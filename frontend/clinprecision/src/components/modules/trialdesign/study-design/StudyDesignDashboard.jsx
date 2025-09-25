import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, FileText, Users, Target, Calendar, Link as LinkIcon, GitBranch, Send, Zap } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import StudyContextHeader from '../components/StudyContextHeader';
import NavigationSidebar, { NavigationToggle } from '../components/NavigationSidebar';
import WorkflowProgressTracker from '../components/WorkflowProgressTracker';
import SmartWorkflowAssistant from '../components/SmartWorkflowAssistant';
import PhaseTransitionHelper from '../components/PhaseTransitionHelper';

// Import the designer components
import StudyArmsDesigner from './StudyArmsDesigner';
import VisitScheduleDesigner from './VisitScheduleDesigner';
import FormBindingDesigner from './FormBindingDesigner';
import StudyPublishWorkflow from './StudyPublishWorkflow';

// Import services
import { getStudyById } from '../../../../services/StudyService';
import StudyDesignService from '../../../../services/StudyDesignService';

// Import Protocol Version Management components
import ProtocolVersionPanel from './protocol-version/ProtocolVersionPanel';
import ProtocolVersionManagementModal from './protocol-version/ProtocolVersionManagementModal';
import useProtocolVersioning from '../hooks/useProtocolVersioning';

/**
 * Study Design Dashboard Component
 * Main orchestrator for the complete study design workflow
 */
