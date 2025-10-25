import { useState, useEffect, useCallback, useRef } from 'react';
import webSocketService from '../services/WebSocketService';
import StudyService from '../services/StudyService';
import type {
  StatusUpdateData,
  StudyUpdateData,
  VersionUpdateData,
  ComputationCompleteData,
  ValidationResultData
} from '../types/api/WebSocketService.types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for useStatusSynchronization hook
 */
export interface UseStatusSynchronizationOptions {
  /** Study ID to monitor */
  studyId?: string | number | null;
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Enable global status updates */
  enableGlobalUpdates?: boolean;
  /** Callback for status updates */
  onStatusUpdate?: ((data: StatusUpdateData) => void) | null;
  /** Callback for errors */
  onError?: ((error: Error) => void) | null;
}

/**
 * Connection status types
 */
export type ConnectionStatusType = 'disconnected' | 'connecting' | 'connected' | 'failed';

/**
 * Cached status entry
 */
export interface CachedStatus {
  status?: any;
  version?: string | number;
  timestamp?: string;
  metadata?: any;
  updatedAt: Date;
  refreshedAt?: Date;
  [key: string]: any;
}

/**
 * Pending update entry
 */
export interface PendingUpdate {
  id: number;
  type: 'status' | 'study' | 'version' | string;
  studyId?: string | number;
  data: any;
  timestamp: Date;
}

/**
 * Sync error entry
 */
export interface SyncError {
  type: 'connection' | 'websocket' | 'refresh' | string;
  message: string;
  timestamp: Date;
  studyId?: string | number;
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  isConnected: boolean;
  connectionStatus: ConnectionStatusType;
  lastUpdate: Date | null;
  cacheSize: number;
  pendingUpdates: number;
  syncErrors: number;
  subscribedTopics: string[];
}

/**
 * Return type of useStatusSynchronization hook
 */
export interface UseStatusSynchronizationResult {
  // Connection state
  isConnected: boolean;
  connectionStatus: ConnectionStatusType;
  lastUpdate: Date | null;
  
  // Data
  statusCache: Map<string, CachedStatus>;
  pendingUpdates: PendingUpdate[];
  syncErrors: SyncError[];
  
  // Actions
  subscribeToStudy: (studyId: string | number) => void;
  unsubscribeFromStudy: (studyId: string | number) => void;
  requestStatusComputation: (studyId: string | number) => void;
  refreshStatus: (studyId: string | number) => Promise<any>;
  clearPendingUpdates: () => void;
  clearSyncErrors: () => void;
  
  // Utilities
  getCachedStatus: (studyId?: string | number) => CachedStatus | null;
  getConnectionStats: () => ConnectionStats;
  
  // Direct WebSocket access
  webSocket: typeof webSocketService;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for real-time status synchronization
 * 
 * Manages real-time status updates and synchronization across the application
 * using WebSocket connections.
 * 
 * @param options - Configuration options
 * @returns Status synchronization state and utilities
 * 
 * @example
 * ```typescript
 * const {
 *   isConnected,
 *   subscribeToStudy,
 *   getCachedStatus,
 *   refreshStatus
 * } = useStatusSynchronization({
 *   studyId: '123',
 *   autoConnect: true,
 *   onStatusUpdate: (data) => console.log('Status updated:', data)
 * });
 * ```
 */
export const useStatusSynchronization = (
  options: UseStatusSynchronizationOptions = {}
): UseStatusSynchronizationResult => {
  const {
    studyId = null,
    autoConnect = true,
    enableGlobalUpdates = false,
    onStatusUpdate = null,
    onError = null
  } = options;

  // State management
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [statusCache, setStatusCache] = useState<Map<string, CachedStatus>>(new Map());
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);

  // Refs for cleanup and callbacks
  const eventListenersRef = useRef<Map<string, Function>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize WebSocket connection and event listeners
   */
  const initializeConnection = useCallback(async (): Promise<void> => {
    try {
      setConnectionStatus('connecting');
      await webSocketService.connect();
      setConnectionStatus('connected');
      setIsConnected(true);
      setSyncErrors([]);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Connection failed');
      console.error('Failed to connect to WebSocket:', err);
      setConnectionStatus('failed');
      setIsConnected(false);
      setSyncErrors(prev => [...prev, { 
        type: 'connection', 
        message: err.message, 
        timestamp: new Date() 
      }]);
      
      if (onError) {
        onError(err);
      }
      
      // Retry connection
      scheduleRetry();
    }
  }, [onError]);

