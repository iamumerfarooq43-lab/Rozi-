import { create } from 'zustand';

// Safely parse user from localStorage
const getUser = () => {
    try {
        const user = localStorage.getItem('rozi_user');
        return user && user !== 'undefined' ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

const useAuthStore = create((set) => ({
    // ─── State ─────────────────────────────────────────────
    user: getUser(),
    token: localStorage.getItem('rozi_token') || null,
    isAuthenticated: !!localStorage.getItem('rozi_token'),

    // ─── Actions ───────────────────────────────────────────

    // Called after successful login
    login: (user, token) => {
        localStorage.setItem('rozi_token', token);
        localStorage.setItem('rozi_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    // Called on logout
    logout: () => {
        localStorage.removeItem('rozi_token');
        localStorage.removeItem('rozi_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    // Called to update user profile data
    setUser: (user) => {
        localStorage.setItem('rozi_user', JSON.stringify(user));
        set({ user });
    },
}));

export default useAuthStore;