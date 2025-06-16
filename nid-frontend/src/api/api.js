import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to all requests except public auth endpoints
api.interceptors.request.use((config) => {
  if (
    config.url.includes('/auth/forgot-password') ||
    config.url.includes('/auth/reset-password') ||
    config.url.includes('/auth/login')
  ) {
    delete config.headers.Authorization;
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export default api; 