// src/components/modules/subjectmanagement/components/PatientStatusHistory.tsx
import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import PatientStatusService from '../../../../services/data-capture/PatientStatusService';
import PatientStatusBadge from './PatientStatusBadge';

interface StatusHistoryItem {
    id?: number | string;
    newStatus: string;
    changedAt: string;
    changedBy: string;
    reason: string;
    notes?: string;
}

interface PatientStatusHistoryProps {
    patientId: string | number;
    className?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

/**
 * Timeline component displaying patient status change history
 * 
 * Features:
 * - Chronological timeline (newest first)
 * - Visual timeline with connecting lines
 * - Status badges with color coding
 * - Timestamp, reason, changed by, and notes
 * - Highlights current (most recent) status
 * - Auto-refresh capability
 * - Loading and error states
 * - Empty state when no history
 * 
 * @param {number} patientId - Patient database ID
 * @param {string} className - Additional CSS classes
 * @param {boolean} autoRefresh - Enable auto-refresh (default: false)
 * @param {number} refreshInterval - Refresh interval in ms (default: 60000)
 */
const PatientStatusHistory: React.FC<PatientStatusHistoryProps> = ({
    patientId,
    className = '',
    autoRefresh = false,
    refreshInterval = 60000
}) => {
    const [history, setHistory] = useState<StatusHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    /**
     * Load status history from API
     */
    const loadHistory = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const data = await PatientStatusService.getPatientStatusHistory(Number(patientId)) as any;
            setHistory(data);
        } catch (err: any) {
            console.error('Error loading status history:', err);
            setError(err.message || 'Failed to load status history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Initial load on mount
     */
    useEffect(() => {
        if (patientId) {
            loadHistory();
        }
    }, [patientId]);

    /**
     * Auto-refresh setup
     */
    useEffect(() => {
        if (autoRefresh && patientId) {
            const interval = setInterval(() => {
                loadHistory(true);
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, patientId]);

    /**
     * Format date/time for display
     */
    const formatDateTime = (timestamp: string): string => {
        if (!timestamp) return 'N/A';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Show relative time for recent changes
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }

        // Full date for older changes
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Calculate days since status change
     */
    const getDaysSince = (timestamp: string): number | null => {
        if (!timestamp) return null;
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const days = Math.floor(diffMs / 86400000);
        return days;
    };

    /**
     * Get icon for status
     */
    const getStatusIcon = (status: string, isCurrent: boolean): React.ReactElement => {
        if (isCurrent) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }

        const iconMap: Record<string, React.ReactElement> = {
            'REGISTERED': <Clock className="w-5 h-5 text-blue-500" />,
            'SCREENING': <Clock className="w-5 h-5 text-yellow-500" />,
            'ENROLLED': <CheckCircle className="w-5 h-5 text-green-500" />,
            'ACTIVE': <CheckCircle className="w-5 h-5 text-violet-500" />,
            'COMPLETED': <CheckCircle className="w-5 h-5 text-gray-500" />,
            'WITHDRAWN': <AlertCircle className="w-5 h-5 text-red-500" />
        };

        return iconMap[status] || <Clock className="w-5 h-5 text-gray-500" />;
    };

    // Loading state
    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading status history...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading History</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => loadHistory()}
                                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!history || history.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Status History</h3>
                    <p className="text-gray-600">
                        No status changes have been recorded for this patient yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Status History</h3>
                    <span className="ml-3 text-sm text-gray-500">
                        ({history.length} change{history.length === 1 ? '' : 's'})
                    </span>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={() => loadHistory(true)}
                    disabled={refreshing}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Refresh history"
                >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Timeline */}
            <div className="p-6">
                <div className="space-y-6">
                    {history.map((item, index) => {
                        const isCurrent = index === 0;
                        const daysSince = getDaysSince(item.changedAt);

                        return (
                            <div key={item.id || index} className="relative">

                                {/* Timeline Line */}
                                {index < history.length - 1 && (
                                    <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gray-200" />
                                )}

                                {/* Timeline Item */}
                                <div className="flex gap-4">

                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? 'bg-green-100 ring-4 ring-green-50' : 'bg-gray-100'
                                        }`}>
                                        {getStatusIcon(item.newStatus, isCurrent)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-6">

                                        {/* Status and Badge */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <PatientStatusBadge {...({ status: item.newStatus, size: "md" } as any)} />
                                                {isCurrent && (
                                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formatDateTime(item.changedAt)}
                                            </span>
                                        </div>

                                        {/* Days Since (for current status) */}
                                        {isCurrent && daysSince !== null && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                {daysSince === 0 ? 'Changed today' :
                                                    daysSince === 1 ? 'Changed yesterday' :
                                                        `${daysSince} days in this status`}
                                            </div>
                                        )}

                                        {/* Reason */}
                                        <div className="bg-gray-50 rounded-md p-3 mb-2">
                                            <div className="flex items-start">
                                                <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                                                    <p className="text-sm text-gray-900">{item.reason}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes (if present) */}
                                        {item.notes && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-2">
                                                <div className="flex items-start">
                                                    <FileText className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-700 mb-1">Additional Notes:</p>
                                                        <p className="text-sm text-blue-900">{item.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Changed By */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <User className="w-4 h-4 mr-1" />
                                            Changed by: <span className="font-medium ml-1">{item.changedBy}</span>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default PatientStatusHistory;
