// src/services/authService.js

const USER_KEY = 'ev_mate_user';

export const authService = {
    login: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockUser = {
            id: 'usr_123456789',
            name: 'Test User',
            email: 'user@example.com',
            photoUrl: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=fff'
        };

        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        return mockUser;
    },

    logout: async () => {
        localStorage.removeItem(USER_KEY);
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }
};
