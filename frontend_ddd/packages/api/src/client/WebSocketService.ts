// src/services/WebSocketService.ts
import { API_BASE_URL } from '../config';
import {
  IWebSocketService,
  WebSocketMessage,
  WebSocketEvent,
  WebSocketEventCallback,
  ConnectionStatus,
  StatusUpdateData,
  StudyUpdateData,
  VersionUpdateData,
  ComputationCompleteData,
  ValidationResultData,
} from '../types/api/WebSocketService.types';

/**
 * WebSocket Service for Real-time Status Updates
 * 
 * Features:
 * - Real-time communication with backend
 * - Automatic reconnection with exponential backoff
 * - Topic-based subscription system
 * - Heartbeat mechanism for connection health
 * - Event-driven architecture
 * 
 * Usage:
 *   import webSocketService from './services/WebSocketService';
 *   await webSocketService.connect();
 *   webSocketService.subscribeToStudy(studyId);
 *   webSocketService.on('statusUpdate', (data) => { ... });
 */
class WebSocketService implements IWebSocketService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 5000; // 5 seconds
  private heartbeatInterval: number = 30000; // 30 seconds
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private eventListeners: Map<string, Set<WebSocketEventCallback>> = new Map();
  private subscribedTopics: Set<string> = new Set();
  private connectionPromise: Promise<IWebSocketService> | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<IWebSocketService> {
    if (this.connectionPromise) {
      console.log('*** WebSocketService: Connection already in progress, returning existing promise');
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<IWebSocketService>((resolve, reject) => {
      try {
        // Convert HTTP/HTTPS URL to WebSocket URL
        const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws');
        const wsUrl = `${wsBaseUrl}/ws/status-updates`;

        console.log('*** WebSocketService: 🔌 Connecting to WebSocket:', wsUrl);

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = (event: Event) => {
          console.log('*** WebSocketService: ✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();

          // Send authentication if token exists
          const token = localStorage.getItem('authToken');
          if (token) {
            console.log('*** WebSocketService: Sending authentication');
            this.send('authenticate', { token });
          }

          // Re-subscribe to topics after reconnection
          this.subscribedTopics.forEach((topic) => {
            console.log('*** WebSocketService: Re-subscribing to topic:', topic);
            this.send('subscribe', { topic });
          });

          this.emit(WebSocketEvent.CONNECTED, event);
          resolve(this);
        };

        this.socket.onmessage = (event: MessageEvent) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('*** WebSocketService: ❌ Error parsing WebSocket message:', error, event.data);
          }
        };

        this.socket.onclose = (event: CloseEvent) => {
          console.log('*** WebSocketService: 🔌 WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.connectionPromise = null;

          this.emit(WebSocketEvent.DISCONNECTED, event);

          // Attempt to reconnect if not a manual close (1000 = normal closure)
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error: Event) => {
          console.error('*** WebSocketService: ❌ WebSocket error:', error);
          this.emit(WebSocketEvent.ERROR, error);
          reject(error);
        };
      } catch (error) {
        console.error('*** WebSocketService: ❌ Error creating WebSocket connection:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('*** WebSocketService: 🔌 Disconnecting WebSocket...');
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.connectionPromise = null;
    this.subscribedTopics.clear();
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(
      `*** WebSocketService: 🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
    );

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch((error) => {
          console.error('*** WebSocketService: ❌ Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Send message to WebSocket server
   */
  send(type: string, data: Record<string, any> = {}): void {
    if (this.isConnected && this.socket) {
      const message: WebSocketMessage = {
        type,
        timestamp: new Date().toISOString(),
        ...data,
      };

      try {
        this.socket.send(JSON.stringify(message));
        console.log('*** WebSocketService: 📤 Sent WebSocket message:', message);
      } catch (error) {
        console.error('*** WebSocketService: ❌ Error sending WebSocket message:', error);
      }
    } else {
      console.warn('*** WebSocketService: ⚠️ Cannot send message: WebSocket not connected');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('*** WebSocketService: 📥 Received WebSocket message:', message);

    const { type, data } = message;

    switch (type) {
      case 'status_update':
        this.emit(WebSocketEvent.STATUS_UPDATE, data as StatusUpdateData);
        break;
      case 'study_update':
        this.emit(WebSocketEvent.STUDY_UPDATE, data as StudyUpdateData);
        break;
      case 'version_update':
        this.emit(WebSocketEvent.VERSION_UPDATE, data as VersionUpdateData);
        break;
      case 'computation_complete':
        this.emit(WebSocketEvent.COMPUTATION_COMPLETE, data as ComputationCompleteData);
        break;
      case 'validation_result':
        this.emit(WebSocketEvent.VALIDATION_RESULT, data as ValidationResultData);
        break;
      case 'heartbeat':
        this.send('heartbeat_ack');
        break;
      case 'error':
        console.error('*** WebSocketService: ❌ WebSocket server error:', data);
        this.emit(WebSocketEvent.SERVER_ERROR, data);
        break;
      case 'subscription_confirmed':
        console.log('*** WebSocketService: ✅ Subscription confirmed for topic:', (data as any)?.topic);
        break;
      default:
        console.log('*** WebSocketService: 📝 Unknown message type:', type, data);
    }
  }

  /**
   * Subscribe to real-time updates for a specific topic
   */
  subscribe(topic: string): void {
    console.log('*** WebSocketService: 📡 Subscribing to topic:', topic);
    this.subscribedTopics.add(topic);

    if (this.isConnected) {
      this.send('subscribe', { topic });
    }
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): void {
    console.log('*** WebSocketService: 📡 Unsubscribing from topic:', topic);
    this.subscribedTopics.delete(topic);

    if (this.isConnected) {
      this.send('unsubscribe', { topic });
    }
  }

  /**
   * Subscribe to study-specific updates
   */
  subscribeToStudy(studyId: string): void {
    console.log('*** WebSocketService: Subscribing to study:', studyId);
    this.subscribe(`study.${studyId}`);
    this.subscribe(`study.${studyId}.status`);
    this.subscribe(`study.${studyId}.versions`);
  }

  /**
   * Unsubscribe from study-specific updates
   */
  unsubscribeFromStudy(studyId: string): void {
    console.log('*** WebSocketService: Unsubscribing from study:', studyId);
    this.unsubscribe(`study.${studyId}`);
    this.unsubscribe(`study.${studyId}.status`);
    this.unsubscribe(`study.${studyId}.versions`);
  }

  /**
   * Subscribe to global status computation updates
   */
  subscribeToStatusComputation(): void {
    console.log('*** WebSocketService: Subscribing to status computation');
    this.subscribe('status.computation');
    this.subscribe('status.validation');
  }

  /**
   * Request immediate status computation for a study
   */
  requestStatusComputation(studyId: string): void {
    console.log('*** WebSocketService: Requesting status computation for study:', studyId);
    this.send('request_status_computation', { studyId });
  }

  /**
   * Request health check
   */
  requestHealthCheck(): void {
    console.log('*** WebSocketService: Requesting health check');
    this.send('health_check');
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat');
      }
    }, this.heartbeatInterval);
    console.log('*** WebSocketService: ❤️ Heartbeat started');
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      console.log('*** WebSocketService: ❤️ Heartbeat stopped');
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: WebSocketEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    console.log('*** WebSocketService: Added event listener for:', event);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: WebSocketEventCallback): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback);
      console.log('*** WebSocketService: Removed event listener for:', event);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`*** WebSocketService: ❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscribedTopics: Array.from(this.subscribedTopics),
      readyState: this.socket ? this.socket.readyState : null,
    };
  }

  /**
   * Clear all event listeners
   */
  clearAllListeners(): void {
    this.eventListeners.clear();
    console.log('*** WebSocketService: Cleared all event listeners');
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Auto-connect when token is available (optional)
if (typeof window !== 'undefined' && localStorage.getItem('authToken')) {
  console.log('*** WebSocketService: Auth token found, initiating auto-connect');
  // Small delay to ensure other services are initialized
  setTimeout(() => {
    webSocketService.connect().catch((error) => {
      console.warn('*** WebSocketService: ⚠️ Initial WebSocket connection failed:', error);
    });
  }, 1000);
}

// Export singleton instance
export default webSocketService;

// Named exports
export { WebSocketService };
export type { IWebSocketService };
