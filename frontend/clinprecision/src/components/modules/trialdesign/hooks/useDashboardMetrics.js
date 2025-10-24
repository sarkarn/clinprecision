import { useState, useEffect, useCallback } from 'react';
import StudyService from '../../../../services/StudyService';

/**
 * React hook for managing dashboard metrics state
 * Provides loading, error handling, and refresh capabilities
 * Created: September 13, 2025
 */
export const useDashboardMetrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load dashboard metrics from backend
    const loadMetrics = useCallback(async () => {
        console.log('Loading dashboard metrics...');
        setLoading(true);
        setError(null);

        try {
            const metricsData = await StudyService.getDashboardMetrics();
            
            if (metricsData?.error) {
                setError(metricsData.message || 'Unable to load metrics');
                setMetrics(null);
            } else {
                setMetrics(metricsData);
                console.log('Dashboard metrics loaded successfully:', metricsData);
            }

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
    const refreshMetrics = useCallback(() => {
        return loadMetrics();
    }, [loadMetrics]);

    // Check if data is available and fresh
    const isDataFresh = useCallback(() => {
        if (!metrics?.lastUpdated) return false;
        
        const lastUpdate = new Date(metrics.lastUpdated);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        
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
    const getEnhancedMetrics = useCallback(() => {
        if (!metrics || loading) {
            return {
                activeStudies: loading ? '...' : '–',
                draftProtocols: loading ? '...' : '–',
                completedStudies: loading ? '...' : '–',
                totalAmendments: loading ? '...' : '–',
                totalStudies: loading ? '...' : '–',
                completionRate: loading ? '...' : '–'
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