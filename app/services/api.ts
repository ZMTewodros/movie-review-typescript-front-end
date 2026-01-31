import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Match the port shown in your terminal
});

// Add interceptors to handle tokens if necessary
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;