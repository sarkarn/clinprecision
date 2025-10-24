import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    FileText,
    CheckCircle2,
    GitBranch,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import ProgressiveLoader, { LiveIndicator } from './ProgressiveLoader';

/**
 * Enhanced Dashboard Metrics Component
 * Provides rich visual representation of study design metrics with interactive elements
 */
const EnhancedDashboardMetrics = ({
    metrics,
    loading,
    error,
    onRefresh,
    isDataFresh,
    className = ""
}) => {
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [animateNumbers, setAnimateNumbers] = useState(false);

    // Trigger number animation when metrics change
    useEffect(() => {
        if (metrics && !loading) {
            setAnimateNumbers(true);
            const timer = setTimeout(() => setAnimateNumbers(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [metrics, loading]);

    // Calculate trend indicators (mock data for now - would come from backend)
    const getTrendData = (metricType) => {
        const trends = {
            activeStudies: { change: 12, direction: 'up', period: 'vs last month' },
            draftProtocols: { change: -3, direction: 'down', period: 'vs last week' },
            completedStudies: { change: 5, direction: 'up', period: 'vs last quarter' },
            totalAmendments: { change: 0, direction: 'neutral', period: 'vs last month' }
        };
        return trends[metricType] || { change: 0, direction: 'neutral', period: '' };
    };

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
            case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
            default: return <Minus className="w-3 h-3 text-gray-400" />;
        }
    };

    const getTrendColor = (direction) => {
        switch (direction) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    const formatNumber = (value) => {
        if (loading) return '...';
        if (value === undefined || value === null) return '–';
        return value.toLocaleString();
    };

    const MetricCard = ({
        title,
        value,
        description,
        icon: Icon,
        color,
        bgColor,
        metricType,
        onClick
    }) => {
        const trend = getTrendData(metricType);
        const isSelected = selectedMetric === metricType;

        return (
            <div
                className={`
                    bg-white rounded-xl shadow-sm border border-gray-200 p-6 
                    hover:shadow-md transition-all duration-200 cursor-pointer
                    ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                    ${className}
                `}
                onClick={() => onClick?.(metricType)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${bgColor}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    {!loading && !error && (
                        <div className="flex items-center space-x-1">
                            {getTrendIcon(trend.direction)}
                            <span className={`text-xs font-medium ${getTrendColor(trend.direction)}`}>
                                {trend.change !== 0 && (trend.change > 0 ? '+' : '')}{trend.change}
                            </span>
                        </div>
                    )}
                </div>

                {/* Main Metric */}
                <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
                    <p className={`
                        text-3xl font-bold ${color} transition-all duration-500
                        ${animateNumbers ? 'scale-110' : 'scale-100'}
                    `}>
                        {formatNumber(value)}
                    </p>
                </div>

                {/* Description and Trend */}
                <div className="space-y-1">
                    <p className="text-sm text-gray-500">{description}</p>
                    {!loading && !error && trend.period && (
                        <p className={`text-xs font-medium ${getTrendColor(trend.direction)}`}>
                            {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.period}
                        </p>
                    )}
                </div>

                {/* Error indicator */}
                {error && (
                    <div className="mt-2 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-600">Data unavailable</span>
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="mt-2 flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600">Loading...</span>
                    </div>
                )}
            </div>
        );
    };

    const MetricDetail = ({ metricType }) => {
        if (!metricType || !metrics) return null;

        const details = {
            activeStudies: {
                title: 'Active Studies Details',
                breakdown: [
                    { label: 'Recruiting', value: Math.floor((metrics.activeStudies || 0) * 0.6), color: 'bg-green-500' },
                    { label: 'Enrolling', value: Math.floor((metrics.activeStudies || 0) * 0.3), color: 'bg-blue-500' },
                    { label: 'Follow-up', value: Math.floor((metrics.activeStudies || 0) * 0.1), color: 'bg-purple-500' }
                ]
            },
            draftProtocols: {
                title: 'Draft Protocols Status',
                breakdown: [
                    { label: 'In Review', value: Math.floor((metrics.draftProtocols || 0) * 0.5), color: 'bg-yellow-500' },
                    { label: 'Pending Changes', value: Math.floor((metrics.draftProtocols || 0) * 0.3), color: 'bg-orange-500' },
                    { label: 'Ready for Approval', value: Math.floor((metrics.draftProtocols || 0) * 0.2), color: 'bg-green-500' }
                ]
            },
            completedStudies: {
                title: 'Completed Studies Overview',
                breakdown: [
                    { label: 'Published', value: Math.floor((metrics.completedStudies || 0) * 0.7), color: 'bg-green-500' },
                    { label: 'Analysis Complete', value: Math.floor((metrics.completedStudies || 0) * 0.2), color: 'bg-blue-500' },
                    { label: 'Reporting', value: Math.floor((metrics.completedStudies || 0) * 0.1), color: 'bg-purple-500' }
                ]
            },
            totalAmendments: {
                title: 'Amendment Types',
                breakdown: [
                    { label: 'Minor Changes', value: Math.floor((metrics.totalAmendments || 0) * 0.6), color: 'bg-green-500' },
                    { label: 'Substantial', value: Math.floor((metrics.totalAmendments || 0) * 0.3), color: 'bg-yellow-500' },
                    { label: 'Major Revisions', value: Math.floor((metrics.totalAmendments || 0) * 0.1), color: 'bg-red-500' }
                ]
            }
        };

        const detail = details[metricType];
        if (!detail) return null;

        return (
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{detail.title}</h4>
                    <button
                        onClick={() => setSelectedMetric(null)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-3">
                    {detail.breakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <ProgressiveLoader
            isLoading={loading}
            hasError={!!error}
            errorMessage={error}
            skeletonType="metrics"
        >
            <div className="space-y-6">
                {/* Header with refresh button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Study Portfolio Overview</h2>
                        <p className="text-gray-600 mt-1">
                            Real-time metrics and insights across your clinical trial portfolio
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Data freshness indicator */}
                        <LiveIndicator isLive={isDataFresh && !loading} />

                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Refresh metrics"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="ml-2">{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Active Studies"
                        value={metrics?.activeStudies}
                        description="Currently recruiting"
                        icon={Users}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                        metricType="activeStudies"
                        onClick={setSelectedMetric}
                    />

                    <MetricCard
                        title="Draft Protocols"
                        value={metrics?.draftProtocols}
                        description="Awaiting approval"
                        icon={FileText}
                        color="text-yellow-600"
                        bgColor="bg-yellow-50"
                        metricType="draftProtocols"
                        onClick={setSelectedMetric}
                    />

                    <MetricCard
                        title="Completed Studies"
                        value={metrics?.completedStudies}
                        description="Data analysis complete"
                        icon={CheckCircle2}
                        color="text-green-600"
                        bgColor="bg-green-50"
                        metricType="completedStudies"
                        onClick={setSelectedMetric}
                    />

                    <MetricCard
                        title="Amendments"
                        value={metrics?.totalAmendments}
                        description="Protocol versions"
                        icon={GitBranch}
                        color="text-purple-600"
                        bgColor="bg-purple-50"
                        metricType="totalAmendments"
                        onClick={setSelectedMetric}
                    />
                </div>

                {/* Detailed View */}
                {selectedMetric && <MetricDetail metricType={selectedMetric} />}

                {/* Interactive hint */}
                {!selectedMetric && !loading && !error && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                            💡 Click on any metric card to view detailed breakdown
                        </p>
                    </div>
                )}
            </div>
        </ProgressiveLoader>
    );
};

export default EnhancedDashboardMetrics;