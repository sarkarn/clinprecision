// src/types/api/ApiService.types.ts

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Configuration for API requests
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean; // Skip adding auth token to request
  retries?: number; // Number of retry attempts
  timeout?: number; // Request timeout in milliseconds
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success?: boolean;
  timestamp?: string;
}


/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  error?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}



/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  response?: ApiErrorResponse;
  originalError?: AxiosError;

  constructor(message: string, status: number, response?: ApiErrorResponse, originalError?: AxiosError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.originalError = originalError;
  }
}

/**
 * Authentication headers
 */
export interface AuthHeaders {
  Authorization?: string;
}

/**
 * API service interface
 */
export interface IApiService {
  get<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>>;
  getAuthHeaders(): AuthHeaders;
}


/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}



export interface PaginatedResponse<T = any> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseQueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export interface UseMutationResult<T, V = any> {
  mutate: (variables: V) => Promise<T>;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: Error | null;
  data?: T;
}
