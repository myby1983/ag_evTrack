import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await login();
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '1rem'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>EV Mate</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Smart Fleet Management for EV Owners
                </p>

                <button
                    className="btn btn-full"
                    onClick={handleLogin}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    Sign in with Google
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default Login;
