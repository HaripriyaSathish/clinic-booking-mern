import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid admin session -> back to the login page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAdminCall = err.config?.url?.startsWith('/admin') && !err.config.url.endsWith('/login');
    if (err.response?.status === 401 && isAdminCall) {
      localStorage.removeItem('adminToken');
      window.location.assign('/admin/login');
    }
    return Promise.reject(err);
  }
);

export default api;
