import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('rozi_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('rozi_token');
            localStorage.removeItem('rozi_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Platforms ---
export const getPlatforms = () => api.get('/platforms').then(r => r.data);
export const createPlatform = (data) => api.post('/platforms', data).then(r => r.data);
export const updatePlatform = (id, data) => api.put(`/platforms/${id}`, data).then(r => r.data);
export const deletePlatform = (id) => api.delete(`/platforms/${id}`).then(r => r.data);

// --- Earnings ---
export const getEarnings = (params) => api.get('/earnings', { params }).then(r => r.data);
export const createEarning = (data) => api.post('/earnings', data).then(r => r.data);
export const deleteEarning = (id) => api.delete(`/earnings/${id}`).then(r => r.data);

// --- Fuel Logs ---
export const getFuelLogs = (params) => api.get('/fuel-logs', { params }).then(r => r.data);
export const createFuelLog = (data) => api.post('/fuel-logs', data).then(r => r.data);
export const deleteFuelLog = (id) => api.delete(`/fuel-logs/${id}`).then(r => r.data);

// --- Dashboard ---
export const getDashboardSummary = (range) =>
    api.get('/dashboard/summary', { params: { range } }).then(r => r.data)

// --- Analytics ---
export const getWeeklyAnalytics = () => api.get('/analytics/weekly').then(r => r.data)
export const getMonthlyAnalytics = () => api.get('/analytics/monthly').then(r => r.data)

// --- Profile ---
export const getProfile = () => api.get('/profile').then(r => r.data)
export const getNotifications = () => api.get('/notifications').then(r => r.data)
export const markAllNotificationsRead = () => api.put('/notifications/read-all').then(r => r.data)
export const updateProfile = (data) => api.put('/profile', data).then(r => r.data)
export const changePassword = (data) => api.put('/profile/password', data).then(r => r.data)

export const uploadAvatar = (formData) => api.post('/profile/avatar', formData).then(r => r.data)

export const deleteAvatar = () => api.delete('/profile/avatar').then(r => r.data)

export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then(r => r.data)





export default api;