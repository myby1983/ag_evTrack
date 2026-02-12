import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const VehicleContext = createContext(null);
const VEHICLES_KEY_PREFIX = 'ev_mate_vehicles_';

export const VehicleProvider = ({ children }) => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadVehicles();
        } else {
            setVehicles([]);
            setCurrentVehicle(null);
            setLoading(false);
        }
    }, [user]);

    const loadVehicles = () => {
        try {
            const data = localStorage.getItem(VEHICLES_KEY_PREFIX + user.id);
            if (data) {
                const parsed = JSON.parse(data);
                setVehicles(parsed);
                if (parsed.length > 0) {
                    // Restore last selected vehicle or default to first
                    const lastSelected = localStorage.getItem('last_vehicle_' + user.id);
                    const selected = parsed.find(v => v.id === lastSelected) || parsed[0];
                    setCurrentVehicle(selected);
                }
            } else {
                setVehicles([]);
            }
        } catch (error) {
            console.error("Failed to load vehicles", error);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const addVehicle = (vehicleData) => {
        const newVehicle = {
            ...vehicleData,
            id: Date.now().toString(),
            userId: user.id,
            createdAt: new Date().toISOString()
        };

        const updatedVehicles = [...vehicles, newVehicle];
        setVehicles(updatedVehicles);
        localStorage.setItem(VEHICLES_KEY_PREFIX + user.id, JSON.stringify(updatedVehicles));

        // Always select the new vehicle upon creation for better UX
        setCurrentVehicle(newVehicle);
        localStorage.setItem('last_vehicle_' + user.id, newVehicle.id);

        return newVehicle;
    };

    const selectVehicle = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setCurrentVehicle(vehicle);
            localStorage.setItem('last_vehicle_' + user.id, vehicle.id);
        }
    };

    return (
        <VehicleContext.Provider value={{ vehicles, currentVehicle, addVehicle, selectVehicle, loading }}>
            {!loading && children}
        </VehicleContext.Provider>
    );
};

export const useVehicle = () => {
    const context = useContext(VehicleContext);
    if (!context) {
        throw new Error('useVehicle must be used within a VehicleProvider');
    }
    return context;
};
