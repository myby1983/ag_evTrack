import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { chargingService } from '../services/chargingService';

import { tripService } from '../services/tripService';

const ChargingLog = () => {
    const navigate = useNavigate();
    const { currentVehicle } = useVehicle();

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        odometer: '', // New field
        mode: 'home', // 'home' or 'public'
        initialSoC: '',
        finalSoC: '',
        units: '', // Only for public or manual override
        amount: '', // Only for public or manual override
        notes: ''
    });

    const [calcPreview, setCalcPreview] = useState(null);

    useEffect(() => {
        if (currentVehicle) {
            // Auto-fill Initial SoC and Odometer from latest Trip or Vehicle Initial
            const lastTrip = tripService.getLastTrip(currentVehicle.id);

            // We should also check last charge?
            // If I just charged, and I am charging AGAIN without driving?
            // Rare, but possible (e.g. public charge then home charge).
            // For now, let's stick to Trip End as the primary source for "Start of Charge".

            const lastSoC = lastTrip ? lastTrip.endSoC : '';
            const lastOdo = lastTrip ? lastTrip.endOdo : currentVehicle.initialOdometer;

            setFormData(prev => ({
                ...prev,
                initialSoC: lastSoC,
                odometer: lastOdo
            }));
        }
    }, [currentVehicle]);

    // Real-time calculation for Home Charging
    useEffect(() => {
        if (formData.mode === 'home' && formData.initialSoC && formData.finalSoC && currentVehicle) {
            const stats = chargingService.calculateHomeCharging(
                formData.initialSoC,
                formData.finalSoC,
                currentVehicle.batteryCapacity,
                currentVehicle.tariff,
                currentVehicle.chargerType
            );
            setCalcPreview(stats);
        } else {
            setCalcPreview(null);
        }
    }, [formData.mode, formData.initialSoC, formData.finalSoC, currentVehicle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let finalData = { ...formData };

        if (formData.mode === 'home' && calcPreview) {
            finalData.units = calcPreview.units;
            finalData.amount = calcPreview.cost;
        }

        chargingService.addLog(currentVehicle.id, finalData);
        navigate('/');
    };

    if (!currentVehicle) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Log Charging</h2>

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

                    <div className="form-group">
                        <label className="label">Odometer (km)</label>
                        <input
                            type="number"
                            name="odometer"
                            className="input"
                            value={formData.odometer}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Charging Mode</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="home"
                                    checked={formData.mode === 'home'}
                                    onChange={handleChange}
                                /> Home
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="public"
                                    checked={formData.mode === 'public'}
                                    onChange={handleChange}
                                /> Public
                            </label>
                        </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Initial SoC (%)</label>
                            <input
                                type="number"
                                name="initialSoC"
                                className="input"
                                value={formData.initialSoC}
                                onChange={handleChange}
                                required
                                min="0" max="100"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Final SoC (%)</label>
                            <input
                                type="number"
                                name="finalSoC"
                                className="input"
                                value={formData.finalSoC}
                                onChange={handleChange}
                                required
                                min="0" max="100"
                            />
                        </div>
                    </div>

                    {formData.mode === 'home' && calcPreview && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estimated Consumption:</p>
                            <p style={{ fontWeight: 'bold' }}>{calcPreview.units} kWh</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Estimated Cost:</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{calcPreview.cost}</p>
                        </div>
                    )}

                    {formData.mode === 'public' && (
                        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">Units (kWh)</label>
                                <input
                                    type="number"
                                    name="units"
                                    className="input"
                                    value={formData.units}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="input"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                        Save Charge Log
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChargingLog;
