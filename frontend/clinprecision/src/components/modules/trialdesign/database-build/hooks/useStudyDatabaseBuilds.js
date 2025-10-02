import { useState, useEffect, useCallback } from 'react';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Custom hook for managing Study Database Builds
 * Provides data fetching, state management, and auto-refresh for builds
 * 
 * @param {number|null} studyId - Optional study ID to filter builds
 * @returns {Object} Build data and operations
 */
export const useStudyDatabaseBuilds = (studyId = null) => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  /**
   * Fetch builds from API
   */
  const fetchBuilds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (studyId) {
        // Fetch builds for specific study
        data = await studyDatabaseBuildService.getBuildsByStudyId(studyId);
      } else {
        // Fetch recent builds (last 30 days)
        data = await studyDatabaseBuildService.getRecentBuilds(30);
      }
      
      // Ensure data is an array
      const buildsArray = Array.isArray(data) ? data : [];
      setBuilds(buildsArray);
      
    } catch (err) {
      console.error('Error fetching builds:', err);
      setError(err);
      
      // Keep existing builds on error to avoid flickering empty states
      // Only clear if this is the first load
      if (builds.length === 0) {
        setBuilds([]);
      }
    } finally {
      setLoading(false);
    }
  }, [studyId, builds.length]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  /**
   * Auto-refresh setup for in-progress builds
   */
  useEffect(() => {
    // Only set up auto-refresh if there are in-progress builds
    const hasInProgress = builds.some(b => b.buildStatus === 'IN_PROGRESS');
    
    if (!hasInProgress) {
      return; // No in-progress builds, no need for auto-refresh
    }
    
    console.log('Setting up auto-refresh for in-progress builds...');
    const interval = setInterval(() => {
      console.log('Auto-refreshing builds due to in-progress builds...');
      fetchBuilds();
    }, 30000); // 30 seconds
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        console.log('Clearing auto-refresh interval');
        clearInterval(interval);
      }
    };
  }, [builds, fetchBuilds]); // Intentionally depend on builds to restart interval when status changes

  /**
   * Manual refresh function
   */
  const refreshBuilds = useCallback(() => {
    console.log('Manual refresh triggered');
    fetchBuilds();
  }, [fetchBuilds]);

  /**
   * Calculate metrics from builds
   */
  const inProgressCount = builds.filter(b => b.buildStatus === 'IN_PROGRESS').length;
  const completedCount = builds.filter(b => b.buildStatus === 'COMPLETED').length;
  const failedCount = builds.filter(b => b.buildStatus === 'FAILED').length;
  const cancelledCount = builds.filter(b => b.buildStatus === 'CANCELLED').length;
  const totalCount = builds.length;

  /**
   * Get builds by status
   */
  const getBuildsByStatus = useCallback((status) => {
    return builds.filter(b => b.buildStatus === status);
  }, [builds]);

  /**
   * Get latest build for study
   */
  const getLatestBuild = useCallback(() => {
    if (builds.length === 0) return null;
    return builds.reduce((latest, current) => {
      const latestTime = new Date(latest.buildStartTime || latest.createdAt);
      const currentTime = new Date(current.buildStartTime || current.createdAt);
      return currentTime > latestTime ? current : latest;
    });
  }, [builds]);

  /**
   * Check if study has active build
   */
  const hasActiveBuild = inProgressCount > 0;

  return {
    // Data
    builds,
    loading,
    error,
    
    // Operations
    refreshBuilds,
    fetchBuilds,
    
    // Metrics
    inProgressCount,
    completedCount,
    failedCount,
    cancelledCount,
    totalCount,
    hasActiveBuild,
    
    // Utilities
    getBuildsByStatus,
    getLatestBuild,
  };
};
