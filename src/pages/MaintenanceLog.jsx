import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { maintenanceService } from '../services/maintenanceService';

const MaintenanceLog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentVehicle } = useVehicle();

    const editMode = location.state?.editMode;
    const initialData = location.state?.initialData;

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Periodic Service', // service, repair, tyre, insurance
        cost: '',
        provider: '', // service center or insurer
        notes: ''
    });

    // Insurance fields
    const [insuranceData, setInsuranceData] = useState({
        insurer: '',
        policyNumber: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTill: ''
    });

    useEffect(() => {
        if (editMode && initialData) {
            setFormData({
                date: initialData.date,
                type: initialData.type,
                cost: initialData.cost,
                provider: initialData.provider,
                notes: initialData.notes
            });
            if (initialData.type === 'insurance') {
                setInsuranceData(initialData.insuranceDetails || {
                    insurer: '',
                    policyNumber: '',
                    validFrom: initialData.date,
                    validTill: ''
                });
            }
        }
    }, [editMode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            return newData;
        });
    };

    const handleInsuranceChange = (e) => {
        const { name, value } = e.target;
        setInsuranceData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-calc Valid Till for Insurance
            if (name === 'validFrom') {
                const date = new Date(value);
                date.setFullYear(date.getFullYear() + 1);
                newData.validTill = date.toISOString().split('T')[0];
            }
            return newData;
        });
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            type,
            // Reset insurance fields if switching away
            validFrom: type === 'insurance' ? prev.date : '',
            validTill: ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        maintenanceService.addLog(currentVehicle.id, formData);
        navigate('/');
    };

    if (!currentVehicle) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Log Maintenance</h2>

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
                        <label className="label">Type</label>
                        <select
                            name="type"
                            className="input"
                            value={formData.type}
                            onChange={handleTypeChange}
                        >
                            <option value="service">Periodic Service</option>
                            <option value="repair">Running Repair</option>
                            <option value="tyre">Tyre Care/Replacement</option>
                            <option value="insurance">Insurance Renewal</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Cost (₹)</label>
                        <input
                            type="number"
                            name="cost"
                            className="input"
                            value={formData.cost}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">{formData.type === 'insurance' ? 'Insurer' : 'Service Center / Provider'}</label>
                        <input
                            type="text"
                            name="provider"
                            className="input"
                            value={formData.provider}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {formData.type === 'insurance' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="label">Valid From</label>
                                <input
                                    type="date"
                                    name="validFrom"
                                    className="input"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="label">Valid Till</label>
                                <input
                                    type="date"
                                    name="validTill"
                                    className="input"
                                    value={formData.validTill}
                                    readOnly
                                />
                            </div>
                        </div>
                    )}

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
                        Save Log
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceLog;
