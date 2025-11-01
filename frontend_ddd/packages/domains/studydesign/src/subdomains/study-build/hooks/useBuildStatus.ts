import { useState, useEffect, useCallback } from 'react';
import studyDatabaseBuildService from '../services/StudyDatabaseBuildService';
import { StudyDatabaseBuild, BuildStatus } from '../types/study/DatabaseBuild.types';

/**
 * Hook return type for useBuildStatus
 */
export interface UseBuildStatusReturn {
  // State
  build: StudyDatabaseBuild | null;
  loading: boolean;
  error: Error | null;
  polling: boolean;
  
  // Operations
  fetchBuildStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  setBuild: (build: StudyDatabaseBuild | null) => void;
  
  // Computed properties
  progress: number;
  statusColor: string;
  formattedDuration: string;
  isInProgress: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
}

/**
 * Custom hook for managing build status and real-time updates
 * Polls for status updates when build is in progress
 * 
 * @param initialBuild - Initial build object
 * @param pollInterval - Polling interval in milliseconds (default: 10000)
 * @returns Current build state and operations
 */
export const useBuildStatus = (
  initialBuild: StudyDatabaseBuild | null,
  pollInterval: number = 10000
): UseBuildStatusReturn => {
  const [build, setBuild] = useState<StudyDatabaseBuild | null>(initialBuild);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [polling, setPolling] = useState<boolean>(false);

  /**
   * Fetch latest build status
   */
  const fetchBuildStatus = useCallback(async (): Promise<void> => {
    if (!build?.buildRequestId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updated = await studyDatabaseBuildService.getBuildByRequestId(
        build.buildRequestId
      );
      
      setBuild(updated);
      
      // Stop polling if build is no longer in progress
      if (updated.buildStatus !== 'IN_PROGRESS') {
        setPolling(false);
      }
      
    } catch (err) {
      console.error('Error fetching build status:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [build?.buildRequestId]);

  /**
   * Start polling for updates
   */
  const startPolling = useCallback((): void => {
    setPolling(true);
  }, []);

  /**
   * Stop polling for updates
   */
  const stopPolling = useCallback((): void => {
    setPolling(false);
  }, []);

  /**
   * Polling effect
   */
  useEffect(() => {
    const isInProgress = build?.buildStatus === BuildStatus.IN_PROGRESS;
    if (!isInProgress || !polling) return;
    
    console.log(`Starting polling for build ${build.buildRequestId} every ${pollInterval}ms`);
    
    const interval = setInterval(() => {
      fetchBuildStatus();
    }, pollInterval);
    
    return () => {
      console.log(`Stopping polling for build ${build.buildRequestId}`);
      clearInterval(interval);
    };
  }, [build?.buildStatus, build?.buildRequestId, polling, pollInterval, fetchBuildStatus]);

  /**
   * Auto-start polling if build is in progress
   */
  useEffect(() => {
    if (build?.buildStatus === BuildStatus.IN_PROGRESS) {
      startPolling();
    }
  }, [build?.buildStatus, startPolling]);

  /**
   * Calculate progress percentage
   */
  const progress = studyDatabaseBuildService.calculateProgress(build || {} as StudyDatabaseBuild);

  /**
   * Get status color
   */
  const statusColor = studyDatabaseBuildService.getStatusColor(build?.buildStatus);

  /**
   * Format duration
   */
  const formattedDuration = build?.duration 
    ? studyDatabaseBuildService.formatDuration(build.duration)
    : 'In progress...';

  return {
    // State
    build,
    loading,
    error,
    polling,
    
    // Operations
    fetchBuildStatus,
    startPolling,
    stopPolling,
    setBuild,
    
    // Computed properties
    progress,
    statusColor,
    formattedDuration,
    isInProgress: build?.buildStatus === BuildStatus.IN_PROGRESS,
    isCompleted: build?.buildStatus === BuildStatus.COMPLETED,
    isFailed: build?.buildStatus === BuildStatus.FAILED,
    isCancelled: build?.buildStatus === BuildStatus.CANCELLED,
  };
};
