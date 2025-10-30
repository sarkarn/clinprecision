import React, { ReactNode } from 'react';

interface FieldMetadata {
    required?: boolean;
    helpText?: string;
    description?: string;
    clinicalSignificance?: boolean;
    referenceRange?: {
        min: number;
        max: number;
        unit?: string;
    };
    units?: string;
}

interface Field {
    id: string;
    name?: string;
    label?: string;
    required?: boolean;
    metadata?: FieldMetadata;
}

interface CustomStyles {
    wrapper?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    helpText?: React.CSSProperties;
    errors?: React.CSSProperties;
}

interface FieldWrapperProps {
    field: Field;
    children: ReactNode;
    errors?: string[];
    context?: 'general' | 'study' | 'template' | 'patient';
    customStyles?: CustomStyles;
    showLabel?: boolean;
    showErrors?: boolean;
    showHelpText?: boolean;
    showRequired?: boolean;
    className?: string;
}

/**
 * FieldWrapper - Common wrapper for all form fields
 * Provides consistent layout, labeling, error display, and help text
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({
    field,
    children,
    errors = [],
    context = 'general',
    customStyles = {},
    showLabel = true,
    showErrors = true,
    showHelpText = true,
    showRequired = true,
    className = ''
}) => {
    const hasError = errors.length > 0;
    const isRequired = field.required || field.metadata?.required;
    const label = field.label || field.name;
    const helpText = field.metadata?.helpText || field.metadata?.description;

    // Get wrapper classes
    const getWrapperClasses = () => {
        const baseClasses = "form-field-wrapper";
        const contextClasses = `form-field-wrapper--${context}`;
        const errorClasses = hasError ? 'form-field-wrapper--error' : '';
        const requiredClasses = isRequired ? 'form-field-wrapper--required' : '';

        return `${baseClasses} ${contextClasses} ${errorClasses} ${requiredClasses} ${className}`.trim();
    };

    // Get label classes
    const getLabelClasses = () => {
        const baseClasses = "block text-sm font-medium mb-2";
        const errorClasses = hasError ? "text-red-700" : "text-gray-700";

        return `${baseClasses} ${errorClasses}`;
    };

    return (
        <div className={getWrapperClasses()} style={customStyles.wrapper}>
            {/* Field Label */}
            {showLabel && label && (
                <label
                    htmlFor={field.id}
                    className={getLabelClasses()}
                    style={customStyles.label}
                >
                    {label}
                    {showRequired && isRequired && (
                        <span className="text-red-500 ml-1" aria-label="required">*</span>
                    )}
                </label>
            )}

            {/* Field Input */}
            <div className="form-field-input" style={customStyles.input}>
                {children}
            </div>

            {/* Help Text */}
            {showHelpText && helpText && (
                <p
                    className="mt-1 text-xs text-gray-500"
                    style={customStyles.helpText}
                    id={`${field.id}-help`}
                >
                    {helpText}
                </p>
            )}

            {/* Validation Errors */}
            {showErrors && hasError && (
                <div
                    className="mt-1 space-y-1"
                    style={customStyles.errors}
                    id={`${field.id}-error`}
                    role="alert"
                    aria-live="polite"
                >
                    {errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-600">
                            {error}
                        </p>
                    ))}
                </div>
            )}

            {/* Clinical Context Indicators */}
            {context === 'patient' && field.metadata?.clinicalSignificance && (
                <div className="mt-1 flex items-center text-xs text-orange-600">
                    <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-2" />
                    Clinically Significant
                </div>
            )}

            {/* Reference Ranges for Lab Values */}
            {context === 'patient' && field.metadata?.referenceRange && (
                <div className="mt-1 text-xs text-gray-500">
                    Reference: {field.metadata.referenceRange.min} - {field.metadata.referenceRange.max}
                    {field.metadata.referenceRange.unit && ` ${field.metadata.referenceRange.unit}`}
                </div>
            )}

            {/* Units Display */}
            {field.metadata?.units && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    {field.metadata.units}
                </div>
            )}
        </div>
    );
};

export default FieldWrapper;
