import React, { FC, useState } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import BuildStatusBadge from './BuildStatusBadge';
import BuildProgressBar from './BuildProgressBar';
import studyDatabaseBuildService from 'services/StudyDatabaseBuildService';
import type { StudyDatabaseBuild } from '../types/study/DatabaseBuild.types';

type TabId = 'overview' | 'configuration' | 'validation' | 'timeline';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactElement;
}

interface BuildDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: StudyDatabaseBuild & {
    studyName?: string;
    studyProtocol?: string;
    inProgress?: boolean;
    buildStartTime?: string;
    buildEndTime?: string;
    buildDurationSeconds?: number;
    indexesCreated?: number;
    buildErrors?: string;
    cancellationReason?: string;
    options?: {
      includeHistoricalData?: boolean;
      validateBeforeBuild?: boolean;
      cleanExistingData?: boolean;
      buildTimeout?: number;
      parallelProcessing?: boolean;
      customOptions?: Record<string, any>;
    };
  };
  onRefresh?: () => void | Promise<void>;
}

/**
 * Detailed modal for viewing study database build information
 * Features tabbed interface with overview, configuration, validation, and timeline
 */
const BuildDetailsModal: FC<BuildDetailsModalProps> = ({ isOpen, onClose, build, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: 'configuration', label: 'Configuration', icon: <ServerIcon className="h-5 w-5" /> },
    { id: 'validation', label: 'Validation', icon: <CheckCircleIcon className="h-5 w-5" /> },
    { id: 'timeline', label: 'Timeline', icon: <ClockIcon className="h-5 w-5" /> },
  ];

  // Format datetime
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    return studyDatabaseBuildService.formatDuration(seconds || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">{build.studyName}</h2>
                  <BuildStatusBadge status={build.buildStatus} size="medium" animated={build.inProgress} />
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Build ID: {build.buildRequestId}
                  </span>
                  <span className="flex items-center">
                    <ServerIcon className="h-4 w-4 mr-1" />
                    Study ID: {build.studyId}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                    title="Refresh"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Progress Section (for in-progress builds) */}
                {build.inProgress && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Build Progress</h3>
                    <BuildProgressBar build={build} showPercentage showPhase height="large" />
                  </div>
                )}

                {/* Build Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Build Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Build Type:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.buildType || 'Standard'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Protocol:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.studyProtocol || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Aggregate UUID:</dt>
                        <dd className="text-sm font-mono text-gray-900 truncate" title={build.aggregateUuid}>
                          {build.aggregateUuid.substring(0, 16)}...
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Metrics</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Forms Configured:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.formsConfigured || 0}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Tables Created:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.tablesCreated || 0}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Indexes Created:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.indexesCreated || 0}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Validation Rules:</dt>
                        <dd className="text-sm font-medium text-gray-900">{build.validationRulesSetup || 0}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Timing Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Timing</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Started At:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDateTime(build.buildStartTime || build.startedAt)}</dd>
                    </div>
                    {build.buildEndTime && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Completed At:</dt>
                          <dd className="text-sm font-medium text-gray-900">{formatDateTime(build.buildEndTime)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Total Duration:</dt>
                          <dd className="text-sm font-medium text-gray-900">{formatDuration(build.buildDurationSeconds || build.duration)}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>

                {/* Errors (if any) */}
                {build.buildErrors && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-2">Build Errors</h3>
                        <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">{build.buildErrors}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {build.cancellationReason && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <XCircleIcon className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Cancellation Reason</h3>
                        <p className="text-sm text-gray-700">{build.cancellationReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === 'configuration' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Build Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <dl className="space-y-3">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Include Historical Data:</dt>
                        <dd className="flex items-center">
                          {build.options?.includeHistoricalData ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Validate Before Build:</dt>
                        <dd className="flex items-center">
                          {build.options?.validateBeforeBuild ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Clean Existing Data:</dt>
                        <dd className="flex items-center">
                          {build.options?.cleanExistingData ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Parallel Processing:</dt>
                        <dd className="flex items-center">
                          {build.options?.parallelProcessing ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </dd>
                      </div>
                      {build.options?.buildTimeout && (
                        <div className="flex items-center justify-between">
                          <dt className="text-sm text-gray-600">Build Timeout:</dt>
                          <dd className="text-sm font-medium text-gray-900">{build.options.buildTimeout} seconds</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {build.options?.customOptions && Object.keys(build.options.customOptions).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Custom Options</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                        {JSON.stringify(build.options.customOptions, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation Tab */}
            {activeTab === 'validation' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation Results</h3>
                  <p className="text-sm text-gray-600">
                    Validation results will appear here after running database validation.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Build Timeline</h3>
                  <div className="space-y-4">
                    {/* Started Event */}
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ClockIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">Build Started</p>
                        <p className="text-sm text-gray-600">{formatDateTime(build.buildStartTime || build.startedAt)}</p>
                      </div>
                    </div>

                    {/* Completed/Failed/Cancelled Event */}
                    {build.buildEndTime && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              build.buildStatus === 'COMPLETED'
                                ? 'bg-green-100'
                                : build.buildStatus === 'FAILED'
                                ? 'bg-red-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            {build.buildStatus === 'COMPLETED' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : build.buildStatus === 'FAILED' ? (
                              <XCircleIcon className="h-5 w-5 text-red-600" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Build {build.buildStatus === 'COMPLETED' ? 'Completed' : build.buildStatus === 'FAILED' ? 'Failed' : 'Cancelled'}
                          </p>
                          <p className="text-sm text-gray-600">{formatDateTime(build.buildEndTime)}</p>
                          <p className="text-sm text-gray-500 mt-1">Duration: {formatDuration(build.buildDurationSeconds || build.duration)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildDetailsModal;
