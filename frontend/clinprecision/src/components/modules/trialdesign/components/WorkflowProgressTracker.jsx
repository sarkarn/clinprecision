import React, { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    AlertTriangle,
    ArrowRight,
    Lightbulb,
    HelpCircle,
    ChevronRight,
    CheckSquare
} from 'lucide-react';

/**
 * Enhanced Workflow Progress Tracker
 * Provides visual progress indication with smart suggestions and validation
 */
const WorkflowProgressTracker = ({
    phases,
    currentPhase,
    completedPhases,
    designProgress,
    onPhaseChange,
    isPhaseAccessible,
    className = ""
}) => {
    const [showSuggestions, setShowSuggestions] = useState(true);

    // Calculate overall progress
    const getOverallProgress = () => {
        const totalPhases = phases.length;
        const completedCount = completedPhases.length;
        return Math.round((completedCount / totalPhases) * 100);
    };

    // Get phase status with enhanced logic
    const getPhaseStatus = (phaseId) => {
        if (completedPhases.includes(phaseId)) return 'completed';
        if (currentPhase === phaseId) return 'current';
        if (isPhaseAccessible(phaseId)) return 'available';
        return 'locked';
    };

    // Get next recommended step
    const getNextStep = () => {
        const currentIndex = phases.findIndex(p => p.id === currentPhase);

        // If current phase is not completed, suggest completing it
        if (!completedPhases.includes(currentPhase)) {
            return {
                type: 'complete_current',
                phase: phases[currentIndex],
                message: `Complete "${phases[currentIndex]?.name}" to proceed`,
                action: 'Continue working on this phase'
            };
        }

        // Suggest next phase
        const nextPhase = phases[currentIndex + 1];
        if (nextPhase && isPhaseAccessible(nextPhase.id)) {
            return {
                type: 'next_phase',
                phase: nextPhase,
                message: `Ready to move to "${nextPhase.name}"`,
                action: 'Start next phase'
            };
        }

        // All phases completed
        if (currentIndex === phases.length - 1 && completedPhases.includes(currentPhase)) {
            return {
                type: 'complete',
                message: 'Study design workflow completed!',
                action: 'Review and publish'
            };
        }

        return null;
    };

    // Validate current phase
    const validatePhase = (phaseId) => {
        const validations = {
            'basic-info': {
                required: ['study name', 'objectives', 'population'],
                warnings: ['Consider adding secondary endpoints'],
                errors: []
            },
            'arms': {
                required: ['treatment arms', 'randomization strategy'],
                warnings: ['Define biomarker strategies'],
                errors: []
            },
            'visits': {
                required: ['visit schedule', 'procedures timeline'],
                warnings: ['Add safety monitoring visits'],
                errors: []
            },
            'forms': {
                required: ['case report forms', 'data collection rules'],
                warnings: ['Review form validation rules'],
                errors: []
            },
            'review': {
                required: ['design review', 'validation checks'],
                warnings: [],
                errors: []
            }
        };

        return validations[phaseId] || { required: [], warnings: [], errors: [] };
    };

    const nextStep = getNextStep();
    const currentValidation = validatePhase(currentPhase);

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
                        <p className="text-sm text-gray-600 mt-1">Study design completion tracker</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{getOverallProgress()}%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getOverallProgress()}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Phase List */}
            <div className="p-6">
                <div className="space-y-3">
                    {phases.map((phase, index) => {
                        const status = getPhaseStatus(phase.id);
                        const isAccessible = isPhaseAccessible(phase.id);
                        const isCurrent = currentPhase === phase.id;

                        return (
                            <div
                                key={phase.id}
                                className={`
                                    flex items-center p-3 rounded-lg transition-all cursor-pointer
                                    ${isCurrent ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'}
                                    ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => isAccessible && onPhaseChange(phase.id)}
                            >
                                {/* Status Icon */}
                                <div className="flex-shrink-0 mr-3">
                                    {status === 'completed' && (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    )}
                                    {status === 'current' && (
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                    {status === 'available' && (
                                        <Circle className="w-6 h-6 text-gray-400" />
                                    )}
                                    {status === 'locked' && (
                                        <Circle className="w-6 h-6 text-gray-300" />
                                    )}
                                </div>

                                {/* Phase Info */}
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {phase.name}
                                        </h4>
                                        {status === 'current' && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{phase.description}</p>

                                    {/* Phase Progress */}
                                    {status === 'current' && designProgress[phase.id] && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{designProgress[phase.id].percentage || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                <div
                                                    className="bg-blue-500 h-1 rounded-full transition-all"
                                                    style={{ width: `${designProgress[phase.id].percentage || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Arrow */}
                                {isAccessible && (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Smart Suggestions */}
            {showSuggestions && nextStep && (
                <div className="border-t border-gray-200 p-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-grow">
                                <h4 className="font-medium text-blue-900">Next Step</h4>
                                <p className="text-sm text-blue-700 mt-1">{nextStep.message}</p>

                                {nextStep.type === 'next_phase' && (
                                    <button
                                        onClick={() => onPhaseChange(nextStep.phase.id)}
                                        className="mt-3 flex items-center text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {nextStep.action}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowSuggestions(false)}
                                className="text-blue-400 hover:text-blue-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Feedback */}
            {currentValidation && (currentValidation.warnings.length > 0 || currentValidation.errors.length > 0) && (
                <div className="border-t border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Phase Validation
                    </h4>

                    {currentValidation.errors.length > 0 && (
                        <div className="mb-3">
                            {currentValidation.errors.map((error, index) => (
                                <div key={index} className="flex items-center text-sm text-red-600 mb-1">
                                    <AlertTriangle className="w-3 h-3 mr-2" />
                                    {error}
                                </div>
                            ))}
                        </div>
                    )}

                    {currentValidation.warnings.length > 0 && (
                        <div>
                            {currentValidation.warnings.map((warning, index) => (
                                <div key={index} className="flex items-center text-sm text-yellow-600 mb-1">
                                    <HelpCircle className="w-3 h-3 mr-2" />
                                    {warning}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkflowProgressTracker;