import { useState, useEffect, useCallback } from 'react';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Custom hook for managing build status and real-time updates
 * Polls for status updates when build is in progress
 * 
 * @param {Object} initialBuild - Initial build object
 * @param {number} pollInterval - Polling interval in milliseconds (default: 10000)
 * @returns {Object} Current build state and operations
 */
export const useBuildStatus = (initialBuild, pollInterval = 10000) => {
  const [build, setBuild] = useState(initialBuild);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  /**
   * Fetch latest build status
   */
  const fetchBuildStatus = useCallback(async () => {
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
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [build?.buildRequestId]);

  /**
   * Start polling for updates
   */
  const startPolling = useCallback(() => {
    setPolling(true);
  }, []);

  /**
   * Stop polling for updates
   */
  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  /**
   * Polling effect
   */
  useEffect(() => {
    if (!build?.inProgress || !polling) return;
    
    console.log(`Starting polling for build ${build.buildRequestId} every ${pollInterval}ms`);
    
    const interval = setInterval(() => {
      fetchBuildStatus();
    }, pollInterval);
    
    return () => {
      console.log(`Stopping polling for build ${build.buildRequestId}`);
      clearInterval(interval);
    };
  }, [build?.inProgress, build?.buildRequestId, polling, pollInterval, fetchBuildStatus]);

  /**
   * Auto-start polling if build is in progress
   */
  useEffect(() => {
    if (build?.inProgress) {
      startPolling();
    }
  }, [build?.inProgress, startPolling]);

  /**
   * Calculate progress percentage
   */
  const progress = studyDatabaseBuildService.calculateProgress(build || {});

  /**
   * Get status color
   */
  const statusColor = studyDatabaseBuildService.getStatusColor(build?.buildStatus);

  /**
   * Format duration
   */
  const formattedDuration = build?.buildDurationSeconds 
    ? studyDatabaseBuildService.formatDuration(build.buildDurationSeconds)
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
    isInProgress: build?.inProgress || false,
    isCompleted: build?.completed || false,
    isFailed: build?.failed || false,
    isCancelled: build?.cancelled || false,
  };
};
