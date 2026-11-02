import { createRemoteJWKSet, jwtVerify } from 'jose';

const USER_KEY = 'ev_mate_user';
const LEGACY_ID = 'usr_123456789';
const LEGACY_OWNER_KEY = 'ev_mate_legacy_owner';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID?.trim() || '';

// This is a browser-local profile, not a server session.
export async function verifyGoogleCredential(credential, clientId, nonce, keys = googleKeys) {
    if (!credential || !clientId || !nonce) throw new Error('Google sign-in is not configured correctly.');
    const { payload } = await jwtVerify(credential, keys, {
        algorithms: ['RS256'],
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: clientId,
        requiredClaims: ['sub', 'exp', 'iat', 'nonce'],
    });
    if (payload.nonce !== nonce || typeof payload.sub !== 'string' || !payload.sub) {
        throw new Error('Google sign-in could not be verified. Please try again.');
    }
    return {
        id: payload.sub,
        name: payload.name || payload.email || 'Google user',
        email: payload.email || '',
        photoUrl: payload.picture || '',
        provider: 'google',
    };
}

export const authService = {
    hasLegacyData: () => {
        try {
            const vehicles = JSON.parse(localStorage.getItem(`ev_mate_vehicles_${LEGACY_ID}`) || '[]');
            return !localStorage.getItem(LEGACY_OWNER_KEY) && Array.isArray(vehicles) && vehicles.length > 0;
        } catch {
            return false;
        }
    },
    migrateLegacyData: (user) => {
        if (authService.hasLegacyData()) {
            const targetKey = `ev_mate_vehicles_${user.id}`;
            const existing = JSON.parse(localStorage.getItem(targetKey) || '[]');
            const legacy = JSON.parse(localStorage.getItem(`ev_mate_vehicles_${LEGACY_ID}`));
            const migrated = legacy.filter(vehicle => !existing.some(item => item.id === vehicle.id))
                .map(vehicle => ({ ...vehicle, userId: user.id }));
            localStorage.setItem(targetKey, JSON.stringify([...existing, ...migrated]));
            // Logs use vehicle IDs, so they do not need moving.
            const selected = localStorage.getItem(`last_vehicle_${LEGACY_ID}`);
            if (selected && !localStorage.getItem(`last_vehicle_${user.id}`)) {
                localStorage.setItem(`last_vehicle_${user.id}`, selected);
            }
            localStorage.setItem(LEGACY_OWNER_KEY, user.id);
        }
    },
    login: async (response, { nonce, importLegacyData = false } = {}) => {
        const user = await verifyGoogleCredential(response?.credential, googleClientId, nonce);
        if (importLegacyData) authService.migrateLegacyData(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
    },
    logout: async () => {
        window.google?.accounts?.id?.disableAutoSelect();
        localStorage.removeItem(USER_KEY);
    },
    getCurrentUser: () => {
        try {
            const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
            return user?.provider === 'google' && typeof user.id === 'string' && user.id ? user : null;
        } catch {
            return null;
        }
    },
};
