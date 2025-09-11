import React from 'react';

/**
 * Progress indicator component for multi-step wizard
 */
const ProgressIndicator = ({
    steps,
    currentStep,
    completedSteps = [],
    stepErrors = {},
    onStepClick
}) => {
    const getStepStatus = (stepIndex) => {
        if (stepErrors[stepIndex]) return 'error';
        if (completedSteps.includes(stepIndex)) return 'completed';
        if (stepIndex === currentStep) return 'current';
        if (stepIndex < currentStep) return 'visited';
        return 'upcoming';
    };

    const getStepStyles = (status) => {
        const baseStyles = 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200';

        switch (status) {
            case 'completed':
                return `${baseStyles} bg-green-600 text-white`;
            case 'current':
                return `${baseStyles} bg-blue-600 text-white ring-4 ring-blue-200`;
            case 'error':
                return `${baseStyles} bg-red-600 text-white`;
            case 'visited':
                return `${baseStyles} bg-gray-400 text-white`;
            default:
                return `${baseStyles} bg-gray-200 text-gray-600`;
        }
    };

    const getConnectorStyles = (fromStatus, toStatus) => {
        const baseStyles = 'flex-1 h-0.5 transition-all duration-200';
        if (fromStatus === 'completed' || fromStatus === 'current') {
            return `${baseStyles} bg-green-600`;
        }
        return `${baseStyles} bg-gray-300`;
    };

    return (
        <div className="w-full py-4">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isClickable = onStepClick && (index <= currentStep || completedSteps.includes(index));

                    return (
                        <React.Fragment key={step.id || index}>
                            <div className="flex flex-col items-center">
                                {/* Step Circle */}
                                <button
                                    onClick={() => isClickable && onStepClick(index)}
                                    disabled={!isClickable}
                                    className={`${getStepStyles(status)} ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                                    title={step.description}
                                >
                                    {status === 'completed' ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : status === 'error' ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </button>

                                {/* Step Label */}
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${status === 'current' ? 'text-blue-600' : status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>
                                        {step.title}
                                    </div>
                                    {step.subtitle && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {step.subtitle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className={getConnectorStyles(status, getStepStatus(index + 1))} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProgressIndicator;
