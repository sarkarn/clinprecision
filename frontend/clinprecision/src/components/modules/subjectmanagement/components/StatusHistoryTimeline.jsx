import React, { useState, useEffect } from 'react';
import { getStatusHistory } from '../../../../services/SubjectService';
import PatientStatusBadge from './PatientStatusBadge';

/**
 * StatusHistoryTimeline Component
 * 
 * Displays a timeline of all status changes for a patient
 * Shows audit trail with timestamps, reasons, and who made changes
 * 
 * @param {Object} props
 * @param {number|string} props.patientId - The patient ID
 * @param {Function} props.onClose - Optional callback when closing
 */
export default function StatusHistoryTimeline({ patientId, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchStatusHistory();
    }, [patientId]);

    const fetchStatusHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getStatusHistory(patientId);
            setHistory(data);
        } catch (err) {
            console.error('Error fetching status history:', err);
            setError('Failed to load status history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (itemId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredHistory = filterStatus === 'ALL'
        ? history
        : history.filter(item => item.newStatus === filterStatus);

    const uniqueStatuses = ['ALL', ...new Set(history.map(item => item.newStatus))];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-gray-600">Loading status history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={fetchStatusHistory}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-600">No status history available</p>
                <p className="text-sm text-gray-500">Status changes will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-gray-600">
                    {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
                </div>
            </div>

            {/* Timeline */}
            <div className="flow-root">
                <ul className="-mb-8">
                    {filteredHistory.map((item, idx) => (
                        <li key={item.id}>
                            <div className="relative pb-8">
                                {/* Connector Line */}
                                {idx !== filteredHistory.length - 1 && (
                                    <span
                                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                    ></span>
                                )}

                                <div className="relative flex items-start space-x-3">
                                    {/* Icon */}
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                                            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        {item.previousStatus && (
                                                            <>
                                                                <PatientStatusBadge status={item.previousStatus} size="sm" />
                                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </>
                                                        )}
                                                        <PatientStatusBadge status={item.newStatus} size="sm" />
                                                    </div>

                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div className="flex items-center">
                                                            <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{formatDate(item.changedAt)}</span>
                                                        </div>

                                                        {item.changedBy && (
                                                            <div className="flex items-center">
                                                                <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span>Changed by: <span className="font-medium">{item.changedBy}</span></span>
                                                            </div>
                                                        )}

                                                        {item.reason && (
                                                            <div className="mt-2">
                                                                <div className="text-xs font-medium text-gray-700 mb-1">Reason:</div>
                                                                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                                                    {item.reason}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.notes && (
                                                            <div className="mt-2">
                                                                <button
                                                                    onClick={() => toggleExpand(item.id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                                                >
                                                                    {expandedItems.has(item.id) ? 'Hide' : 'Show'} Notes
                                                                    <svg
                                                                        className={`ml-1 h-3 w-3 transform transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                                {expandedItems.has(item.id) && (
                                                                    <div className="mt-2 text-sm text-gray-800 bg-blue-50 p-2 rounded border border-blue-100">
                                                                        {item.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Event ID Badge */}
                                                <div className="ml-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600">
                                                        #{item.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
