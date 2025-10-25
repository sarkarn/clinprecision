import React, { FC, useState } from 'react';
import {
  ClockIcon,
  ServerIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import BuildStatusBadge from './BuildStatusBadge';
import BuildProgressBar from './BuildProgressBar';
import BuildActionsMenu from './BuildActionsMenu';
import BuildDetailsModal from './BuildDetailsModal';
import CancelBuildModal from './CancelBuildModal';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';
import type { StudyDatabaseBuild } from '../../../../../types/study/DatabaseBuild.types';

interface StudyDatabaseBuildCardProps {
  build: StudyDatabaseBuild & {
    studyName?: string;
    studyProtocol?: string;
    inProgress?: boolean;
    buildStartTime?: string;
    buildEndTime?: string;
    buildDurationSeconds?: number;
    indexesCreated?: number;
  };
  onRefresh?: () => void | Promise<void>;
  onBuildUpdated?: () => void | Promise<void>;
}

/**
 * Enhanced card component for displaying study database build with full details
 * Integrates all Phase 2 components: status badge, progress bar, actions menu, and modals
 */
const StudyDatabaseBuildCard: FC<StudyDatabaseBuildCardProps> = ({ build, onRefresh, onBuildUpdated }) => {
  const [showActionsMenu, setShowActionsMenu] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Format datetime
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    return studyDatabaseBuildService.formatDuration(seconds || 0);
  };

  // Handle view details
  const handleViewDetails = (): void => {
    setShowActionsMenu(false);
    setShowDetailsModal(true);
  };

  // Handle refresh
  const handleRefresh = async (): Promise<void> => {
    setShowActionsMenu(false);
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Handle cancel
  const handleCancel = (): void => {
    setShowActionsMenu(false);
    setShowCancelModal(true);
  };

  // Handle confirm cancel
  const handleConfirmCancel = async (reason: string): Promise<void> => {
    try {
      await studyDatabaseBuildService.cancelStudyDatabaseBuild(build.buildRequestId, reason);
      if (onBuildUpdated) {
        await onBuildUpdated();
      }
    } catch (error) {
      throw error; // Let modal handle the error display
    }
  };

  // Handle retry
  const handleRetry = async (): Promise<void> => {
    setShowActionsMenu(false);
    try {
      // Note: Retry functionality would use buildStudyDatabase with same params
      // await studyDatabaseBuildService.buildStudyDatabase({ studyId: build.studyId });
      console.log('Retry not yet implemented');
      if (onBuildUpdated) {
        await onBuildUpdated();
      }
    } catch (error) {
      console.error('Failed to retry build:', error);
    }
  };

  // Handle validate
  const handleValidate = async (): Promise<void> => {
    setShowActionsMenu(false);
    setIsValidating(true);
    try {
      await studyDatabaseBuildService.validateStudyDatabase(build.buildRequestId, {
        checkDataIntegrity: true,
        validateSchemaStructure: true,
        checkBusinessRules: true,
        strictMode: false,
      });
      if (onBuildUpdated) {
        await onBuildUpdated();
      }
    } catch (error) {
      console.error('Failed to validate database:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer" onClick={handleViewDetails}>
                  {build.studyName}
                </h3>
                <BuildStatusBadge
                  status={build.buildStatus}
                  size="medium"
                  animated={build.inProgress}
                />
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {build.buildRequestId}
                </span>
                <span className="flex items-center">
                  <ServerIcon className="h-4 w-4 mr-1" />
                  Study ID: {build.studyId}
                </span>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              {showActionsMenu && (
                <BuildActionsMenu
                  build={build}
                  onClose={() => setShowActionsMenu(false)}
                  onViewDetails={handleViewDetails}
                  onRefresh={handleRefresh}
                  onCancel={handleCancel}
                  onRetry={handleRetry}
                  onValidate={handleValidate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar (for in-progress builds) */}
        {build.inProgress && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <BuildProgressBar build={build} showPercentage showPhase />
          </div>
        )}

        {/* Card Body - Metrics Grid */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Forms Configured */}
            <div className="text-center">
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-blue-100">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{build.formsConfigured || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Forms</p>
            </div>

            {/* Tables Created */}
            <div className="text-center">
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-green-100">
                <ServerIcon className="h-5 w-5 text-green-600" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{build.tablesCreated || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tables</p>
            </div>

            {/* Indexes Created */}
            <div className="text-center">
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{build.indexesCreated || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Indexes</p>
            </div>

            {/* Validation Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-full bg-orange-100">
                {(build.validationRulesSetup || 0) > 0 ? (
                  <CheckCircleIcon className="h-5 w-5 text-orange-600" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-orange-400" />
                )}
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{build.validationRulesSetup || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rules</p>
            </div>
          </div>
        </div>

        {/* Card Footer - Timing Info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Started: {formatDateTime(build.buildStartTime)}
              </span>
              {build.buildEndTime && (
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Duration: {formatDuration(build.buildDurationSeconds)}
                </span>
              )}
            </div>
            <button
              onClick={handleViewDetails}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View Details →
            </button>
          </div>
        </div>

        {/* Validation Status (if validating) */}
        {isValidating && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
            <div className="flex items-center">
              <svg className="animate-spin h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-yellow-800 font-medium">Validating database...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <BuildDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        build={build}
        onRefresh={handleRefresh}
      />

      <CancelBuildModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        build={build}
      />
    </>
  );
};

export default StudyDatabaseBuildCard;
