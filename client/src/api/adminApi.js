import api from './axios';

export const login = (data) => api.post('/admin/login', data);

// Generic CRUD helpers: resource = 'doctors', 'departments', 'stats', ...
export const list   = (resource) => api.get(`/admin/${resource}`);
export const create = (resource, data) => api.post(`/admin/${resource}`, data);
export const update = (resource, id, data) => api.put(`/admin/${resource}/${id}`, data);
export const remove = (resource, id) => api.delete(`/admin/${resource}/${id}`);

// Single-record resources: 'hero', 'settings', 'sections/departments', ...
export const getOne  = (resource) => api.get(`/admin/${resource}`);
export const saveOne = (resource, data) => api.put(`/admin/${resource}`, data);

export const getDashboard = () => api.get('/admin/dashboard');
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/admin/appointments/${id}/status`, { status });
