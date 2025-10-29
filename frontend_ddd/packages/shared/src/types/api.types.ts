/**
 * API Type Definitions
 * Types for API services, HTTP communication, and external integrations
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


// ============================================================================
// HTTP Configuration
// ============================================================================

/**
 * Configuration for API requests
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retries?: number;
  timeout?: number;
}

/**
 * Authentication headers
 */
export interface AuthHeaders {
  Authorization?: string;
}

// ============================================================================
// HTTP Enums
// ============================================================================

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

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
  error?: string;
  timestamp?: string;
  path?: string;
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
 * Paginated API response
 */
export interface PaginatedResponse<T = any> {
  content?: T[];
  data?: T[];
  totalElements?: number;
  totalCount?: number;
  totalPages?: number;
  number?: number;
  page?: number;
  currentPage?: number;
  size?: number;
  pageSize?: number;
  first?: boolean;
  last?: boolean;
  hasMore?: boolean;
}

// ============================================================================
// API Error Handling
// ============================================================================

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

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * Storage keys for authentication data
 */
export enum AuthStorageKeys {
  AUTH_TOKEN = 'authToken',
  USER_ID = 'userId',
  USER_NUMERIC_ID = 'userNumericId',
  USER_EMAIL = 'userEmail',
  USER_ROLE = 'userRole',
  USER_NAME = 'userName',
  TOKEN_EXPIRATION = 'tokenExpiration',
}

// ============================================================================
// API Service Interface
// ============================================================================

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

// ============================================================================
// WebSocket Service Types
// ============================================================================

/**
 * WebSocket message types
 */
export enum WebSocketMessageType {
  AUTHENTICATE = 'authenticate',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  STATUS_UPDATE = 'status_update',
  STUDY_UPDATE = 'study_update',
  VERSION_UPDATE = 'version_update',
  COMPUTATION_COMPLETE = 'computation_complete',
  VALIDATION_RESULT = 'validation_result',
  HEARTBEAT = 'heartbeat',
  HEARTBEAT_ACK = 'heartbeat_ack',
  ERROR = 'error',
  SUBSCRIPTION_CONFIRMED = 'subscription_confirmed',
  REQUEST_STATUS_COMPUTATION = 'request_status_computation',
  HEALTH_CHECK = 'health_check',
}

/**
 * WebSocket event types
 */
export enum WebSocketEvent {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  STATUS_UPDATE = 'statusUpdate',
  STUDY_UPDATE = 'studyUpdate',
  VERSION_UPDATE = 'versionUpdate',
  COMPUTATION_COMPLETE = 'computationComplete',
  VALIDATION_RESULT = 'validationResult',
  SERVER_ERROR = 'serverError',
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: string;
  timestamp: string;
  data?: T;
}

/**
 * Authentication message data
 */
export interface AuthenticateData {
  token: string;
}

/**
 * Subscription message data
 */
export interface SubscriptionData {
  topic: string;
}

/**
 * Status update data
 */
export interface StatusUpdateData {
  studyId: string;
  status: string;
  timestamp: string;
  [key: string]: any;
}


/**
 * Connection status
 */
export interface ConnectionStatus {
  isConnected: boolean;
  reconnectAttempts: number;
  subscribedTopics: string[];
  readyState: number | null;
}

/**
 * WebSocket event callback
 */
export type WebSocketEventCallback<T = any> = (data: T) => void;

/**
 * WebSocket service interface
 */
export interface IWebSocketService {
  connect(): Promise<IWebSocketService>;
  disconnect(): void;
  send(type: string, data?: Record<string, any>): void;
  subscribe(topic: string): void;
  unsubscribe(topic: string): void;
  subscribeToStudy(studyId: string): void;
  unsubscribeFromStudy(studyId: string): void;
  subscribeToStatusComputation(): void;
  requestStatusComputation(studyId: string): void;
  requestHealthCheck(): void;
  on(event: string, callback: WebSocketEventCallback): void;
  off(event: string, callback: WebSocketEventCallback): void;
  getConnectionStatus(): ConnectionStatus;
  clearAllListeners(): void;
}

/**
 * WebSocket ready states
 */
export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}
