import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';
import { dashboardService } from '../services/dashboardService';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { currentVehicle, vehicles, selectVehicle } = useVehicle();
    const navigate = useNavigate();

    const [showVehicleList, setShowVehicleList] = useState(false);
    const [stats, setStats] = useState(null);
    const [period, setPeriod] = useState('all'); // weekly, monthly, yearly, all

    useEffect(() => {
        if (currentVehicle) {
            const aggregated = dashboardService.getAggregatedStats(currentVehicle.id);
            setStats(aggregated);
        }
    }, [currentVehicle]);

    // Empty State
    if (!currentVehicle) {
        return (
            <div className="container" style={{ paddingBottom: '6rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Welcome to EV Mate</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Track your Electric Vehicle's performance, charging, and expenses efficiently.
                </p>

                <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🚗⚡</div>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/onboarding')}
                    style={{ margin: '0 auto', maxWidth: '300px' }}
                >
                    + Add Your First Vehicle
                </button>

                <button
                    className="btn"
                    onClick={logout}
                    style={{
                        marginTop: '2rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)'
                    }}
                >
                    Sign Out
                </button>
            </div>
        );
    }

    if (!stats) return <div className="container">Loading...</div>;

    const currentStats = stats[period];
    const periods = [
        { id: 'weekly', label: 'Week' },
        { id: 'monthly', label: 'Month' },
        { id: 'yearly', label: 'Year' },
        { id: 'all', label: 'All' }
    ];

    const StatRow = ({ label, value, unit, subValue, highlight }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--bg-tertiary)'
        }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: highlight ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {value} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{unit}</span>
                </div>
                {subValue && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subValue}</div>}
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                position: 'relative'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Dashboard</h1>
                    <div
                        onClick={() => setShowVehicleList(!showVehicleList)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            userSelect: 'none',
                            background: 'var(--bg-secondary)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            width: 'fit-content'
                        }}
                    >
                        <span>{currentVehicle.brandName} {currentVehicle.modelName}</span>
                        <span style={{ fontSize: '0.7rem' }}>▼</span>
                    </div>

                    {showVehicleList && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem',
                            zIndex: 10,
                            minWidth: '220px',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            {vehicles.map(v => (
                                <div
                                    key={v.id}
                                    onClick={() => {
                                        selectVehicle(v.id);
                                        setShowVehicleList(false);
                                    }}
                                    style={{
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-sm)',
                                        background: v.id === currentVehicle.id ? 'var(--bg-tertiary)' : 'transparent',
                                        color: v.id === currentVehicle.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold' }}>{v.brandName} {v.modelName}</div>
                                    <small style={{ color: 'var(--text-secondary)' }}>{v.regNumber}</small>
                                </div>
                            ))}
                            <hr style={{ borderColor: 'var(--bg-tertiary)', margin: '0.5rem 0' }} />
                            <div
                                onClick={() => navigate('/onboarding')}
                                style={{
                                    padding: '0.75rem',
                                    cursor: 'pointer',
                                    color: 'var(--accent-primary)',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Add New Vehicle
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    textAlign: 'right'
                }}>
                    <div style={{
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginBottom: '0.25rem',
                        display: 'inline-block'
                    }}>
                        {currentVehicle.regNumber}
                    </div>
                </div>
            </header>

            {/* Period Selector Tabs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'var(--bg-secondary)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-md)'
            }}>
                {periods.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setPeriod(p.id)}
                        style={{
                            background: period === p.id ? 'var(--bg-tertiary)' : 'transparent',
                            color: period === p.id ? '#fff' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.5rem 0',
                            fontSize: '0.85rem',
                            fontWeight: period === p.id ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Matrix / Stats Grid */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                    Analytics ({periods.find(p => p.id === period).label})
                </h3>

                <StatRow
                    label="Distance Driven"
                    value={currentStats.distance}
                    unit="km"
                    highlight
                />
                <StatRow
                    label="Efficiency"
                    value={currentStats.efficiency}
                    unit="km/kWh"
                    subValue={`Consumed: ${currentStats.energy} kWh`}
                />
                <StatRow
                    label="Charging Cost"
                    value={`₹${currentStats.chargingCost}`}
                    unit=""
                    subValue={`Avg: ₹${currentStats.runningCostPerKm} / km`}
                />
                <StatRow
                    label="Total Expense"
                    value={`₹${currentStats.totalExpense}`}
                    unit=""
                    subValue="Incl. Maint. + Ins."
                />
                <StatRow
                    label="TCO / KM"
                    value={`₹${currentStats.tcoPerKm}`}
                    unit="/ km"
                    highlight
                />
            </div>

            {/* Quick Actions (Floating or Bottom Fixed could be better, but sticking to inline for now) */}
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Quick Actions</span>
                <span
                    onClick={() => navigate('/history')}
                    style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', cursor: 'pointer' }}
                >
                    View History →
                </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                    className="btn"
                    onClick={() => navigate('/trip-log')}
                    style={{ background: 'var(--bg-secondary)', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🚗</span>
                    <span>Trip</span>
                </button>
                <button
                    className="btn"
                    onClick={() => navigate('/charging-log')}
                    style={{ background: 'var(--bg-secondary)', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}
                >
                    <span style={{ fontSize: '1.5rem' }}>⚡</span>
                    <span>Charge</span>
                </button>
                <button
                    className="btn"
                    onClick={() => navigate('/maintenance-log')}
                    style={{ background: 'var(--bg-secondary)', flexDirection: 'column', gap: '0.5rem', padding: '1rem', gridColumn: 'span 2' }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🔧</span>
                    <span>Maintenance & Insurance</span>
                </button>
            </div>

            <button
                className="btn"
                onClick={logout}
                style={{
                    marginTop: '2rem',
                    background: 'transparent',
                    border: '1px solid var(--bg-tertiary)',
                    width: '100%',
                    color: 'var(--text-secondary)'
                }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default Dashboard;
