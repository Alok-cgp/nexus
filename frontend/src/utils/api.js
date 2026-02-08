import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        // If the URL is provided but missing /api, append it
        return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    // Fallback for Vercel unified deployment or local dev
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
