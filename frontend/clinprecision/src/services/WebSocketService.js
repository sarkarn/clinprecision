// src/services/WebSocketService.js
import { API_BASE_URL } from '../config.js';

/**
 * WebSocket Service for Real-time Status Updates
 * Handles real-time communication with backend for study status changes
 */
class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000; // 5 seconds
        this.heartbeatInterval = 30000; // 30 seconds
        this.heartbeatTimer = null;
        this.eventListeners = new Map();
        this.subscribedTopics = new Set();
        this.connectionPromise = null;
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                // Convert HTTP/HTTPS URL to WebSocket URL
                const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws');
                const wsUrl = `${wsBaseUrl}/ws/status-updates`;
                
                console.log('🔌 Connecting to WebSocket:', wsUrl);
                
                this.socket = new WebSocket(wsUrl);

                this.socket.onopen = (event) => {
                    console.log('✅ WebSocket connected successfully');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    
                    // Send authentication if token exists
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        this.send('authenticate', { token });
                    }
                    
                    // Re-subscribe to topics after reconnection
                    this.subscribedTopics.forEach(topic => {
                        this.send('subscribe', { topic });
                    });
                    
                    this.emit('connected', event);
                    resolve(this);
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('❌ Error parsing WebSocket message:', error, event.data);
                    }
                };

                this.socket.onclose = (event) => {
                    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.connectionPromise = null;
                    
                    this.emit('disconnected', event);
                    
                    // Attempt to reconnect if not a manual close
                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.attemptReconnect();
                    }
                };

                this.socket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };

            } catch (error) {
                console.error('❌ Error creating WebSocket connection:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting WebSocket...');
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
    attemptReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
        
        setTimeout(() => {
            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                this.connect().catch(error => {
                    console.error('❌ Reconnection failed:', error);
                });
            }
        }, delay);
    }

    /**
     * Send message to WebSocket server
     */
    send(type, data = {}) {
        if (this.isConnected && this.socket) {
            const message = {
                type,
                timestamp: new Date().toISOString(),
                ...data
            };
            
            try {
                this.socket.send(JSON.stringify(message));
                console.log('📤 Sent WebSocket message:', message);
            } catch (error) {
                console.error('❌ Error sending WebSocket message:', error);
            }
        } else {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(message) {
        console.log('📥 Received WebSocket message:', message);
        
        const { type, data } = message;
        
        switch (type) {
            case 'status_update':
                this.emit('statusUpdate', data);
                break;
            case 'study_update':
                this.emit('studyUpdate', data);
                break;
            case 'version_update':
                this.emit('versionUpdate', data);
                break;
            case 'computation_complete':
                this.emit('computationComplete', data);
                break;
            case 'validation_result':
                this.emit('validationResult', data);
                break;
            case 'heartbeat':
                this.send('heartbeat_ack');
                break;
            case 'error':
                console.error('❌ WebSocket server error:', data);
                this.emit('serverError', data);
                break;
            case 'subscription_confirmed':
                console.log('✅ Subscription confirmed for topic:', data.topic);
                break;
            default:
                console.log('📝 Unknown message type:', type, data);
        }
    }

    /**
     * Subscribe to real-time updates for a specific topic
     */
    subscribe(topic) {
        console.log('📡 Subscribing to topic:', topic);
        this.subscribedTopics.add(topic);
        
        if (this.isConnected) {
            this.send('subscribe', { topic });
        }
    }

    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic) {
        console.log('📡 Unsubscribing from topic:', topic);
        this.subscribedTopics.delete(topic);
        
        if (this.isConnected) {
            this.send('unsubscribe', { topic });
        }
    }

    /**
     * Subscribe to study-specific updates
     */
    subscribeToStudy(studyId) {
        this.subscribe(`study.${studyId}`);
        this.subscribe(`study.${studyId}.status`);
        this.subscribe(`study.${studyId}.versions`);
    }

    /**
     * Unsubscribe from study-specific updates
     */
    unsubscribeFromStudy(studyId) {
        this.unsubscribe(`study.${studyId}`);
        this.unsubscribe(`study.${studyId}.status`);
        this.unsubscribe(`study.${studyId}.versions`);
    }

    /**
     * Subscribe to global status computation updates
     */
    subscribeToStatusComputation() {
        this.subscribe('status.computation');
        this.subscribe('status.validation');
    }

    /**
     * Request immediate status computation for a study
     */
    requestStatusComputation(studyId) {
        this.send('request_status_computation', { studyId });
    }

    /**
     * Request health check
     */
    requestHealthCheck() {
        this.send('health_check');
    }

    /**
     * Start heartbeat to maintain connection
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send('heartbeat');
            }
        }, this.heartbeatInterval);
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    /**
     * Emit event to all listeners
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            subscribedTopics: Array.from(this.subscribedTopics),
            readyState: this.socket ? this.socket.readyState : null
        };
    }

    /**
     * Clear all event listeners
     */
    clearAllListeners() {
        this.eventListeners.clear();
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Auto-connect when token is available (optional)
if (typeof window !== 'undefined' && localStorage.getItem('authToken')) {
    // Small delay to ensure other services are initialized
    setTimeout(() => {
        webSocketService.connect().catch(error => {
            console.warn('⚠️ Initial WebSocket connection failed:', error);
        });
    }, 1000);
}

export default webSocketService;

// Export for testing
export { WebSocketService };