  /**
   * Schedule connection retry
   */
  const scheduleRetry = useCallback((): void => {
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
  const handleStatusUpdate = useCallback((data: StatusUpdateData): void => {
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
    if (timestamp) {
      setLastUpdate(new Date(timestamp));
    }
    
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
  const handleStudyUpdate = useCallback((data: StudyUpdateData): void => {
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
  const handleVersionUpdate = useCallback((data: VersionUpdateData): void => {
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
  const handleComputationComplete = useCallback((data: ComputationCompleteData): void => {
    console.log('⚙️ Computation complete:', data);
    
    // Update status cache if it contains status information
    if (data.result && data.studyId) {
      setStatusCache(prev => {
        const newCache = new Map(prev);
        newCache.set(`study-${data.studyId}`, {
          ...data.result,
          computationType: data.computationType,
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
  const handleValidationResult = useCallback((data: ValidationResultData): void => {
    console.log('✅ Validation result received:', data);
    
    // Emit custom event
    window.dispatchEvent(new CustomEvent('validationResult', { detail: data }));
  }, []);

  /**
   * Handle connection state changes
   */
  const handleConnectionChange = useCallback((connected: boolean): void => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
    
    if (connected && studyId) {
      // Re-subscribe to topics after reconnection
      webSocketService.subscribeToStudy(String(studyId));
      
      if (enableGlobalUpdates) {
        webSocketService.subscribeToStatusComputation();
      }
    }
  }, [studyId, enableGlobalUpdates]);

  /**
   * Subscribe to a specific study
   */
  const subscribeToStudy = useCallback((targetStudyId: string | number): void => {
    if (isConnected) {
      webSocketService.subscribeToStudy(String(targetStudyId));
    }
  }, [isConnected]);

  /**
   * Unsubscribe from a study
   */
  const unsubscribeFromStudy = useCallback((targetStudyId: string | number): void => {
    if (isConnected) {
      webSocketService.unsubscribeFromStudy(String(targetStudyId));
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
  const requestStatusComputation = useCallback((targetStudyId: string | number): void => {
    if (isConnected) {
      webSocketService.requestStatusComputation(String(targetStudyId));
    } else {
      console.warn('Cannot request status computation: WebSocket not connected');
    }
  }, [isConnected]);

  /**
   * Get cached status for a study
   */
  const getCachedStatus = useCallback((targetStudyId?: string | number): CachedStatus | null => {
    const key = targetStudyId ? `study-${targetStudyId}` : 'global';
    return statusCache.get(key) || null;
  }, [statusCache]);

  /**
   * Force refresh status from backend
   */
  const refreshStatus = useCallback(async (targetStudyId: string | number): Promise<any> => {
    try {
      const studyData = await StudyService.getStudyById(String(targetStudyId));
      
      // Update cache with fresh data
      setStatusCache(prev => {
        const newCache = new Map(prev);
        newCache.set(`study-${targetStudyId}`, {
          ...studyData,
          updatedAt: new Date(),
          refreshedAt: new Date()
        });
        return newCache;
      });
      
      return studyData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Refresh failed');
      console.error('Failed to refresh status:', err);
      setSyncErrors(prev => [...prev, { 
        type: 'refresh', 
        message: err.message, 
        studyId: targetStudyId,
        timestamp: new Date() 
      }]);
      throw error;
    }
  }, []);

  /**
   * Clear pending updates
   */
  const clearPendingUpdates = useCallback((): void => {
    setPendingUpdates([]);
  }, []);

  /**
   * Clear sync errors
   */
  const clearSyncErrors = useCallback((): void => {
    setSyncErrors([]);
  }, []);

  /**
   * Get connection statistics
   */
  const getConnectionStats = useCallback((): ConnectionStats => {
    const wsStatus = webSocketService.getConnectionStatus();
    return {
      isConnected,
      connectionStatus,
      lastUpdate,
      cacheSize: statusCache.size,
      pendingUpdates: pendingUpdates.length,
      syncErrors: syncErrors.length,
      subscribedTopics: wsStatus.subscribedTopics
    };
  }, [isConnected, connectionStatus, lastUpdate, statusCache.size, pendingUpdates.length, syncErrors.length]);

  /**
   * Setup effect for WebSocket event listeners
   */
  useEffect(() => {
    // Store event listeners in ref for cleanup
    const listeners = new Map<string, Function>([
      ['statusUpdate', handleStatusUpdate],
      ['studyUpdate', handleStudyUpdate],
      ['versionUpdate', handleVersionUpdate],
      ['computationComplete', handleComputationComplete],
      ['validationResult', handleValidationResult],
      ['connected', () => handleConnectionChange(true)],
      ['disconnected', () => handleConnectionChange(false)],
      ['error', (error: Error) => {
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
      webSocketService.on(event, callback as any);
    });
    
    return () => {
      // Cleanup event listeners
      listeners.forEach((callback, event) => {
        webSocketService.off(event, callback as any);
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
      webSocketService.subscribeToStudy(String(studyId));
    }
    
    return () => {
      if (studyId && isConnected) {
        webSocketService.unsubscribeFromStudy(String(studyId));
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
        const newCache = new Map<string, CachedStatus>();
        
        prev.forEach((value, key) => {
          if (value.updatedAt && ((now.getTime() - value.updatedAt.getTime()) < maxAge)) {
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
