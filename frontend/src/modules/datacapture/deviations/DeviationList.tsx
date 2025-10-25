// DeviationList.tsx - Display Protocol Deviations
import React, { useState } from 'react';
import ProtocolDeviationService from '../../../services/quality/ProtocolDeviationService';

// Type definitions
interface Comment {
    id: number;
    commentedBy: string;
    createdAt: string;
    comment: string;
}

interface Deviation {
    id: number;
    title: string;
    description: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
    deviationType: string;
    reportedDate: string;
    reportedBy: string;
    requiresReporting: boolean;
    protocolSection?: string;
    expectedProcedure?: string;
    actualProcedure?: string;
    rootCause?: string;
    immediateAction?: string;
    correctiveAction?: string;
    reportedToSponsor?: boolean;
    sponsorReportDate?: string;
    reportedToIrb?: boolean;
    irbReportDate?: string;
}

interface DeviationListProps {
    deviations?: Deviation[];
    onStatusUpdate?: (deviation: Deviation) => void;
    onAddComment?: (deviation: Deviation) => void;
    showFilters?: boolean;
}

/**
 * Component for displaying protocol deviations with filtering
 * 
 * Features:
 * - Color-coded severity badges (red=CRITICAL, orange=MAJOR, yellow=MINOR)
 * - Status badges with progression tracking
 * - Expandable details for each deviation
 * - Filtering by severity and status
 * - Timeline display with created/updated dates
 */
