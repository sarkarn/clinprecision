import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudyForm } from '../hooks/useStudyForm';
import { useWizardNavigation } from '../hooks/useWizardNavigation';
import ProgressIndicator from '../components/ProgressIndicator';
import { LoadingOverlay, Alert, Button } from '../components/UIComponents';
import StudyService, { StudyLookupData as ServiceLookupData } from 'services/StudyService';
import { StudyOrganizationService } from 'services/StudyOrganizationService';

// Step Components
import BasicInformationStep from './steps/BasicInformationStep';
import TimelinePersonnelStep from './steps/TimelinePersonnelStep';
import OrganizationsRegulatoryStep from './steps/OrganizationsRegulatoryStep';
import ReviewConfirmationStep from './steps/ReviewConfirmationStep';

interface Organization {
    id: string | number;
    name: string;
    code?: string;
    organizationType?: {
        id: number;
        name: string;
    };
}

interface LookupItem {
    id: number | string;
    label?: string;
    name?: string;
    value?: string;
    description?: string;
}

interface LookupData {
    studyPhases: LookupItem[];
    studyStatuses: LookupItem[];
    regulatoryStatuses: LookupItem[];
}

interface StepDefinition {
    id: string;
    title: string;
    subtitle: string;
    description: string;
}

interface StudyMetadata {
    studyCoordinator?: string;
    medicalMonitor?: string;
    secondaryObjectives?: string[];
    estimatedDuration?: string;
    ethicsApproval?: boolean;
    fdaInd?: boolean;
}

interface StudyData {
    [key: string]: any;
    phase?: string;
    status?: string;
    studyPhaseId?: number;
    studyStatusId?: number;
    regulatoryStatusId?: number;
    regulatoryStatus?: string | { id?: number; name?: string; code?: string };
    metadata?: string;
    organizations?: any[];
}

