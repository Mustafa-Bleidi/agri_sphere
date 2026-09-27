import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('agrisphere_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('agrisphere_token');
            localStorage.removeItem('agrisphere_user');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
