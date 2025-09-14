import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from './fields/TextInput';
import { NumberInput } from './fields/NumberInput';
import { DateInput } from './fields/DateInput';
import { TimeInput } from './fields/TimeInput';
import { DateTimeInput } from './fields/DateTimeInput';
import { TextareaInput } from './fields/TextareaInput';
import { SelectInput } from './fields/SelectInput';
import { MultiSelectInput } from './fields/MultiSelectInput';
import { RadioInput } from './fields/RadioInput';
import { CheckboxInput } from './fields/CheckboxInput';
import { FileInput } from './fields/FileInput';
import { EmailInput } from './fields/EmailInput';
import { TelInput } from './fields/TelInput';
import { UrlInput } from './fields/UrlInput';
import { RangeInput } from './fields/RangeInput';
import { ReadOnlyDisplay } from './fields/ReadOnlyDisplay';

/**
 * FormFieldRenderer - Renders individual form fields based on type
 * 
 * @param {Object} field - Field definition with type, validation, metadata
 * @param {*} value - Current field value
 * @param {Function} onChange - Callback when field value changes
 * @param {string} mode - Form rendering mode ('entry', 'view', 'preview', 'designer')
 * @param {boolean} isReadOnly - Whether field should be read-only
 * @param {Array} errors - Validation errors for this field
 * @param {string} context - Form context ('general', 'study', 'template', 'patient')
 * @param {Object} config - Additional field configuration
 * @param {Object} customStyles - Custom styling overrides
 */
export const FormFieldRenderer = ({
    field,
    value,
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
    // Field change handler
    const handleChange = (newValue) => {
        if (!isReadOnly && mode === 'entry') {
            onChange(field.id, newValue, field);
        }
    };

    // Common props for all field components
    const commonProps = {
        field,
        value,
        onChange: handleChange,
        mode,
        isReadOnly,
        errors,
        context,
        config,
        customStyles,
        className: `form-field form-field--${field.type} ${className}`,
        'data-field-id': field.id,
        'data-field-type': field.type,
        'data-context': context,
        ...props
    };

    // For view mode or read-only, use ReadOnlyDisplay
    if (mode === 'view' || isReadOnly) {
        return <ReadOnlyDisplay {...commonProps} />;
    }

    // Render appropriate input component based on field type
    switch (field.type) {
        case 'text':
            return <TextInput {...commonProps} />;

        case 'email':
            return <EmailInput {...commonProps} />;

        case 'tel':
        case 'phone':
            return <TelInput {...commonProps} />;

        case 'url':
            return <UrlInput {...commonProps} />;

        case 'number':
        case 'integer':
        case 'float':
        case 'decimal':
            return <NumberInput {...commonProps} />;

        case 'date':
            return <DateInput {...commonProps} />;

        case 'time':
            return <TimeInput {...commonProps} />;

        case 'datetime':
        case 'datetime-local':
            return <DateTimeInput {...commonProps} />;

        case 'textarea':
        case 'longtext':
            return <TextareaInput {...commonProps} />;

        case 'select':
        case 'dropdown':
            return <SelectInput {...commonProps} />;

        case 'multiselect':
        case 'multi-select':
            return <MultiSelectInput {...commonProps} />;

        case 'radio':
        case 'radio-group':
            return <RadioInput {...commonProps} />;

        case 'checkbox':
        case 'checkbox-group':
            return <CheckboxInput {...commonProps} />;

        case 'file':
        case 'upload':
            return <FileInput {...commonProps} />;

        case 'range':
        case 'slider':
            return <RangeInput {...commonProps} />;

        // Clinical-specific field types
        case 'vital-sign':
            return <NumberInput {...commonProps} config={{ ...config, showUnits: true }} />;

        case 'medication':
            return <SelectInput {...commonProps} config={{ ...config, allowSearch: true }} />;

        case 'dose':
            return <NumberInput {...commonProps} config={{ ...config, showUnits: true, precision: 2 }} />;

        case 'lab-value':
            return <NumberInput {...commonProps} config={{ ...config, showUnits: true, showReference: true }} />;

        case 'adverse-event':
            return <SelectInput {...commonProps} config={{ ...config, allowOther: true }} />;

        case 'conmed':
            return <TextInput {...commonProps} config={{ ...config, allowAutocomplete: true }} />;

        // Custom field types for specific contexts
        case 'study-phase':
            return <SelectInput {...commonProps} config={{
                ...config,
                options: ['Phase I', 'Phase II', 'Phase III', 'Phase IV']
            }} />;

        case 'randomization-code':
            return <TextInput {...commonProps} config={{ ...config, mask: 'XXX-000', readOnly: true }} />;

        case 'subject-id':
            return <TextInput {...commonProps} config={{ ...config, pattern: '^[A-Z0-9-]+$' }} />;

        default:
            // Fallback to text input for unknown types
            console.warn(`Unknown field type: ${field.type}. Falling back to text input.`);
            return <TextInput {...commonProps} />;
    }
};

FormFieldRenderer.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        required: PropTypes.bool,
        readOnly: PropTypes.bool,
        validation: PropTypes.object,
        metadata: PropTypes.object,
        options: PropTypes.array
    }).isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['entry', 'view', 'preview', 'designer']),
    isReadOnly: PropTypes.bool,
    errors: PropTypes.array,
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    config: PropTypes.object,
    customStyles: PropTypes.object,
    className: PropTypes.string
};

export default FormFieldRenderer;