import React from 'react';
import { useFormValidation } from '../FormContext';
import { FieldWrapper } from './FieldWrapper';

interface FieldMetadata {
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    required?: boolean;
    helpText?: string;
    description?: string;
}

interface Field {
    id: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    metadata?: FieldMetadata;
}

interface FieldConfig {
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    mask?: string;
    allowAutocomplete?: boolean;
    suggestions?: string[];
}

interface CustomStyles {
    wrapper?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    helpText?: React.CSSProperties;
    errors?: React.CSSProperties;
}

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    field: Field;
    value?: string;
    onChange: (value: string) => void;
    mode?: 'entry' | 'view' | 'edit';
    isReadOnly?: boolean;
    errors?: string[];
    context?: 'general' | 'study' | 'template' | 'patient';
    config?: FieldConfig;
    customStyles?: CustomStyles;
    className?: string;
}

/**
 * TextInput - Reusable text input field component
 */
export const TextInput: React.FC<TextInputProps> = ({
    field,
    value = '',
    onChange,
    mode = 'entry',
    isReadOnly = false,
    errors = [],
    context = 'general',
    config = {},
    customStyles = {},
    className = '',
    ...props
}) => {
    const validation = useFormValidation();
    const fieldErrors = errors.length > 0 ? errors : validation.getErrors(field.id);
    const hasError = fieldErrors.length > 0;

    // Merge field metadata with config
    const fieldConfig: FieldConfig = {
        placeholder: field.placeholder || field.metadata?.placeholder || '',
        maxLength: field.metadata?.maxLength || config.maxLength,
        minLength: field.metadata?.minLength || config.minLength,
        pattern: field.metadata?.pattern || config.pattern,
        mask: config.mask,
        allowAutocomplete: config.allowAutocomplete,
        suggestions: config.suggestions,
        ...config
    };

    /**
     * Apply input mask
     * Simple mask implementation (X = letter, 0 = number, - = literal)
     */
    const applyInputMask = (inputValue: string, mask: string): string => {
        let maskedValue = '';
        let valueIndex = 0;

        for (let maskIndex = 0; maskIndex < mask.length && valueIndex < inputValue.length; maskIndex++) {
            const maskChar = mask[maskIndex];
            const valueChar = inputValue[valueIndex];

            if (maskChar === 'X' && /[A-Za-z]/.test(valueChar)) {
                maskedValue += valueChar.toUpperCase();
                valueIndex++;
            } else if (maskChar === '0' && /[0-9]/.test(valueChar)) {
                maskedValue += valueChar;
                valueIndex++;
            } else if (maskChar === '-') {
                maskedValue += '-';
                if (valueChar !== '-') {
                    // Skip non-matching literal characters in input
                    continue;
                } else {
                    valueIndex++;
                }
            } else {
                // Skip invalid characters
                valueIndex++;
                maskIndex--;
            }
        }

        return maskedValue;
    };

    /**
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Apply input mask if provided
        if (fieldConfig.mask) {
            newValue = applyInputMask(newValue, fieldConfig.mask);
        }

        onChange(newValue);
    };

    /**
     * Get input classes
     */
    const getInputClasses = () => {
        const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
        const errorClasses = hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
        const readOnlyClasses = isReadOnly
            ? "bg-gray-50 cursor-not-allowed text-gray-500"
            : "bg-white";

        return `${baseClasses} ${errorClasses} ${readOnlyClasses} ${className}`;
    };

    /**
     * Render autocomplete suggestions (if enabled)
     */
    const renderAutocomplete = () => {
        if (!fieldConfig.allowAutocomplete || !fieldConfig.suggestions) {
            return null;
        }

        return (
            <datalist id={`${field.id}-suggestions`}>
                {fieldConfig.suggestions.map((suggestion, index) => (
                    <option key={index} value={suggestion} />
                ))}
            </datalist>
        );
    };

    return (
        <FieldWrapper
            field={field}
            errors={fieldErrors}
            context={context}
            customStyles={customStyles}
        >
            <input
                type="text"
                id={field.id}
                name={field.id}
                value={value}
                onChange={handleChange}
                placeholder={fieldConfig.placeholder}
                className={getInputClasses()}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                required={field.required}
                maxLength={fieldConfig.maxLength}
                minLength={fieldConfig.minLength}
                pattern={fieldConfig.pattern}
                list={fieldConfig.allowAutocomplete ? `${field.id}-suggestions` : undefined}
                autoComplete={fieldConfig.allowAutocomplete ? 'on' : 'off'}
                style={customStyles.input}
                aria-describedby={hasError ? `${field.id}-error` : undefined}
                aria-invalid={hasError}
                {...props}
            />
            {renderAutocomplete()}
        </FieldWrapper>
    );
};

export default TextInput;
