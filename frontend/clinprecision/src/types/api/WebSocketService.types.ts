// src/types/api/WebSocketService.types.ts

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
 * Study update data
 */
export interface StudyUpdateData {
  studyId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

/**
 * Version update data
 */
export interface VersionUpdateData {
  studyId: string;
  versionId: string;
  action: 'created' | 'updated' | 'activated' | 'deleted';
  timestamp: string;
}

/**
 * Computation complete data
 */
export interface ComputationCompleteData {
  studyId: string;
  computationType: string;
  result: any;
  duration: number;
  timestamp: string;
}

/**
 * Validation result data
 */
export interface ValidationResultData {
  studyId: string;
  validationId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
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
