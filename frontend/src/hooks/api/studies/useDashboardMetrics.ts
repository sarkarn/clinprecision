import { useState, useEffect, useCallback } from 'react';
import StudyService, { DashboardMetrics } from 'services/StudyService';

/**
 * Enhanced metrics with calculated fields
 */
export interface EnhancedDashboardMetrics {
  activeStudies: number | string;
  draftProtocols: number | string;
  completedStudies: number | string;
  totalAmendments: number | string;
  studiesByStatus: Record<string, number>;
  studiesByPhase: Record<string, number>;
  lastUpdated?: string;
  totalStudies: number | string;
  completionRate: number | string;
}

/**
 * Return type for useDashboardMetrics hook
 */
export interface UseDashboardMetricsReturn {
  metrics: EnhancedDashboardMetrics;
  rawMetrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
  isDataFresh: boolean;
  hasData: boolean;
}

/**
 * React hook for managing dashboard metrics state
 * Provides loading, error handling, and refresh capabilities
 * Created: September 13, 2025
 */
export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard metrics from backend
  const loadMetrics = useCallback(async () => {
    console.log('Loading dashboard metrics...');
    setLoading(true);
    setError(null);

    try {
      const metricsData = await StudyService.getDashboardMetrics();
      setMetrics(metricsData);
      console.log('Dashboard metrics loaded successfully:', metricsData);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
      setError('Failed to load dashboard metrics. Please try again.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Refresh metrics (can be called manually)
  const refreshMetrics = useCallback((): Promise<void> => {
    return loadMetrics();
  }, [loadMetrics]);

  // Check if data is available and fresh
  const isDataFresh = useCallback((): boolean => {
    if (!metrics?.lastUpdated) return false;
    
    const lastUpdate = new Date(metrics.lastUpdated);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    return diffMinutes < 15; // Consider data fresh for 15 minutes
  }, [metrics]);

  // Auto-refresh metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isDataFresh()) {
        console.log('Auto-refreshing dashboard metrics...');
        refreshMetrics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loading, isDataFresh, refreshMetrics]);

  // Enhanced metrics formatter with additional calculations
  const getEnhancedMetrics = useCallback((): EnhancedDashboardMetrics => {
    if (!metrics || loading) {
      return {
        activeStudies: loading ? '...' : '–',
        draftProtocols: loading ? '...' : '–',
        completedStudies: loading ? '...' : '–',
        totalAmendments: loading ? '...' : '–',
        totalStudies: loading ? '...' : '–',
        completionRate: loading ? '...' : '–',
        studiesByStatus: {},
        studiesByPhase: {}
      };
    }

    const totalStudies = (metrics.activeStudies || 0) + (metrics.draftProtocols || 0) + (metrics.completedStudies || 0);
    const completionRate = totalStudies > 0 ? ((metrics.completedStudies || 0) / totalStudies * 100).toFixed(1) : 0;

    return {
      activeStudies: metrics.activeStudies || 0,
      draftProtocols: metrics.draftProtocols || 0,
      completedStudies: metrics.completedStudies || 0,
      totalAmendments: metrics.totalAmendments || 0,
      studiesByStatus: metrics.studiesByStatus || {},
      studiesByPhase: metrics.studiesByPhase || {},
      lastUpdated: metrics.lastUpdated,
      totalStudies,
      completionRate
    };
  }, [metrics, loading]);

  return {
    metrics: getEnhancedMetrics(),
    rawMetrics: metrics,
    loading,
    error,
    refreshMetrics,
    isDataFresh: isDataFresh(),
    hasData: metrics !== null && !loading
  };
};
