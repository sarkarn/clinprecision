import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BuildStatusBadge from './BuildStatusBadge';
import BuildProgressBar from './BuildProgressBar';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Detailed modal for viewing build information
 * Features tabbed interface with Overview, Configuration, Validation, and Timeline
 */
const BuildDetailsModal = ({ isOpen, onClose, build, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !build) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'configuration', label: 'Configuration', icon: '⚙️' },
        { id: 'validation', label: 'Validation', icon: '✓' },
        { id: 'timeline', label: 'Timeline', icon: '📅' },
    ];

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format duration
    const formatDuration = (seconds) => {
        return studyDatabaseBuildService.formatDuration(seconds);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-xl font-semibold text-white">
                                        {build.studyName}
                                    </h3>
                                    <BuildStatusBadge status={build.buildStatus} size="medium" animated={build.inProgress} />
                                </div>
                                <p className="mt-1 text-sm text-blue-100">
                                    Build Request: {build.buildRequestId}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-blue-100 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-white">
                        <nav className="flex -mb-px px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    py-4 px-6 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="bg-white px-6 py-6 max-h-[600px] overflow-y-auto">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Progress Section */}
                                {build.inProgress && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Build Progress</h4>
                                        <BuildProgressBar build={build} showPercentage showPhase />
                                    </div>
                                )}

                                {/* Build Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Build Information</h4>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Study ID</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{build.studyId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Protocol</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{build.studyProtocol || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Aggregate UUID</p>
                                            <p className="mt-1 text-sm font-mono text-xs text-gray-900 break-all">{build.aggregateUuid}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Requested By</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">User #{build.requestedBy}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Build Metrics */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Build Metrics</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                            <p className="text-xs text-blue-600 uppercase tracking-wide">Forms</p>
                                            <p className="mt-2 text-2xl font-bold text-blue-900">{build.formsConfigured || 0}</p>
                                            <p className="mt-1 text-xs text-blue-600">Configured</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                            <p className="text-xs text-green-600 uppercase tracking-wide">Tables</p>
                                            <p className="mt-2 text-2xl font-bold text-green-900">{build.tablesCreated || 0}</p>
                                            <p className="mt-1 text-xs text-green-600">Created</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                            <p className="text-xs text-purple-600 uppercase tracking-wide">Indexes</p>
                                            <p className="mt-2 text-2xl font-bold text-purple-900">{build.indexesCreated || 0}</p>
                                            <p className="mt-1 text-xs text-purple-600">Indexed</p>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                            <p className="text-xs text-orange-600 uppercase tracking-wide">Rules</p>
                                            <p className="mt-2 text-2xl font-bold text-orange-900">{build.validationRulesSetup || 0}</p>
                                            <p className="mt-1 text-xs text-orange-600">Setup</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timing Information */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Timing</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Started:</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDateTime(build.buildStartTime)}</span>
                                        </div>
                                        {build.buildEndTime && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Completed:</span>
                                                <span className="text-sm font-medium text-gray-900">{formatDateTime(build.buildEndTime)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-gray-200 pt-2">
                                            <span className="text-sm font-medium text-gray-700">Duration:</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {build.buildDurationSeconds ? formatDuration(build.buildDurationSeconds) : 'In progress...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Information (if failed) */}
                                {build.buildStatus === 'FAILED' && build.errorMessage && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Error Details</h4>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-800">{build.errorMessage}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation Information */}
                                {build.buildStatus === 'CANCELLED' && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Cancellation Details</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Cancelled At:</span>
                                                <span className="text-sm font-medium text-gray-900">{formatDateTime(build.cancellationTime)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Cancelled By:</span>
                                                <span className="text-sm font-medium text-gray-900">User #{build.cancelledBy}</span>
                                            </div>
                                            {build.cancellationReason && (
                                                <div className="border-t border-gray-200 pt-2">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                                                    <p className="text-sm text-gray-900">{build.cancellationReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Configuration Tab */}
                        {activeTab === 'configuration' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Build Configuration</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Study Design</p>
                                            <p className="mt-1 text-sm text-gray-900">{build.studyDesignConfiguration || 'Standard configuration'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Build Options</p>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${build.formsConfigured > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-sm text-gray-700">Forms Configuration</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${build.validationRulesSetup > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-sm text-gray-700">Validation Rules</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${build.tablesCreated > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span className="text-sm text-gray-700">Database Tables</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Detailed configuration settings will be available in future releases.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Validation Tab */}
                        {activeTab === 'validation' && (
                            <div className="space-y-6">
                                {build.validationResult ? (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Validation Results</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Status</p>
                                                <p className="mt-1 text-sm font-medium text-gray-900">{build.validationResult.isValid ? 'Valid' : 'Invalid'}</p>
                                            </div>
                                            {build.validationResult.overallAssessment && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Assessment</p>
                                                    <p className="mt-1 text-sm text-gray-900">{build.validationResult.overallAssessment}</p>
                                                </div>
                                            )}
                                            {build.validationResult.complianceStatus && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Compliance</p>
                                                    <p className="mt-1 text-sm text-gray-900">{build.validationResult.complianceStatus}</p>
                                                </div>
                                            )}
                                            {build.validationResult.performanceScore && (
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Performance Score</p>
                                                    <p className="mt-1 text-sm text-gray-900">{build.validationResult.performanceScore}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">No validation results available</p>
                                        <p className="mt-1 text-xs text-gray-500">Validation can be run after build completion</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Build Timeline</h4>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {/* Build Initiated */}
                                        <li>
                                            <div className="relative pb-8">
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Build Initiated</p>
                                                            <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(build.buildStartTime)}</p>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-700">Database build process started by User #{build.requestedBy}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        {/* Current Status */}
                                        <li>
                                            <div className="relative pb-8">
                                                {build.buildEndTime && <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${build.buildStatus === 'COMPLETED' ? 'bg-green-500' :
                                                                build.buildStatus === 'FAILED' ? 'bg-red-500' :
                                                                    build.buildStatus === 'CANCELLED' ? 'bg-gray-500' :
                                                                        'bg-blue-500'
                                                            }`}>
                                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{build.buildStatus.replace('_', ' ')}</p>
                                                            <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(build.buildEndTime || new Date())}</p>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-700">
                                                            {build.buildStatus === 'IN_PROGRESS' && 'Build is currently in progress'}
                                                            {build.buildStatus === 'COMPLETED' && 'Build completed successfully'}
                                                            {build.buildStatus === 'FAILED' && 'Build failed with errors'}
                                                            {build.buildStatus === 'CANCELLED' && 'Build was cancelled'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                        {/* Completion/End */}
                                        {build.buildEndTime && (
                                            <li>
                                                <div className="relative">
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">Process Ended</p>
                                                                <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(build.buildEndTime)}</p>
                                                            </div>
                                                            <p className="mt-2 text-sm text-gray-700">
                                                                Total duration: {formatDuration(build.buildDurationSeconds)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Last updated: {formatDateTime(build.updatedAt || build.buildStartTime)}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onRefresh}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={onClose}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildDetailsModal;
