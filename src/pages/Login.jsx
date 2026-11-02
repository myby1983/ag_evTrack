import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, googleClientId } from '../services/authService';
import { loadGoogleIdentity } from '../services/googleIdentity';
import { dataService } from '../services/dataService';

const Login = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const callbackRef = useRef(null);
    const pendingRef = useRef(false);
    const [hasLegacyData] = useState(() => authService.hasLegacyData());
    const [importLegacyData, setImportLegacyData] = useState(false);
    const [status, setStatus] = useState(googleClientId ? 'Loading Google sign-in…' : '');
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        callbackRef.current = async (response, nonce, isActive) => {
            if (pendingRef.current) return;
            pendingRef.current = true;
            setError('');
            setStatus('Signing in…');
            try {
                await login(response, { nonce, importLegacyData });
                if (isActive()) navigate('/', { replace: true });
            } catch {
                if (isActive()) {
                    setError('Google sign-in could not be completed. Check your connection and try again.');
                    setStatus('');
                }
            } finally {
                pendingRef.current = false;
            }
        };
    }, [login, importLegacyData, navigate]);

    useEffect(() => {
        if (!googleClientId || user) return;
        let active = true;
        const container = buttonRef.current;
        const nonce = crypto.randomUUID();
        loadGoogleIdentity().then(identity => {
            if (!active) return;
            identity.initialize({
                client_id: googleClientId,
                nonce,
                auto_select: false,
                ux_mode: 'popup',
                callback: response => {
                    if (active) callbackRef.current(response, nonce, () => active);
                },
            });
            identity.renderButton(container, {
                theme: 'outline', size: 'large', text: 'signin_with',
                width: Math.min(320, container.clientWidth),
            });
            setStatus('');
        }).catch(err => {
            if (active) {
                setStatus('');
                setError(err.message);
            }
        });
        return () => {
            active = false;
            container?.replaceChildren();
        };
    }, [attempt, user]);

    if (user) return <Navigate to="/" replace />;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>EV Mate</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Smart Fleet Management for EV Owners</p>
                {hasLegacyData && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="checkbox" checked={importLegacyData} disabled={status === 'Signing in…'} onChange={e => setImportLegacyData(e.target.checked)} />
                            Bring my existing logs into this Google account
                        </label>
                        <button className="btn" style={{ marginTop: '0.75rem' }} onClick={() => dataService.exportData()}>Back up existing logs</button>
                    </div>
                )}
                {!googleClientId && <p role="status">Google sign-in hasn’t been configured yet. Please contact the app owner.</p>}
                <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: googleClientId ? '44px' : 0 }} />
                {status && <p role="status" aria-live="polite" style={{ marginTop: '1rem' }}>{status}</p>}
                {error && (
                    <div style={{ marginTop: '1rem' }}>
                        <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>
                        <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => {
                            setError(''); setStatus('Loading Google sign-in…'); setAttempt(value => value + 1);
                        }}>Retry</button>
                    </div>
                )}
                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Your vehicle logs stay in this browser. Google sign-in does not sync them across devices.
                </p>
            </div>
        </div>
    );
};

export default Login;