const StudyDesignDashboard = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract current phase from URL path
    const getCurrentPhaseFromUrl = () => {
        const pathParts = location.pathname.split('/');
        const designIndex = pathParts.findIndex(part => part === 'design');
        if (designIndex !== -1 && pathParts[designIndex + 1]) {
            return pathParts[designIndex + 1];
        }
        return 'basic-info';
    };

    // State management
    const [study, setStudy] = useState(null);
    const [designProgress, setDesignProgress] = useState({});
    const [currentPhase, setCurrentPhase] = useState(getCurrentPhaseFromUrl());
    const [completedPhases, setCompletedPhases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [showNavSidebar, setShowNavSidebar] = useState(false);
    const [showWorkflowAssistant, setShowWorkflowAssistant] = useState(true);
    const [transitionTarget, setTransitionTarget] = useState(null);
    const [showTransitionHelper, setShowTransitionHelper] = useState(false);
    const [showProtocolVersionModal, setShowProtocolVersionModal] = useState(false);

    // Protocol Version Management
    const protocolVersioning = useProtocolVersioning(studyId);

    // Design phases configuration
    const designPhases = [
        // Sequential Design Phases
        {
            id: 'basic-info',
            name: 'Basic Information',
            description: 'Study registration and basic details',
            icon: <FileText className="h-5 w-5" />,
            path: '/study-design/basic-info',
            status: 'COMPLETED', // Already implemented in StudyCreationWizard
            category: 'design'
        },
        {
            id: 'arms',
            name: 'Study Arms',
            description: 'Configure treatment arms and interventions',
            icon: <Target className="h-5 w-5" />,
            path: '/study-design/arms',
            status: 'AVAILABLE',
            category: 'design'
        },
        {
            id: 'visits',
            name: 'Visit Schedule',
            description: 'Design visit timeline and procedures',
            icon: <Calendar className="h-5 w-5" />,
            path: '/study-design/visits',
            status: 'AVAILABLE',
            category: 'design'
        },
        {
            id: 'forms',
            name: 'Form Binding',
            description: 'Bind forms to visits and configure rules',
            icon: <LinkIcon className="h-5 w-5" />,
            path: '/study-design/forms',
            status: 'AVAILABLE',
            category: 'design'
        },
        {
            id: 'review',
            name: 'Review & Validation',
            description: 'Review design and validate configuration',
            icon: <CheckCircle className="h-5 w-5" />,
            path: '/study-design/review',
            status: 'AVAILABLE',
            category: 'design'
        },
        {
            id: 'publish',
            name: 'Publish Study',
            description: 'Publish study for data capture',
            icon: <Send className="h-5 w-5" />,
            path: '/study-design/publish',
            status: 'AVAILABLE',
            category: 'design'
        },
        // Separator
        {
            id: 'separator',
            type: 'separator',
            label: 'Protocol Management'
        },
        // Independent Protocol Management
        {
            id: 'protocol-versions',
            name: 'Protocol Versions',
            description: 'Manage protocol versions and amendments',
            icon: <FileText className="h-5 w-5" />,
            path: '/study-design/protocol-versions',
            status: 'AVAILABLE',
            category: 'protocol-management',
            independent: true
        }
    ];

    // Load study data and progress
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    // Reload progress when navigating between phases to show updated status
    useEffect(() => {
        if (studyId) {
            loadDesignProgress();
        }
    }, [location.pathname, studyId]);

    // Update current phase when route changes
    useEffect(() => {
        const newPhase = getCurrentPhaseFromUrl();
        if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
        }
    }, [location.pathname]);

    // Redirect to basic-info if no phase is specified
    useEffect(() => {
        const currentPhaseFromUrl = getCurrentPhaseFromUrl();
        if (!currentPhaseFromUrl || currentPhaseFromUrl === 'design') {
            navigate(`/study-design/study/${studyId}/design/basic-info`, { replace: true });
        }
    }, [studyId, location.pathname]);

    const loadStudyData = async () => {
        try {
            setLoading(true);
            setErrors([]);

            // Fetch real study data from backend
            const studyResponse = await getStudyById(studyId);
            setStudy(studyResponse);

            // Fetch design progress from backend API
            try {
                const designProgressResponse = await StudyDesignService.getDesignProgress(studyId);

                // Check if response is in expected format (has progressData)
                const progressData = designProgressResponse.progressData || designProgressResponse;
                setDesignProgress(progressData);

                console.log('Initial progress data received:', progressData);

                // Calculate completed phases based on progress data
                const completed = Object.entries(progressData).filter(
                    ([_, progress]) => progress && progress.completed
                ).map(([phaseId, _]) => phaseId);

                setCompletedPhases(completed);

                console.info('Design progress loaded successfully for study', studyId, '- Initial completed phases:', completed);

            } catch (progressError) {
                console.warn('Design progress API call failed, initializing default progress:', progressError);

                // Try to initialize design progress for this study
                try {
                    await StudyDesignService.initializeDesignProgress(studyId);
                    // Retry fetching progress after initialization
                    const retryProgressResponse = await StudyDesignService.getDesignProgress(studyId);
                    const progressData = retryProgressResponse.progressData || retryProgressResponse;
                    setDesignProgress(progressData);

                    const completed = Object.entries(progressData).filter(
                        ([_, progress]) => progress && progress.completed
                    ).map(([phaseId, _]) => phaseId);
                    setCompletedPhases(completed);

                } catch (initError) {
                    console.error('Failed to initialize design progress, using fallback:', initError);
                    // Fallback to default state if initialization fails
                    setDesignProgress({
                        'basic-info': { completed: true, percentage: 100, lastUpdated: new Date().toISOString() },
                        'arms': { completed: false, percentage: 0, lastUpdated: null },
                        'visits': { completed: false, percentage: 0, lastUpdated: null },
                        'forms': { completed: false, percentage: 0, lastUpdated: null },
                        'review': { completed: false, percentage: 0, lastUpdated: null },
                        'publish': { completed: false, percentage: 0, lastUpdated: null },
                        'protocol-versions': { completed: false, percentage: 0, lastUpdated: null }
                    });
                    setCompletedPhases(['basic-info']);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading study design data:', error);
            setErrors(['Failed to load study design data. Please check your connection and try again.']);
            setLoading(false);
        }
    };

    // Load only design progress (for updates without full reload)
    const loadDesignProgress = async () => {
        try {
            const designProgressResponse = await StudyDesignService.getDesignProgress(studyId);
            const progressData = designProgressResponse.progressData || designProgressResponse;
            setDesignProgress(progressData);

            // Update completed phases
            const completed = Object.entries(progressData).filter(
                ([_, progress]) => progress && progress.completed
            ).map(([phaseId, _]) => phaseId);
            setCompletedPhases(completed);

            console.info('Design progress refreshed for study', studyId, '- Completed phases:', completed);
        } catch (error) {
            console.warn('Failed to refresh design progress:', error);
        }
    };

    // Navigate to phase with transition helper
    const handlePhaseChange = (phaseId) => {
        // If changing to a different phase, show transition helper
        if (phaseId !== currentPhase && showWorkflowAssistant) {
            setTransitionTarget(phaseId);
            setShowTransitionHelper(true);
        } else {
            navigate(`/study-design/study/${studyId}/design/${phaseId}`, { replace: true });
        }
    };

    // Handle confirmed phase transition
    const handleConfirmedTransition = (phaseId) => {
        setShowTransitionHelper(false);
        setTransitionTarget(null);
        navigate(`/study-design/study/${studyId}/design/${phaseId}`, { replace: true });
    };

    // Cancel phase transition
    const handleCancelTransition = () => {
        setShowTransitionHelper(false);
        setTransitionTarget(null);
    };

    // Get phase status
    const getPhaseStatus = (phaseId) => {
        const progress = designProgress[phaseId];
        if (!progress) return 'NOT_STARTED';

        if (progress.completed) return 'COMPLETED';
        if (progress.percentage > 0) return 'IN_PROGRESS';
        return 'NOT_STARTED';
    };

    // Get overall completion percentage
    const getOverallCompletion = () => {
        const phases = Object.keys(designProgress);
        if (phases.length === 0) return 0;

        const totalPercentage = phases.reduce((sum, phaseId) => {
            return sum + (designProgress[phaseId]?.percentage || 0);
        }, 0);

        return Math.round(totalPercentage / phases.length);
    };

    // Check if phase is accessible
    const isPhaseAccessible = (phaseId) => {
        // Separator is not clickable
        if (phaseId === 'separator') {
            return false;
        }

        // Protocol versions are always accessible (independent of design workflow)
        if (phaseId === 'protocol-versions') {
            return true;
        }

        // For development: Allow access to all design phases except publish
        // which should only be accessible after completing the review phase
        if (['basic-info', 'arms', 'visits', 'forms', 'review'].includes(phaseId)) {
            return true;
        }

        // For publish, check if review is completed
        if (phaseId === 'publish') {
            return completedPhases.includes('review');
        }

        // Fallback to original logic for any other phases
        const phase = designPhases.find(p => p.id === phaseId);
        if (!phase || phase.type === 'separator') return false;

        const phaseIndex = designPhases.findIndex(p => p.id === phaseId);
        if (phaseIndex === 0) return true; // First phase is always accessible

        // Check if previous phases are completed (only for design phases)
        if (phase.category === 'design') {
            for (let i = 0; i < phaseIndex; i++) {
                const prevPhase = designPhases[i];
                if (prevPhase.category === 'design' && !completedPhases.includes(prevPhase.id)) {
                    return false;
                }
            }
        }

        return true;
    };

    // Handle Protocol Version Management
    const handleCreateProtocolVersion = () => {
        setShowProtocolVersionModal(true);
    };

    const handleManageProtocolVersions = () => {
        setShowProtocolVersionModal(true);
    };

    // Get current phase display name
    const getCurrentPhaseName = () => {
        const phase = designPhases.find(p => p.id === currentPhase);
        return phase ? phase.name : 'Study Design';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading study design...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Toggle for Mobile */}
            <NavigationToggle
                onClick={() => setShowNavSidebar(!showNavSidebar)}
                isOpen={showNavSidebar}
            />

            {/* Navigation Sidebar */}
            <NavigationSidebar
                isOpen={showNavSidebar}
                onToggle={() => setShowNavSidebar(!showNavSidebar)}
                currentWorkflow="Study Design Workflow"
                workflowSteps={[
                    // Sequential design phases
                    ...designPhases
                        .filter(phase => phase.category === 'design')
                        .map((phase, index) => ({
                            title: phase.name,
                            description: phase.description,
                            completed: completedPhases.includes(phase.id),
                            current: phase.id === currentPhase,
                            independent: false
                        })),
                    // Separator
                    {
                        type: 'separator',
                        label: 'Protocol Management'
                    },
                    // Protocol management phases
                    ...designPhases
                        .filter(phase => phase.category === 'protocol-management')
                        .map((phase, index) => ({
                            title: phase.name,
                            description: phase.description,
                            completed: completedPhases.includes(phase.id),
                            current: phase.id === currentPhase,
                            independent: true,
                            hideNumber: true
                        }))
                ]}
                currentStep={(() => {
                    // Build the same workflowSteps array structure to find current index
                    const workflowSteps = [
                        ...designPhases.filter(phase => phase.category === 'design'),
                        { type: 'separator' },
                        ...designPhases.filter(phase => phase.category === 'protocol-management')
                    ];
                    return workflowSteps.findIndex(phase => phase.id === currentPhase);
                })()}
                study={study}
            />

            {/* Study Context Header */}
            <StudyContextHeader
                study={study}
                currentPage={getCurrentPhaseName()}
                onBack={() => navigate('/study-design/studies')}
                showProgress={true}
                progressValue={getOverallCompletion()}
                actions={[
                    {
                        label: showWorkflowAssistant ? 'Hide Assistant' : 'Show Assistant',
                        variant: 'outline',
                        icon: Zap,
                        onClick: () => setShowWorkflowAssistant(!showWorkflowAssistant)
                    },
                    {
                        label: 'Edit Study',
                        variant: 'outline',
                        icon: FileText,
                        onClick: () => navigate(`/study-design/edit/${studyId}`)
                    }
                ]}
            />

            {/* Errors */}
            {errors.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Alert
                        type="error"
                        title="Error"
                        message={errors[0]}
                        onClose={() => setErrors([])}
                    />
                </div>
            )}

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Workflow Progress */}
                    <div className="lg:col-span-3 space-y-6">
                        <StudyDesignPhaseTracker
                            phases={designPhases}
                            currentPhase={currentPhase}
                            completedPhases={completedPhases}
                            designProgress={designProgress}
                            onPhaseChange={handlePhaseChange}
                            isPhaseAccessible={isPhaseAccessible}
                        />

                        {showWorkflowAssistant && (
                            <SmartWorkflowAssistant
                                currentPhase={currentPhase}
                                designProgress={designProgress}
                                completedPhases={completedPhases}
                                study={study}
                                onPhaseChange={handlePhaseChange}
                            />
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
                            {/* Phase Content */}
                            <div className="p-6">
                                {currentPhase === 'basic-info' && <BasicInfoSummary study={study} />}
                                {currentPhase === 'arms' && <StudyArmsDesigner onPhaseCompleted={loadDesignProgress} />}
                                {currentPhase === 'visits' && <VisitScheduleDesigner onPhaseCompleted={loadDesignProgress} />}
                                {currentPhase === 'forms' && <FormBindingDesigner />}
                                {currentPhase === 'review' && <StudyReviewPanel study={study} designProgress={designProgress} />}
                                {currentPhase === 'publish' && <StudyPublishWorkflow />}
                                {currentPhase === 'protocol-versions' && (
                                    <ProtocolVersionPanel
                                        studyId={studyId}
                                        studyName={study?.name}
                                        currentProtocolVersion={protocolVersioning.currentVersion}
                                        protocolVersions={protocolVersioning.versions}
                                        loading={protocolVersioning.loading}
                                        onCreateVersion={handleCreateProtocolVersion}
                                        onManageVersions={handleManageProtocolVersions}
                                        onEditVersion={(versionId) => {
                                            protocolVersioning.setEditingVersion(versionId);
                                            setShowProtocolVersionModal(true);
                                        }}
                                        onSubmitReview={protocolVersioning.submitForReview}
                                        onApproveVersion={protocolVersioning.approveVersion}
                                        onActivateVersion={protocolVersioning.activateVersion}
                                        compact={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase Transition Helper */}
            <PhaseTransitionHelper
                currentPhase={currentPhase}
                targetPhase={transitionTarget}
                completedPhases={completedPhases}
                designProgress={designProgress}
                onTransition={handleConfirmedTransition}
                onCancel={handleCancelTransition}
                isVisible={showTransitionHelper}
            />

            {/* Protocol Version Management Modal */}
            {showProtocolVersionModal && (
                <ProtocolVersionManagementModal
                    studyId={studyId}
                    studyName={study?.name}
                    isOpen={showProtocolVersionModal}
                    onClose={() => {
                        setShowProtocolVersionModal(false);
                        protocolVersioning.setEditingVersion(null);
                    }}
                    protocolVersioning={protocolVersioning}
                />
            )}
        </div>
    );
};

// Study Design Header Component
const StudyDesignHeader = ({ study, currentPhase, overallCompletion, onBack }) => {
    const getCurrentPhaseName = () => {
        const designPhases = [
            { id: 'basic-info', name: 'Basic Information' },
            { id: 'arms', name: 'Study Arms' },
            { id: 'visits', name: 'Visit Schedule' },
            { id: 'forms', name: 'Form Binding' },
            { id: 'review', name: 'Review & Validation' },
            { id: 'publish', name: 'Publish Study' },
            { id: 'protocol-versions', name: 'Protocol Versions' }
        ];

        const phase = designPhases.find(p => p.id === currentPhase);
        return phase ? phase.name : 'Study Design';
    };

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={onBack}>
                            ← Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{study?.name}</h1>
                            <p className="text-sm text-gray-600">{getCurrentPhaseName()}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Progress Circle */}
                        <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
                                    <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
                                    <circle
                                        cx="22"
                                        cy="22"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${overallCompletion * 1.257} 125.7`}
                                        className="text-blue-600"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-900">{overallCompletion}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Overall Progress</div>
                                <div className="text-xs text-gray-600">Study Design</div>
                            </div>
                        </div>

                        {/* Study Info */}
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">Version {study?.version}</div>
                            <div className="text-xs text-gray-600">{study?.studyStatus?.name || study?.state || 'Draft'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Study Design Sidebar Component
const StudyDesignSidebar = ({
    phases,
    currentPhase,
    designProgress,
    completedPhases,
    onPhaseChange,
    isPhaseAccessible,
    getPhaseStatus
}) => {
    const getStatusIcon = (phaseId) => {
        const status = getPhaseStatus(phaseId);
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'IN_PROGRESS':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
        }
    };

    const getPhaseClasses = (phaseId) => {
        const isAccessible = isPhaseAccessible(phaseId);
        const isActive = currentPhase === phaseId;
        const status = getPhaseStatus(phaseId);

        let classes = 'flex items-center space-x-3 p-3 rounded-lg transition-colors ';

        if (!isAccessible) {
            classes += 'opacity-50 cursor-not-allowed ';
        } else if (isActive) {
            classes += 'bg-blue-50 border-2 border-blue-200 text-blue-900 ';
        } else {
            classes += 'hover:bg-gray-50 cursor-pointer ';
        }

        return classes;
    };

    return (
        <div className="w-80 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Design Phases</h3>

            <div className="space-y-2">
                {phases.map((phase, index) => {
                    const isAccessible = isPhaseAccessible(phase.id);
                    const progress = designProgress[phase.id];

                    return (
                        <div key={phase.id}>
                            <div
                                className={getPhaseClasses(phase.id)}
                                onClick={() => isAccessible && onPhaseChange(phase.id)}
                            >
                                <div className="flex-shrink-0">
                                    {getStatusIcon(phase.id)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {phase.name}
                                        </h4>
                                        {progress && progress.percentage > 0 && (
                                            <span className="text-xs text-gray-500">
                                                {progress.percentage}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                                    {progress && progress.lastUpdated && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Updated: {new Date(progress.lastUpdated).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {progress && progress.percentage > 0 && (
                                <div className="ml-8 mt-2 mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-blue-600 h-1 rounded-full transition-all"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Connector Line */}
                            {index < phases.length - 1 && (
                                <div className="ml-[22px] h-4 w-px bg-gray-200" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Basic Info Summary Component (placeholder)
const BasicInfoSummary = ({ study }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Study Information Summary</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Study Name</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Protocol Number</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.protocolNumber || 'Not assigned'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Study Phase</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.studyPhase?.name || study?.studyPhase}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Study Status</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.studyStatus?.name || study?.studyStatus}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Indication</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.indication}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Principal Investigator</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.principalInvestigator}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sponsor</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.sponsor}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Version</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.version}</div>
                    </div>
                </div>

                {study?.description && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.description}</div>
                    </div>
                )}

                {study?.primaryObjective && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Primary Objective</label>
                        <div className="mt-1 text-sm text-gray-900">{study?.primaryObjective}</div>
                    </div>
                )}

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                            Basic study information is complete
                        </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                        You can now proceed to configure study arms and treatment design.
                    </p>
                </div>
            </div>
        </div>
    );
};


// Study Review Panel Component with completion button
const StudyReviewPanel = ({ study, designProgress }) => {
    const [marking, setMarking] = React.useState(false);
    const [error, setError] = React.useState("");
    const completedPhases = Object.entries(designProgress).filter(
        ([_, progress]) => progress.completed
    );
    const pendingPhases = Object.entries(designProgress).filter(
        ([_, progress]) => !progress.completed
    );
    const { studyId } = useParams();
    // Submit study for review (changes status from PLANNING to PROTOCOL_REVIEW)
    const handleSubmitForReview = async () => {
        setMarking(true);
        setError("");

        try {
            // Check current study status
            const currentStatus = study?.studyStatus?.code;

            // If already in review status, show appropriate message
            if (currentStatus === 'PROTOCOL_REVIEW') {
                setError("Study is already submitted for review. Please wait for approval before making changes.");
                return;
            }

            // If already approved or active, prevent submission
            if (currentStatus === 'APPROVED' || currentStatus === 'ACTIVE') {
                setError(`Study is already ${currentStatus.toLowerCase()}. Cannot submit for review again.`);
                return;
            }

            // First change the study status to PROTOCOL_REVIEW
            await StudyDesignService.changeStudyStatus(studyId, 'PROTOCOL_REVIEW');

            // Then mark the review phase as completed in design progress
            await StudyDesignService.updateDesignProgress(studyId, {
                progressData: {
                    review: { phase: "review", completed: true, percentage: 100 }
                }
            });

            // Show success message instead of reload
            // Create a success notification that will persist briefly
            const showSuccessMessage = () => {
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
                successDiv.innerHTML = `
                    <div class="flex items-center">
                        <div class="w-4 h-4 text-green-500 mr-2">✅</div>
                        <div>
                            <strong>Review Submitted Successfully!</strong>
                            <p class="text-sm mt-1">Study is now under protocol review.</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(successDiv);

                // Remove after 4 seconds
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.parentNode.removeChild(successDiv);
                    }
                }, 4000);
            };

            showSuccessMessage();

            // Refresh the page to show updated status
            window.location.reload();

        } catch (e) {
            console.error('Error submitting study for review:', e);
            setError(e.message || "Failed to submit study for review. Please try again.");
        } finally {
            setMarking(false);
        }
    };
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Study Design Review</h3>
                {/* Completion Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Completed Sections</h4>
                        <div className="space-y-2">
                            {completedPhases.map(([phaseId, progress]) => (
                                <div key={phaseId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                    <span className="text-sm text-green-900 capitalize">{phaseId.replace('-', ' ')}</span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Pending Sections</h4>
                        <div className="space-y-2">
                            {pendingPhases.map(([phaseId, progress]) => (
                                <div key={phaseId} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                    <span className="text-sm text-yellow-900 capitalize">{phaseId.replace('-', ' ')}</span>
                                    <span className="text-xs text-yellow-700">{progress.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Validation Results */}
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Validation Status</h4>
                    <div className="space-y-2">
                        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-sm text-green-900">Study arms configuration is valid</span>
                        </div>
                        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-sm text-green-900">Visit schedule is properly configured</span>
                        </div>
                    </div>
                </div>
                {/* Submit for Review Button */}
                <div className="pt-6 flex flex-col items-end">
                    {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

                    {/* Render button based on current study status */}
                    {(() => {
                        const currentStatus = study?.studyStatus?.code;

                        if (currentStatus === 'PROTOCOL_REVIEW') {
                            return (
                                <div className="text-center">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center">
                                            <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                            <span className="text-yellow-800 text-sm font-medium">
                                                Study is under review
                                            </span>
                                        </div>
                                        <p className="text-yellow-700 text-xs mt-1">
                                            Waiting for approval team to review and approve the study design.
                                        </p>
                                    </div>
                                </div>
                            );
                        } else if (currentStatus === 'APPROVED') {
                            return (
                                <div className="text-center">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-green-800 text-sm font-medium">
                                                Study approved
                                            </span>
                                        </div>
                                        <p className="text-green-700 text-xs mt-1">
                                            Study has been approved and is ready for publication.
                                        </p>
                                    </div>
                                </div>
                            );
                        } else if (currentStatus === 'ACTIVE') {
                            return (
                                <div className="text-center">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            <span className="text-blue-800 text-sm font-medium">
                                                Study is active
                                            </span>
                                        </div>
                                        <p className="text-blue-700 text-xs mt-1">
                                            Study is published and available for data capture.
                                        </p>
                                    </div>
                                </div>
                            );
                        } else {
                            // Show submit button for PLANNING, DRAFT, or other eligible statuses
                            return (
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-50"
                                    onClick={handleSubmitForReview}
                                    disabled={marking}
                                >
                                    {marking ? "Submitting..." : "Submit for Review"}
                                </button>
                            );
                        }
                    })()}
                </div>
            </div>
        </div>
    );
};

