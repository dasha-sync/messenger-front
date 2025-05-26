import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
