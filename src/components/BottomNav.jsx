import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check active state
    const isActive = (path, search) => {
        if (search) {
            return location.pathname === path && location.search.includes(search);
        }
        return location.pathname === path && location.search === '';
    };

    const NavItem = ({ icon, label, path, search }) => {
        const active = isActive(path, search);
        return (
            <div
                onClick={() => navigate(path + (search || ''))}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 0',
                    cursor: 'pointer',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                }}
            >
                <span style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{icon}</span>
                <span style={{ fontSize: '0.7rem' }}>{label}</span>
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'rgba(30, 30, 30, 0.95)', // somewhat transparent dark bg
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid var(--bg-tertiary)',
            display: 'flex',
            justifyContent: 'space-around',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom)' // for iOS safe area
        }}>
            <NavItem icon="🏠" label="Home" path="/" />
            <NavItem icon="🚗" label="Trips" path="/history" search="?tab=trips" />
            <NavItem icon="⚡" label="Charging" path="/history" search="?tab=charging" />
            <NavItem icon="💸" label="Expenses" path="/history" search="?tab=maintenance" />
            <NavItem icon="🚘" label="Garage" path="/garage" />
        </div>
    );
};

export default BottomNav;
