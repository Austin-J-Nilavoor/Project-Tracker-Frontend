import axios from 'axios';

// IMPORTANT: Set this to the base URL of your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add the JWT token to every request header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401s (Token expiration/invalidity)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       // Optional: Log out user globally if a 401 is received on any call other than login
       // In a real browser environment, a redirect here would force re-authentication.
       if (error.config.url !== '/auth/login') {
          // localStorage.clear();
          // window.location.href = '/login'; 
       }
    }
    return Promise.reject(error);
  }
);

export default api;