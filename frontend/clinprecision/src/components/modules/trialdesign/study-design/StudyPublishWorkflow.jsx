import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, XCircle, Eye, FileText, Users, Calendar, Link as LinkIcon, Send, Lock, Unlock } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import StudyDesignService from '../../../../services/StudyDesignService';

/**
 * Study Publish Workflow Component
 * Manages study review, validation, and publishing process
 */
const StudyPublishWorkflow = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState(null);
    const [validationResults, setValidationResults] = useState([]);
    const [publishStatus, setPublishStatus] = useState('DRAFT'); // DRAFT, READY_FOR_REVIEW, PROTOCOL_REVIEW, READY_TO_PUBLISH, PUBLISHED
    const [reviewers, setReviewers] = useState([]);
    const [publishSettings, setPublishSettings] = useState({
        enableDataCapture: true,
        autoRandomization: true,
        notifyInvestigators: true,
        lockDesign: true
    });
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [errors, setErrors] = useState([]);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        try {
            setLoading(true);

            // Check for uploaded IRB documents in localStorage
            const checkIRBDocuments = () => {
                try {
                    const savedDocuments = localStorage.getItem(`study_${studyId}_uploaded_documents`);
                    if (savedDocuments) {
                        const documents = JSON.parse(savedDocuments);
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
                },
                validationResults: [
                    {
                        category: 'Study Information',
                        status: 'PASSED',
                        checks: [
                            { name: 'Study title defined', status: 'PASSED', required: true },
                            { name: 'Principal investigator assigned', status: 'PASSED', required: true },
                            { name: 'Study phase specified', status: 'PASSED', required: true },
                            { name: 'Primary endpoint defined', status: 'PASSED', required: true },
                            { name: 'Sample size calculation', status: 'WARNING', required: false, message: 'Statistical plan could be more detailed' }
                        ]
                    },
                    {
                        category: 'Study Arms',
                        status: 'PASSED',
                        checks: [
                            { name: 'At least one study arm defined', status: 'PASSED', required: true },
                            { name: 'Randomization strategy configured', status: 'PASSED', required: true },
                            { name: 'All arms have interventions', status: 'PASSED', required: true },
                            { name: 'Subject allocation defined', status: 'PASSED', required: true }
                        ]
                    },
                    {
                        category: 'Visit Schedule',
                        status: 'PASSED',
                        checks: [
                            { name: 'Baseline visit defined', status: 'PASSED', required: true },
                            { name: 'Visit windows configured', status: 'PASSED', required: true },
                            { name: 'All visits have procedures', status: 'PASSED', required: true },
                            { name: 'End of treatment visit', status: 'PASSED', required: true }
                        ]
                    },
                    {
                        category: 'Form Bindings',
                        status: 'WARNING',
                        checks: [
                            { name: 'Required forms bound to visits', status: 'PASSED', required: true },
                            { name: 'Demographics form at baseline', status: 'PASSED', required: true },
                            { name: 'Safety forms configured', status: 'PASSED', required: true },
                            { name: 'All forms have timing rules', status: 'WARNING', required: false, message: 'Some forms missing specific timing constraints' }
                        ]
                    },
                    {
                        category: 'Regulatory',
                        status: hasIRBDocuments ? 'PASSED' : 'FAILED',
                        checks: [
                            {
                                name: 'IRB approval documents',
                                status: hasIRBDocuments ? 'PASSED' : 'FAILED',
                                required: true,
                                message: hasIRBDocuments ? 'IRB approval documents uploaded' : 'IRB approval letter not uploaded'
                            },
                            { name: 'Informed consent forms', status: 'PASSED', required: true },
                            { name: 'Investigator agreements', status: 'WARNING', required: false, message: '2 sites missing signed agreements' },
                            { name: 'FDA IND number', status: 'PASSED', required: true }
                        ]
                    }
                ],
                reviewers: [
                    {
                        id: 'REV001',
                        name: 'Dr. Michael Chen',
                        role: 'Medical Monitor',
                        status: 'ASSIGNED',
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: null,
                        comments: []
                    },
                    {
                        id: 'REV002',
                        name: 'Dr. Lisa Rodriguez',
                        role: 'Biostatistician',
                        status: 'APPROVED',
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: '2024-01-12T14:30:00Z',
                        comments: [
                            { text: 'Statistical analysis plan looks good', type: 'APPROVAL' },
                            { text: 'Consider adding interim analysis', type: 'SUGGESTION' }
                        ]
                    },
                    {
                        id: 'REV003',
                        name: 'Sarah Williams',
                        role: 'Regulatory Affairs',
                        status: 'CHANGES_REQUESTED',
                        assignedDate: '2024-01-10T09:00:00Z',
                        reviewedDate: '2024-01-11T16:45:00Z',
                        comments: [
                            { text: 'Missing IRB approval letter', type: 'REQUIRED_CHANGE' },
                            { text: 'Update informed consent version', type: 'REQUIRED_CHANGE' }
                        ]
                    }
                ]
            };

            // Load actual study data from backend
            const studyData = await StudyDesignService.getStudyById(studyId);
            console.log('Loaded study data:', studyData);

            setStudy(studyData);
            setValidationResults(mockData.validationResults);
            setReviewers(mockData.reviewers);

            // Determine publish status based on backend study status
            const backendStatus = studyData.studyStatus?.code || 'PLANNING';
            const overallStatus = determinePublishStatusFromBackend(backendStatus, mockData.validationResults, mockData.reviewers);
            setPublishStatus(overallStatus);

            setLoading(false);
        } catch (error) {
            console.error('Error loading study data:', error);
            setErrors(['Failed to load study data']);
            setLoading(false);
        }
    };

    // Determine publish status
    const determinePublishStatus = (validations, reviewers) => {
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
    const determinePublishStatusFromBackend = (backendStatus, validations, reviewers) => {
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
            setStudy(prev => ({ ...prev, state: 'PUBLISHED' }));

        } catch (error) {
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
        if (!window.confirm('Are you sure you want to approve this study? This will allow it to be published for data capture.')) {
            return;
        }

        try {
            setPublishing(true);

            const result = await StudyDesignService.changeStudyStatus(studyId, 'APPROVED');
            console.log('Study approved successfully:', result);

            // Update the study state
            setStudy(prev => ({ ...prev, studyStatus: { code: 'APPROVED' } }));
            setPublishStatus('READY_TO_PUBLISH');

        } catch (error) {
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
    const getOverallValidationStatus = () => {
        if (validationResults.some(v => v.status === 'FAILED')) return 'FAILED';
        if (validationResults.some(v => v.status === 'WARNING')) return 'WARNING';
        return 'PASSED';
    };

    // Get status icon and color
    const getStatusIcon = (status) => {
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

    // Get publish status display
    const getPublishStatusDisplay = () => {
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span className="ml-2">{statusDisplay.label}</span>
                        </span>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </div>
                </div>

                {/* Study Summary */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{study?.arms}</div>
                        <div className="text-sm text-gray-600">Study Arms</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{study?.visits}</div>
                        <div className="text-sm text-gray-600">Visits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{study?.forms}</div>
                        <div className="text-sm text-gray-600">Forms</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{study?.plannedSubjects}</div>
                        <div className="text-sm text-gray-600">Subjects</div>
                    </div>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Error"
                    message={errors[0]}
                    onClose={() => setErrors([])}
                />
            )}

            {/* Publishing Progress */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Progress</h3>
                <PublishingProgress
                    status={publishStatus}
                    validationStatus={overallValidation}
                    reviewers={reviewers}
                />
            </div>

            {/* Validation Results */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
                        <Button variant="outline" size="sm" onClick={handleRunValidation}>
                            Re-run Validation
                        </Button>
                    </div>
                </div>

                <ValidationResults
                    results={validationResults}
                    onFixIssue={(category, checkName) => {
                        console.log('Fix issue:', category, checkName);
                        // Navigate to appropriate section
                    }}
                />
            </div>

            {/* Review Status */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Review Status</h3>
                </div>

                <ReviewStatus
                    reviewers={reviewers}
                    studyStatus={publishStatus}
                />
            </div>

            {/* Publish Settings */}
            {publishStatus === 'READY_TO_PUBLISH' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h3>
                    <PublishSettings
                        settings={publishSettings}
                        onChange={setPublishSettings}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
                <PublishActions
                    status={publishStatus}
                    validationStatus={overallValidation}
                    onPublish={handlePublishStudy}
                    onApprove={handleApproveStudy}
                    publishing={publishing}
                />
            </div>
        </div>
    );
};

// Publishing Progress Component
const PublishingProgress = ({ status, validationStatus, reviewers }) => {
    const steps = [
        {
            id: 'design',
            name: 'Design Complete',
            status: 'COMPLETED',
            icon: <FileText className="h-5 w-5" />
        },
        {
            id: 'validation',
            name: 'Validation',
            status: validationStatus === 'FAILED' ? 'FAILED' : validationStatus === 'WARNING' ? 'WARNING' : 'COMPLETED',
            icon: <CheckCircle className="h-5 w-5" />
        },
        {
            id: 'review',
            name: 'Review',
            status: status === 'PROTOCOL_REVIEW' || status === 'READY_TO_PUBLISH' || status === 'PUBLISHED' ? 'COMPLETED' :
                status === 'READY_FOR_REVIEW' ? 'CURRENT' : 'PENDING',
            icon: <Users className="h-5 w-5" />
        },
        {
            id: 'publish',
            name: 'Publish',
            status: status === 'PUBLISHED' ? 'COMPLETED' :
                status === 'READY_TO_PUBLISH' ? 'CURRENT' : 'PENDING',
            icon: <Send className="h-5 w-5" />
        }
    ];

    const getStepColor = (stepStatus) => {
        switch (stepStatus) {
            case 'COMPLETED':
                return 'bg-green-500 text-white border-green-500';
            case 'CURRENT':
                return 'bg-blue-500 text-white border-blue-500';
            case 'WARNING':
                return 'bg-yellow-500 text-white border-yellow-500';
            case 'FAILED':
                return 'bg-red-500 text-white border-red-500';
            default:
                return 'bg-gray-200 text-gray-500 border-gray-200';
        }
    };

    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)}`}>
                            {step.icon}
                        </div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{step.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{step.status.toLowerCase()}</div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 ${steps[index + 1].status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-200'
                            }`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Validation Results Component
const ValidationResults = ({ results, onFixIssue }) => {
    return (
        <div className="divide-y divide-gray-200">
            {results.map((category, index) => (
                <div key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            {getStatusIcon(category.status)}
                            <h4 className="ml-2 text-lg font-medium text-gray-900">{category.category}</h4>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                            category.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {category.status}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {category.checks.map((check, checkIndex) => (
                            <ValidationCheck
                                key={checkIndex}
                                check={check}
                                onFix={() => onFixIssue(category.category, check.name)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Validation Check Component
const ValidationCheck = ({ check, onFix }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
                {getStatusIcon(check.status)}
                <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{check.name}</div>
                    {check.message && (
                        <div className="text-sm text-gray-600">{check.message}</div>
                    )}
                </div>
                {check.required && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                        Required
                    </span>
                )}
            </div>

            {check.status === 'FAILED' && (
                <Button variant="outline" size="sm" onClick={onFix}>
                    Fix
                </Button>
            )}
        </div>
    );
};

// Review Status Component
const ReviewStatus = ({ reviewers, studyStatus }) => {
    const getReviewerStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'CHANGES_REQUESTED':
                return 'bg-red-100 text-red-800';
            case 'ASSIGNED':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="space-y-4">
                {reviewers.map((reviewer) => (
                    <div key={reviewer.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-gray-900">{reviewer.name}</h4>
                                <p className="text-sm text-gray-600">{reviewer.role}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Assigned: {new Date(reviewer.assignedDate).toLocaleDateString()}
                                    {reviewer.reviewedDate && (
                                        <> • Reviewed: {new Date(reviewer.reviewedDate).toLocaleDateString()}</>
                                    )}
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReviewerStatusColor(reviewer.status)}`}>
                                {reviewer.status.replace('_', ' ')}
                            </span>
                        </div>

                        {reviewer.comments && reviewer.comments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {reviewer.comments.map((comment, index) => (
                                    <div key={index} className={`p-2 rounded text-sm ${comment.type === 'REQUIRED_CHANGE' ? 'bg-red-50 text-red-800' :
                                        comment.type === 'SUGGESTION' ? 'bg-blue-50 text-blue-800' :
                                            'bg-green-50 text-green-800'
                                        }`}>
                                        {comment.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Publish Settings Component
const PublishSettings = ({ settings, onChange }) => {
    const handleSettingChange = (key, value) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-gray-900">Enable Data Capture</label>
                    <p className="text-sm text-gray-600">Allow sites to start entering patient data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.enableDataCapture}
                        onChange={(e) => handleSettingChange('enableDataCapture', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-gray-900">Auto Randomization</label>
                    <p className="text-sm text-gray-600">Automatically randomize subjects upon eligibility confirmation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.autoRandomization}
                        onChange={(e) => handleSettingChange('autoRandomization', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-gray-900">Notify Investigators</label>
                    <p className="text-sm text-gray-600">Send email notifications to all site investigators</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.notifyInvestigators}
                        onChange={(e) => handleSettingChange('notifyInvestigators', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-gray-900">Lock Study Design</label>
                    <p className="text-sm text-gray-600">Prevent further changes to study design after publishing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.lockDesign}
                        onChange={(e) => handleSettingChange('lockDesign', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
    );
};

// Publish Actions Component
const PublishActions = ({ status, validationStatus, onPublish, onApprove, publishing }) => {
    // For development - allow publishing from any status except already published
    const canPublish = status !== 'PUBLISHED';
    const hasValidationIssues = validationStatus === 'FAILED' || validationStatus === 'WARNING';

    return (
        <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
                {status === 'DRAFT' && validationStatus === 'FAILED' && (
                    <div className="text-red-600">
                        <strong>⚠️ Validation failures detected!</strong> You can still publish for development purposes.
                    </div>
                )}
                {status === 'DRAFT' && validationStatus === 'WARNING' && (
                    <div className="text-yellow-600">
                        <strong>⚠️ Validation warnings detected!</strong> Review recommended before publishing.
                    </div>
                )}
                {status === 'DRAFT' && validationStatus === 'PASSED' && (
                    'Study validation passed - ready to publish'
                )}
                {status === 'READY_FOR_REVIEW' && (
                    'Study has been submitted for review'
                )}
                {status === 'PROTOCOL_REVIEW' && (
                    'Study is currently under review'
                )}
                {status === 'READY_TO_PUBLISH' && (
                    'All reviews complete - ready to publish'
                )}
                {status === 'PUBLISHED' && (
                    'Study is published and live for data capture'
                )}
            </div>

            <div className="flex space-x-3">
                {status === 'PROTOCOL_REVIEW' && (
                    <Button
                        onClick={onApprove}
                        disabled={publishing}
                        variant="primary"
                        className="bg-blue-600 hover:bg-blue-700"
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

// Helper function for status icons
const getStatusIcon = (status) => {
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

export default StudyPublishWorkflow;
