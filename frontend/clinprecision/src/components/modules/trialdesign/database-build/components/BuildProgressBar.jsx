import React from 'react';
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

/**
 * Progress bar component for displaying build progress
 * Shows animated progress with percentage and current phase
 */
const BuildProgressBar = ({ build, showPercentage = true, showPhase = true, height = 'medium' }) => {

    // Calculate progress percentage
    const progress = studyDatabaseBuildService.calculateProgress(build);

    // Determine current phase based on progress
    const getCurrentPhase = () => {
        if (progress < 30) {
            return 'Initializing build...';
        } else if (progress < 60) {
            return 'Configuring forms and tables...';
        } else if (progress < 90) {
            return 'Setting up validation rules...';
        } else {
            return 'Finalizing build...';
        }
    };

    const currentPhase = getCurrentPhase();

    // Height variants
    const heightClasses = {
        small: 'h-2',
        medium: 'h-3',
        large: 'h-4',
    };

    // Progress color based on percentage
    const getProgressColor = () => {
        if (progress < 30) return 'bg-blue-400';
        if (progress < 60) return 'bg-blue-500';
        if (progress < 90) return 'bg-blue-600';
        return 'bg-blue-700';
    };

    return (
        <div className="space-y-2">
            {/* Progress bar */}
            <div className="relative w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`
            ${heightClasses[height]}
            ${getProgressColor()}
            transition-all duration-500 ease-out
            rounded-full
          `}
                    style={{ width: `${progress}%` }}
                >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
                </div>
            </div>

            {/* Progress info */}
            <div className="flex items-center justify-between text-sm">
                {showPhase && (
                    <span className="text-gray-600 font-medium animate-pulse">
                        {currentPhase}
                    </span>
                )}
                {showPercentage && (
                    <span className="text-blue-600 font-semibold ml-auto">
                        {progress}%
                    </span>
                )}
            </div>

            {/* Metrics summary (optional) */}
            {build && (
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                        Forms: {build.formsConfigured || 0}
                    </div>
                    <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                        Tables: {build.tablesCreated || 0}
                    </div>
                    <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-1" />
                        Rules: {build.validationRulesSetup || 0}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuildProgressBar;
