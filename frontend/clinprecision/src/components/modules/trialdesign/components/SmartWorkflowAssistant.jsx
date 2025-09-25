import React, { useState, useEffect } from 'react';
import {
    Zap,
    Target,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    ArrowRight,
    FileText,
    Users,
    Calendar,
    Link as LinkIcon,
    Send,
    GitBranch,
    HelpCircle,
    Sparkles,
    TrendingUp
} from 'lucide-react';

/**
 * Smart Workflow Assistant
 * Provides contextual guidance, suggestions, and workflow optimization tips
 */
const SmartWorkflowAssistant = ({
    currentPhase,
    designProgress,
    completedPhases,
    study,
    onPhaseChange,
    className = ""
}) => {
    const [activeTab, setActiveTab] = useState('suggestions');
    const [dismissedTips, setDismissedTips] = useState(new Set());

    // Phase-specific guidance data
    const phaseGuidance = {
        'basic-info': {
            icon: FileText,
            color: 'blue',
            title: 'Study Foundation',
            description: 'Establish the core elements of your clinical trial',
            tips: [
                {
                    id: 'clear-objectives',
                    type: 'best-practice',
                    title: 'Define Clear Objectives',
                    content: 'Ensure primary and secondary endpoints are specific, measurable, and aligned with regulatory requirements.',
                    action: 'Review objectives'
                },
                {
                    id: 'population-criteria',
                    type: 'optimization',
                    title: 'Refine Population Criteria',
                    content: 'Consider biomarker stratification and ensure inclusion/exclusion criteria support feasible enrollment.',
                    action: 'Optimize criteria'
                }
            ],
            checklist: [
                'Study title and protocol number',
                'Primary and secondary objectives',
                'Target population definition',
                'Inclusion/exclusion criteria',
                'Study design rationale'
            ],
            nextSteps: [
                'Move to Study Arms configuration',
                'Define treatment strategies',
                'Plan randomization approach'
            ]
        },
        'arms': {
            icon: Target,
            color: 'green',
            title: 'Treatment Design',
            description: 'Configure study arms and intervention strategies',
            tips: [
                {
                    id: 'balanced-randomization',
                    type: 'best-practice',
                    title: 'Balanced Randomization',
                    content: 'Consider stratified randomization by key prognostic factors to ensure balanced treatment groups.',
                    action: 'Configure stratification'
                },
                {
                    id: 'biomarker-strategy',
                    type: 'enhancement',
                    title: 'Biomarker Strategy',
                    content: 'Define biomarker collection and analysis plan early to support translational research goals.',
                    action: 'Add biomarkers'
                }
            ],
            checklist: [
                'Treatment arms defined',
                'Control group strategy',
                'Randomization method',
                'Blinding approach',
                'Dose escalation rules'
            ],
            nextSteps: [
                'Design visit schedule',
                'Map procedures to timepoints',
                'Define safety monitoring'
            ]
        },
        'visits': {
            icon: Calendar,
            color: 'purple',
            title: 'Visit Schedule',
            description: 'Design comprehensive visit timeline and procedures',
            tips: [
                {
                    id: 'safety-visits',
                    type: 'safety',
                    title: 'Safety Monitoring',
                    content: 'Include adequate safety run-in periods and consider additional safety visits for high-risk populations.',
                    action: 'Add safety visits'
                },
                {
                    id: 'patient-burden',
                    type: 'optimization',
                    title: 'Minimize Patient Burden',
                    content: 'Balance comprehensive data collection with patient convenience to improve retention rates.',
                    action: 'Optimize schedule'
                }
            ],
            checklist: [
                'Visit schedule defined',
                'Procedure mapping complete',
                'Window periods specified',
                'Safety assessments planned',
                'Follow-up strategy set'
            ],
            nextSteps: [
                'Bind forms to visits',
                'Configure data collection rules',
                'Set validation parameters'
            ]
        },
        'forms': {
            icon: LinkIcon,
            color: 'orange',
            title: 'Data Collection',
            description: 'Configure forms and data capture rules',
            tips: [
                {
                    id: 'data-standards',
                    type: 'compliance',
                    title: 'Regulatory Standards',
                    content: 'Ensure forms comply with CDASH standards and support efficient regulatory submissions.',
                    action: 'Validate standards'
                },
                {
                    id: 'edit-checks',
                    type: 'quality',
                    title: 'Smart Edit Checks',
                    content: 'Implement intelligent edit checks to catch data inconsistencies early and reduce query burden.',
                    action: 'Configure checks'
                }
            ],
            checklist: [
                'Forms assigned to visits',
                'Validation rules configured',
                'Edit checks implemented',
                'User permissions set',
                'Data flow validated'
            ],
            nextSteps: [
                'Review complete design',
                'Validate all configurations',
                'Prepare for publishing'
            ]
        },
        'review': {
            icon: CheckCircle2,
            color: 'green',
            title: 'Design Review',
            description: 'Validate and finalize study design',
            tips: [
                {
                    id: 'cross-validation',
                    type: 'validation',
                    title: 'Cross-Validation',
                    content: 'Verify that all design elements work together cohesively and support study objectives.',
                    action: 'Run validation'
                },
                {
                    id: 'stakeholder-review',
                    type: 'process',
                    title: 'Stakeholder Review',
                    content: 'Engage key stakeholders for final design review before publishing to ensure alignment.',
                    action: 'Schedule review'
                }
            ],
            checklist: [
                'Design validation complete',
                'Stakeholder approval obtained',
                'Documentation reviewed',
                'Training materials prepared',
                'Go-live checklist ready'
            ],
            nextSteps: [
                'Publish study design',
                'Initialize data collection',
                'Begin site activation'
            ]
        },
        'protocol-versions': {
            icon: GitBranch,
            color: 'purple',
            title: 'Protocol Management',
            description: 'Manage protocol versions and amendments',
            tips: [
                {
                    id: 'version-control',
                    type: 'best-practice',
                    title: 'Version Control',
                    content: 'Maintain clear version numbering and comprehensive change documentation for regulatory compliance.',
                    action: 'Review versioning'
                },
                {
                    id: 'amendment-planning',
                    type: 'process',
                    title: 'Amendment Planning',
                    content: 'Plan amendments carefully to minimize site burden and maintain data integrity.',
                    action: 'Plan amendments'
                },
                {
                    id: 'regulatory-tracking',
                    type: 'compliance',
                    title: 'Regulatory Tracking',
                    content: 'Track approval status across different regulatory authorities and sites.',
                    action: 'Track approvals'
                }
            ],
            checklist: [
                'Initial protocol version created',
                'Version numbering system established',
                'Amendment process defined',
                'Approval workflow configured',
                'Change documentation ready'
            ],
            nextSteps: [
                'Submit for review',
                'Track approval status',
                'Manage site implementations'
            ]
        }
    };

    // Get current phase guidance
    const getCurrentGuidance = () => {
        return phaseGuidance[currentPhase] || phaseGuidance['basic-info'];
    };

    // Get smart suggestions based on current state
    const getSmartSuggestions = () => {
        const suggestions = [];
        const guidance = getCurrentGuidance();

        // Check if current phase is completed
        const isCurrentPhaseCompleted = completedPhases.includes(currentPhase);

        if (!isCurrentPhaseCompleted) {
            // Current phase not completed - suggest completing it
            suggestions.push({
                type: 'completion',
                priority: 'high',
                title: `Complete ${guidance.title}`,
                description: `Finish configuring ${guidance.title.toLowerCase()} and save your changes to proceed`,
                action: () => {
                    console.log('Phase completion guidance for:', currentPhase);
                    // For arms phase, suggest saving changes
                    if (currentPhase === 'arms') {
                        alert('Please configure your study arms and click "Save Changes" to complete this phase.');
                    } else {
                        alert(`Please complete the ${guidance.title.toLowerCase()} configuration to proceed.`);
                    }
                },
                actionLabel: 'How to Complete'
            });
        } else {
            // Current phase is completed - suggest moving to next phase
            const getNextPhaseId = () => {
                const phaseOrder = ['basic-info', 'arms', 'visits', 'forms', 'review', 'publish', 'protocol-versions'];
                const currentIndex = phaseOrder.indexOf(currentPhase);
                return phaseOrder[currentIndex + 1];
            };

            const nextPhaseId = getNextPhaseId();
            if (nextPhaseId) {
                const nextGuidance = phaseGuidance[nextPhaseId];
                suggestions.push({
                    type: 'next-phase',
                    priority: 'medium',
                    title: `Ready for ${nextGuidance?.title || 'Next Phase'}`,
                    description: `${guidance.title} is complete. Continue to ${nextGuidance?.description || 'the next phase'}.`,
                    action: () => {
                        console.log('Continue button clicked', {
                            currentPhase,
                            nextPhaseId,
                            onPhaseChange: typeof onPhaseChange,
                            completedPhases
                        });

                        if (!onPhaseChange) {
                            console.error('onPhaseChange function not provided to SmartWorkflowAssistant');
                            alert('Navigation function not available. Please refresh the page.');
                            return;
                        }

                        console.log(`Navigating from ${currentPhase} to ${nextPhaseId}`);
                        try {
                            onPhaseChange(nextPhaseId);
                        } catch (error) {
                            console.error('Error during phase navigation:', error);
                            alert('Error occurred during navigation. Please try again.');
                        }
                    },
                    actionLabel: 'Continue'
                });
            }
        }

        // Next phase suggestion
        const phaseOrder = ['basic-info', 'arms', 'visits', 'forms', 'review', 'publish', 'protocol-versions'];
        const currentIndex = phaseOrder.indexOf(currentPhase);
        const nextPhase = phaseOrder[currentIndex + 1];

        if (completedPhases.includes(currentPhase) && nextPhase) {
            const nextGuidance = phaseGuidance[nextPhase];
            if (nextGuidance) {
                suggestions.push({
                    type: 'next-phase',
                    priority: 'medium',
                    title: `Ready for ${nextGuidance.title}`,
                    description: nextGuidance.description,
                    action: () => onPhaseChange(nextPhase),
                    actionLabel: 'Start Next Phase'
                });
            }
        }

        // Study-specific suggestions
        if (study) {
            if (!study.primaryObjective && currentPhase === 'basic-info') {
                suggestions.push({
                    type: 'required',
                    priority: 'high',
                    title: 'Define Primary Objective',
                    description: 'A clear primary objective is required for study approval',
                    actionLabel: 'Add Objective'
                });
            }
        }

        return suggestions;
    };

    const guidance = getCurrentGuidance();
    const suggestions = getSmartSuggestions();
    const IconComponent = guidance.icon;

    // Get tip type styling
    const getTipStyling = (type) => {
        const styles = {
            'best-practice': 'bg-blue-50 border-blue-200 text-blue-800',
            'optimization': 'bg-green-50 border-green-200 text-green-800',
            'safety': 'bg-red-50 border-red-200 text-red-800',
            'compliance': 'bg-purple-50 border-purple-200 text-purple-800',
            'quality': 'bg-yellow-50 border-yellow-200 text-yellow-800',
            'enhancement': 'bg-indigo-50 border-indigo-200 text-indigo-800',
            'validation': 'bg-teal-50 border-teal-200 text-teal-800',
            'process': 'bg-gray-50 border-gray-200 text-gray-800'
        };
        return styles[type] || styles['best-practice'];
    };

    const dismissTip = (tipId) => {
        setDismissedTips(prev => new Set([...prev, tipId]));
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${guidance.color}-100`}>
                        <IconComponent className={`w-5 h-5 text-${guidance.color}-600`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{guidance.title} Assistant</h3>
                        <p className="text-sm text-gray-600">{guidance.description}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
                    {[
                        { id: 'suggestions', label: 'Smart Suggestions', icon: Zap },
                        { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
                        { id: 'tips', label: 'Best Practices', icon: Lightbulb }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Smart Suggestions Tab */}
                {activeTab === 'suggestions' && (
                    <div className="space-y-4">
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                                <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${suggestion.priority === 'high'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {suggestion.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                                            {suggestion.action && (
                                                <button
                                                    onClick={suggestion.action}
                                                    className="flex items-center text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    {suggestion.actionLabel}
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h4 className="font-medium text-gray-900 mb-2">All caught up!</h4>
                                <p className="text-sm text-gray-600">No immediate suggestions for this phase.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Checklist Tab */}
                {activeTab === 'checklist' && (
                    <div className="space-y-3">
                        {guidance.checklist.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-700">{item}</span>
                            </div>
                        ))}

                        {guidance.nextSteps && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Next Steps
                                </h4>
                                <div className="space-y-2">
                                    {guidance.nextSteps.map((step, index) => (
                                        <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                                            <ArrowRight className="w-3 h-3" />
                                            {step}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tips Tab */}
                {activeTab === 'tips' && (
                    <div className="space-y-4">
                        {guidance.tips
                            .filter(tip => !dismissedTips.has(tip.id))
                            .map((tip, index) => (
                                <div key={tip.id} className={`border rounded-lg p-4 ${getTipStyling(tip.type)}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Lightbulb className="w-4 h-4" />
                                                <h4 className="font-medium">{tip.title}</h4>
                                                <span className="px-2 py-1 text-xs rounded-full bg-white bg-opacity-50">
                                                    {tip.type.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-3">{tip.content}</p>
                                            {tip.action && (
                                                <button className="text-sm underline hover:no-underline">
                                                    {tip.action}
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => dismissTip(tip.id)}
                                            className="text-current opacity-50 hover:opacity-100 ml-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}

                        {guidance.tips.filter(tip => !dismissedTips.has(tip.id)).length === 0 && (
                            <div className="text-center py-8">
                                <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No active tips for this phase.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartWorkflowAssistant;