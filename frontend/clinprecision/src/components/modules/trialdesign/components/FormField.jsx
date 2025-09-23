import React, { useState } from 'react';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * Enhanced form field component with improved validation feedback
 * Maintains backward compatibility while adding enhanced features
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    touched,
    required = false,
    placeholder,
    options = [], // For select fields
    rows = 3, // For textarea
    disabled = false,
    helpText,
    className = '',

    // Enhanced features (optional)
    showValidIcon = false,
    progressiveValidation = false,
    validationState = null, // { isValid, isValidating, error }

    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const fieldId = `field-${name}`;

    // Use enhanced validation state if provided, otherwise fall back to basic error handling
    const effectiveValidationState = validationState || {
        isValid: touched && !error && value,
        isValidating: false,
        error: touched && error ? error : null
    };

    const hasError = effectiveValidationState.error;

    const baseInputStyles = `
    w-full px-3 py-2 border rounded-md transition-all duration-200
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
    ${hasError
            ? 'border-red-500 bg-red-50 focus:ring-red-200'
            : effectiveValidationState.isValid && showValidIcon
                ? 'border-green-500 bg-green-50 focus:ring-green-200'
                : isFocused
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
        }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
  `;

    const getValidationIcon = () => {
        if (!showValidIcon || disabled) return null;

        if (effectiveValidationState.isValidating) {
            return (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            );
        }

        if (effectiveValidationState.isValid) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }

        if (hasError) {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }

        return null;
    };

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={fieldId}
                        name={name}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        rows={rows}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );

            case 'select':
                return (
                    <select
                        id={fieldId}
                        name={name}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    >
                        <option value="">{placeholder || `Select ${label}`}</option>
                        {options.map((option) => (
                            <option
                                key={option.value || option}
                                value={option.value || option}
                            >
                                {option.label || option}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            id={fieldId}
                            name={name}
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => onChange(name, e.target.checked)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={disabled}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            {...props}
                        />
                        <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
                            {label}
                        </label>
                    </div>
                );

            case 'date':
                return (
                    <input
                        id={fieldId}
                        name={name}
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );

            default:
                return (
                    <input
                        id={fieldId}
                        name={name}
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(name, e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={baseInputStyles}
                        {...props}
                    />
                );
        }
    };

    if (type === 'checkbox') {
        return (
            <div className={`space-y-1 ${className}`}>
                {renderInput()}
                {hasError && (
                    <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {effectiveValidationState.error}
                    </p>
                )}
                {helpText && !hasError && (
                    <p className="text-sm text-gray-600">{helpText}</p>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {/* Label */}
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
                {showValidIcon && (
                    <span className="ml-2">
                        {getValidationIcon()}
                    </span>
                )}
            </label>

            {/* Input Field */}
            {renderInput()}

            {/* Error Message */}
            {hasError && (
                <p className="text-sm text-red-600 flex items-center animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {effectiveValidationState.error}
                </p>
            )}

            {/* Success Message */}
            {effectiveValidationState.isValid && !hasError && showValidIcon && (
                <p className="text-sm text-green-600 flex items-center animate-fadeIn">
                    <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    Looks good!
                </p>
            )}

            {/* Help Text */}
            {helpText && !hasError && (
                <p className="text-sm text-gray-600 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {helpText}
                </p>
            )}
        </div>
    );
};

export default FormField;