const DeviationList: React.FC<DeviationListProps> = ({
    deviations = [],
    onStatusUpdate,
    onAddComment,
    showFilters = true
}) => {
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedDeviation, setExpandedDeviation] = useState<number | null>(null);
    const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
    const [comments, setComments] = useState<Record<number, Comment[]>>({});

    // Filter deviations based on selected filters
    const filteredDeviations = deviations.filter(deviation => {
        if (severityFilter !== 'all' && deviation.severity !== severityFilter) {
            return false;
        }
        if (statusFilter !== 'all' && deviation.status !== statusFilter) {
            return false;
        }
        return true;
    });

    // Toggle deviation expansion
    const toggleDeviation = async (deviationId: number) => {
        if (expandedDeviation === deviationId) {
            setExpandedDeviation(null);
        } else {
            setExpandedDeviation(deviationId);

            // Load comments if not already loaded
            if (!comments[deviationId]) {
                await loadComments(deviationId);
            }
        }
    };

    // Load comments for a deviation
    const loadComments = async (deviationId: number) => {
        setLoadingComments(prev => ({ ...prev, [deviationId]: true }));
        try {
            const deviationComments = await ProtocolDeviationService.getDeviationComments(deviationId) as any;
            setComments(prev => ({ ...prev, [deviationId]: deviationComments }));
        } catch (error) {
            console.error('[DEVIATION_LIST] Error loading comments:', error);
        } finally {
            setLoadingComments(prev => ({ ...prev, [deviationId]: false }));
        }
    };

    // Format date for display
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get severity icon
    const getSeverityIcon = (severity: string): JSX.Element => {
        switch (severity) {
            case 'CRITICAL':
                return (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'MAJOR':
                return (
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (deviations.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">No protocol deviations recorded</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            {showFilters && (
                <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Severity:</label>
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="MAJOR">Major</option>
                            <option value="MINOR">Minor</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="OPEN">Open</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    <div className="ml-auto text-sm text-gray-600">
                        Showing {filteredDeviations.length} of {deviations.length} deviations
                    </div>
                </div>
            )}

            {/* Deviations List */}
            {filteredDeviations.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">No deviations match the selected filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDeviations.map(deviation => (
                        <div
                            key={deviation.id}
                            className="border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Deviation Header - Clickable */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => toggleDeviation(deviation.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Severity Icon */}
                                        <div className="mt-1">
                                            {getSeverityIcon(deviation.severity)}
                                        </div>

                                        {/* Title and Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900">{deviation.title}</h4>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ProtocolDeviationService.getSeverityBadgeClass(deviation.severity)}`}>
                                                    {deviation.severity}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ProtocolDeviationService.getStatusBadgeClass(deviation.status)}`}>
                                                    {deviation.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-700 mb-2">{deviation.description}</p>

                                            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                                <span>
                                                    <strong>Type:</strong> {ProtocolDeviationService.getDeviationTypeLabel(deviation.deviationType)}
                                                </span>
                                                <span>
                                                    <strong>Reported:</strong> {formatDate(deviation.reportedDate)}
                                                </span>
                                                <span>
                                                    <strong>By:</strong> {deviation.reportedBy}
                                                </span>
                                                {deviation.requiresReporting && (
                                                    <span className="text-red-600 font-medium">
                                                        📋 Requires Reporting
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <div>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedDeviation === deviation.id ? 'transform rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedDeviation === deviation.id && (
                                <div className="border-t border-gray-200 bg-gray-50 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Protocol Section */}
                                        {deviation.protocolSection && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Protocol Section</h5>
                                                <p className="text-sm text-gray-900">{deviation.protocolSection}</p>
                                            </div>
                                        )}

                                        {/* Expected Procedure */}
                                        {deviation.expectedProcedure && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Expected Procedure</h5>
                                                <p className="text-sm text-gray-900">{deviation.expectedProcedure}</p>
                                            </div>
                                        )}

                                        {/* Actual Procedure */}
                                        {deviation.actualProcedure && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Actual Procedure</h5>
                                                <p className="text-sm text-gray-900">{deviation.actualProcedure}</p>
                                            </div>
                                        )}

                                        {/* Root Cause */}
                                        {deviation.rootCause && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Root Cause</h5>
                                                <p className="text-sm text-gray-900">{deviation.rootCause}</p>
                                            </div>
                                        )}

                                        {/* Immediate Action */}
                                        {deviation.immediateAction && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Immediate Action</h5>
                                                <p className="text-sm text-gray-900">{deviation.immediateAction}</p>
                                            </div>
                                        )}

                                        {/* Corrective Action */}
                                        {deviation.correctiveAction && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-1">Corrective Action</h5>
                                                <p className="text-sm text-gray-900">{deviation.correctiveAction}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reporting Status */}
                                    {deviation.requiresReporting && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <h5 className="text-xs font-semibold text-red-700 uppercase mb-2">Reporting Status</h5>
                                            <div className="flex gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Sponsor:</span>{' '}
                                                    {deviation.reportedToSponsor ? (
                                                        <span className="text-green-600">✓ Reported {deviation.sponsorReportDate && `on ${formatDate(deviation.sponsorReportDate)}`}</span>
                                                    ) : (
                                                        <span className="text-red-600">✗ Not Reported</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium">IRB:</span>{' '}
                                                    {deviation.reportedToIrb ? (
                                                        <span className="text-green-600">✓ Reported {deviation.irbReportDate && `on ${formatDate(deviation.irbReportDate)}`}</span>
                                                    ) : (
                                                        <span className="text-red-600">✗ Not Reported</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments Section */}
                                    <div className="mt-4">
                                        <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                            Comments ({comments[deviation.id]?.length || 0})
                                        </h5>

                                        {loadingComments[deviation.id] ? (
                                            <div className="text-sm text-gray-500">Loading comments...</div>
                                        ) : comments[deviation.id] && comments[deviation.id].length > 0 ? (
                                            <div className="space-y-2">
                                                {comments[deviation.id].map(comment => (
                                                    <div key={comment.id} className="bg-white p-3 rounded border border-gray-200">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-medium text-gray-900">{comment.commentedBy}</span>
                                                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{comment.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">No comments yet</div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex gap-2">
                                        {deviation.status !== 'CLOSED' && onStatusUpdate && (
                                            <button
                                                onClick={() => onStatusUpdate(deviation)}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Update Status
                                            </button>
                                        )}
                                        {onAddComment && (
                                            <button
                                                onClick={() => onAddComment(deviation)}
                                                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            >
                                                Add Comment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeviationList;
