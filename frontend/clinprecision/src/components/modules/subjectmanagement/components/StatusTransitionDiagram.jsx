// src/components/modules/subjectmanagement/components/StatusTransitionDiagram.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import PatientStatusService from '../../../../services/data-capture/PatientStatusService';

/**
 * Visual workflow diagram showing patient status lifecycle
 * 
 * Features:
 * - Horizontal flow diagram (left to right)
 * - Status boxes with color coding
 * - Transition arrows with conversion rates
 * - Highlights current patient status (if patientId provided)
 * - Interactive click to trigger status change
 * - Transition statistics from API
 * - Loading and error states
 * - Responsive design
 * 
 * @param {number} patientId - (Optional) Patient ID to highlight current status
 * @param {string} currentStatus - (Optional) Current patient status to highlight
 * @param {function} onStatusClick - Callback when status box is clicked (patientId, status)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showStats - Show transition statistics (default: true)
 */
const StatusTransitionDiagram = ({
    patientId,
    currentStatus,
    onStatusClick,
    className = '',
    showStats = true
}) => {
    const [transitionSummary, setTransitionSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status lifecycle order
    const statusLifecycle = PatientStatusService.getStatusLifecycle();

    /**
     * Load transition statistics
     */
    useEffect(() => {
        if (showStats) {
            loadTransitionStats();
        } else {
            setLoading(false);
        }
    }, [showStats]);

    /**
     * Fetch transition summary from API
     */
    const loadTransitionStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await PatientStatusService.getStatusTransitionSummary();
            setTransitionSummary(data);
        } catch (err) {
            console.error('Error loading transition stats:', err);
            setError(err.message || 'Failed to load transition statistics');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get transition data between two statuses
     */
    const getTransitionData = (fromStatus, toStatus) => {
        if (!transitionSummary || transitionSummary.length === 0) {
            return null;
        }

        const transition = transitionSummary.find(
            t => t.fromStatus === fromStatus && t.toStatus === toStatus
        );

        return transition;
    };

    /**
     * Calculate conversion rate percentage
     */
    const calculateConversionRate = (fromStatus, toStatus) => {
        const transition = getTransitionData(fromStatus, toStatus);

        if (!transition || !transition.transitionCount) {
            return null;
        }

        // Find total transitions from this status
        const totalFromStatus = transitionSummary
            .filter(t => t.fromStatus === fromStatus)
            .reduce((sum, t) => sum + (t.transitionCount || 0), 0);

        if (totalFromStatus === 0) return null;

        const rate = (transition.transitionCount / totalFromStatus) * 100;
        return rate.toFixed(1);
    };

    /**
     * Get status box color classes
     */
    const getStatusColorClasses = (status, isCurrentStatus) => {
        const baseClasses = "transition-all duration-200";

        // Handle both string and object formats
        const statusStr = typeof status === 'string' ? status : (status?.status || '');

        if (isCurrentStatus) {
            return `${baseClasses} bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-200 shadow-lg scale-105`;
        }

        const colorMap = {
            'REGISTERED': 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300',
            'SCREENING': 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300',
            'ENROLLED': 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300',
            'ACTIVE': 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-800 hover:from-violet-200 hover:to-violet-300',
            'COMPLETED': 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300',
            'WITHDRAWN': 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300'
        };

        return `${baseClasses} ${colorMap[statusStr] || 'bg-gray-100 text-gray-800'}`;
    };

    /**
     * Handle status box click
     */
    const handleStatusClick = (status) => {
        if (onStatusClick && patientId) {
            onStatusClick(patientId, status);
        }
    };

    /**
     * Format status for display
     */
    const formatStatus = (status) => {
        return PatientStatusService.formatStatus(status);
    };

    // Error state
    if (error && showStats) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Statistics Unavailable
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                {error}. Showing workflow without statistics.
                            </p>
                        </div>
                        <button
                            onClick={loadTransitionStats}
                            className="ml-3 text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Status Workflow</h3>
                </div>
                {showStats && (
                    <div className="flex items-center gap-2">
                        {loading && (
                            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                        )}
                        <button
                            onClick={loadTransitionStats}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Refresh statistics"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                )}
            </div>

            {/* Diagram */}
            <div className="p-6 overflow-x-auto">

                {/* Main Flow (REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED) */}
                <div className="flex items-center justify-between min-w-max mb-8">
                    {statusLifecycle.slice(0, 5).map((statusObj, index) => {
                        const status = statusObj.status || statusObj;
                        const isCurrentStatus = currentStatus === status;
                        const isClickable = onStatusClick && patientId;
                        const nextStatusObj = statusLifecycle[index + 1];
                        const nextStatus = nextStatusObj ? (nextStatusObj.status || nextStatusObj) : null;
                        const conversionRate = nextStatus ? calculateConversionRate(status, nextStatus) : null;

                        return (
                            <React.Fragment key={status}>

                                {/* Status Box */}
                                <div
                                    onClick={() => isClickable && handleStatusClick(status)}
                                    className={`
                    px-6 py-4 rounded-lg font-semibold text-center min-w-[140px]
                    ${getStatusColorClasses(status, isCurrentStatus)}
                    ${isClickable ? 'cursor-pointer' : ''}
                  `}
                                >
                                    <div className="text-sm mb-1">{formatStatus(status)}</div>
                                    {isCurrentStatus && (
                                        <div className="text-xs font-normal opacity-90">Current</div>
                                    )}
                                </div>

                                {/* Arrow with conversion rate */}
                                {index < 4 && (
                                    <div className="flex flex-col items-center mx-4">
                                        <ArrowRight className="w-8 h-8 text-gray-400" />
                                        {showStats && conversionRate && !loading && (
                                            <div className="mt-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {conversionRate}%
                                            </div>
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* WITHDRAWN Branch (can happen from any status) */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-center">
                        <div className="text-sm text-gray-600 mr-4">Alternative Path:</div>

                        {/* Any Status → WITHDRAWN */}
                        <div className="flex items-center">
                            <div className="px-4 py-2 bg-gray-100 rounded text-sm text-gray-700 font-medium">
                                Any Status
                            </div>
                            <ArrowRight className="w-6 h-6 text-gray-400 mx-3" />
                            <div
                                onClick={() => onStatusClick && patientId && handleStatusClick('WITHDRAWN')}
                                className={`
                  px-6 py-4 rounded-lg font-semibold text-center min-w-[140px]
                  ${getStatusColorClasses('WITHDRAWN', currentStatus === 'WITHDRAWN')}
                  ${onStatusClick && patientId ? 'cursor-pointer' : ''}
                `}
                            >
                                <div className="text-sm">{formatStatus('WITHDRAWN')}</div>
                                {currentStatus === 'WITHDRAWN' && (
                                    <div className="text-xs font-normal opacity-90">Current</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-6 text-sm">

                        {/* Current Status Indicator */}
                        {currentStatus && (
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded ring-2 ring-green-200 mr-2" />
                                <span className="text-gray-700">Current Status</span>
                            </div>
                        )}

                        {/* Clickable Indicator */}
                        {onStatusClick && patientId && (
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-200 rounded mr-2" />
                                <span className="text-gray-700">Click to change status</span>
                            </div>
                        )}

                        {/* Conversion Rate */}
                        {showStats && !loading && transitionSummary.length > 0 && (
                            <div className="flex items-center">
                                <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-gray-700">Conversion rate (%)</span>
                            </div>
                        )}

                        {/* Loading Stats */}
                        {showStats && loading && (
                            <div className="flex items-center text-gray-500">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                <span>Loading statistics...</span>
                            </div>
                        )}

                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-700">
                        <strong>Patient Lifecycle:</strong> Patients typically progress from{' '}
                        <strong>Registered</strong> → <strong>Screening</strong> → <strong>Enrolled</strong> →{' '}
                        <strong>Active</strong> → <strong>Completed</strong>. Patients can be{' '}
                        <strong>Withdrawn</strong> at any stage if they no longer meet criteria or choose to discontinue.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default StatusTransitionDiagram;
