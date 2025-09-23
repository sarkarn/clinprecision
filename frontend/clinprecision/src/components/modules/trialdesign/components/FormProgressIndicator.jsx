import React from 'react';
import { CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';

/**
 * Form Progress Indicator - Shows form completion status and validation feedback
 */
const FormProgressIndicator = ({
    completionPercentage = 0,
    requiredFieldsCompleted = 0,
    totalRequiredFields = 0,
    totalErrors = 0,
    isFormValid = false,
    showDetailedProgress = true,
    fieldValidationStates = {},
    className = ''
}) => {
    const getProgressColor = () => {
        if (totalErrors > 0) return 'bg-red-500';
        if (completionPercentage === 100) return 'bg-green-500';
        if (completionPercentage >= 75) return 'bg-blue-500';
        if (completionPercentage >= 50) return 'bg-yellow-500';
        return 'bg-gray-300';
    };

    const getStatusIcon = () => {
        if (isFormValid && completionPercentage === 100) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
        if (totalErrors > 0) {
            return <AlertCircle className="w-5 h-5 text-red-500" />;
        }
        if (completionPercentage > 0) {
            return <Clock className="w-5 h-5 text-blue-500" />;
        }
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    };

    const getStatusMessage = () => {
        if (isFormValid && completionPercentage === 100) {
            return 'Form is complete and ready for submission';
        }
        if (totalErrors > 0) {
            return `${totalErrors} error${totalErrors > 1 ? 's' : ''} need${totalErrors === 1 ? 's' : ''} to be fixed`;
        }
        if (requiredFieldsCompleted < totalRequiredFields) {
            const remaining = totalRequiredFields - requiredFieldsCompleted;
            return `${remaining} required field${remaining > 1 ? 's' : ''} remaining`;
        }
        return 'Form in progress';
    };

    const renderFieldValidationSummary = () => {
        if (!showDetailedProgress || Object.keys(fieldValidationStates).length === 0) {
            return null;
        }

        const validFields = Object.values(fieldValidationStates).filter(state => state.isValid).length;
        const invalidFields = Object.values(fieldValidationStates).filter(state => state.error).length;
        const inProgressFields = Object.values(fieldValidationStates).filter(state => state.isValidating).length;
        const totalFields = Object.keys(fieldValidationStates).length;

        return (
            <div className="mt-3 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                    <span>Field Status:</span>
                    <div className="flex space-x-3">
                        {validFields > 0 && (
                            <span className="flex items-center">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                {validFields} valid
                            </span>
                        )}
                        {invalidFields > 0 && (
                            <span className="flex items-center">
                                <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
                                {invalidFields} errors
                            </span>
                        )}
                        {inProgressFields > 0 && (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                                {inProgressFields} validating
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <h4 className="text-sm font-medium text-gray-900">Form Progress</h4>
                </div>
                <span className="text-sm font-medium text-gray-600">
                    {Math.round(completionPercentage)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${completionPercentage}%` }}
                />
            </div>

            {/* Status Message */}
            <p className="text-sm text-gray-600 mb-2">
                {getStatusMessage()}
            </p>

            {/* Required Fields Progress */}
            {totalRequiredFields > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                    Required fields: {requiredFieldsCompleted} of {totalRequiredFields} completed
                </div>
            )}

            {/* Field Validation Summary */}
            {renderFieldValidationSummary()}

            {/* Submit Readiness Indicator */}
            {completionPercentage === 100 && isFormValid && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-700 font-medium">
                            Ready for submission!
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Inline Field Validation Indicator - Shows validation status for individual fields
 */
export const FieldValidationIndicator = ({
    validationState,
    showProgress = true,
    className = ''
}) => {
    const { error, isValid, isValidating, isTouched } = validationState;

    if (!isTouched) return null;

    return (
        <div className={`flex items-center mt-1 ${className}`}>
            {isValidating && (
                <div className="flex items-center text-blue-600 text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                    Validating...
                </div>
            )}

            {!isValidating && isValid && (
                <div className="flex items-center text-green-600 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                </div>
            )}

            {!isValidating && error && (
                <div className="flex items-center text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {error}
                </div>
            )}
        </div>
    );
};

/**
 * Step Progress Indicator - Shows validation status for wizard steps
 */
export const StepProgressIndicator = ({
    steps = [],
    currentStep = 0,
    stepValidationStates = {},
    className = ''
}) => {
    const getStepStatus = (stepIndex) => {
        const step = steps[stepIndex];
        const validationState = stepValidationStates[step.id] || {};

        if (stepIndex < currentStep) {
            return validationState.isValid ? 'completed' : 'error';
        }
        if (stepIndex === currentStep) {
            if (validationState.isValidating) return 'validating';
            return 'current';
        }
        return 'pending';
    };

    const getStepIcon = (stepIndex, status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'validating':
                return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
            case 'current':
                return <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">{stepIndex + 1}</div>;
            default:
                return <div className="w-5 h-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-medium">{stepIndex + 1}</div>;
        }
    };

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            {getStepIcon(index, status)}
                            <span className={`mt-2 text-xs ${status === 'current' ? 'text-blue-600 font-medium' :
                                    status === 'completed' ? 'text-green-600' :
                                        status === 'error' ? 'text-red-600' :
                                            'text-gray-500'
                                }`}>
                                {step.title}
                            </span>
                        </div>

                        {!isLast && (
                            <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default FormProgressIndicator;