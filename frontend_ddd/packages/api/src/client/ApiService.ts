// src/services/ApiService.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@shared/config';
import {
  ApiRequestConfig,
  IApiService,
  AuthHeaders,
  AuthStorageKeys,
  HttpStatus,
} from '@shared/types/api.types';

/**
 * ApiService - Centralized HTTP client with interceptors
 * 
 * Provides:
 * - Axios instance with base configuration
 * - Request interceptor for automatic token injection
 * - Response interceptor for 401 error handling
 * - Generic HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Auth header utilities
 * 
 * Usage:
 *   import ApiService from './services/ApiService';
 *   const response = await ApiService.get('/endpoint');
 */

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add authorization headers
api.interceptors.request.use(
  (config) => {
    console.log('*** ApiService: Request interceptor - Adding auth token');
    
    // Skip auth token for requests with skipAuth flag
    const skipAuth = (config as ApiRequestConfig).skipAuth;
    if (skipAuth) {
      console.log('*** ApiService: Skipping auth token (skipAuth=true)');
      return config;
    }
    
    // Get token from localStorage
    const token = localStorage.getItem(AuthStorageKeys.AUTH_TOKEN);
    if (token) {
      console.log('*** ApiService: Auth token found, adding to headers');
      // Ensure headers object exists - use proper axios headers type
      if (!config.headers) {
        config.headers = {} as any;
      }
      // Set Authorization header using both methods for compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
      console.log('*** ApiService: Authorization header set:', config.headers.Authorization);
      console.log('*** ApiService: All headers:', JSON.stringify(config.headers));
    } else {
      console.log('*** ApiService: No auth token found in localStorage');
    }
    
    console.log('*** ApiService: Final request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      hasAuthHeader: !!config.headers?.Authorization,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('*** ApiService: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('*** ApiService: Response received:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('*** ApiService: Response error:', error.message);
    
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === HttpStatus.UNAUTHORIZED) {
      console.log('*** ApiService: 401 Unauthorized - Clearing auth data and redirecting to login');
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem(AuthStorageKeys.AUTH_TOKEN);
      localStorage.removeItem(AuthStorageKeys.USER_ID);
      localStorage.removeItem(AuthStorageKeys.USER_EMAIL);
      localStorage.removeItem(AuthStorageKeys.USER_ROLE);
      localStorage.removeItem(AuthStorageKeys.TOKEN_EXPIRATION);
      
      // Check if we're already on the login page to avoid redirect loops
      if (!window.location.pathname.includes('/login')) {
        console.log('*** ApiService: Redirecting to /login');
        window.location.href = '/login';
      } else {
        console.log('*** ApiService: Already on login page, skipping redirect');
      }
    }
    
    // Log other error statuses
    if (error.response) {
      console.error('*** ApiService: HTTP Error', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('*** ApiService: No response received', error.request);
    } else {
      console.error('*** ApiService: Request setup error', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * ApiService implementation
 * Provides typed HTTP methods for making API requests
 */
const ApiService: IApiService = {
  /**
   * Perform a GET request
   * @param url - The endpoint URL
   * @param config - Optional request configuration
   * @returns Promise with response data
   */
  get: async <T = any>(url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse<T>> => {
    console.log('*** ApiService.get:', url);
    return await api.get<T>(url, config);
  },

  /**
   * Perform a POST request
   * @param url - The endpoint URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise with response data
   */
  post: async <T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<AxiosResponse<T>> => {
    console.log('*** ApiService.post:', url, data);
    return await api.post<T>(url, data, config);
  },

  /**
   * Perform a PUT request
   * @param url - The endpoint URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise with response data
   */
  put: async <T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<AxiosResponse<T>> => {
    console.log('*** ApiService.put:', url, data);
    return await api.put<T>(url, data, config);
  },

  /**
   * Perform a PATCH request
   * @param url - The endpoint URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise with response data
   */
  patch: async <T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<AxiosResponse<T>> => {
    console.log('*** ApiService.patch:', url, data);
    return await api.patch<T>(url, data, config);
  },

  /**
   * Perform a DELETE request
   * @param url - The endpoint URL
   * @param config - Optional request configuration
   * @returns Promise with response data
   */
  delete: async <T = any>(url: string, config: ApiRequestConfig = {}): Promise<AxiosResponse<T>> => {
    console.log('*** ApiService.delete:', url);
    return await api.delete<T>(url, config);
  },

  /**
   * Get authorization headers for other services
   * @returns Object with Authorization header if token exists
   */
  getAuthHeaders: (): AuthHeaders => {
    const token = localStorage.getItem(AuthStorageKeys.AUTH_TOKEN);
    if (token) {
      console.log('*** ApiService.getAuthHeaders: Token found');
      return { Authorization: `Bearer ${token}` };
    }
    console.log('*** ApiService.getAuthHeaders: No token found');
    return {};
  },
};

// Export the ApiService singleton
export default ApiService;

// Named exports for convenience
export { api as axiosInstance };
export type { IApiService };
