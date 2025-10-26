import React from 'react';

interface ValidationMessage {
    type: string;
    message: string;
}

interface ValidationErrorsProps {
    errors?: ValidationMessage[];
    warnings?: ValidationMessage[];
    fieldName?: string;
}

/**
 * ValidationErrors Component
 * 
 * Displays validation errors and warnings for form fields.
 * Used by FormEntry to show real-time validation feedback.
 * 
 * Props:
 * - errors: Array of error objects { type, message }
 * - warnings: Array of warning objects { type, message }
 * - fieldName: Name of the field (for accessibility)
 */
const ValidationErrors: React.FC<ValidationErrorsProps> = ({ 
    errors = [], 
    warnings = [], 
    fieldName 
}) => {
    if (!errors.length && !warnings.length) {
        return null;
    }

    return (
        <div className="validation-messages mt-1">
            {/* Error Messages - Red */}
            {errors.length > 0 && (
                <div className="validation-errors">
                    {errors.map((error, index) => (
                        <div
                            key={`error-${index}`}
                            className="text-red-600 text-sm mt-1 flex items-start"
                            role="alert"
                            aria-live="polite"
                        >
                            <svg
                                className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>{error.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Messages - Yellow/Orange */}
            {warnings.length > 0 && (
                <div className="validation-warnings">
                    {warnings.map((warning, index) => (
                        <div
                            key={`warning-${index}`}
                            className="text-yellow-600 text-sm mt-1 flex items-start"
                            role="alert"
                            aria-live="polite"
                        >
                            <svg
                                className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>{warning.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ValidationErrors;
