import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { EV_MASTER_DATA } from '../services/masterData';

const VehicleForm = () => {
    const navigate = useNavigate();
    const { addVehicle } = useVehicle();

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        regNumber: '',
        chargerType: '7.5', // Default 7.5kW
        tariff: '',
        initialOdometer: '',
        onboardingDate: new Date().toISOString().split('T')[0]
    });

    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        if (formData.brand) {
            setAvailableModels(EV_MASTER_DATA.models[formData.brand] || []);
            setFormData(prev => ({ ...prev, model: '' }));
        }
    }, [formData.brand]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.brand || !formData.model) {
            alert('Please select vehicle details');
            return;
        }

        // RegEx Validation for KL01AB1234 format (Generic India format)
        const regPattern = /^[A-Z]{2}[0-9]{2}[A-Z,0-9]{1,2}[0-9]{4}$/;
        if (!regPattern.test(formData.regNumber.toUpperCase().replace(/\s/g, ''))) {
            if (!confirm("The registration number format looks unusual. Proceed anyway?")) return;
        }

        // Get Model Details
        const modelDetails = availableModels.find(m => m.id === formData.model);

        const vehicleData = {
            ...formData,
            regNumber: formData.regNumber.toUpperCase(),
            batteryCapacity: modelDetails?.battery || 0,
            modelName: modelDetails?.name,
            brandName: EV_MASTER_DATA.brands.find(b => b.id === formData.brand)?.name
        };

        addVehicle(vehicleData);
        navigate('/');
    };

    return (
        <div className="container">
            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Add New Vehicle</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Brand</label>
                        <select
                            name="brand"
                            className="input"
                            value={formData.brand}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Brand</option>
                            {EV_MASTER_DATA.brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Model</label>
                        <select
                            name="model"
                            className="input"
                            value={formData.model}
                            onChange={handleChange}
                            disabled={!formData.brand}
                            required
                        >
                            <option value="">Select Model</option>
                            {availableModels.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.battery} kWh)</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Registration Number</label>
                        <input
                            type="text"
                            name="regNumber"
                            className="input"
                            placeholder="e.g. KL01AB1234"
                            value={formData.regNumber}
                            onChange={handleChange}
                            style={{ textTransform: 'uppercase' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Home Charger Type</label>
                        <select
                            name="chargerType"
                            className="input"
                            value={formData.chargerType}
                            onChange={handleChange}
                        >
                            {EV_MASTER_DATA.chargerOptions.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Home Tariff (₹/kWh)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="tariff"
                            className="input"
                            placeholder="e.g. 7.50"
                            value={formData.tariff}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Initial Odometer (km)</label>
                        <input
                            type="number"
                            name="initialOdometer"
                            className="input"
                            placeholder="0"
                            value={formData.initialOdometer}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
                        Save Vehicle
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;
