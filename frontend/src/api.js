import axios from 'axios';

const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL 
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Sesión inválida o expirada. Redirigiendo...");
        sessionStorage.clear(); 
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;