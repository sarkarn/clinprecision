// src/services/auth/LoginService.ts

import axios, { AxiosInstance } from 'axios';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';
import {
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  AuthData,
  TokenValidationResponse,
} from '../types/domain/User.types';

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

/**
 * Create axios instance with default configuration for authentication
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Authenticates a user with email and password
 * Extracts authentication data from response headers
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('*** LoginService: Attempting login for:', credentials.email);
    
    const loginResponse = await axiosInstance.post(
      `/users-ws/users/login`,
      credentials
    );

    if (loginResponse.status !== 200) {
      throw new Error('Invalid credentials');
    }

    // Extract authentication data from headers
    const token = loginResponse.headers.token as string;
    const userId = loginResponse.headers.userid as string; // String username
    const userNumericId = loginResponse.headers.usernumericid as string; // Long numeric ID
    const userEmail = loginResponse.headers.useremail as string;
    const userRole = loginResponse.headers.userrole as string;
    const userName = loginResponse.headers.username as string; // User's display name

    console.log('*** LoginService: Response headers:', loginResponse.headers);
    console.log('*** LoginService: User IDs - userId (string):', userId, 'userNumericId (long):', userNumericId);
    console.log('*** LoginService: User name:', userName);

    if (!token || !userId || !userNumericId) {
      throw new Error('Authentication successful but token, userId, or userNumericId is missing');
    }

    // Save authentication data to local storage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId); // String username
    localStorage.setItem('userNumericId', userNumericId); // Long numeric ID for API calls
    localStorage.setItem('userEmail', userEmail || credentials.email);
    localStorage.setItem('userRole', userRole || 'USER');
    localStorage.setItem('userName', userName || credentials.email); // User's display name

    // Store expiration time (24 hours)
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const expirationTime = new Date().getTime() + expiresIn;
    localStorage.setItem('tokenExpiration', expirationTime.toString());

    console.log('*** LoginService: Login successful, token stored');

    const authData: AuthData = {
      token,
      userId,
      userNumericId,
      userEmail: userEmail || credentials.email,
      userRole: userRole || 'USER',
      userName: userName || credentials.email,
    };

    return {
      success: true,
      authData,
    };
  } catch (error) {
    console.error('*** LoginService: Login error:', error);
    throw error;
  }
};

/**
 * Logs out the current user
 * Clears all authentication data from local storage
 */
export const logoutUser = async (): Promise<LogoutResponse> => {
  try {
    console.log('*** LoginService: Logging out user');

    // Clear all authentication data from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userNumericId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('tokenExpiration');

    console.log('*** LoginService: Logout successful, local storage cleared');

    // Optional: API call for server-side logout
    // await axiosInstance.post(`/users-ws/users/logout`);

    return { success: true };
  } catch (error) {
    console.error('*** LoginService: Logout error:', error);
    throw error;
  }
};

/**
 * Validates the current authentication token
 */
export const validateToken = async (): Promise<TokenValidationResponse> => {
  try {
    const token = getAuthToken();
    const expiration = getTokenExpiration();

    if (!token || !expiration) {
      return { valid: false };
    }

    // Check if token is expired
    const now = new Date().getTime();
    const expiresAt = parseInt(expiration);

    if (now >= expiresAt) {
      console.log('*** LoginService: Token expired');
      return { valid: false };
    }

    console.log('*** LoginService: Token valid');
    return {
      valid: true,
      userId: getUserId(),
      expiresAt,
    };
  } catch (error) {
    console.error('*** LoginService: Token validation error:', error);
    return { valid: false };
  }
};

/**
 * Refreshes the authentication token (extends expiration)
 */
export const refreshToken = async (): Promise<void> => {
  try {
    console.log('*** LoginService: Refreshing token expiration');

    // Extend expiration by another 24 hours
    const expiresIn = 24 * 60 * 60 * 1000;
    const expirationTime = new Date().getTime() + expiresIn;
    localStorage.setItem('tokenExpiration', expirationTime.toString());

    console.log('*** LoginService: Token expiration refreshed');
  } catch (error) {
    console.error('*** LoginService: Token refresh error:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if the user is authenticated (token exists and is not expired)
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const expiration = localStorage.getItem('tokenExpiration');

  if (!token || !expiration) {
    return false;
  }

  // Check if token is expired
  return new Date().getTime() < parseInt(expiration);
};

/**
 * Get the current authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Get the current user ID (string username)
 */
export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

/**
 * Get the current user numeric ID (long ID for API calls)
 */
export const getUserNumericId = (): string | null => {
  return localStorage.getItem('userNumericId');
};

/**
 * Get the current user email
 */
export const getUserEmail = (): string | null => {
  return localStorage.getItem('userEmail');
};

/**
 * Get the current user role
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole');
};

/**
 * Get the current user display name
 */
export const getUserName = (): string | null => {
  return localStorage.getItem('userName');
};

/**
 * Get the token expiration timestamp
 */
export const getTokenExpiration = (): string | null => {
  return localStorage.getItem('tokenExpiration');
};

/**
 * Get complete authentication context
 */
export const getAuthContext = () => {
  return {
    isAuthenticated: isAuthenticated(),
    token: getAuthToken(),
    userId: getUserId(),
    userNumericId: getUserNumericId(),
    userEmail: getUserEmail(),
    userRole: getUserRole(),
    userName: getUserName(),
    tokenExpiration: getTokenExpiration() ? parseInt(getTokenExpiration()!) : null,
  };
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook for user login
 * @example
 * const loginMutation = useLogin();
 * loginMutation.mutate({ email: 'user@example.com', password: 'password' });
 */
export const useLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginCredentials>
) => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginUser,
    ...options,
  });
};

/**
 * Hook for user logout
 * @example
 * const logoutMutation = useLogout();
 * logoutMutation.mutate();
 */
export const useLogout = (
  options?: UseMutationOptions<LogoutResponse, Error, void>
) => {
  return useMutation<LogoutResponse, Error, void>({
    mutationFn: logoutUser,
    ...options,
  });
};

/**
 * Hook for token validation
 * @example
 * const validateMutation = useValidateToken();
 * validateMutation.mutate();
 */
export const useValidateToken = (
  options?: UseMutationOptions<TokenValidationResponse, Error, void>
) => {
  return useMutation<TokenValidationResponse, Error, void>({
    mutationFn: validateToken,
    ...options,
  });
};

/**
 * Hook for token refresh
 * @example
 * const refreshMutation = useRefreshToken();
 * refreshMutation.mutate();
 */
export const useRefreshToken = (
  options?: UseMutationOptions<void, Error, void>
) => {
  return useMutation<void, Error, void>({
    mutationFn: refreshToken,
    ...options,
  });
};

// ============================================================================
// LEGACY COMPATIBILITY - Maintain backward compatibility
// ============================================================================

export const LoginService = {
  login: loginUser,
  logout: logoutUser,
  isAuthenticated,
  getToken: getAuthToken,
  getUserId,
  getUserNumericId,
  getUserEmail,
  getUserRole,
  getUserName,
  validateToken,
  refreshToken,
  getAuthContext,
};

export default LoginService;
