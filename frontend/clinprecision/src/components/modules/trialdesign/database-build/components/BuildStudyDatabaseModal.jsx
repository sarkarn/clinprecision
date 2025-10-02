import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getStudies } from '../../../../../services/StudyServiceModern';
import { useBuildActions } from '../hooks/useBuildActions';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Modal for building a study database
 * User Journey Step 3-7: Complete build form with validation and submission
 */
const BuildStudyDatabaseModal = ({ isOpen, onClose, onSuccess, selectedStudy }) => {
    // Form state
    const [formData, setFormData] = useState({
        studyId: selectedStudy?.id || '',
        studyName: selectedStudy?.name || '',
        studyProtocol: selectedStudy?.protocolNumber || '',
        requestedBy: '', // Will be set from user context
        buildConfiguration: '{}', // JSON configuration
    });

    // UI state
    const [studies, setStudies] = useState([]);
    const [loadingStudies, setLoadingStudies] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showStudyDropdown, setShowStudyDropdown] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [hasActiveBuild, setHasActiveBuild] = useState(false);
    const [checkingActive, setCheckingActive] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [buildResult, setBuildResult] = useState(null);

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
     * Load studies for dropdown
     */
    useEffect(() => {
        const loadStudies = async () => {
            try {
                setLoadingStudies(true);
                const data = await getStudies();
                setStudies(data || []);
            } catch (error) {
                console.error('Error loading studies:', error);
                setStudies([]);
            } finally {
                setLoadingStudies(false);
            }
        };

        if (isOpen) {
            loadStudies();
            // Set default requestedBy from user context (would normally come from auth)
            setFormData(prev => ({
                ...prev,
                requestedBy: 'Current User', // TODO: Get from auth context
            }));
        }
    }, [isOpen]);

    /**
     * Check if selected study has active build
     */
    useEffect(() => {
        const checkForActiveBuild = async () => {
            if (!formData.studyId) {
                setHasActiveBuild(false);
                return;
            }

            try {
                setCheckingActive(true);
                const hasActive = await studyDatabaseBuildService.hasActiveBuild(formData.studyId);
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
    const handleStudySelect = (study) => {
        setFormData({
            ...formData,
            studyId: study.id,
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
    const validateForm = () => {
        const errors = {};

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
            errors.requestedBy = 'Requested by is required';
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        clearError();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Prepare build request
        const buildRequest = {
            studyId: parseInt(formData.studyId),
            studyName: formData.studyName,
            studyProtocol: formData.studyProtocol,
            requestedBy: formData.requestedBy,
            buildConfiguration: formData.buildConfiguration 
                ? JSON.parse(formData.buildConfiguration) 
                : {},
        };

        // Submit build request
        try {
            await buildDatabase(buildRequest);
        } catch (error) {
            // Error is handled by the hook's error callback
            console.error('Submit error:', error);
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        if (!submitting) {
            setFormData({
                studyId: '',
                studyName: '',
                studyProtocol: '',
                requestedBy: '',
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
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search for a study..."
                                        value={formData.studyId ? (studies.find(s => s.id === formData.studyId)?.name || formData.studyName) : searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowStudyDropdown(true);
                                        }}
                                        onFocus={() => setShowStudyDropdown(true)}
                                        disabled={submitting || loadingStudies}
                                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                            validationErrors.studyId ? 'border-red-300' : 'border-gray-300'
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
                                            filteredStudies.map((study) => (
                                                <button
                                                    key={study.id}
                                                    type="button"
                                                    onClick={() => handleStudySelect(study)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {study.name || study.studyName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Protocol: {study.protocolNumber || study.studyProtocol || 'N/A'} • ID: {study.id}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No studies found
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
                            <input
                                type="text"
                                value={formData.requestedBy}
                                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                disabled={submitting}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                                    validationErrors.requestedBy ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter your name"
                            />
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
                                onChange={(e) => setFormData({ ...formData, buildConfiguration: e.target.value })}
                                disabled={submitting}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 font-mono text-sm ${
                                    validationErrors.buildConfiguration ? 'border-red-300' : 'border-gray-300'
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
