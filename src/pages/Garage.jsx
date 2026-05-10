import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const Garage = () => {
    const navigate = useNavigate();
    const { vehicles, currentVehicle, selectVehicle } = useVehicle();
    const { logout } = useAuth();
    const fileInputRef = useRef(null);

    const [toast, setToast] = useState(null);
    const [dataSummary, setDataSummary] = useState(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        refreshSummary();
    }, []);

    const refreshSummary = () => {
        setDataSummary(dataService.getDataSummary());
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Export ──
    const handleExport = () => {
        const result = dataService.exportData();
        if (result.success) {
            showToast(`✅ ${result.message}`, 'success');
        } else {
            showToast(`⚠️ ${result.message}`, 'error');
        }
    };

    // ── Import ──
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(
            '⚠️ COMPLETE REPLACEMENT\n\n' +
            'This will DELETE all existing data and replace it with the backup file.\n\n' +
            'Are you sure?'
        )) {
            e.target.value = '';
            return;
        }

        setImporting(true);
        const result = await dataService.importData(file);
        setImporting(false);
        e.target.value = '';

        if (result.success) {
            showToast(`✅ ${result.message}`, 'success');
            refreshSummary();
            // Reload the app to pick up new data in context
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast(`❌ ${result.message}`, 'error');
        }
    };

    // ── Clear ──
    const handleClear = () => {
        if (!window.confirm('⚠️ DELETE ALL DATA?\n\nThis cannot be undone. Export first if you need a backup.')) return;
        if (!window.confirm('🚨 FINAL CONFIRMATION\n\nAll vehicles, trips, charging and maintenance logs will be permanently deleted.\n\nProceed?')) return;

        const removed = dataService.clearAllData();
        showToast(`🗑️ Cleared ${removed} data keys.`, 'success');
        refreshSummary();
        setTimeout(() => window.location.reload(), 1500);
    };

    // ── Styles ──
    const sectionTitleStyle = {
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        marginBottom: '0.75rem',
        marginTop: '2rem'
    };

    const actionBtnStyle = (color) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.95rem',
        textAlign: 'left',
        transition: 'all 0.2s ease'
    });

    const iconBadgeStyle = (bg) => ({
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        flexShrink: 0
    });

    return (
        <div className="container" style={{ paddingBottom: '6rem' }}>
            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: toast.type === 'success' ? 'var(--accent-primary)' : 'var(--danger)',
                    color: '#fff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    zIndex: 9999,
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s ease',
                    maxWidth: '90vw',
                    textAlign: 'center'
                }}>
                    {toast.message}
                </div>
            )}

            {/* ── Header ── */}
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Garage</h1>
            </header>

            {/* ── Vehicle List ── */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
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
                            alignItems: 'center',
                            transition: 'border-color 0.2s ease'
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
                        marginTop: '0.5rem',
                        background: 'transparent',
                        border: '1px dashed var(--text-secondary)',
                        color: 'var(--text-secondary)',
                        justifyContent: 'center'
                    }}
                >
                    + Add Another Vehicle
                </button>
            </div>

            {/* ── Data Management Section ── */}
            <div style={sectionTitleStyle}>Data Management</div>

            {/* Summary Card */}
            {dataSummary && dataSummary.totalKeys > 0 && (
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    marginBottom: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataSummary.vehicles}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Vehicles</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataSummary.trips}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Trips</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataSummary.charges}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Charges</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{dataSummary.maintenance}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Maint.</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '0.5rem' }}>
                {/* Export Button */}
                <button onClick={handleExport} style={actionBtnStyle('var(--accent-primary)')}>
                    <div style={iconBadgeStyle('rgba(16, 185, 129, 0.15)')}>📥</div>
                    <div>
                        <div style={{ fontWeight: '600' }}>Export All Data</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download JSON backup to your device</div>
                    </div>
                </button>

                {/* Import Button */}
                <button
                    onClick={handleImportClick}
                    disabled={importing}
                    style={{
                        ...actionBtnStyle('var(--warning)'),
                        opacity: importing ? 0.5 : 1
                    }}
                >
                    <div style={iconBadgeStyle('rgba(245, 158, 11, 0.15)')}>📤</div>
                    <div>
                        <div style={{ fontWeight: '600' }}>{importing ? 'Importing...' : 'Import Data'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Restore from a backup file (replaces all data)</div>
                    </div>
                </button>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                {/* Clear Button */}
                <button onClick={handleClear} style={actionBtnStyle('var(--danger)')}>
                    <div style={iconBadgeStyle('rgba(239, 68, 68, 0.15)')}>🗑️</div>
                    <div>
                        <div style={{ fontWeight: '600', color: 'var(--danger)' }}>Clear All Data</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permanently delete everything</div>
                    </div>
                </button>
            </div>

            {/* ── Sign Out ── */}
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

export default Garage;
