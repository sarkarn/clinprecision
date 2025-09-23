import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Enhanced form field component with real-time validation, progressive feedback,
 * and contextual help features
 */
const EnhancedFormField = ({
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

    // Enhanced validation props
    validationMode = 'onBlur', // 'realtime', 'onBlur', 'onSubmit'
    showValidIcon = true,
    suggestions = [], // Array of suggested values
    validateAsYouType = false,
    strengthMeter = false, // For password fields
    autoComplete = true,
    formatValue, // Function to format display value

    // Progressive validation
    validationRules = {},
    onValidationChange,

    ...props
}) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [validationStatus, setValidationStatus] = useState('idle'); // 'idle', 'validating', 'valid', 'invalid'
    const [realTimeError, setRealTimeError] = useState(null);
    const inputRef = useRef(null);
    const fieldId = `enhanced-field-${name}`;

    // Update local value when prop value changes
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    // Real-time validation
    useEffect(() => {
        if (validateAsYouType && localValue && validationRules) {
            const timer = setTimeout(() => {
                validateField(localValue);
            }, 300); // Debounce validation

            return () => clearTimeout(timer);
        }
    }, [localValue, validateAsYouType, validationRules]);

    const validateField = async (fieldValue) => {
        if (!validationRules || !fieldValue) return;

        setValidationStatus('validating');

        try {
            // Basic validation
            const error = await runValidation(fieldValue);

            if (error) {
                setRealTimeError(error);
                setValidationStatus('invalid');
            } else {
                setRealTimeError(null);
                setValidationStatus('valid');
            }

            if (onValidationChange) {
                onValidationChange(name, !error, error);
            }
        } catch (err) {
            setRealTimeError('Validation error');
            setValidationStatus('invalid');
        }
    };

    const runValidation = async (fieldValue) => {
        // Run custom validation rules
        for (const rule of Object.values(validationRules)) {
            if (typeof rule === 'function') {
                const result = await rule(fieldValue);
                if (result !== true) {
                    return typeof result === 'string' ? result : 'Invalid value';
                }
            }
        }
        return null;
    };

    const getEffectiveError = () => {
        if (validationMode === 'realtime' && realTimeError) {
            return realTimeError;
        }
        return touched && error ? error : null;
    };

    const getValidationIcon = () => {
        if (!showValidIcon || disabled) return null;

        switch (validationStatus) {
            case 'validating':
                return (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                );
            case 'valid':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'invalid':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (validationMode === 'realtime') {
            onChange(name, newValue);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        setShowSuggestions(false);

        if (validationMode === 'onBlur' || validationMode === 'realtime') {
            onChange(name, localValue);
            if (validationRules) {
                validateField(localValue);
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setLocalValue(suggestion);
        onChange(name, suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const effectiveError = getEffectiveError();
    const hasError = Boolean(effectiveError);
    const isValid = validationStatus === 'valid' && !hasError;

    const baseInputStyles = `
        w-full px-3 py-2 border rounded-md transition-all duration-200
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
        ${hasError
            ? 'border-red-500 bg-red-50 focus:ring-red-200'
            : isValid
                ? 'border-green-500 bg-green-50 focus:ring-green-200'
                : isFocused
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
        }
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${suggestions.length > 0 ? 'pr-8' : ''}
    `;

    const renderPasswordToggle = () => {
        if (type !== 'password') return null;

        return (
            <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        );
    };

    const renderSuggestions = () => {
        if (!showSuggestions || suggestions.length === 0 || !isFocused) return null;

        const filteredSuggestions = suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(localValue.toLowerCase())
        );

        if (filteredSuggestions.length === 0) return null;

        return (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredSuggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        );
    };

    const renderProgressiveHint = () => {
        if (!isFocused || hasError || !validationRules) return null;

        const hints = [];

        if (validationRules.minLength && localValue.length < validationRules.minLength) {
            hints.push(`Need ${validationRules.minLength - localValue.length} more characters`);
        }

        if (validationRules.pattern && localValue && !validationRules.pattern.test(localValue)) {
            hints.push('Format is not valid');
        }

        if (hints.length === 0) return null;

        return (
            <div className="text-xs text-blue-600 mt-1 flex items-center">
                <HelpCircle className="w-3 h-3 mr-1" />
                {hints.join(', ')}
            </div>
        );
    };

    const renderInput = () => {
        const inputProps = {
            id: fieldId,
            name,
            value: localValue,
            onChange: handleInputChange,
            onBlur: handleBlur,
            onFocus: handleFocus,
            placeholder,
            disabled,
            className: baseInputStyles,
            ref: inputRef,
            ...props
        };

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        {...inputProps}
                        rows={rows}
                    />
                );

            case 'select':
                return (
                    <select
                        {...inputProps}
                        value={localValue}
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
                            checked={localValue || false}
                            onChange={(e) => {
                                const newValue = e.target.checked;
                                setLocalValue(newValue);
                                onChange(name, newValue);
                            }}
                            disabled={disabled}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            {...props}
                        />
                        <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
                            {label}
                        </label>
                    </div>
                );

            case 'password':
                return (
                    <div className="relative">
                        <input
                            {...inputProps}
                            type={showPassword ? 'text' : 'password'}
                        />
                        {renderPasswordToggle()}
                    </div>
                );

            default:
                return <input {...inputProps} type={type} />;
        }
    };

    if (type === 'checkbox') {
        return (
            <div className={`space-y-1 ${className}`}>
                {renderInput()}
                {effectiveError && (
                    <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {effectiveError}
                    </p>
                )}
                {helpText && !effectiveError && (
                    <p className="text-sm text-gray-600">{helpText}</p>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-1 relative ${className}`}>
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

            {/* Input Field Container */}
            <div className="relative">
                {renderInput()}
                {renderSuggestions()}
            </div>

            {/* Progressive Hints */}
            {renderProgressiveHint()}

            {/* Error Message */}
            {effectiveError && (
                <p className="text-sm text-red-600 flex items-center animate-fadeIn">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {effectiveError}
                </p>
            )}

            {/* Success Message */}
            {isValid && !effectiveError && (
                <p className="text-sm text-green-600 flex items-center animate-fadeIn">
                    <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    Looks good!
                </p>
            )}

            {/* Help Text */}
            {helpText && !effectiveError && !isValid && (
                <p className="text-sm text-gray-600 flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {helpText}
                </p>
            )}
        </div>
    );
};

export default EnhancedFormField;