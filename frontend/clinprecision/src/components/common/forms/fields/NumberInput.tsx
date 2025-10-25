import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Calculator } from 'lucide-react';
import FieldWrapper from './FieldWrapper';
import { useFormField } from '../FormContext';

interface ReferenceRange {
    min?: number;
    max?: number;
}

interface ValidationConfig {
    custom?: (value: number | null) => string | null | undefined;
}

interface FieldWrapperCompatibleField {
    id: string;
    name?: string;
    label?: string;
    required?: boolean;
    metadata?: {
        referenceRange?: ReferenceRange;
        units?: string;
    };
}

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
    id: string;
    name?: string;
    label: string;
    value?: number | string | null;
    onChange?: (value: number | null) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    showStepControls?: boolean;
    allowNegative?: boolean;
    thousandsSeparator?: boolean;
    currency?: string;
    units?: string;
    referenceRange?: ReferenceRange;
    context?: 'general' | 'study' | 'template' | 'patient';
    fieldType?: 'number' | 'integer' | 'float';
    validation?: ValidationConfig;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * NumberInput - Reusable number input field component
 * Supports integers, floats, ranges, step controls, and clinical contexts
 */
const NumberInput: React.FC<NumberInputProps> = ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    required = false,
    readOnly = false,
    disabled = false,
    placeholder,
    min,
    max,
    step = 1,
    precision,
    showStepControls = false,
    allowNegative = true,
    thousandsSeparator = false,
    currency,
    units,
    referenceRange,
    context = 'general',
    fieldType = 'number',
    validation = {},
    className = '',
    style = {},
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState('');

    // Use form context if available
    const formField = useFormField(id);
    const fieldValue = formField?.value ?? value;
    const fieldError = formField?.errors[0];

    /**
     * Initialize internal value
     */
    useEffect(() => {
        if (fieldValue !== undefined && fieldValue !== null) {
            setInternalValue(formatDisplayValue(fieldValue));
        } else {
            setInternalValue('');
        }
    }, [fieldValue]);

    /**
     * Format value for display
     */
    const formatDisplayValue = (val: number | string | null): string => {
        if (val === undefined || val === null || val === '') return '';

        const numValue = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(numValue)) return '';

        // Apply precision if specified
        let formatted = precision !== undefined
            ? numValue.toFixed(precision)
            : numValue.toString();

        // Apply thousands separator if enabled
        if (thousandsSeparator) {
            const parts = formatted.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formatted = parts.join('.');
        }

        return formatted;
    };

    /**
     * Parse display value to numeric value
     */
    const parseNumericValue = (displayVal: string): number | null => {
        if (!displayVal) return null;

        // Remove thousands separators
        const cleaned = displayVal.replace(/,/g, '');
        const numValue = parseFloat(cleaned);

        if (isNaN(numValue)) return null;

        // Apply field type constraints
        switch (fieldType) {
            case 'integer':
                return Math.round(numValue);
            case 'float':
                return precision !== undefined ?
                    parseFloat(numValue.toFixed(precision)) : numValue;
            default:
                return numValue;
        }
    };

    /**
     * Validate numeric value
     */
    const validateValue = (numValue: number | null): string[] => {
        const errors: string[] = [];

        // Required validation
        if (required && (numValue === null || numValue === undefined)) {
            errors.push('This field is required');
        }

        if (numValue !== null && numValue !== undefined) {
            // Min/max validation
            if (min !== undefined && numValue < min) {
                errors.push(`Value must be at least ${min}`);
            }
            if (max !== undefined && numValue > max) {
                errors.push(`Value must be at most ${max}`);
            }

            // Negative number validation
            if (!allowNegative && numValue < 0) {
                errors.push('Negative values are not allowed');
            }

            // Integer validation
            if (fieldType === 'integer' && !Number.isInteger(numValue)) {
                errors.push('Value must be a whole number');
            }

            // Custom validation
            if (validation.custom && typeof validation.custom === 'function') {
                const customError = validation.custom(numValue);
                if (customError) {
                    errors.push(customError);
                }
            }

            // Reference range validation (for clinical context)
            if (referenceRange && context !== 'general') {
                if (referenceRange.min !== undefined && numValue < referenceRange.min) {
                    errors.push(`Below normal range (${referenceRange.min} - ${referenceRange.max})`);
                }
                if (referenceRange.max !== undefined && numValue > referenceRange.max) {
                    errors.push(`Above normal range (${referenceRange.min} - ${referenceRange.max})`);
                }
            }
        }

        return errors;
    };

    /**
     * Handle input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const displayValue = e.target.value;
        setInternalValue(displayValue);

        const numValue = parseNumericValue(displayValue);
        const errors = validateValue(numValue);

        setIsValid(errors.length === 0);
        setValidationMessage(errors[0] || '');

        // Call onChange with numeric value
        onChange?.(numValue);
        formField?.setValue?.(numValue);
    };

    /**
     * Handle input blur
     */
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const numValue = parseNumericValue(internalValue);

        // Reformat display value on blur
        if (numValue !== null) {
            setInternalValue(formatDisplayValue(numValue));
        }

        onBlur?.(e);
    };

    /**
     * Handle step controls
     */
    const handleStep = (direction: 'up' | 'down') => {
        const currentValue = parseNumericValue(internalValue) || 0;
        const stepSize = step || 1;
        let newValue: number;

        if (direction === 'up') {
            newValue = currentValue + stepSize;
        } else {
            newValue = currentValue - stepSize;
        }

        // Apply constraints
        if (min !== undefined && newValue < min) newValue = min;
        if (max !== undefined && newValue > max) newValue = max;

        setInternalValue(formatDisplayValue(newValue));
        onChange?.(newValue);
        formField?.setValue?.(newValue);
    };

    /**
     * Handle keyboard events
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow step controls with arrow keys
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleStep('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleStep('down');
        }
    };

    // Get input props
    const inputProps = {
        id,
        name: name || id,
        type: 'text' as const,
        value: internalValue,
        onChange: handleInputChange,
        onBlur: handleBlur,
        onFocus,
        onKeyDown: handleKeyDown,
        placeholder,
        required,
        readOnly,
        disabled,
        className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(fieldError || !isValid) ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`,
        style,
        ref: inputRef,
        ...props
    };

    // Determine if we should show reference range
    const showReferenceRange = referenceRange && (context === 'study' || context === 'patient');

    const fieldForWrapper: FieldWrapperCompatibleField = {
        id,
        name,
        label,
        required,
        metadata: {
            referenceRange: showReferenceRange ? referenceRange : undefined,
            units
        }
    };

    return (
        <FieldWrapper
            field={fieldForWrapper}
            errors={[fieldError || (!isValid ? validationMessage : '')].filter(Boolean)}
            context={context}
        >
            <div className="relative">
                {/* Currency prefix */}
                {currency && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 text-sm">{currency}</span>
                    </div>
                )}

                {/* Main input */}
                <input
                    {...inputProps}
                    className={`${inputProps.className} ${currency ? 'pl-8' : ''} ${(showStepControls || units) ? 'pr-16' : ''
                        }`}
                />

                {/* Step controls and units */}
                <div className="absolute inset-y-0 right-0 flex items-center">
                    {/* Step controls */}
                    {showStepControls && !readOnly && !disabled && (
                        <div className="flex flex-col border-l border-gray-300">
                            <button
                                type="button"
                                onClick={() => handleStep('up')}
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b border-gray-300"
                                disabled={max !== undefined && (parseNumericValue(internalValue) ?? 0) >= max}
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStep('down')}
                                className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                disabled={min !== undefined && (parseNumericValue(internalValue) ?? 0) <= min}
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    {/* Units suffix */}
                    {units && (
                        <div className="pr-3 flex items-center">
                            <span className="text-gray-500 text-sm">{units}</span>
                        </div>
                    )}
                </div>

                {/* Calculator icon for clinical context */}
                {context !== 'general' && !readOnly && (
                    <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                        <Calculator className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Range indicator for clinical values */}
            {showReferenceRange && fieldValue !== undefined && fieldValue !== null && (
                <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                        Normal Range: {referenceRange.min} - {referenceRange.max} {units}
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2">
                        {/* Normal range */}
                        <div
                            className="absolute bg-green-200 h-2 rounded-full"
                            style={{
                                left: '20%',
                                width: '60%'
                            }}
                        />
                        {/* Current value indicator */}
                        <div
                            className={`absolute w-1 h-4 -mt-1 rounded-full ${Number(fieldValue) < (referenceRange.min ?? 0) ? 'bg-yellow-500' :
                                    Number(fieldValue) > (referenceRange.max ?? 0) ? 'bg-red-500' :
                                        'bg-green-500'
                                }`}
                            style={{
                                left: `${Math.max(0, Math.min(100, ((Number(fieldValue) - (referenceRange.min || 0)) /
                                    ((referenceRange.max || 100) - (referenceRange.min || 0))) * 100))}%`
                            }}
                        />
                    </div>
                </div>
            )}
        </FieldWrapper>
    );
};

export default NumberInput;
