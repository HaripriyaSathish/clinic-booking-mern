import api from './axios';

export const getHomeData    = () => api.get('/public/home');
export const getDoctors     = () => api.get('/public/doctors');
export const getDoctor      = (slug) => api.get(`/public/doctors/${slug}`);
export const getDepartments = () => api.get('/public/departments');
export const getSlots       = (doctorId, date) => api.get(`/public/slots?doctorId=${doctorId}&date=${date}`);
export const bookAppointment = (data) => api.post('/public/appointments', data);
export const sendContact    = (data) => api.post('/public/contact', data);
