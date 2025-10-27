import React, { useState, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';
import FieldWrapper from './FieldWrapper';
import { useFormField } from '../FormContext';

type OptionValue = string | number;

interface CheckboxOption {
    value: OptionValue;
    label: string;
    disabled?: boolean;
    description?: string;
}

type NormalizedOption = string | CheckboxOption;

interface ValidationConfig {
    custom?: (selection: OptionValue[]) => string | null | undefined;
}

interface FieldWrapperCompatibleField {
    id: string;
    name?: string;
    label?: string;
    required?: boolean;
}

interface CheckboxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
    id: string;
    name?: string;
    label: string;
    value?: boolean | string | OptionValue[];
    onChange?: (value: boolean | string | OptionValue[]) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    options?: NormalizedOption[];
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    layout?: 'vertical' | 'horizontal' | 'grid';
    maxSelections?: number;
    indeterminate?: boolean;
    context?: 'general' | 'study' | 'template' | 'patient';
    validation?: ValidationConfig;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * CheckboxInput - Reusable checkbox input field component
 * Supports single checkbox, checkbox groups, and indeterminate state
 */
const CheckboxInput: React.FC<CheckboxInputProps> = ({
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    onFocus,
    options = [],
    required = false,
    readOnly = false,
    disabled = false,
    multiple = false,
    layout = 'vertical',
    maxSelections,
    indeterminate = false,
    context = 'general',
    validation = {},
    className = '',
    style = {},
    ...props
}) => {
    const [selectedValues, setSelectedValues] = useState<OptionValue[]>([]);
    const [validationMessage, setValidationMessage] = useState<string>('');

    // Use form context if available
    const formField = useFormField(id);
    const fieldValue = formField?.value ?? value;
    const fieldError = formField?.errors[0];

    // Initialize selected values
    useEffect(() => {
        if (multiple) {
            // Checkbox group
            const values = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [fieldValue as OptionValue] : []);
            setSelectedValues(values);
        } else {
            // Single checkbox
            setSelectedValues(fieldValue ? [fieldValue as OptionValue] : []);
        }
    }, [fieldValue, multiple]);

    /**
     * Normalize options to consistent format
     */
    const normalizeOptions = (opts: NormalizedOption[]): CheckboxOption[] => {
        return opts.map(option => {
            if (typeof option === 'string') {
                return { value: option, label: option };
            }
            return {
                value: option.value,
                label: option.label || String(option.value),
                disabled: option.disabled,
                description: option.description
            };
        });
    };

    /**
     * Validate selected values
     */
    const validateSelection = (selection: OptionValue[]): string[] => {
        const errors: string[] = [];

        // Required validation
        if (required && (!selection || selection.length === 0)) {
            errors.push('This field is required');
        }

        // Max selections validation
        if (maxSelections && selection.length > maxSelections) {
            errors.push(`Maximum ${maxSelections} selection${maxSelections > 1 ? 's' : ''} allowed`);
        }

        // Custom validation
        if (validation.custom && typeof validation.custom === 'function') {
            const customError = validation.custom(selection);
            if (customError) {
                errors.push(customError);
            }
        }

        return errors;
    };

    /**
     * Handle single checkbox change
     */
    const handleSingleCheckboxChange = (checked: boolean) => {
        const newValue = checked;
        const newSelection: OptionValue[] = [];

        setSelectedValues(newSelection);

        const errors = validateSelection(newSelection);
        setValidationMessage(errors[0] || '');

        onChange?.(newValue);
        formField?.setValue?.(newValue);
    };

    /**
     * Handle checkbox group change
     */
    const handleGroupCheckboxChange = (optionValue: OptionValue, checked: boolean) => {
        let newSelection: OptionValue[];

        if (checked) {
            newSelection = [...selectedValues, optionValue];
        } else {
            newSelection = selectedValues.filter(val => val !== optionValue);
        }

        setSelectedValues(newSelection);

        const errors = validateSelection(newSelection);
        setValidationMessage(errors[0] || '');

        onChange?.(newSelection);
        formField?.setValue?.(newSelection);
    };

    /**
     * Handle select all/none for checkbox groups
     */
    const handleSelectAll = () => {
        const normalizedOptions = normalizeOptions(options);
        const enabledOptions = normalizedOptions.filter(opt => !opt.disabled);
        const allValues = enabledOptions.map(opt => opt.value);

        const newSelection = selectedValues.length === allValues.length ? [] : allValues;
        setSelectedValues(newSelection);

        const errors = validateSelection(newSelection);
        setValidationMessage(errors[0] || '');

        onChange?.(newSelection);
        formField?.setValue?.(newSelection);
    };

    /**
     * Get layout classes
     */
    const getLayoutClasses = (): string => {
        switch (layout) {
            case 'horizontal':
                return 'flex flex-wrap gap-4';
            case 'grid':
                return 'grid grid-cols-2 gap-2';
            default:
                return 'space-y-2';
        }
    };

    /**
     * Render single checkbox
     */
    const renderSingleCheckbox = () => {
        const isChecked = selectedValues.length > 0;

        return (
            <label className={`flex items-center cursor-pointer ${disabled || readOnly ? 'cursor-not-allowed opacity-50' : ''}`}>
                <div className="relative">
                    <input
                        type="checkbox"
                        id={id}
                        name={name || id}
                        checked={isChecked}
                        onChange={(e) => handleSingleCheckboxChange(e.target.checked)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        disabled={disabled}
                        readOnly={readOnly}
                        className="sr-only"
                        {...props}
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${isChecked
                            ? 'bg-blue-600 border-blue-600'
                            : `border-gray-300 ${!disabled && !readOnly ? 'hover:border-gray-400' : ''}`
                        } ${(fieldError || validationMessage) ? 'border-red-500' : ''}`}>
                        {isChecked && (
                            indeterminate ? (
                                <Minus className="w-3 h-3 text-white" />
                            ) : (
                                <Check className="w-3 h-3 text-white" />
                            )
                        )}
                    </div>
                </div>
                <span className="ml-2 text-sm text-gray-900">
                    {label}
                </span>
            </label>
        );
    };

    /**
     * Render checkbox group
     */
    const renderCheckboxGroup = () => {
        const normalizedOptions = normalizeOptions(options);

        if (normalizedOptions.length === 0) {
            return (
                <div className="text-sm text-gray-500">
                    No options available
                </div>
            );
        }

        return (
            <div>
                {/* Select All/None control */}
                {normalizedOptions.length > 3 && (
                    <div className="mb-3 pb-2 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            disabled={disabled || readOnly}
                            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {selectedValues.length === normalizedOptions.filter(opt => !opt.disabled).length
                                ? 'Deselect All'
                                : 'Select All'
                            }
                        </button>
                    </div>
                )}

                {/* Options */}
                <div className={getLayoutClasses()}>
                    {normalizedOptions.map(option => {
                        const isChecked = selectedValues.includes(option.value);
                        const isDisabled = disabled || readOnly || option.disabled;

                        return (
                            <label
                                key={String(option.value)}
                                className={`flex items-start cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                            >
                                <div className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => handleGroupCheckboxChange(option.value, e.target.checked)}
                                        disabled={isDisabled}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${isChecked
                                            ? 'bg-blue-600 border-blue-600'
                                            : `border-gray-300 ${!isDisabled ? 'hover:border-gray-400' : ''}`
                                        }`}>
                                        {isChecked && (
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        )}
                                    </div>
                                </div>
                                <div className="ml-2">
                                    <div className="text-sm text-gray-900">
                                        {option.label}
                                    </div>
                                    {option.description && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Selection count */}
                {selectedValues.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
                        {selectedValues.length} of {normalizedOptions.length} selected
                        {maxSelections && (
                            <span> (max {maxSelections})</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const fieldForWrapper: FieldWrapperCompatibleField = {
        id,
        name,
        label,
        required
    };

    if (multiple) {
        // Checkbox group
        return (
            <FieldWrapper
                field={fieldForWrapper}
                errors={[fieldError || validationMessage].filter(Boolean)}
                context={context}
            >
                {renderCheckboxGroup()}
            </FieldWrapper>
        );
    } else {
        // Single checkbox - don't use FieldWrapper since label is inline
        return (
            <div className={`checkbox-field ${className}`} style={style}>
                {renderSingleCheckbox()}
                {(fieldError || validationMessage) && (
                    <p className="mt-1 text-sm text-red-600">
                        {fieldError || validationMessage}
                    </p>
                )}
            </div>
        );
    }
};

export default CheckboxInput;
