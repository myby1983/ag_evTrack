import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';

const Garage = () => {
    const navigate = useNavigate();
    const { vehicles, currentVehicle, selectVehicle } = useVehicle();

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Garage</h1>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {vehicles.map(vehicle => (
                    <div
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle.id)}
                        style={{
                            background: 'var(--bg-secondary)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            border: currentVehicle?.id === vehicle.id ? '1px solid var(--accent-primary)' : '1px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{vehicle.brandName} {vehicle.modelName}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{vehicle.regNumber}</div>
                        </div>
                        {currentVehicle?.id === vehicle.id && (
                            <span style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>✓</span>
                        )}
                    </div>
                ))}

                <button
                    className="btn"
                    onClick={() => navigate('/onboarding')}
                    style={{
                        marginTop: '1rem',
                        background: 'transparent',
                        border: '1px dashed var(--text-secondary)',
                        color: 'var(--text-secondary)',
                        justifyContent: 'center'
                    }}
                >
                    + Add Another Vehicle
                </button>
            </div>
        </div>
    );
};

export default Garage;