// Transform study data from API format to form format
const transformStudyDataForForm = (studyData: StudyData, lookupData: LookupData): any => {
    console.log('=== TRANSFORMING STUDY DATA ===');
    console.log('Original API response:', studyData);
    console.log('Available lookup data:', lookupData);

    const transformed: any = {
        ...studyData,
        // Ensure organization data is in the expected format
        organizations: studyData.organizations || []
    };

    // Map string phase/status values to IDs if needed
    if (lookupData) {
        // Handle phase mapping - more comprehensive matching
        if (studyData.phase && !studyData.studyPhaseId && lookupData.studyPhases) {
            const phaseStr = studyData.phase.toString().toLowerCase().trim();
            const phaseMatch = lookupData.studyPhases.find(p => {
                const label = p.label?.toLowerCase() || '';
                const value = p.value?.toLowerCase() || '';

                return label === phaseStr ||
                    value === phaseStr ||
                    label.includes(phaseStr) ||
                    phaseStr.includes(label.replace(/phase\s*/i, '').trim()) ||
                    (phaseStr.includes('phase') && label.includes(phaseStr.replace(/phase\s*/i, '').trim()));
            });
            if (phaseMatch) {
                transformed.studyPhaseId = phaseMatch.id;
                console.log(`Mapped phase "${studyData.phase}" to ID ${phaseMatch.id} (${phaseMatch.label})`);
            } else {
                console.warn(`Could not map phase "${studyData.phase}" to any lookup value`);
                console.log('Available phases:', lookupData.studyPhases.map(p => ({ id: p.id, label: p.label, value: p.value })));
            }
        }

        // Handle status mapping - more comprehensive matching
        if (studyData.status && !studyData.studyStatusId && lookupData.studyStatuses) {
            const statusStr = studyData.status.toString().toLowerCase().trim();
            const statusMatch = lookupData.studyStatuses.find(s => {
                const label = s.label?.toLowerCase() || '';
                const value = s.value?.toLowerCase() || '';

                return label === statusStr ||
                    value === statusStr ||
                    label.includes(statusStr) ||
                    statusStr.includes(label);
            });
            if (statusMatch) {
                transformed.studyStatusId = statusMatch.id;
                console.log(`Mapped status "${studyData.status}" to ID ${statusMatch.id} (${statusMatch.label})`);
            } else {
                console.warn(`Could not map status "${studyData.status}" to any lookup value`);
                console.log('Available statuses:', lookupData.studyStatuses.map(s => ({ id: s.id, label: s.label, value: s.value })));
            }
        }
    }

    // Parse metadata if it exists
    if (studyData.metadata && typeof studyData.metadata === 'string') {
        try {
            const metadata = JSON.parse(studyData.metadata);
            console.log('Parsed metadata:', metadata);
            Object.assign(transformed, metadata);
        } catch (err) {
            console.warn('Failed to parse study metadata:', err);
        }
    }

    // Map lookup values AFTER metadata is parsed (since regulatory status might be in metadata)
    if (lookupData) {
        // Handle regulatory status mapping - check both top-level and from metadata
        // If regulatoryStatusId is already a number (from metadata), use it directly
        if (transformed.regulatoryStatusId && typeof transformed.regulatoryStatusId === 'number') {
            console.log(`Using existing regulatoryStatusId: ${transformed.regulatoryStatusId}`);
        } else {
            // Try to map from string values (legacy data or direct field)
            const regulatoryStatusValue = transformed.regulatoryStatus || studyData.regulatoryStatus;
            if (regulatoryStatusValue && !transformed.regulatoryStatusId && lookupData.regulatoryStatuses) {
                // Handle case where regulatoryStatus is an object (legacy data)
                const statusToMap = typeof regulatoryStatusValue === 'object'
                    ? (regulatoryStatusValue.name || regulatoryStatusValue.code || regulatoryStatusValue.id)
                    : regulatoryStatusValue;

                if (typeof statusToMap === 'number') {
                    // If it's already a number, use it as ID
                    transformed.regulatoryStatusId = statusToMap;
                    console.log(`Using numeric regulatoryStatusId: ${statusToMap}`);
                } else if (typeof statusToMap === 'string') {
                    // Map string to ID
                    const regStatusStr = statusToMap.toString().toLowerCase().trim();
                    const regStatusMatch = lookupData.regulatoryStatuses.find(r => {
                        const label = r.label?.toLowerCase() || '';
                        const value = r.value?.toLowerCase() || '';
                        const name = r.name?.toLowerCase() || '';

                        return label === regStatusStr ||
                            value === regStatusStr ||
                            name === regStatusStr ||
                            label.includes(regStatusStr) ||
                            regStatusStr.includes(label) ||
                            name.includes(regStatusStr) ||
                            regStatusStr.includes(name);
                    });
                    if (regStatusMatch) {
                        transformed.regulatoryStatusId = regStatusMatch.id;
                        console.log(`Mapped regulatory status "${statusToMap}" to ID ${regStatusMatch.id} (${regStatusMatch.label || regStatusMatch.name})`);
                    } else {
                        console.warn(`Could not map regulatory status "${statusToMap}" to any lookup value`);
                        console.log('Available regulatory statuses:', lookupData.regulatoryStatuses.map(r => ({ id: r.id, label: r.label, name: r.name, value: r.value })));
                    }
                }
            }
        }
    }

    console.log('Transformed data before return:', transformed);
    console.log('Key fields check:', {
        studyPhaseId: transformed.studyPhaseId,
        studyStatusId: transformed.studyStatusId,
        regulatoryStatusId: transformed.regulatoryStatusId,
        phase: transformed.phase,
        status: transformed.status,
        regulatoryStatus: transformed.regulatoryStatus,
        name: transformed.name
    });

    return transformed;
};

/**
 * Multi-step Study Edit Wizard
 * Identical to StudyCreationWizard but loads existing study data for editing
 */
