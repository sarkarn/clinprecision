import React, { FC, useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getStudies } from 'services/StudyServiceModern';
import { useBuildActions } from '../hooks/useBuildActions';
import studyDatabaseBuildService from 'services/StudyDatabaseBuildService';
import { useAuth } from '../login/AuthContext';
import { useStudyNavigation } from '../hooks/useStudyNavigation';
import type { StudyDatabaseBuild } from '../types/study/DatabaseBuild.types';

interface Study {
  id?: number;
  name?: string;
  studyName?: string;
  protocolNumber?: string;
  studyProtocol?: string;
  status?: string;
  studyStatus?: {
    code?: string;
    name?: string;
  };
}

interface FormData {
  studyId: number | '';
  studyName: string;
  studyProtocol: string;
  requestedBy: number | '';
  requestedByDisplay: string;
  buildConfiguration: string;
}

interface ValidationErrors {
  studyId?: string;
  studyName?: string;
  requestedBy?: string;
  buildConfiguration?: string;
}

interface BuildRequest {
  studyId: number;
  studyName: string;
  studyProtocol: string;
  requestedBy: number;
  buildConfiguration: Record<string, any>;
}

interface BuildStudyDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: StudyDatabaseBuild) => void;
  selectedStudy?: Study;
}

/**
 * Modal for building a study database
 * User Journey Step 3-7: Complete build form with validation and submission
 * 
 * UX IMPROVEMENTS:
 * 1. Auto-fills current user from auth context in requestedBy field
 * 2. Filters studies to show only APPROVED or ACTIVE status (ready for build)
 * 3. Pre-selects study if accessed from Study Design Dashboard context
 * 4. Prevents showing studies that already have active builds
 */
