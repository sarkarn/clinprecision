import React, { useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Zap,
    Target,
    Calendar,
    FileText,
    Link as LinkIcon,
    Send
} from 'lucide-react';

/**
 * Phase Transition Helper
 * Provides guided transitions between workflow phases with validation and preparation
 */
const PhaseTransitionHelper = ({
    currentPhase,
    targetPhase,
    completedPhases,
    designProgress,
    onTransition,
    onCancel,
    isVisible = false
}) => {
    const [validationResults, setValidationResults] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    // Phase configurations
    const phaseConfig = {
        'basic-info': {
            name: 'Basic Information',
            icon: FileText,
            color: 'blue',
            requirements: [
                'Study title and description',
                'Primary and secondary objectives',
                'Target population criteria',
                'Study design rationale'
            ]
        },
        'arms': {
            name: 'Study Arms',
            icon: Target,
            color: 'green',
            requirements: [
                'Treatment arms configuration',
                'Randomization strategy',
                'Control group definition',
                'Blinding approach'
            ]
        },
        'visits': {
            name: 'Visit Schedule',
            icon: Calendar,
            color: 'purple',
            requirements: [
                'Visit timeline defined',
                'Procedures mapped to visits',
                'Safety assessments planned',
                'Follow-up strategy set'
            ]
        },
        'forms': {
            name: 'Form Binding',
            icon: LinkIcon,
            color: 'orange',
            requirements: [
                'Forms assigned to visits',
                'Validation rules configured',
                'Data collection rules set',
                'User permissions defined'
            ]
        },
        'review': {
            name: 'Review & Validation',
            icon: CheckCircle2,
            color: 'teal',
            requirements: [
                'Design validation complete',
                'Cross-references verified',
                'Documentation reviewed',
                'Stakeholder approval'
            ]
        },
        'publish': {
            name: 'Publish Study',
            icon: Send,
            color: 'indigo',
            requirements: [
                'All phases completed',
                'Final review approved',
                'System configuration ready',
                'Go-live checklist complete'
            ]
        }
    };

    // Validate current phase before transition
    const validatePhase = async (phaseId) => {
        setIsValidating(true);

        // Simulate validation API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockValidation = {
            'basic-info': {
                passed: true,
                score: 95,
                issues: [],
                warnings: ['Consider adding secondary endpoints for exploratory analysis']
            },
            'arms': {
                passed: true,
                score: 88,
                issues: [],
                warnings: ['Biomarker strategy could be enhanced']
            },
            'visits': {
                passed: false,
                score: 75,
                issues: ['Safety monitoring visits need to be defined'],
                warnings: ['Consider adding interim analysis timepoints']
            },
            'forms': {
                passed: true,
                score: 92,
                issues: [],
                warnings: []
            }
        };

        const result = mockValidation[phaseId] || { passed: true, score: 100, issues: [], warnings: [] };
        setValidationResults(result);
        setIsValidating(false);

        return result;
    };

    // Handle transition with validation
    const handleTransition = async () => {
        const validation = await validatePhase(currentPhase);

        if (validation.passed || window.confirm('Phase has validation issues. Continue anyway?')) {
            onTransition(targetPhase);
        }
    };

    if (!isVisible || !targetPhase) return null;

    const currentConfig = phaseConfig[currentPhase];
    const targetConfig = phaseConfig[targetPhase];
    const CurrentIcon = currentConfig?.icon || FileText;
    const TargetIcon = targetConfig?.icon || FileText;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Phase Transition</h2>
                    <div className="flex items-center space-x-4">
                        {/* Current Phase */}
                        <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg bg-${currentConfig?.color}-100`}>
                                <CurrentIcon className={`w-4 h-4 text-${currentConfig?.color}-600`} />
                            </div>
                            <span className="font-medium text-gray-900">{currentConfig?.name}</span>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-gray-400" />

                        {/* Target Phase */}
                        <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg bg-${targetConfig?.color}-100`}>
                                <TargetIcon className={`w-4 h-4 text-${targetConfig?.color}-600`} />
                            </div>
                            <span className="font-medium text-gray-900">{targetConfig?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Phase Validation */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Current Phase Validation</h3>

                        {isValidating ? (
                            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                                <div className="animate-spin">
                                    <Zap className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-blue-700">Validating phase completion...</span>
                            </div>
                        ) : validationResults ? (
                            <div className="space-y-3">
                                {/* Validation Score */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900">Completion Score</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${validationResults.score >= 90 ? 'bg-green-500' :
                                                    validationResults.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${validationResults.score}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-semibold text-gray-900">{validationResults.score}%</span>
                                    </div>
                                </div>

                                {/* Issues */}
                                {validationResults.issues.length > 0 && (
                                    <div className="p-4 bg-red-50 rounded-lg">
                                        <h4 className="font-medium text-red-900 mb-2 flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Issues Found
                                        </h4>
                                        <ul className="space-y-1">
                                            {validationResults.issues.map((issue, index) => (
                                                <li key={index} className="text-sm text-red-700">• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Warnings */}
                                {validationResults.warnings.length > 0 && (
                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Recommendations
                                        </h4>
                                        <ul className="space-y-1">
                                            {validationResults.warnings.map((warning, index) => (
                                                <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Success State */}
                                {validationResults.passed && validationResults.issues.length === 0 && (
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-center text-green-700">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            <span className="font-medium">Phase validation successful!</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => validatePhase(currentPhase)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Run Validation
                            </button>
                        )}
                    </div>

                    {/* Next Phase Requirements */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">
                            What to expect in {targetConfig?.name}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <ul className="space-y-2">
                                {targetConfig?.requirements.map((requirement, index) => (
                                    <li key={index} className="flex items-center text-sm text-gray-700">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                        {requirement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Workflow Progress</h3>
                        <div className="flex items-center space-x-2">
                            <div className="flex-grow bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${(completedPhases.length / Object.keys(phaseConfig).length) * 100}%`
                                    }}
                                ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                                {completedPhases.length} of {Object.keys(phaseConfig).length} phases complete
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>

                    <div className="flex space-x-3">
                        {validationResults && !validationResults.passed && (
                            <button
                                onClick={() => setValidationResults(null)}
                                className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                Fix Issues First
                            </button>
                        )}

                        <button
                            onClick={handleTransition}
                            disabled={!validationResults}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continue to {targetConfig?.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseTransitionHelper;