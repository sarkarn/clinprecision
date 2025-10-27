import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, XCircle, Eye, FileText, Users, Calendar, Link as LinkIcon, Send, Lock, Unlock } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import StudyDesignService from 'services/StudyDesignService';
import useProtocolVersioning from '../../../../../../src/hooks/api/studies/useProtocolVersioning';
import type { Study } from '../../../../types';

// ============================================================================
// Type Definitions
// ============================================================================

type PublishStatus = 'DRAFT' | 'READY_FOR_REVIEW' | 'PROTOCOL_REVIEW' | 'READY_TO_PUBLISH' | 'PUBLISHED';
type ValidationStatus = 'PASSED' | 'WARNING' | 'FAILED';
type ReviewerStatus = 'ASSIGNED' | 'APPROVED' | 'CHANGES_REQUESTED';
type CommentType = 'APPROVAL' | 'SUGGESTION' | 'REQUIRED_CHANGE';

interface ValidationCheck {
    name: string;
    status: ValidationStatus;
    required: boolean;
    message?: string;
}

interface ValidationResult {
    category: string;
    status: ValidationStatus;
    checks: ValidationCheck[];
}

interface ReviewerComment {
    text: string;
    type: CommentType;
}

interface Reviewer {
    id: string;
    name: string;
    role: string;
    status: ReviewerStatus;
    assignedDate: string;
    reviewedDate: string | null;
    comments: ReviewerComment[];
}

interface PublishSettings {
    enableDataCapture: boolean;
    autoRandomization: boolean;
    notifyInvestigators: boolean;
    lockDesign: boolean;
}

interface MockStudyData {
    id: string | number;
    name: string;
    state: string;
    version: string;
    lastModified: string;
    createdBy: string;
    studyPhase: string;
    indication: string;
    arms: number;
    visits: number;
    forms: number;
    bindings: number;
    plannedSubjects: number;
    sites: number;
}

interface PublishStatusDisplay {
    label: string;
    color: string;
    icon: React.ReactElement;
}

// Sub-component Props
interface ValidationCategoryCardProps {
    validation: ValidationResult;
    onViewDetails: () => void;
}

interface ReviewerCardProps {
    reviewer: Reviewer;
}

interface PublishActionBarProps {
    status: PublishStatus;
    onApprove: () => void;
    onPublish: () => void;
    publishing: boolean;
    hasActiveProtocol: boolean;
    hasValidationIssues: boolean;
}

/**
 * Study Publish Workflow Component
 * Manages study review, validation, and publishing process
 */
const StudyPublishWorkflow: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();

    // Protocol versioning hook - to check for active protocol before study approval
    const { protocolVersions } = useProtocolVersioning(studyId || '');

    // State management
    const [study, setStudy] = useState<Study | null>(null);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('DRAFT');
    const [reviewers, setReviewers] = useState<Reviewer[]>([]);
    const [publishSettings, setPublishSettings] = useState<PublishSettings>({
        enableDataCapture: true,
        autoRandomization: true,
        notifyInvestigators: true,
        lockDesign: true
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [publishing, setPublishing] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        if (!studyId) return;

        try {
            setLoading(true);

            // Check for uploaded IRB documents in localStorage
            const checkIRBDocuments = (): boolean => {
                try {
                    const savedDocuments = localStorage.getItem(`study_${studyId}_uploaded_documents`);
                    if (savedDocuments) {
                        const documents = JSON.parse(savedDocuments) as { documentType: string }[];
                        const irbDocuments = documents.filter(doc => doc.documentType === 'IRB');
                        return irbDocuments.length > 0;
                    }
                    return false;
                } catch (error) {
                    console.error('Error checking IRB documents:', error);
                    return false;
                }
            };

            const hasIRBDocuments = checkIRBDocuments();

            // Mock data - replace with actual API call
            const mockData = {
                study: {
                    id: studyId,
                    name: 'Phase III Oncology Trial - Advanced NSCLC',
                    state: 'DESIGN',
                    version: '1.0',
                    lastModified: '2024-01-15T10:30:00Z',
                    createdBy: 'Dr. Sarah Johnson',
                    studyPhase: 'Phase III',
                    indication: 'Advanced Non-Small Cell Lung Cancer',
                    arms: 2,
                    visits: 8,
                    forms: 10,
                    bindings: 15,
                    plannedSubjects: 300,
                    sites: 12
                } as MockStudyData,
                validationResults: [
                    {
                        category: 'Study Information',
                        status: 'PASSED' as ValidationStatus,
                        checks: [
                            { name: 'Study title defined', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Principal investigator assigned', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Study phase specified', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Primary endpoint defined', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Sample size calculation', status: 'WARNING' as ValidationStatus, required: false, message: 'Statistical plan could be more detailed' }
                        ]
                    },
                    {
                        category: 'Study Arms',
                        status: 'PASSED' as ValidationStatus,
                        checks: [
                            { name: 'At least one study arm defined', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Randomization strategy configured', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'All arms have interventions', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Subject allocation defined', status: 'PASSED' as ValidationStatus, required: true }
                        ]
                    },
                    {
                        category: 'Visit Schedule',
                        status: 'PASSED' as ValidationStatus,
                        checks: [
                            { name: 'Baseline visit defined', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Visit windows configured', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'All visits have procedures', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'End of treatment visit', status: 'PASSED' as ValidationStatus, required: true }
                        ]
                    },
                    {
                        category: 'Form Bindings',
                        status: 'WARNING' as ValidationStatus,
                        checks: [
                            { name: 'Required forms bound to visits', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Demographics form at baseline', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Safety forms configured', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'All forms have timing rules', status: 'WARNING' as ValidationStatus, required: false, message: 'Some forms missing specific timing constraints' }
                        ]
                    },
                    {
                        category: 'Regulatory',
                        status: hasIRBDocuments ? ('PASSED' as ValidationStatus) : ('FAILED' as ValidationStatus),
                        checks: [
                            {
                                name: 'IRB approval documents',
                                status: hasIRBDocuments ? ('PASSED' as ValidationStatus) : ('FAILED' as ValidationStatus),
                                required: true,
                                message: hasIRBDocuments ? 'IRB approval documents uploaded' : 'IRB approval letter not uploaded'
                            },
                            { name: 'Informed consent forms', status: 'PASSED' as ValidationStatus, required: true },
                            { name: 'Investigator agreements', status: 'WARNING' as ValidationStatus, required: false, message: '2 sites missing signed agreements' },
                            { name: 'FDA IND number', status: 'PASSED' as ValidationStatus, required: true }
                        ]
                    }
                ] as ValidationResult[],
                reviewers: [
                    {
                        id: 'REV001',
                        name: 'Dr. Michael Chen',
                        role: 'Medical Monitor',
                        status: 'ASSIGNED' as ReviewerStatus,
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: null,
                        comments: []
                    },
                    {
                        id: 'REV002',
                        name: 'Dr. Lisa Rodriguez',
                        role: 'Biostatistician',
                        status: 'APPROVED' as ReviewerStatus,
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: '2024-01-12T14:30:00Z',
                        comments: [
                            { text: 'Statistical analysis plan looks good', type: 'APPROVAL' as CommentType },
                            { text: 'Consider adding interim analysis', type: 'SUGGESTION' as CommentType }
                        ]
                    },
                    {
                        id: 'REV003',
                        name: 'Sarah Williams',
                        role: 'Regulatory Affairs',
                        status: 'CHANGES_REQUESTED' as ReviewerStatus,
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: '2024-01-11T16:45:00Z',
                        comments: [
                            { text: 'Missing IRB approval letter', type: 'REQUIRED_CHANGE' as CommentType },
                            { text: 'Update informed consent version', type: 'REQUIRED_CHANGE' as CommentType }
                        ]
                    }
                ] as Reviewer[]
            };

            // Load actual study data from backend
            const studyData = await StudyDesignService.getStudyById(studyId);
            console.log('Loaded study data:', studyData);
            console.log('Study status from backend:', {
                studyStatusObject: (studyData as any).studyStatus,
                studyStatusCode: (studyData as any).studyStatus?.code,
                studyStatus: studyData.status,
                rawStudy: studyData
            });

            setStudy(studyData);
            setValidationResults(mockData.validationResults);
            setReviewers(mockData.reviewers);

            // Determine publish status based on backend study status
            // Try both studyStatus.code and status fields (backend might return either)
            const backendStatus = (studyData as any).studyStatus?.code || studyData.status || 'PLANNING';
            console.log('Backend status extracted:', backendStatus);
            const overallStatus = determinePublishStatusFromBackend(backendStatus, mockData.validationResults, mockData.reviewers);
            console.log('Final publish status set to:', overallStatus);
            setPublishStatus(overallStatus);

            setLoading(false);
        } catch (error) {
            console.error('Error loading study data:', error);
            setErrors(['Failed to load study data']);
            setLoading(false);
        }
    };

    // Determine publish status
    const determinePublishStatus = (validations: ValidationResult[], reviewers: Reviewer[]): PublishStatus => {
        // Allow publishing even with validation failures for development purposes
        // const hasFailedValidation = validations.some(v => v.status === 'FAILED');
        // if (hasFailedValidation) return 'DRAFT';

        const allReviewsComplete = reviewers.every(r => r.status !== 'ASSIGNED');
        const hasChangesRequested = reviewers.some(r => r.status === 'CHANGES_REQUESTED');

        if (hasChangesRequested) return 'DRAFT';
        if (!allReviewsComplete) return 'PROTOCOL_REVIEW';

        return 'READY_TO_PUBLISH';
    };

    // Determine publish status based on backend study status
    const determinePublishStatusFromBackend = (backendStatus: string, validations: ValidationResult[], reviewers: Reviewer[]): PublishStatus => {
        console.log('Determining publish status for backend status:', backendStatus);

        switch (backendStatus?.toUpperCase()) {
            case 'PLANNING':
            case 'DRAFT':
            case 'REJECTED':
                return 'DRAFT';
            case 'PROTOCOL_REVIEW':
                return 'PROTOCOL_REVIEW';
            case 'APPROVED':
                return 'READY_TO_PUBLISH';
            case 'ACTIVE':
                return 'PUBLISHED';
            case 'COMPLETED':
            case 'TERMINATED':
            case 'WITHDRAWN':
            case 'SUSPENDED':
                return 'PUBLISHED'; // Study has been published but is now in a different state
            default:
                console.warn('Unknown backend status:', backendStatus);
                return 'DRAFT';
        }
    };

    // Publish study (handles all cases - with or without validation issues)
    const handlePublishStudy = async () => {
        if (!studyId) return;

        // Check for validation issues and warn user accordingly
        const hasFailedValidation = validationResults.some(v => v.status === 'FAILED');
        const hasWarnings = validationResults.some(v => v.status === 'WARNING');

        let confirmMessage = 'Are you sure you want to publish this study? This action cannot be undone and will make the study live for data capture.';

        if (hasFailedValidation) {
            confirmMessage = 'WARNING: This study has validation failures! Publishing will make it live for data capture despite these issues. ' + confirmMessage;
        } else if (hasWarnings) {
            confirmMessage = 'NOTE: This study has validation warnings. ' + confirmMessage;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setPublishing(true);

            // Call actual API (backend only needs studyId, no request body required)
            const result = await StudyDesignService.publishStudy(studyId);
            console.log('Study published successfully:', result);

            setPublishStatus('PUBLISHED');
            setStudy(prev => prev ? { ...prev, state: 'PUBLISHED' } : null);

        } catch (error: any) {
            console.error('Error publishing study:', error);

            // Use backend error message if descriptive, otherwise add context
            let errorMessage = error.message || 'Unknown error';
            if (!errorMessage.toLowerCase().includes('publish') && !errorMessage.toLowerCase().includes('study')) {
                errorMessage = 'Failed to publish study: ' + errorMessage;
            }

            setErrors([errorMessage]);
        } finally {
            setPublishing(false);
        }
    };

    // Approve study (changes status from PROTOCOL_REVIEW to APPROVED)
    const handleApproveStudy = async () => {
        if (!studyId) return;

        if (!window.confirm('Are you sure you want to approve this study? This will allow it to be published for data capture.')) {
            return;
        }

        try {
            setPublishing(true);

            const result = await StudyDesignService.changeStudyStatus(studyId, 'APPROVED');
            console.log('Study approved successfully:', result);

            // Update the study state
            setStudy(prev => prev ? { ...prev, studyStatus: { code: 'APPROVED', name: 'Approved', description: null } as any } : null);
            setPublishStatus('READY_TO_PUBLISH');

        } catch (error: any) {
            console.error('Error approving study:', error);

            let errorMessage = error.message || 'Unknown error';
            if (!errorMessage.toLowerCase().includes('approve') && !errorMessage.toLowerCase().includes('study')) {
                errorMessage = 'Failed to approve study: ' + errorMessage;
            }

            setErrors([errorMessage]);
        } finally {
            setPublishing(false);
        }
    };

    // Run validation
    const handleRunValidation = async () => {
        try {
            // Mock validation - replace with actual API call
            console.log('Running validation for study:', studyId);

            // Re-load validation results
            loadStudyData();
        } catch (error) {
            console.error('Error running validation:', error);
            setErrors(['Failed to run validation']);
        }
    };

    // Get overall validation status
    const getOverallValidationStatus = (): ValidationStatus => {
        if (validationResults.some(v => v.status === 'FAILED')) return 'FAILED';
        if (validationResults.some(v => v.status === 'WARNING')) return 'WARNING';
        return 'PASSED';
    };

    // Get status icon and color
    const getStatusIcon = (status: ValidationStatus): React.ReactElement => {
        switch (status) {
            case 'PASSED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'WARNING':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'FAILED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    // Check if there's an active protocol version (required for study approval)
    // CORRECTED: Study can only be approved if protocol is ACTIVE (FDA/ICH-GCP compliant)
    const hasActiveProtocol = (): boolean => {
        return protocolVersions?.some(version => version.status === 'ACTIVE') || false;
    };

    // Get publish status display
    const getPublishStatusDisplay = (): PublishStatusDisplay => {
        switch (publishStatus) {
            case 'DRAFT':
                return { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> };
            case 'READY_FOR_REVIEW':
                return { label: 'Ready for Review', color: 'bg-blue-100 text-blue-800', icon: <Eye className="h-4 w-4" /> };
            case 'PROTOCOL_REVIEW':
                return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: <Users className="h-4 w-4" /> };
            case 'READY_TO_PUBLISH':
                return { label: 'Ready to Publish', color: 'bg-green-100 text-green-800', icon: <Send className="h-4 w-4" /> };
            case 'PUBLISHED':
                return { label: 'Published', color: 'bg-purple-100 text-purple-800', icon: <Lock className="h-4 w-4" /> };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading study data...</span>
            </div>
        );
    }

    const statusDisplay = getPublishStatusDisplay();
    const overallValidation = getOverallValidationStatus();

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Study Publishing</h1>
                        <p className="text-gray-600 mt-1">
                            Review, validate, and publish {study?.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span className="ml-2">{statusDisplay.label}</span>
                        </span>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </div>
                </div>

                {/* Study Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Study Arms</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{(study as any)?.arms || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Visit Schedule</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">{(study as any)?.visits || 0} visits</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Forms</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">{(study as any)?.forms || 0}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <LinkIcon className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-900">Bindings</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900 mt-1">{(study as any)?.bindings || 0}</div>
                    </div>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Error"
                    message={errors.join('; ')}
                    onClose={() => setErrors([])}
                />
            )}

            {/* Validation Results */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Validation Results</h2>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                            {getStatusIcon(overallValidation)}
                            <span className="ml-2 font-medium">
                                {overallValidation === 'PASSED' && 'All checks passed'}
                                {overallValidation === 'WARNING' && 'Some warnings'}
                                {overallValidation === 'FAILED' && 'Validation failed'}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRunValidation}>
                            Re-run Validation
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {validationResults.map((validation, index) => (
                        <ValidationCategoryCard
                            key={index}
                            validation={validation}
                            onViewDetails={() => console.log('View details:', validation)}
                        />
                    ))}
                </div>
            </div>

            {/* Reviewers */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Review Status</h2>
                <div className="space-y-4">
                    {reviewers.map(reviewer => (
                        <ReviewerCard key={reviewer.id} reviewer={reviewer} />
                    ))}
                </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h2>
                <div className="space-y-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={publishSettings.enableDataCapture}
                            onChange={(e) => setPublishSettings({ ...publishSettings, enableDataCapture: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable data capture immediately after publishing</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={publishSettings.autoRandomization}
                            onChange={(e) => setPublishSettings({ ...publishSettings, autoRandomization: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable automatic randomization</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={publishSettings.notifyInvestigators}
                            onChange={(e) => setPublishSettings({ ...publishSettings, notifyInvestigators: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Notify investigators when study is published</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={publishSettings.lockDesign}
                            onChange={(e) => setPublishSettings({ ...publishSettings, lockDesign: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Lock study design after publishing</span>
                    </label>
                </div>
            </div>

            {/* Action Bar */}
            <PublishActionBar
                status={publishStatus}
                onApprove={handleApproveStudy}
                onPublish={handlePublishStudy}
                publishing={publishing}
                hasActiveProtocol={hasActiveProtocol()}
                hasValidationIssues={overallValidation !== 'PASSED'}
            />
        </div>
    );
};

// ============================================================================
// Sub-Components
// ============================================================================

const ValidationCategoryCard: React.FC<ValidationCategoryCardProps> = ({ validation, onViewDetails }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center">
                    {validation.status === 'PASSED' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                    {validation.status === 'WARNING' && <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />}
                    {validation.status === 'FAILED' && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                    <h3 className="font-medium text-gray-900">{validation.category}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`text-sm ${validation.status === 'PASSED' ? 'text-green-600' :
                            validation.status === 'WARNING' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {validation.checks.filter(c => c.status === 'PASSED').length} / {validation.checks.length} checks
                    </span>
                    <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-2">
                    {validation.checks.map((check, idx) => (
                        <div key={idx} className="flex items-start pl-7">
                            <div className="flex-shrink-0 mt-0.5">
                                {check.status === 'PASSED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {check.status === 'WARNING' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                {check.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                            </div>
                            <div className="ml-2 flex-1">
                                <div className="text-sm text-gray-700">{check.name}</div>
                                {check.message && (
                                    <div className="text-xs text-gray-500 mt-1">{check.message}</div>
                                )}
                            </div>
                            {check.required && (
                                <span className="text-xs text-red-600 font-medium">Required</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ReviewerCard: React.FC<ReviewerCardProps> = ({ reviewer }) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-gray-900">{reviewer.name}</h3>
                    <p className="text-sm text-gray-600">{reviewer.role}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reviewer.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        reviewer.status === 'CHANGES_REQUESTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                    }`}>
                    {reviewer.status === 'APPROVED' ? 'Approved' :
                        reviewer.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending'}
                </span>
            </div>

            {reviewer.comments.length > 0 && (
                <div className="mt-3 space-y-2">
                    {reviewer.comments.map((comment, idx) => (
                        <div key={idx} className={`text-sm p-2 rounded ${comment.type === 'APPROVAL' ? 'bg-green-50 text-green-800' :
                                comment.type === 'REQUIRED_CHANGE' ? 'bg-red-50 text-red-800' :
                                    'bg-blue-50 text-blue-800'
                            }`}>
                            {comment.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PublishActionBar: React.FC<PublishActionBarProps> = ({
    status,
    onApprove,
    onPublish,
    publishing,
    hasActiveProtocol,
    hasValidationIssues
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
                {status === 'DRAFT' && (
                    'Complete the review phase to submit for approval'
                )}

                {status === 'PROTOCOL_REVIEW' && (
                    'Study is under review'
                )}

                {status === 'READY_TO_PUBLISH' && (
                    hasValidationIssues
                        ? 'Study has validation warnings but can be published'
                        : 'Study is ready to be published'
                )}

                {status === 'PUBLISHED' && (
                    'Study is published and live for data capture'
                )}
            </div>

            <div className="flex space-x-3">
                {status === 'PROTOCOL_REVIEW' && (
                    <>
                        <Button
                            onClick={onApprove}
                            disabled={publishing || !hasActiveProtocol}
                            variant="primary"
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!hasActiveProtocol ? 'At least one protocol version must be activated before the study can be approved' : ''}
                        >
                            {publishing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Study
                                </>
                            )}
                        </Button>
                        {!hasActiveProtocol && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>Please activate a protocol version in <strong>Protocol Management</strong> before approving the study</span>
                            </div>
                        )}
                    </>
                )}

                {status === 'READY_TO_PUBLISH' && (
                    <Button
                        onClick={onPublish}
                        disabled={publishing}
                        variant="primary"
                        className={hasValidationIssues ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                        {publishing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Publish Study
                            </>
                        )}
                    </Button>
                )}

                {status === 'DRAFT' && (
                    <div className="text-sm text-gray-600">
                        Complete the review phase to submit for approval
                    </div>
                )}

                {status === 'PUBLISHED' && (
                    <div className="text-sm text-green-600 font-medium">
                        ✅ Study is live and collecting data
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPublishWorkflow;
