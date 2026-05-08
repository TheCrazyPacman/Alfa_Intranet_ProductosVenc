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
  (response) => response,
  (error) => {
    if (error.response) {
      // Si el error es 401 pero NO viene de la ruta de login
      if (error.response.status === 401 && !error.config.url.includes('/auth/login')) {
        console.warn("Sesión expirada. Redirigiendo...");
        sessionStorage.clear(); 
        window.location.href = '/Intranet/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;