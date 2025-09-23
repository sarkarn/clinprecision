// src/hooks/useStatusSynchronization.js
import { useState, useEffect, useCallback, useRef } from 'react';
import webSocketService from '../services/WebSocketService';
import StudyService from '../services/StudyService';

/**
 * Hook for real-time status synchronization
 * Manages real-time status updates and synchronization across the application
 */
export const useStatusSynchronization = (options = {}) => {
    const {
        studyId = null,
        autoConnect = true,
        enableGlobalUpdates = false,
        onStatusUpdate = null,
        onError = null
    } = options;

    // State management
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [statusCache, setStatusCache] = useState(new Map());
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [syncErrors, setSyncErrors] = useState([]);

    // Refs for cleanup and callbacks
    const eventListenersRef = useRef(new Map());
    const retryTimeoutRef = useRef(null);
    const cacheTimeoutRef = useRef(null);

    /**
     * Initialize WebSocket connection and event listeners
     */
    const initializeConnection = useCallback(async () => {
        try {
            setConnectionStatus('connecting');
            await webSocketService.connect();
            setConnectionStatus('connected');
            setIsConnected(true);
            setSyncErrors([]);
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            setConnectionStatus('failed');
            setIsConnected(false);
            setSyncErrors(prev => [...prev, { type: 'connection', message: error.message, timestamp: new Date() }]);
            
            if (onError) {
                onError(error);
            }
            
            // Retry connection
            scheduleRetry();
        }
    }, [onError]);

    /**
     * Schedule connection retry
     */
    const scheduleRetry = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
            if (!isConnected) {
                initializeConnection();
            }
        }, 5000);
    }, [isConnected, initializeConnection]);

    /**
     * Handle status update events
     */
    const handleStatusUpdate = useCallback((data) => {
        console.log('📊 Status update received:', data);
        
        const { studyId: updateStudyId, status, version, timestamp, metadata } = data;
        
        // Update status cache
        setStatusCache(prev => {
            const newCache = new Map(prev);
            const key = updateStudyId ? `study-${updateStudyId}` : 'global';
            newCache.set(key, {
                status,
                version,
                timestamp,
                metadata,
                updatedAt: new Date()
            });
            return newCache;
        });
        
        // Update last update timestamp
        setLastUpdate(new Date(timestamp));
        
        // Add to pending updates for batch processing
        setPendingUpdates(prev => [...prev, {
            id: Date.now(),
            type: 'status',
            studyId: updateStudyId,
            data,
            timestamp: new Date()
        }]);
        
        // Call external callback
        if (onStatusUpdate) {
            onStatusUpdate(data);
        }
        
        // Emit custom event for other components
        window.dispatchEvent(new CustomEvent('statusUpdate', { detail: data }));
    }, [onStatusUpdate]);

    /**
     * Handle study update events
     */
    const handleStudyUpdate = useCallback((data) => {
        console.log('📚 Study update received:', data);
        
        // Update status cache for study
        setStatusCache(prev => {
            const newCache = new Map(prev);
            newCache.set(`study-${data.studyId}`, {
                ...data,
                updatedAt: new Date()
            });
            return newCache;
        });
        
        // Add to pending updates
        setPendingUpdates(prev => [...prev, {
            id: Date.now(),
            type: 'study',
            studyId: data.studyId,
            data,
            timestamp: new Date()
        }]);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('studyUpdate', { detail: data }));
    }, []);

    /**
     * Handle version update events
     */
    const handleVersionUpdate = useCallback((data) => {
        console.log('🔄 Version update received:', data);
        
        // Add to pending updates
        setPendingUpdates(prev => [...prev, {
            id: Date.now(),
            type: 'version',
            studyId: data.studyId,
            data,
            timestamp: new Date()
        }]);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('versionUpdate', { detail: data }));
    }, []);

    /**
     * Handle computation complete events
     */
    const handleComputationComplete = useCallback((data) => {
        console.log('⚙️ Computation complete:', data);
        
        // Update status cache if it contains status information
        if (data.results && data.studyId) {
            setStatusCache(prev => {
                const newCache = new Map(prev);
                newCache.set(`study-${data.studyId}`, {
                    ...data.results,
                    computationId: data.computationId,
                    updatedAt: new Date()
                });
                return newCache;
            });
        }
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('computationComplete', { detail: data }));
    }, []);

    /**
     * Handle validation result events
     */
    const handleValidationResult = useCallback((data) => {
        console.log('✅ Validation result received:', data);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('validationResult', { detail: data }));
    }, []);

    /**
     * Handle connection state changes
     */
    const handleConnectionChange = useCallback((connected) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
        
        if (connected) {
            // Re-subscribe to topics after reconnection
            if (studyId) {
                webSocketService.subscribeToStudy(studyId);
            }
            if (enableGlobalUpdates) {
                webSocketService.subscribeToStatusComputation();
            }
        }
    }, [studyId, enableGlobalUpdates]);

    /**
     * Subscribe to a specific study
     */
    const subscribeToStudy = useCallback((targetStudyId) => {
        if (isConnected) {
            webSocketService.subscribeToStudy(targetStudyId);
        }
    }, [isConnected]);

    /**
     * Unsubscribe from a study
     */
    const unsubscribeFromStudy = useCallback((targetStudyId) => {
        if (isConnected) {
            webSocketService.unsubscribeFromStudy(targetStudyId);
        }
        
        // Clear cache for study
        setStatusCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(`study-${targetStudyId}`);
            return newCache;
        });
    }, [isConnected]);

    /**
     * Request immediate status computation
     */
    const requestStatusComputation = useCallback((targetStudyId) => {
        if (isConnected) {
            webSocketService.requestStatusComputation(targetStudyId);
        } else {
            console.warn('Cannot request status computation: WebSocket not connected');
        }
    }, [isConnected]);

    /**
     * Get cached status for a study
     */
    const getCachedStatus = useCallback((targetStudyId) => {
        const key = targetStudyId ? `study-${targetStudyId}` : 'global';
        return statusCache.get(key) || null;
    }, [statusCache]);

    /**
     * Force refresh status from backend
     */
    const refreshStatus = useCallback(async (targetStudyId) => {
        try {
            const studyData = await StudyService.getStudyById(targetStudyId);
            
            // Update cache with fresh data
            setStatusCache(prev => {
                const newCache = new Map(prev);
                newCache.set(`study-${targetStudyId}`, {
                    ...studyData,
                    refreshedAt: new Date()
                });
                return newCache;
            });
            
            return studyData;
        } catch (error) {
            console.error('Failed to refresh status:', error);
            setSyncErrors(prev => [...prev, { 
                type: 'refresh', 
                message: error.message, 
                studyId: targetStudyId,
                timestamp: new Date() 
            }]);
            throw error;
        }
    }, []);

    /**
     * Clear pending updates
     */
    const clearPendingUpdates = useCallback(() => {
        setPendingUpdates([]);
    }, []);

    /**
     * Clear sync errors
     */
    const clearSyncErrors = useCallback(() => {
        setSyncErrors([]);
    }, []);

    /**
     * Get connection statistics
     */
    const getConnectionStats = useCallback(() => {
        return {
            isConnected,
            connectionStatus,
            lastUpdate,
            cacheSize: statusCache.size,
            pendingUpdates: pendingUpdates.length,
            syncErrors: syncErrors.length,
            subscribedTopics: webSocketService.getConnectionStatus().subscribedTopics
        };
    }, [isConnected, connectionStatus, lastUpdate, statusCache.size, pendingUpdates.length, syncErrors.length]);

    /**
     * Setup effect for WebSocket event listeners
     */
    useEffect(() => {
        // Store event listeners in ref for cleanup
        const listeners = new Map([
            ['statusUpdate', handleStatusUpdate],
            ['studyUpdate', handleStudyUpdate],
            ['versionUpdate', handleVersionUpdate],
            ['computationComplete', handleComputationComplete],
            ['validationResult', handleValidationResult],
            ['connected', () => handleConnectionChange(true)],
            ['disconnected', () => handleConnectionChange(false)],
            ['error', (error) => {
                setSyncErrors(prev => [...prev, { 
                    type: 'websocket', 
                    message: error.message, 
                    timestamp: new Date() 
                }]);
                if (onError) onError(error);
            }]
        ]);
        
        eventListenersRef.current = listeners;
        
        // Register event listeners
        listeners.forEach((callback, event) => {
            webSocketService.on(event, callback);
        });
        
        return () => {
            // Cleanup event listeners
            listeners.forEach((callback, event) => {
                webSocketService.off(event, callback);
            });
        };
    }, [handleStatusUpdate, handleStudyUpdate, handleVersionUpdate, handleComputationComplete, 
        handleValidationResult, handleConnectionChange, onError]);

    /**
     * Auto-connect effect
     */
    useEffect(() => {
        if (autoConnect && !isConnected) {
            initializeConnection();
        }
        
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [autoConnect, isConnected, initializeConnection]);

    /**
     * Study subscription effect
     */
    useEffect(() => {
        if (studyId && isConnected) {
            webSocketService.subscribeToStudy(studyId);
        }
        
        return () => {
            if (studyId && isConnected) {
                webSocketService.unsubscribeFromStudy(studyId);
            }
        };
    }, [studyId, isConnected]);

    /**
     * Global updates subscription effect
     */
    useEffect(() => {
        if (enableGlobalUpdates && isConnected) {
            webSocketService.subscribeToStatusComputation();
        }
    }, [enableGlobalUpdates, isConnected]);

    /**
     * Cache cleanup effect
     */
    useEffect(() => {
        // Clear old cache entries periodically
        cacheTimeoutRef.current = setInterval(() => {
            const now = new Date();
            const maxAge = 10 * 60 * 1000; // 10 minutes
            
            setStatusCache(prev => {
                const newCache = new Map();
                
                prev.forEach((value, key) => {
                    if (value.updatedAt && (now - value.updatedAt) < maxAge) {
                        newCache.set(key, value);
                    }
                });
                
                return newCache;
            });
        }, 5 * 60 * 1000); // Run every 5 minutes
        
        return () => {
            if (cacheTimeoutRef.current) {
                clearInterval(cacheTimeoutRef.current);
            }
        };
    }, []);

    return {
        // Connection state
        isConnected,
        connectionStatus,
        lastUpdate,
        
        // Data
        statusCache,
        pendingUpdates,
        syncErrors,
        
        // Actions
        subscribeToStudy,
        unsubscribeFromStudy,
        requestStatusComputation,
        refreshStatus,
        clearPendingUpdates,
        clearSyncErrors,
        
        // Utilities
        getCachedStatus,
        getConnectionStats,
        
        // Direct WebSocket access (for advanced use)
        webSocket: webSocketService
    };
};

export default useStatusSynchronization;