const BuildStudyDatabaseModal: FC<BuildStudyDatabaseModalProps> = ({ isOpen, onClose, onSuccess, selectedStudy }) => {
  // Get current user from auth context
  const { user } = useAuth();

  // Get study navigation context
  const { getCurrentStudyId, isInStudyContext } = useStudyNavigation();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    studyId: selectedStudy?.id || '',
    studyName: selectedStudy?.name || selectedStudy?.studyName || '',
    studyProtocol: selectedStudy?.protocolNumber || selectedStudy?.studyProtocol || '',
    requestedBy: '',
    requestedByDisplay: '',
    buildConfiguration: '{}',
  });

  // UI state
  const [studies, setStudies] = useState<Study[]>([]);
  const [loadingStudies, setLoadingStudies] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showStudyDropdown, setShowStudyDropdown] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasActiveBuild, setHasActiveBuild] = useState<boolean>(false);
  const [checkingActive, setCheckingActive] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [buildResult, setBuildResult] = useState<StudyDatabaseBuild | null>(null);

  // Use build actions hook
  const {
    loading: submitting,
    error: submitError,
    buildDatabase,
    clearError,
  } = useBuildActions(
    (result) => {
      // Success callback
      console.log('Build started successfully:', result);
      setBuildResult(result);
      setShowSuccess(true);
      // Close modal and refresh after showing success message
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess(result);
        }
      }, 2000);
    },
    (error) => {
      // Error callback
      console.error('Build failed:', error);
    }
  );

  /**
   * Load studies for dropdown - FILTERED to show only build-ready studies
   * Only shows studies with status APPROVED or ACTIVE
   */
  useEffect(() => {
    const loadStudies = async (): Promise<void> => {
      try {
        setLoadingStudies(true);
        const data = await getStudies();

        // Filter studies to show only those ready for database build
        const buildReadyStudies = (data || []).filter((study: Study) => {
          const status = study.studyStatus?.code || study.status;
          return status === 'APPROVED' || status === 'ACTIVE';
        });

        console.log('Total studies:', data?.length || 0);
        console.log('Build-ready studies (APPROVED/ACTIVE):', buildReadyStudies.length);

        setStudies(buildReadyStudies);
      } catch (error) {
        console.error('Error loading studies:', error);
        setStudies([]);
      } finally {
        setLoadingStudies(false);
      }
    };

    if (isOpen) {
      loadStudies();

      // Set requestedBy from authenticated user
      const userNumericId = user?.userNumericId ? parseInt(user.userNumericId as string) : null;
      const displayName = user?.email || user?.name || 'Unknown User';

      console.log('Setting requestedBy from auth context:', {
        userNumericId,
        displayName,
        userObject: user
      });

      if (!userNumericId) {
        console.warn('Numeric User ID not found in auth context. Build request may fail. Please re-login.');
      }

      // Check if we're in a study context
      const contextStudyId = getCurrentStudyId();
      console.log('Study context:', { contextStudyId, isInStudyContext: isInStudyContext() });

      setFormData(prev => ({
        ...prev,
        requestedBy: userNumericId || '',
        requestedByDisplay: displayName,
      }));
    }
  }, [isOpen, user, getCurrentStudyId, isInStudyContext]);

  /**
   * Pre-select study if provided via prop or from study context
   */
  useEffect(() => {
    if (isOpen && studies.length > 0) {
      // Priority 1: Use selectedStudy prop if provided
      if (selectedStudy) {
        console.log('Pre-selecting study from prop:', selectedStudy);
        handleStudySelect(selectedStudy);
        return;
      }

      // Priority 2: Use study from URL context
      const contextStudyId = getCurrentStudyId();
      if (contextStudyId && isInStudyContext()) {
        const numericContextId = typeof contextStudyId === 'string' ? parseInt(contextStudyId) : contextStudyId;
        const contextStudy = studies.find(s => s.id === numericContextId);

        if (contextStudy) {
          console.log('Pre-selecting study from context:', contextStudy);
          handleStudySelect(contextStudy);
        }
      }
    }
  }, [isOpen, studies, selectedStudy]);

  /**
   * Check if selected study has active build
   */
  useEffect(() => {
    const checkForActiveBuild = async (): Promise<void> => {
      if (!formData.studyId) {
        setHasActiveBuild(false);
        return;
      }

      try {
        setCheckingActive(true);
        const hasActive = await studyDatabaseBuildService.hasActiveBuild(formData.studyId as number);
        setHasActiveBuild(hasActive);

        if (hasActive) {
          setValidationErrors(prev => ({
            ...prev,
            studyId: 'This study already has an active build in progress'
          }));
        } else {
          setValidationErrors(prev => {
            const { studyId, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        console.error('Error checking active build:', error);
        setHasActiveBuild(false);
      } finally {
        setCheckingActive(false);
      }
    };

    if (formData.studyId) {
      checkForActiveBuild();
    }
  }, [formData.studyId]);

  /**
   * Handle study selection
   */
  const handleStudySelect = (study: Study): void => {
    setFormData({
      ...formData,
      studyId: study.id || '',
      studyName: study.name || study.studyName || '',
      studyProtocol: study.protocolNumber || study.studyProtocol || '',
    });
    setShowStudyDropdown(false);
    setSearchTerm('');
  };

  /**
   * Filter studies based on search term
   */
  const filteredStudies = studies.filter(study => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const name = (study.name || study.studyName || '').toLowerCase();
    const protocol = (study.protocolNumber || study.studyProtocol || '').toLowerCase();
    return name.includes(search) || protocol.includes(search);
  });

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.studyId) {
      errors.studyId = 'Please select a study';
    }

    if (hasActiveBuild) {
      errors.studyId = 'This study already has an active build in progress';
    }

    if (!formData.studyName) {
      errors.studyName = 'Study name is required';
    }

    if (!formData.requestedBy) {
      errors.requestedBy = 'Numeric User ID is required. Please re-login to refresh your session.';
    }

    if (formData.requestedBy && (isNaN(formData.requestedBy as number) || (formData.requestedBy as number) <= 0)) {
      errors.requestedBy = 'Invalid numeric user ID. Please re-login to refresh your session.';
    }

    // Validate JSON configuration if provided
    if (formData.buildConfiguration && formData.buildConfiguration.trim() !== '') {
      try {
        JSON.parse(formData.buildConfiguration);
      } catch (e) {
        errors.buildConfiguration = 'Invalid JSON format';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Clear previous errors
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare build request
    const buildRequest: BuildRequest = {
      studyId: parseInt(formData.studyId as any),
      studyName: formData.studyName,
      studyProtocol: formData.studyProtocol,
      requestedBy: formData.requestedBy as number,
      buildConfiguration: formData.buildConfiguration
        ? JSON.parse(formData.buildConfiguration)
        : {},
    };

    // Submit build request
    try {
      await buildDatabase(buildRequest);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = (): void => {
    if (!submitting) {
      setFormData({
        studyId: '',
        studyName: '',
        studyProtocol: '',
        requestedBy: '',
        requestedByDisplay: '',
        buildConfiguration: '{}',
      });
      setValidationErrors({});
      setHasActiveBuild(false);
      setShowSuccess(false);
      setBuildResult(null);
      clearError();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Success Message */}
          {showSuccess && buildResult && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">
                    Build Started Successfully!
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Build ID: {buildResult.buildRequestId || buildResult.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Build Study Database
              </h3>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Configure and start a new database build process for your study
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6">
            {/* Submit Error Display */}
            {submitError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Build Failed
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {submitError.message || 'An error occurred while starting the build'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active Build Warning */}
            {hasActiveBuild && formData.studyId && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Active Build Detected
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This study already has an active build in progress. Please wait for it to complete or cancel it before starting a new build.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Study Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Study <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Only studies with status APPROVED or ACTIVE can have databases built
              </p>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a study..."
                    value={formData.studyId ? (studies.find(s => s.id === formData.studyId)?.name || studies.find(s => s.id === formData.studyId)?.studyName || formData.studyName) : searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(e.target.value);
                      setShowStudyDropdown(true);
                    }}
                    onFocus={() => setShowStudyDropdown(true)}
                    disabled={submitting || loadingStudies}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${validationErrors.studyId ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Dropdown */}
                {showStudyDropdown && !submitting && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingStudies ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading studies...
                      </div>
                    ) : filteredStudies.length > 0 ? (
                      filteredStudies.map((study) => {
                        const status = study.studyStatus?.code || study.status;
                        const statusLabel = study.studyStatus?.name || status;
                        const statusColor = status === 'ACTIVE' ? 'text-green-600' : 'text-blue-600';

                        return (
                          <button
                            key={study.id}
                            type="button"
                            onClick={() => handleStudySelect(study)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900">
                                {study.name || study.studyName}
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${statusColor} bg-opacity-10`}>
                                {statusLabel}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Protocol: {study.protocolNumber || study.studyProtocol || 'N/A'} • ID: {study.id}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {searchTerm ?
                          'No build-ready studies match your search' :
                          'No build-ready studies available. Only APPROVED or ACTIVE studies can have databases built.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {validationErrors.studyId && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.studyId}</p>
              )}
            </div>

            {/* Study Name (Auto-filled) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studyName}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Will be auto-filled when study is selected"
              />
              {validationErrors.studyName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.studyName}</p>
              )}
            </div>

            {/* Study Protocol (Auto-filled) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Protocol
              </label>
              <input
                type="text"
                value={formData.studyProtocol}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Will be auto-filled when study is selected"
              />
            </div>

            {/* Requested By */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested By <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Auto-filled from your user profile
              </p>
              <input
                type="text"
                value={formData.requestedByDisplay || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="User information will be auto-filled"
              />
              {formData.requestedBy && (
                <p className="mt-1 text-xs text-gray-500">
                  User ID: {formData.requestedBy}
                </p>
              )}
              {validationErrors.requestedBy && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.requestedBy}</p>
              )}
            </div>

            {/* Build Configuration (Optional JSON) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Build Configuration <span className="text-gray-500 text-xs">(Optional JSON)</span>
              </label>
              <textarea
                value={formData.buildConfiguration}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, buildConfiguration: e.target.value })}
                disabled={submitting}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 font-mono text-sm ${validationErrors.buildConfiguration ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder='{"forms": ["Form1", "Form2"], "validations": ["Required"]}'
              />
              {validationErrors.buildConfiguration && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.buildConfiguration}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Advanced users can specify custom build options in JSON format
              </p>
            </div>

            {/* Checking Active Build Indicator */}
            {checkingActive && (
              <div className="mb-4 text-sm text-gray-600 flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking for active builds...
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || hasActiveBuild || checkingActive || Object.keys(validationErrors).length > 0}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Build...
                  </>
                ) : (
                  'Start Build'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuildStudyDatabaseModal;