// Custom Phase Tracker with Separator Support
const StudyDesignPhaseTracker = ({
    phases,
    currentPhase,
    completedPhases,
    designProgress,
    onPhaseChange,
    isPhaseAccessible
}) => {
    const getStatusIcon = (phaseId) => {
        if (completedPhases.includes(phaseId)) {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        }

        const progress = designProgress[phaseId];
        if (progress && progress.percentage > 0) {
            return <Clock className="h-5 w-5 text-blue-500" />;
        }

        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    };

    const getPhaseClasses = (phase) => {
        if (phase.type === 'separator') {
            return 'py-2'; // Just padding for separators
        }

        const isAccessible = isPhaseAccessible(phase.id);
        const isActive = currentPhase === phase.id;
        const isCompleted = completedPhases.includes(phase.id);

        let classes = 'flex items-center space-x-3 p-3 rounded-lg transition-colors ';

        if (!isAccessible) {
            classes += 'opacity-50 cursor-not-allowed ';
        } else if (isActive) {
            classes += 'bg-blue-50 border-2 border-blue-200 text-blue-900 ';
        } else if (isCompleted) {
            classes += 'bg-green-50 hover:bg-green-100 cursor-pointer ';
        } else {
            classes += 'hover:bg-gray-50 cursor-pointer ';
        }

        // Add special styling for independent protocol management
        if (phase.category === 'protocol-management') {
            classes += 'border border-purple-200 bg-purple-25 ';
        }

        return classes;
    };

    return (
        <div className="w-80 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Study Workflow</h3>

            <div className="space-y-2">
                {phases.map((phase, index) => {
                    if (phase.type === 'separator') {
                        return (
                            <div key={phase.id} className={getPhaseClasses(phase)}>
                                <div className="w-full">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                        <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                                            {phase.label}
                                        </span>
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                    </div>
                                    <div className="text-xs text-gray-500 text-center">
                                        Independent of design workflow
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    const isAccessible = isPhaseAccessible(phase.id);
                    const progress = designProgress[phase.id];

                    return (
                        <div key={phase.id}>
                            <div
                                className={getPhaseClasses(phase)}
                                onClick={() => isAccessible && onPhaseChange(phase.id)}
                            >
                                <div className="flex-shrink-0">
                                    {getStatusIcon(phase.id)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {phase.name}
                                        </h4>
                                        {progress && progress.percentage > 0 && (
                                            <span className="text-xs text-gray-500">
                                                {progress.percentage}%
                                            </span>
                                        )}
                                        {phase.independent && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">
                                                Independent
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                                    {progress && progress.lastUpdated && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Updated: {new Date(progress.lastUpdated).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {progress && progress.percentage > 0 && phase.type !== 'separator' && (
                                <div className="ml-8 mt-2 mb-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-blue-600 h-1 rounded-full transition-all"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Connector Line - Skip for last item or before separators */}
                            {index < phases.length - 1 && phases[index + 1]?.type !== 'separator' && phase.type !== 'separator' && (
                                <div className="ml-[22px] h-4 w-px bg-gray-200" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
                <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                        <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded mr-2"></div>
                        Sequential workflow phases
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                        <div className="w-3 h-3 bg-purple-25 border border-purple-200 rounded mr-2"></div>
                        Independent protocol management
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyDesignDashboard;
