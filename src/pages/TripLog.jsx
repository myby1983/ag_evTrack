
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { tripService } from '../services/tripService';

const TripLog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentVehicle } = useVehicle();

    // Check for edit mode
    const editMode = location.state?.editMode;
    const initialData = location.state?.initialData;

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startOdo: '',
        endOdo: '',
        startSoC: '100', // Default assumption, or fetch from last state
        endSoC: '',
        notes: ''
    });

    useEffect(() => {
        if (currentVehicle) {
            if (editMode && initialData) {
                setFormData(initialData);
            } else {
                // New Entry Logic
                const { soc, odo } = tripService.getLatestState(currentVehicle.id, currentVehicle.initialOdometer);
                setFormData(prev => ({
                    ...prev,
                    startOdo: odo,
                    startSoC: soc
                }));
            }
        }
    }, [currentVehicle, editMode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (parseFloat(formData.endOdo) < parseFloat(formData.startOdo)) {
            alert("End Odometer cannot be less than Start Odometer");
            return;
        }

        // Calculate Stats
        const stats = tripService.calculateStats(
            formData.startOdo,
            formData.endOdo,
            formData.startSoC,
            formData.endSoC,
            currentVehicle.batteryCapacity
        );

        const tripData = {
            ...formData,
            ...stats
        };

        if (editMode) {
            tripService.updateTrip(currentVehicle.id, initialData.id, tripData);
        } else {
            tripService.addTrip(currentVehicle.id, tripData);
        }

        navigate(-1); // Go back (to Dashboard or History)
    };

    if (!currentVehicle) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
                    {editMode ? 'Edit Trip' : 'Log Trip'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Date</label>
                        <input
                            type="date"
                            name="date"
                            className="input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Start Odo (km)</label>
                            <input
                                type="number"
                                name="startOdo"
                                className="input"
                                value={formData.startOdo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">End Odo (km)</label>
                            <input
                                type="number"
                                name="endOdo"
                                className="input"
                                value={formData.endOdo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Start SoC (%)</label>
                            <input
                                type="number"
                                name="startSoC"
                                className="input"
                                value={formData.startSoC}
                                onChange={handleChange}
                                required
                                min="0" max="100"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">End SoC (%)</label>
                            <input
                                type="number"
                                name="endSoC"
                                className="input"
                                value={formData.endSoC}
                                onChange={handleChange}
                                required
                                min="0" max="100"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Notes</label>
                        <textarea
                            name="notes"
                            className="input"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                        Save Trip
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TripLog;
