import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CalendarDays } from 'lucide-react';
import FieldWrapper from './FieldWrapper';
import { useFormField } from '../FormContext';

interface ValidationConfig {
    noFutureDates?: boolean;
    noPastDates?: boolean;
    custom?: (value: Date | null) => string | null | undefined;
}

interface FieldWrapperCompatibleField {
    id: string;
    name?: string;
    label?: string;
    required?: boolean;
}

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
    id: string;
    name?: string;
    label: string;
    value?: string | Date | null;
    onChange?: (value: string | null) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    placeholder?: string;
    min?: string;
    max?: string;
    step?: string;
    fieldType?: 'date' | 'time' | 'datetime' | 'datetime-local';
    format?: string;
    showTimeZone?: boolean;
    relativeDates?: string[];
    context?: 'general' | 'study' | 'template' | 'patient';
    validation?: ValidationConfig;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * DateInput - Reusable date/time input field component
 * Supports date, time, datetime, with validation and clinical contexts
 */
const DateInput: React.FC<DateInputProps> = ({
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
    step,
    fieldType = 'date',
    format = 'YYYY-MM-DD',
    showTimeZone = false,
    relativeDates = [],
    context = 'general',
    validation = {},
    className = '',
    style = {},
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [validationMessage, setValidationMessage] = useState('');
    const [showRelativeOptions, setShowRelativeOptions] = useState(false);

    // Use form context if available
    const formField = useFormField(id);
    const fieldValue = formField?.value ?? value;
    const fieldError = formField?.errors[0];

    /**
     * Format value for input element
     */
    const formatValueForInput = (val: string | Date | null): string => {
        if (!val) return '';

        const date = new Date(val);
        if (isNaN(date.getTime())) return '';

        switch (fieldType) {
            case 'date':
                return date.toISOString().split('T')[0];
            case 'time':
                return date.toTimeString().split(' ')[0].substring(0, 5);
            case 'datetime':
            case 'datetime-local':
                return date.toISOString().slice(0, 16);
            default:
                return date.toISOString().split('T')[0];
        }
    };

    /**
     * Initialize internal value
     */
    useEffect(() => {
        if (fieldValue) {
            setInternalValue(formatValueForInput(fieldValue));
        } else {
            setInternalValue('');
        }
    }, [fieldValue, fieldType]);

    /**
     * Parse input value to Date object
     */
    const parseInputValue = (inputVal: string): Date | null => {
        if (!inputVal) return null;

        try {
            let date: Date;
            switch (fieldType) {
                case 'time': {
                    // Combine with today's date for time-only inputs
                    const today = new Date();
                    const [hours, minutes] = inputVal.split(':');
                    date = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
                        parseInt(hours), parseInt(minutes));
                    break;
                }
                case 'datetime':
                case 'datetime-local':
                    date = new Date(inputVal);
                    break;
                default:
                    date = new Date(inputVal + 'T00:00:00');
                    break;
            }

            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            return null;
        }
    };

    /**
     * Format date for display
     */
    const formatDateForDisplay = (date: Date): string => {
        if (!date) return '';

        switch (fieldType) {
            case 'time':
                return date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'datetime':
            case 'datetime-local':
                return date.toLocaleString();
            default:
                return date.toLocaleDateString();
        }
    };

    /**
     * Validate date value
     */
    const validateValue = (dateValue: Date | null): string[] => {
        const errors: string[] = [];

        // Required validation
        if (required && !dateValue) {
            errors.push('This field is required');
        }

        if (dateValue) {
            // Min/max validation
            if (min) {
                const minDate = new Date(min);
                if (dateValue < minDate) {
                    errors.push(`Date must be on or after ${formatDateForDisplay(minDate)}`);
                }
            }
            if (max) {
                const maxDate = new Date(max);
                if (dateValue > maxDate) {
                    errors.push(`Date must be on or before ${formatDateForDisplay(maxDate)}`);
                }
            }

            // Age validation for clinical context
            if (context !== 'general' && id.toLowerCase().includes('birth')) {
                const today = new Date();
                const age = today.getFullYear() - dateValue.getFullYear();
                if (age < 0 || age > 150) {
                    errors.push('Please enter a valid birth date');
                }
            }

            // Future date validation
            if (validation.noFutureDates && dateValue > new Date()) {
                errors.push('Future dates are not allowed');
            }

            // Past date validation
            if (validation.noPastDates && dateValue < new Date()) {
                errors.push('Past dates are not allowed');
            }

            // Custom validation
            if (validation.custom && typeof validation.custom === 'function') {
                const customError = validation.custom(dateValue);
                if (customError) {
                    errors.push(customError);
                }
            }
        }

        return errors;
    };

    /**
     * Handle input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setInternalValue(inputValue);

        const dateValue = parseInputValue(inputValue);
        const errors = validateValue(dateValue);

        setIsValid(errors.length === 0);
        setValidationMessage(errors[0] || '');

        // Call onChange with ISO string or null
        const outputValue = dateValue ? dateValue.toISOString() : null;
        onChange?.(outputValue);
        formField?.setValue?.(outputValue);
    };

    /**
     * Handle relative date selection
     */
    const handleRelativeDateSelect = (relativeDate: string) => {
        const today = new Date();
        let targetDate: Date;

        switch (relativeDate) {
            case 'today':
                targetDate = today;
                break;
            case 'yesterday':
                targetDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'tomorrow':
                targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                break;
            case '+1 week':
                targetDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case '-1 week':
                targetDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '+1 month':
                targetDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                break;
            case '-1 month':
                targetDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                break;
            default:
                return;
        }

        const formattedValue = formatValueForInput(targetDate);
        setInternalValue(formattedValue);

        const outputValue = targetDate.toISOString();
        onChange?.(outputValue);
        formField?.setValue?.(outputValue);

        setShowRelativeOptions(false);
    };

    /**
     * Calculate age if this is a birth date field
     */
    const calculateAge = (): number | null => {
        if (!fieldValue || !id.toLowerCase().includes('birth')) return null;

        const birthDate = new Date(fieldValue);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= 0 ? age : null;
    };

    /**
     * Get input type based on field type
     */
    const getInputType = (): 'date' | 'time' | 'datetime-local' => {
        switch (fieldType) {
            case 'time':
                return 'time';
            case 'datetime':
            case 'datetime-local':
                return 'datetime-local';
            default:
                return 'date';
        }
    };

    /**
     * Get appropriate icon
     */
    const getIcon = () => {
        switch (fieldType) {
            case 'time':
                return Clock;
            case 'datetime':
            case 'datetime-local':
                return CalendarDays;
            default:
                return Calendar;
        }
    };

    const Icon = getIcon();
    const age = calculateAge();

    // Get input props
    const inputProps = {
        id,
        name: name || id,
        type: getInputType(),
        value: internalValue,
        onChange: handleInputChange,
        onBlur,
        onFocus,
        placeholder,
        min,
        max,
        step,
        required,
        readOnly,
        disabled,
        className: `w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(fieldError || !isValid) ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`,
        style,
        ref: inputRef,
        ...props
    };

    const fieldForWrapper: FieldWrapperCompatibleField = {
        id,
        name,
        label,
        required
    };

    return (
        <FieldWrapper
            field={fieldForWrapper}
            errors={[fieldError || (!isValid ? validationMessage : '')].filter(Boolean)}
            context={context}
        >
            <div className="relative">
                {/* Main input */}
                <input {...inputProps} />

                {/* Calendar/Clock icon */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>

                {/* Relative date dropdown */}
                {relativeDates.length > 0 && !readOnly && !disabled && (
                    <div className="absolute inset-y-0 right-8 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowRelativeOptions(!showRelativeOptions)}
                            className="text-xs text-blue-600 hover:text-blue-700 px-1"
                        >
                            Quick
                        </button>

                        {showRelativeOptions && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-32">
                                {relativeDates.map(relativeDate => (
                                    <button
                                        key={relativeDate}
                                        type="button"
                                        onClick={() => handleRelativeDateSelect(relativeDate)}
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {relativeDate}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Age display for birth dates */}
            {age !== null && (
                <div className="mt-2 text-sm text-gray-600">
                    Age: {age} year{age !== 1 ? 's' : ''}
                </div>
            )}

            {/* Current value display in different format */}
            {fieldValue && format !== 'YYYY-MM-DD' && (
                <div className="mt-2 text-sm text-gray-600">
                    {formatDateForDisplay(new Date(fieldValue))}
                </div>
            )}

            {/* Time zone display */}
            {showTimeZone && fieldType.includes('datetime') && (
                <div className="mt-1 text-xs text-gray-500">
                    Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>
            )}
        </FieldWrapper>
    );
};

export default DateInput;
