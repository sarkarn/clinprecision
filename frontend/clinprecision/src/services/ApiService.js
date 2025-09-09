// src/services/ApiService.js
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('tokenExpiration');
      
      // Check if we're already on the login page to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

const ApiService = {
  // Generic HTTP methods
  get: async (url, config = {}) => {
    return await api.get(url, config);
  },
  
  post: async (url, data, config = {}) => {
    return await api.post(url, data, config);
  },
  
  put: async (url, data, config = {}) => {
    return await api.put(url, data, config);
  },
  
  delete: async (url, config = {}) => {
    return await api.delete(url, config);
  },
  
  patch: async (url, data, config = {}) => {
    return await api.patch(url, data, config);
  },
  
  // Function to get authorization headers for other services
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default ApiService;
