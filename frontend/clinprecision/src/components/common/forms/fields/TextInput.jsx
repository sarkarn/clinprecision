import React from 'react';
import PropTypes from 'prop-types';
import { useFormValidation } from '../FormContext';
import { FieldWrapper } from './FieldWrapper';

/**
 * TextInput - Reusable text input field component
 */
export const TextInput = ({
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
    const fieldConfig = {
        placeholder: field.placeholder || field.metadata?.placeholder || '',
        maxLength: field.metadata?.maxLength || config.maxLength,
        minLength: field.metadata?.minLength || config.minLength,
        pattern: field.metadata?.pattern || config.pattern,
        mask: config.mask,
        allowAutocomplete: config.allowAutocomplete,
        ...config
    };

    // Handle input change
    const handleChange = (e) => {
        let newValue = e.target.value;

        // Apply input mask if provided
        if (fieldConfig.mask) {
            newValue = applyInputMask(newValue, fieldConfig.mask);
        }

        onChange(newValue);
    };

    // Apply input mask
    const applyInputMask = (value, mask) => {
        // Simple mask implementation (X = letter, 0 = number, - = literal)
        let maskedValue = '';
        let valueIndex = 0;

        for (let maskIndex = 0; maskIndex < mask.length && valueIndex < value.length; maskIndex++) {
            const maskChar = mask[maskIndex];
            const valueChar = value[valueIndex];

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

    // Get input classes
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

    // Render autocomplete suggestions (if enabled)
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

TextInput.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    mode: PropTypes.string,
    isReadOnly: PropTypes.bool,
    errors: PropTypes.array,
    context: PropTypes.string,
    config: PropTypes.object,
    customStyles: PropTypes.object,
    className: PropTypes.string
};

export default TextInput;