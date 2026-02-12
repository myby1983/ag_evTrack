import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { tripService } from '../services/tripService';
import { chargingService } from '../services/chargingService';
import { maintenanceService } from '../services/maintenanceService';

const History = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentVehicle } = useVehicle();
    const [activeTab, setActiveTab] = useState('trips');
    const [data, setData] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['trips', 'charging', 'maintenance'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        if (currentVehicle) {
            loadData();
        }
    }, [currentVehicle, activeTab]);

    const loadData = () => {
        let logs = [];
        if (activeTab === 'trips') {
            logs = tripService.getTrips(currentVehicle.id);
        } else if (activeTab === 'charging') {
            logs = chargingService.getChargingLogs(currentVehicle.id);
        } else {
            logs = maintenanceService.getLogs(currentVehicle.id);
        }
        //Sort by date desc
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(logs);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            if (activeTab === 'trips') {
                tripService.deleteTrip(currentVehicle.id, id);
            } else if (activeTab === 'charging') {
                chargingService.deleteLog(currentVehicle.id, id);
            } else {
                maintenanceService.deleteLog(currentVehicle.id, id);
            }
            loadData();
        }
    };

    const handleEdit = (log) => {
        let path = '';
        if (activeTab === 'trips') path = '/trip-log';
        if (activeTab === 'charging') path = '/charging-log';
        if (activeTab === 'maintenance') path = '/maintenance-log';

        navigate(path, { state: { editMode: true, initialData: log } });
    };

    if (!currentVehicle) return <div>Loading...</div>;

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => navigate(`/history?tab=${id}`)}
            style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: activeTab === id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderBottom: activeTab === id ? '2px solid white' : 'none'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ padding: '0.5rem' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>History</h1>
            </header>

            <div style={{ display: 'flex', marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <TabButton id="trips" label="Trips" />
                <TabButton id="charging" label="Charging" />
                <TabButton id="maintenance" label="Maint." />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No logs found.</div>}

                {data.map(item => (
                    <div key={item.id} style={{
                        background: 'var(--bg-secondary)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div onClick={() => handleEdit(item)} style={{ flex: 1, cursor: 'pointer' }}>
                            <div style={{ fontWeight: 'bold' }}>{item.date}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {activeTab === 'trips' && `${item.distance} km • ${item.efficiency} km/kWh`}
                                {activeTab === 'charging' && `${(item.mode || 'unknown').toUpperCase()} • ₹${item.amount || 0} • ${item.units ? item.units : (item.finalSoC && item.initialSoC ? ((item.finalSoC - item.initialSoC) / 100 * currentVehicle.batteryCapacity).toFixed(1) : '0')} kWh`}
                                {activeTab === 'maintenance' && `${item.type} • ₹${item.cost}`}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--warning)',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            🗑
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
