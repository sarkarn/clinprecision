// src/components/shared/status/RealTimeStatusDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useStatusSynchronization } from '../../../hooks/useStatusSynchronization';
import StatusIndicator, { DetailedStatusCard } from './StatusIndicator';
import {
    Activity,
    Database,
    Wifi,
    WifiOff,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    Settings,
    Zap,
    Clock,
    TrendingUp
} from 'lucide-react';

type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected' | 'failed';

interface ExpandedSections {
    connection: boolean;
    status: boolean;
    updates: boolean;
    errors: boolean;
    metrics: boolean;
}

interface RealTimeStatusDashboardProps {
    studyId?: string | null;
    enableGlobalUpdates?: boolean;
    showConnectionStatus?: boolean;
    showMetrics?: boolean;
    showPendingUpdates?: boolean;
    showErrors?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
    className?: string;
}

/**
 * Real-time Status Dashboard Component
 * Provides comprehensive real-time status monitoring and synchronization
 */
const RealTimeStatusDashboard: React.FC<RealTimeStatusDashboardProps> = ({
    studyId = null,
    enableGlobalUpdates = false,
    showConnectionStatus = true,
    showMetrics = true,
    showPendingUpdates = true,
    showErrors = true,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    className = ''
}) => {
    const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
        connection: true,
        status: true,
        updates: false,
        errors: false,
        metrics: false
    });
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
    const [lastManualRefresh, setLastManualRefresh] = useState<Date | null>(null);

    // Use status synchronization hook
    const {
        isConnected,
        connectionStatus,
        lastUpdate,
        statusCache,
        pendingUpdates,
        syncErrors,
        subscribeToStudy,
        unsubscribeFromStudy,
        requestStatusComputation,
        refreshStatus,
        clearPendingUpdates,
        clearSyncErrors,
        getCachedStatus,
        getConnectionStats
    } = useStatusSynchronization({
        studyId,
        enableGlobalUpdates,
        autoConnect: true,
        onStatusUpdate: (data: any) => {
            console.log('Dashboard received status update:', data);
        },
        onError: (error: any) => {
            console.error('Dashboard sync error:', error);
        }
    }) as any;

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefreshEnabled || !studyId) return;

        const interval = setInterval(async () => {
            try {
                await refreshStatus(studyId);
            } catch (error) {
                console.error('Auto-refresh failed:', error);
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefreshEnabled, studyId, refreshInterval, refreshStatus]);

    /**
     * Handle manual refresh
     */
    const handleManualRefresh = async () => {
        if (!studyId) return;

        try {
            setLastManualRefresh(new Date());
            await refreshStatus(studyId);
            // Also request real-time computation
            requestStatusComputation(studyId);
        } catch (error) {
            console.error('Manual refresh failed:', error);
        }
    };

    /**
     * Toggle section expansion
     */
    const toggleSection = (section: keyof ExpandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    /**
     * Get current study status
     */
    const currentStatus = getCachedStatus(studyId);
    const connectionStats = getConnectionStats();

    /**
     * Render connection status section
     */
    const renderConnectionStatus = (): React.ReactElement | null => {
        if (!showConnectionStatus) return null;

        const getConnectionColor = (): string => {
            switch (connectionStatus) {
                case 'connected': return 'text-green-600 bg-green-50 border-green-200';
                case 'connecting': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                case 'disconnected': return 'text-red-600 bg-red-50 border-red-200';
                case 'failed': return 'text-red-600 bg-red-50 border-red-200';
                default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
        };

        const getConnectionIcon = () => {
            switch (connectionStatus) {
                case 'connected': return CheckCircle2;
                case 'connecting': return RefreshCw;
                case 'disconnected':
                case 'failed': return WifiOff;
                default: return Wifi;
            }
        };

        const ConnectionIcon = getConnectionIcon();

        return (
            <div className="border border-gray-200 rounded-lg p-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('connection')}
                >
                    <div className="flex items-center gap-2">
                        <ConnectionIcon className={`w-5 h-5 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
                        <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getConnectionColor()}`}>
                        {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </div>
                </div>

                {expandedSections.connection && (
                    <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">WebSocket Status:</span>
                                <span className="ml-2 font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Last Update:</span>
                                <span className="ml-2 font-medium">
                                    {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Subscribed Topics:</span>
                                <span className="ml-2 font-medium">{connectionStats.subscribedTopics.length}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Cache Size:</span>
                                <span className="ml-2 font-medium">{connectionStats.cacheSize}</span>
                            </div>
                        </div>

                        {connectionStats.subscribedTopics.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Subscribed Topics:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {connectionStats.subscribedTopics.map((topic: string) => (
                                        <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render current status section
     */
    const renderCurrentStatus = (): React.ReactElement => {
        return (
            <div className="border border-gray-200 rounded-lg p-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('status')}
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {autoRefreshEnabled && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Zap className="w-3 h-3" />
                                Auto-refresh
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleManualRefresh();
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            title="Refresh status"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {expandedSections.status && (
                    <div className="mt-4">
                        {currentStatus ? (
                            <DetailedStatusCard
                                status={currentStatus.status}
                                lastUpdated={currentStatus.updatedAt}
                                isRealTime={isConnected}
                                connectionStatus={connectionStatus as ConnectionStatusType}
                                computationInProgress={pendingUpdates.some((u: any) => u.type === 'computation')}
                                onRefresh={handleManualRefresh}
                                additionalInfo={{
                                    'Version': currentStatus.version || 'N/A',
                                    'Computation ID': currentStatus.computationId || 'N/A',
                                    'Last Manual Refresh': lastManualRefresh ? lastManualRefresh.toLocaleTimeString() : 'Never'
                                }}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p>No status data available</p>
                                {studyId && (
                                    <button
                                        onClick={handleManualRefresh}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Load Status
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render pending updates section
     */
    const renderPendingUpdates = (): React.ReactElement | null => {
        if (!showPendingUpdates) return null;

        return (
            <div className="border border-gray-200 rounded-lg p-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('updates')}
                >
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="text-lg font-semibold text-gray-900">Pending Updates</h3>
                        {pendingUpdates.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {pendingUpdates.length}
                            </span>
                        )}
                    </div>
                    {pendingUpdates.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearPendingUpdates();
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {expandedSections.updates && (
                    <div className="mt-4">
                        {pendingUpdates.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No pending updates</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {pendingUpdates.slice(0, 10).map((update: any) => (
                                    <div key={update.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${update.type === 'status' ? 'bg-green-500' :
                                                    update.type === 'study' ? 'bg-blue-500' :
                                                        update.type === 'version' ? 'bg-purple-500' : 'bg-gray-500'
                                                }`} />
                                            <span className="text-sm font-medium">{update.type}</span>
                                            {update.studyId && (
                                                <span className="text-xs text-gray-500">Study {update.studyId}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(update.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                                {pendingUpdates.length > 10 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        ...and {pendingUpdates.length - 10} more
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render errors section
     */
    const renderErrors = (): React.ReactElement | null => {
        if (!showErrors || syncErrors.length === 0) return null;

        return (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('errors')}
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-900">Sync Errors</h3>
                        <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                            {syncErrors.length}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            clearSyncErrors();
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                    >
                        Clear All
                    </button>
                </div>

                {expandedSections.errors && (
                    <div className="mt-4">
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {syncErrors.map((error: any, index: number) => (
                                <div key={index} className="p-2 bg-white border border-red-200 rounded">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-red-900">{error.type}</span>
                                            <p className="text-sm text-red-700 mt-1">{error.message}</p>
                                            {error.studyId && (
                                                <span className="text-xs text-red-600">Study: {error.studyId}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-red-500">
                                            {new Date(error.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /**
     * Render settings section
     */
    const renderSettings = (): React.ReactElement => {
        return (
            <div className="border border-gray-200 rounded-lg p-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('metrics')}
                >
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                    </div>
                </div>

                {expandedSections.metrics && (
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Auto-refresh</label>
                            <button
                                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefreshEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {studyId && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => requestStatusComputation(studyId)}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    disabled={!isConnected}
                                >
                                    Request Computation
                                </button>
                                <button
                                    onClick={handleManualRefresh}
                                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                >
                                    Force Refresh
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {renderConnectionStatus()}
            {renderCurrentStatus()}
            {renderPendingUpdates()}
            {renderErrors()}
            {renderSettings()}
        </div>
    );
};

export default RealTimeStatusDashboard;