const StudyEditWizard: React.FC = () => {
    const navigate = useNavigate();
    const { studyId } = useParams<{ studyId: string }>();

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
    const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
    const [lookupData, setLookupData] = useState<LookupData>({
        studyPhases: [],
        studyStatuses: [],
        regulatoryStatuses: []
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
    const [isLoadingStudy, setIsLoadingStudy] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Step definitions
    const steps: StepDefinition[] = [
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
            subtitle: 'Confirm & save',
            description: 'Review all changes and update the study'
        }
    ];

    // Load study data and organizations/lookup data on component mount
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setIsLoadingStudy(true);
                setLoadError(null);

                // Fetch existing study data
                console.log('Fetching study with ID:', studyId);
                const studyData = await StudyService.getStudyById(studyId!);
                console.log('Raw study data from API:', studyData);

                // Fetch organizations and lookup data in parallel
                const [orgs, lookups] = await Promise.all([
                    StudyOrganizationService.getAllOrganizations(),
                    StudyService.getStudyLookupData()
                ]);

                setAvailableOrganizations(Array.isArray(orgs) ? orgs : []);
                
                // Transform service format to local format
                const finalLookupData: LookupData = {
                    studyPhases: Array.isArray(lookups.phases) ? lookups.phases.map(p => ({ id: p.value, label: p.label, value: p.value })) : [],
                    studyStatuses: Array.isArray(lookups.statuses) ? lookups.statuses.map(s => ({ id: s.value, label: s.label, value: s.value })) : [],
                    regulatoryStatuses: Array.isArray(lookups.regulatoryStatuses) ? lookups.regulatoryStatuses.map(r => ({ id: r.value, label: r.label, value: r.value })) : []
                };
                setLookupData(finalLookupData);

                // Transform study data for form with lookup data for mapping
                const transformedData = transformStudyDataForForm(studyData, finalLookupData);
                console.log('About to call updateFields with:', transformedData);
                updateFields(transformedData);
                console.log('updateFields called successfully');

            } catch (err: any) {
                console.error('Error loading study data:', err);
                setLoadError(err.message || 'Failed to load study data');
            } finally {
                setIsLoadingStudy(false);
            }
        };

        if (studyId) {
            fetchData();
        }
    }, [studyId]); // Removed updateFields from dependency array to prevent infinite loop

    // Debug: Log form data changes
    useEffect(() => {
        console.log('=== FORM DATA UPDATED ===');
        console.log('Current formData:', formData);
        console.log('Key fields:', {
            name: formData.name,
            studyPhaseId: formData.studyPhaseId,
            studyStatusId: formData.studyStatusId,
            regulatoryStatusId: formData.regulatoryStatusId,
            studyPhaseIdType: typeof formData.studyPhaseId,
            studyStatusIdType: typeof formData.studyStatusId,
            regulatoryStatusIdType: typeof formData.regulatoryStatusId
        });
    }, [formData]);

    // Handle form submission
    const handleSubmit = async (): Promise<void> => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);

            // Prepare data for API
            const apiData: any = { ...formData };

            // Handle metadata fields (only put non-database fields in metadata)
            if (apiData.studyCoordinator || apiData.medicalMonitor || apiData.secondaryObjectives ||
                typeof apiData.ethicsApproval !== 'undefined' || typeof apiData.fdaInd !== 'undefined' ||
                apiData.estimatedDuration) {
                const metadata: StudyMetadata = {};
                // Keep these as top-level fields for database columns:
                // - principalInvestigator (maps to principal_investigator column)
                // - studyType (maps to study_type column) 
                // - primaryObjective (maps to primary_objective column)
                // - regulatoryStatusId (maps to regulatory_status_id column)

                // Only put supporting/flexible fields in metadata:
                if (apiData.studyCoordinator) {
                    metadata.studyCoordinator = apiData.studyCoordinator;
                    delete apiData.studyCoordinator;
                }
                if (apiData.medicalMonitor) {
                    metadata.medicalMonitor = apiData.medicalMonitor;
                    delete apiData.medicalMonitor;
                }
                if (apiData.secondaryObjectives) {
                    metadata.secondaryObjectives = apiData.secondaryObjectives;
                    delete apiData.secondaryObjectives;
                }
                if (apiData.estimatedDuration) {
                    metadata.estimatedDuration = apiData.estimatedDuration;
                    delete apiData.estimatedDuration;
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

            console.log('Submitting study update:', apiData);

            // Update the study
            const response = await StudyService.updateStudy(studyId!, apiData);
            console.log('Study updated successfully:', response);

            // Navigate back to study list
            navigate('/study-design/studies', {
                state: {
                    message: `Study "${formData.name}" has been updated successfully!`,
                    type: 'success'
                }
            });

        } catch (error: any) {
            console.error('Error updating study:', error);
            setSubmitError(
                error.response?.data?.message ||
                error.message ||
                'Failed to update study. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle exit confirmation
    const handleExit = (): void => {
        if (isDirty) {
            setShowExitConfirm(true);
        } else {
            navigate('/study-design/studies');
        }
    };

    // Render current step content
    const renderStepContent = (): React.ReactNode => {
        switch (currentStep) {
            case 0:
                return (
                    <BasicInformationStep
                        formData={formData}
                        onFieldChange={updateField}
                        getFieldError={getFieldError}
                        hasFieldError={hasFieldError}
                        lookupData={lookupData}
                        availableOrganizations={availableOrganizations}
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
                        lookupData={lookupData}
                    />
                );
            case 3:
                return (
                    <ReviewConfirmationStep
                        formData={formData}
                        availableOrganizations={availableOrganizations}
                        lookupData={lookupData}
                        onEdit={goToStep}
                    />
                );
            default:
                return null;
        }
    };

    // Show loading screen while fetching study data
    if (isLoadingStudy) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingOverlay isLoading={true} message="Loading study data...">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Study Data</h2>
                            <p className="text-gray-600">Please wait while we fetch the study information...</p>
                        </div>
                    </LoadingOverlay>
                </div>
            </div>
        );
    }

    // Show error screen if loading failed
    if (loadError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Study</h2>
                        <p className="text-red-700 mb-4">{loadError}</p>
                        <div className="space-x-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Retry
                            </Button>
                            <Button
                                onClick={() => navigate('/study-design/studies')}
                                variant="outline"
                            >
                                Back to Studies
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Study</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Update study information using the step-by-step wizard
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={handleExit}
                                variant="outline"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <ProgressIndicator
                        steps={steps}
                        currentStep={currentStep}
                        completedSteps={steps.map((_, index) => index).filter(index => isStepCompleted(index))}
                        onStepClick={goToStep}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LoadingOverlay isLoading={isSubmitting} message="Updating study...">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Step Content */}
                        <div className="p-8">
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between px-8 py-6 bg-gray-50 border-t rounded-b-lg">
                            <div>
                                {!isFirstStep && (
                                    <Button
                                        onClick={previousStep}
                                        variant="outline"
                                        disabled={isSubmitting}
                                    >
                                        Previous
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                {!isLastStep ? (
                                    <Button
                                        onClick={nextStep}
                                        disabled={!canGoNext || isSubmitting}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!isValid || isSubmitting}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Study'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </LoadingOverlay>
            </div>

            {/* Error Alert */}
            {submitError && (
                <Alert
                    type="error"
                    title="Update Failed"
                    message={submitError}
                    onClose={() => setSubmitError(null)}
                />
            )}

            {/* Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Unsaved Changes
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You have unsaved changes. Are you sure you want to leave without saving?
                            </p>
                            <div className="flex space-x-3 justify-end">
                                <Button
                                    onClick={() => setShowExitConfirm(false)}
                                    variant="outline"
                                >
                                    Stay
                                </Button>
                                <Button
                                    onClick={() => navigate('/study-design/studies')}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Leave Without Saving
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyEditWizard;
