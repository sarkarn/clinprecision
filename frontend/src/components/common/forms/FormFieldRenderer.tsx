import React from 'react';
import TextInput from './fields/TextInput';
import NumberInput from './fields/NumberInput';
import DateInput from './fields/DateInput';
import SelectInput from './fields/SelectInput';
import CheckboxInput from './fields/CheckboxInput';
import ReadOnlyDisplay from './fields/ReadOnlyDisplay';

interface Field {
    id: string;
    type: string;
    name?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
    validation?: Record<string, any>;
    metadata?: Record<string, any>;
    options?: Array<{ value: string | number; label: string }>;
}

interface FieldConfig {
    showUnits?: boolean;
    precision?: number;
    allowSearch?: boolean;
    allowOther?: boolean;
    allowAutocomplete?: boolean;
    mask?: string;
    pattern?: string;
    options?: string[];
    [key: string]: any;
}

interface CustomStyles {
    wrapper?: React.CSSProperties;
    label?: React.CSSProperties;
    input?: React.CSSProperties;
    helpText?: React.CSSProperties;
    errors?: React.CSSProperties;
}

interface FormFieldRendererProps {
    field: Field;
    value?: any;
    onChange: (fieldId: string, newValue: any, field: Field) => void;
    mode?: 'entry' | 'view' | 'preview' | 'designer';
    isReadOnly?: boolean;
    errors?: string[];
    context?: 'general' | 'study' | 'template' | 'patient';
    config?: FieldConfig;
    customStyles?: CustomStyles;
    className?: string;
    [key: string]: any;
}

/**
 * FormFieldRenderer - Renders individual form fields based on type
 * 
 * @param field - Field definition with type, validation, metadata
 * @param value - Current field value
 * @param onChange - Callback when field value changes
 * @param mode - Form rendering mode ('entry', 'view', 'preview', 'designer')
 * @param isReadOnly - Whether field should be read-only
 * @param errors - Validation errors for this field
 * @param context - Form context ('general', 'study', 'template', 'patient')
 * @param config - Additional field configuration
 * @param customStyles - Custom styling overrides
 */
export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
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
    /**
     * Field change handler
     */
    const handleChange = (newValue: any) => {
        if (!isReadOnly && mode === 'entry') {
            onChange(field.id, newValue, field);
        }
    };

    // Common props for all field components
    const commonProps = {
        field,
        id: field.id,
        name: field.name || field.id,
        label: field.label || field.name || field.id,
        value,
        onChange: handleChange,
        required: field.required,
        readOnly: field.readOnly || isReadOnly,
        options: field.options,
        errors,
        context,
        customStyles,
        className: `form-field form-field--${field.type} ${className}`,
        ...props
    };

    // For view mode or read-only, use ReadOnlyDisplay
    if (mode === 'view' || isReadOnly) {
        return <ReadOnlyDisplay {...commonProps} />;
    }

    // Render appropriate input component based on field type
    switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'phone':
        case 'url':
            return <TextInput {...commonProps} />;

        case 'number':
        case 'integer':
        case 'float':
        case 'decimal':
            return <NumberInput {...commonProps} />;

        case 'date':
        case 'time':
        case 'datetime':
        case 'datetime-local':
            return <DateInput {...commonProps} fieldType={field.type as any} />;

        case 'textarea':
        case 'longtext':
            return <TextInput {...commonProps} />;

        case 'select':
        case 'dropdown':
            return <SelectInput {...commonProps} />;

        case 'multiselect':
        case 'multi-select':
            return <SelectInput {...commonProps} multiple />;

        case 'radio':
        case 'radio-group':
            return <SelectInput {...commonProps} />;

        case 'checkbox':
        case 'checkbox-group':
            return <CheckboxInput {...commonProps} />;

        case 'file':
        case 'upload':
            return <TextInput {...commonProps} />;

        case 'range':
        case 'slider':
            return <NumberInput {...commonProps} />;

        // Clinical-specific field types
        case 'vital-sign':
        case 'medication':
        case 'dose':
        case 'lab-value':
            return <NumberInput {...commonProps} />;

        case 'adverse-event':
        case 'study-phase':
            return <SelectInput {...commonProps} />;

        case 'conmed':
        case 'randomization-code':
        case 'subject-id':
            return <TextInput {...commonProps} />;

        default:
            // Fallback to text input for unknown types
            console.warn(`Unknown field type: ${field.type}. Falling back to text input.`);
            return <TextInput {...commonProps} />;
    }
};

export default FormFieldRenderer;
