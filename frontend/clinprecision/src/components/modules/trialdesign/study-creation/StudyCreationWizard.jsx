import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyForm } from '../hooks/useStudyForm';
import { useWizardNavigation } from '../hooks/useWizardNavigation';
import ProgressIndicator from '../components/ProgressIndicator';
import { LoadingOverlay, Alert, Button } from '../components/UIComponents';
import StudyService from '../../../../services/StudyService';
import { OrganizationService } from '../../../../services/OrganizationService';

// Step Components
import BasicInformationStep from './steps/BasicInformationStep';
import TimelinePersonnelStep from './steps/TimelinePersonnelStep';
import OrganizationsRegulatoryStep from './steps/OrganizationsRegulatoryStep';
import ReviewConfirmationStep from './steps/ReviewConfirmationStep';

/**
 * Multi-step Study Creation Wizard
 */
const StudyCreationWizard = () => {
    const navigate = useNavigate();

    // Form and wizard state
    const {
        formData,
        updateField,
        updateFields,
        validateForm,
        getFieldError,
        hasFieldError,
        isValid,
        isDirty
    } = useStudyForm();

    const {
        currentStep,
        nextStep,
        previousStep,
        goToStep,
        markStepCompleted,
        markStepIncomplete,
        setStepError,
        clearStepError,
        canGoNext,
        canGoPrevious,
        isFirstStep,
        isLastStep,
        isStepCompleted,
        hasStepError,
        getStepError
    } = useWizardNavigation(4);

    // Component state
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Step definitions
    const steps = [
        {
            id: 'basic',
            title: 'Basic Info',
            subtitle: 'Study details',
            description: 'Basic study information and identification'
        },
        {
            id: 'timeline',
            title: 'Timeline',
            subtitle: 'Dates & people',
            description: 'Timeline and personnel information'
        },
        {
            id: 'organizations',
            title: 'Organizations',
            subtitle: 'Partners & regulatory',
            description: 'Organization associations and regulatory information'
        },
        {
            id: 'review',
            title: 'Review',
            subtitle: 'Confirm & create',
            description: 'Review all information and create the study'
        }
    ];

    // Load organizations on component mount
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const orgs = await OrganizationService.getAllOrganizations();
                setAvailableOrganizations(Array.isArray(orgs) ? orgs : []);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setAvailableOrganizations([]);
            }
        };

        fetchOrganizations();
    }, []);

    // Validate current step
    const validateCurrentStep = () => {
        switch (currentStep) {
            case 0: // Basic Information
                const basicFields = ['name', 'protocolNumber', 'studyPhaseId', 'sponsor'];
                const basicErrors = basicFields.filter(field => !formData[field] || hasFieldError(field));
                if (basicErrors.length > 0) {
                    setStepError(0, `Please complete all required fields: ${basicErrors.join(', ')}`);
                    return false;
                }
                clearStepError(0);
                return true;

            case 1: // Timeline & Personnel
                if (!formData.principalInvestigator) {
                    setStepError(1, 'Principal Investigator is required');
                    return false;
                }
                if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
                    setStepError(1, 'Start date must be before end date');
                    return false;
                }
                clearStepError(1);
                return true;

            case 2: // Organizations & Regulatory
                // This step is optional, so always valid
                clearStepError(2);
                return true;

            case 3: // Review
                // Final validation
                return validateForm();

            default:
                return true;
        }
    };

    // Handle next step
    const handleNext = () => {
        if (validateCurrentStep()) {
            markStepCompleted(currentStep);
            nextStep();
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        previousStep();
    };

    // Handle step click
    const handleStepClick = (stepIndex) => {
        if (stepIndex <= currentStep || isStepCompleted(stepIndex)) {
            goToStep(stepIndex);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            setSubmitError('Please complete all required fields before submitting.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Prepare data for API
            const apiData = { ...formData };

            // Handle metadata fields
            if (apiData.principalInvestigator || apiData.studyCoordinator || apiData.medicalMonitor) {
                const metadata = {};
                if (apiData.principalInvestigator) {
                    metadata.principalInvestigator = apiData.principalInvestigator;
                    delete apiData.principalInvestigator;
                }
                if (apiData.studyCoordinator) {
                    metadata.studyCoordinator = apiData.studyCoordinator;
                    delete apiData.studyCoordinator;
                }
                if (apiData.medicalMonitor) {
                    metadata.medicalMonitor = apiData.medicalMonitor;
                    delete apiData.medicalMonitor;
                }
                if (apiData.primaryObjective) {
                    metadata.primaryObjective = apiData.primaryObjective;
                    delete apiData.primaryObjective;
                }
                if (apiData.secondaryObjectives) {
                    metadata.secondaryObjectives = apiData.secondaryObjectives;
                    delete apiData.secondaryObjectives;
                }
                if (apiData.estimatedDuration) {
                    metadata.estimatedDuration = apiData.estimatedDuration;
                    delete apiData.estimatedDuration;
                }
                if (apiData.studyType) {
                    metadata.studyType = apiData.studyType;
                    delete apiData.studyType;
                }
                if (apiData.regulatoryStatus) {
                    metadata.regulatoryStatus = apiData.regulatoryStatus;
                    delete apiData.regulatoryStatus;
                }
                if (typeof apiData.ethicsApproval !== 'undefined') {
                    metadata.ethicsApproval = apiData.ethicsApproval;
                    delete apiData.ethicsApproval;
                }
                if (typeof apiData.fdaInd !== 'undefined') {
                    metadata.fdaInd = apiData.fdaInd;
                    delete apiData.fdaInd;
                }

                apiData.metadata = JSON.stringify(metadata);
            }

            console.log('Submitting study data:', apiData);

            // Create the study
            const response = await StudyService.registerStudy(apiData);
            console.log('Study created successfully:', response);

            // Navigate to study list or edit page
            navigate('/study-design/list', {
                state: {
                    message: `Study "${formData.name}" has been created successfully!`,
                    type: 'success'
                }
            });

        } catch (error) {
            console.error('Error creating study:', error);
            setSubmitError(
                error.response?.data?.message ||
                error.message ||
                'Failed to create study. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle exit confirmation
    const handleExit = () => {
        if (isDirty) {
            setShowExitConfirm(true);
        } else {
            navigate('/study-design/list');
        }
    };

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <BasicInformationStep
                        formData={formData}
                        onFieldChange={updateField}
                        getFieldError={getFieldError}
                        hasFieldError={hasFieldError}
                    />
                );
            case 1:
                return (
                    <TimelinePersonnelStep
                        formData={formData}
                        onFieldChange={updateField}
                        getFieldError={getFieldError}
                        hasFieldError={hasFieldError}
                    />
                );
            case 2:
                return (
                    <OrganizationsRegulatoryStep
                        formData={formData}
                        onFieldChange={updateField}
                        getFieldError={getFieldError}
                        hasFieldError={hasFieldError}
                    />
                );
            case 3:
                return (
                    <ReviewConfirmationStep
                        formData={formData}
                        availableOrganizations={availableOrganizations}
                        onEdit={goToStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LoadingOverlay isLoading={isSubmitting} message="Creating study...">
                <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create New Study</h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Complete all steps to register a new clinical study in the system.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={handleExit}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Exit
                                </Button>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="px-6">
                            <ProgressIndicator
                                steps={steps}
                                currentStep={currentStep}
                                completedSteps={[]}
                                stepErrors={{}}
                                onStepClick={handleStepClick}
                            />
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-6">
                            {/* Step Error */}
                            {hasStepError(currentStep) && (
                                <Alert
                                    type="error"
                                    message={getStepError(currentStep)}
                                    className="mb-6"
                                />
                            )}

                            {/* Submit Error */}
                            {submitError && (
                                <Alert
                                    type="error"
                                    title="Submission Error"
                                    message={submitError}
                                    onClose={() => setSubmitError(null)}
                                    className="mb-6"
                                />
                            )}

                            {/* Step Content */}
                            {renderStepContent()}
                        </div>

                        {/* Navigation */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                            <div>
                                {!isFirstStep && (
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={!canGoPrevious}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </Button>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                {!isLastStep ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={!canGoNext}
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        loading={isSubmitting}
                                        disabled={!isValid || isSubmitting}
                                    >
                                        Create Study
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exit Confirmation Modal */}
                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Exit</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                You have unsaved changes. Are you sure you want to exit? All progress will be lost.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowExitConfirm(false)}
                                >
                                    Continue Editing
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => navigate('/study-design/list')}
                                >
                                    Exit Without Saving
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </LoadingOverlay>
        </div>
    );
};

export default StudyCreationWizard;
