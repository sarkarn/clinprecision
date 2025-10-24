// src/types/auth/Login.types.ts

/**
 * Authentication credentials for login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication data returned from login
 */
export interface AuthData {
  token: string;
  userId: string; // String username
  userNumericId: string; // Long numeric ID for API calls
  userEmail: string;
  userRole: string;
  userName: string; // User's display name
}

/**
 * Login response structure
 */
export interface LoginResponse {
  success: boolean;
  authData: AuthData;
}

/**
 * Logout response structure
 */
export interface LogoutResponse {
  success: boolean;
}

/**
 * Local storage keys for authentication data
 */
export enum AuthStorageKeys {
  AUTH_TOKEN = 'authToken',
  USER_ID = 'userId',
  USER_NUMERIC_ID = 'userNumericId',
  USER_EMAIL = 'userEmail',
  USER_ROLE = 'userRole',
  USER_NAME = 'userName',
  TOKEN_EXPIRATION = 'tokenExpiration'
}

/**
 * Default token expiration time (24 hours in milliseconds)
 */
export const DEFAULT_TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Login API endpoint
 */
export const LOGIN_ENDPOINT = '/users-ws/users/login';

/**
 * Logout API endpoint
 */
export const LOGOUT_ENDPOINT = '/users-ws/users/logout';

/**
 * Login service interface
 */
export interface ILoginService {
  /**
   * Authenticates a user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise with login response data
   */
  login(email: string, password: string): Promise<LoginResponse>;

  /**
   * Logs out the current user
   * @returns Promise indicating logout success
   */
  logout(): Promise<LogoutResponse>;

  /**
   * Check if the user is authenticated (token exists and is not expired)
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean;

  /**
   * Get the current authentication token
   * @returns The authentication token or null
   */
  getToken(): string | null;

  /**
   * Get the current user ID (string username)
   * @returns The user ID or null
   */
  getUserId(): string | null;
}
