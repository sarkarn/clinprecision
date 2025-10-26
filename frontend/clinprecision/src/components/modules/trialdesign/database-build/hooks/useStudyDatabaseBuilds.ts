import { useState, useEffect, useCallback } from 'react';
import StudyDatabaseBuildService from 'services/StudyDatabaseBuildService';
import { StudyDatabaseBuild, BuildStatus } from '../../../../../types/study/DatabaseBuild.types';

/**
 * Return type for useStudyDatabaseBuilds hook
 */
export interface UseStudyDatabaseBuildsReturn {
  builds: StudyDatabaseBuild[];
  loading: boolean;
  error: Error | null;
  fetchBuilds: () => Promise<void>;
  refreshBuilds: () => Promise<void>;
  getBuildsByStatus: (status: BuildStatus) => StudyDatabaseBuild[];
  getLatestBuild: () => StudyDatabaseBuild | null;
  inProgressCount: number;
  completedCount: number;
  failedCount: number;
  cancelledCount: number;
  totalCount: number;
  hasActiveBuild: boolean;
}

/**
 * React hook for managing study database builds
 * Provides auto-refresh for in-progress builds and metrics calculation
 * Created: September 13, 2025
 */
export const useStudyDatabaseBuilds = (studyId?: number): UseStudyDatabaseBuildsReturn => {
  const [builds, setBuilds] = useState<StudyDatabaseBuild[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  /**
   * Fetch builds from backend
   */
  const fetchBuilds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let buildsData: StudyDatabaseBuild[];
      if (studyId !== undefined) {
        buildsData = await StudyDatabaseBuildService.getBuildsByStudyId(studyId);
      } else {
        buildsData = await StudyDatabaseBuildService.getRecentBuilds(30);
      }

      setBuilds(buildsData || []);
    } catch (err) {
      console.error('Error fetching builds:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch builds'));
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  /**
   * Refresh builds (manual trigger)
   */
  const refreshBuilds = useCallback(async () => {
    await fetchBuilds();
  }, [fetchBuilds]);

  /**
   * Get builds by status
   */
  const getBuildsByStatus = useCallback((status: BuildStatus): StudyDatabaseBuild[] => {
    return builds.filter(build => build.buildStatus === status);
  }, [builds]);

  /**
   * Get the latest build
   */
  const getLatestBuild = useCallback((): StudyDatabaseBuild | null => {
    if (builds.length === 0) return null;
    
    return builds.reduce((latest, current) => {
      const latestDate = new Date(latest.createdAt || 0);
      const currentDate = new Date(current.createdAt || 0);
      return currentDate > latestDate ? current : latest;
    });
  }, [builds]);

  // Calculate metrics
  const inProgressCount = builds.filter(b => b.buildStatus === BuildStatus.IN_PROGRESS).length;
  const completedCount = builds.filter(b => b.buildStatus === BuildStatus.COMPLETED).length;
  const failedCount = builds.filter(b => b.buildStatus === BuildStatus.FAILED).length;
  const cancelledCount = builds.filter(b => b.buildStatus === BuildStatus.CANCELLED).length;
  const totalCount = builds.length;
  const hasActiveBuild = inProgressCount > 0;

  // Load builds on mount
  useEffect(() => {
    fetchBuilds();
  }, [fetchBuilds]);

  // Auto-refresh for in-progress builds
  useEffect(() => {
    const hasInProgress = builds.some(build => build.buildStatus === BuildStatus.IN_PROGRESS);

    if (hasInProgress && !refreshInterval) {
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log('Auto-refreshing builds (in-progress detected)...');
        fetchBuilds();
      }, 30000);

      setRefreshInterval(interval);
    } else if (!hasInProgress && refreshInterval) {
      // Clear auto-refresh when no in-progress builds
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    // Cleanup on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [builds, refreshInterval, fetchBuilds]);

  return {
    builds,
    loading,
    error,
    fetchBuilds,
    refreshBuilds,
    getBuildsByStatus,
    getLatestBuild,
    inProgressCount,
    completedCount,
    failedCount,
    cancelledCount,
    totalCount,
    hasActiveBuild
  };
};
