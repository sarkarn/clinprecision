import React, { useState, useEffect } from 'react';
import FormFieldRenderer from './FormFieldRenderer';
import './FormRenderer.css';

interface Field {
    id: string;
    name?: string;
    label?: string;
    type: string;
    required?: boolean;
    readOnly?: boolean;
    validation?: ValidationRules;
    [key: string]: any;
}

interface FormSection {
    id?: string;
    name?: string;
    description?: string;
    fields?: Field[];
}

interface FormDefinition {
    name?: string;
    description?: string;
    sections?: FormSection[];
    fields?: Field[];
    [key: string]: any;
}

interface ValidationRules {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
    minDate?: string;
    maxDate?: string;
    customValidator?: (value: any, allFormData: Record<string, any>, fieldDefinition: Field) => string | null;
}

interface CustomStyles {
    container?: React.CSSProperties;
    field?: Record<string, any>;
    [key: string]: any;
}

interface FormRendererProps {
    formDefinition: FormDefinition;
    formData?: Record<string, any>;
    mode?: 'entry' | 'view' | 'preview' | 'designer';
    onDataChange?: (data: Record<string, any>, fieldId?: string, value?: any) => void;
    onValidationChange?: (errors: Record<string, string[]>, isValid: boolean) => void;
    onSave?: (data: Record<string, any>, isAutoSave?: boolean) => Promise<void> | void;
    onCancel?: () => void;
    validationRules?: Record<string, ValidationRules>;
    fieldConfig?: Record<string, any>;
    showSections?: boolean;
    showProgress?: boolean;
    customStyles?: CustomStyles;
    className?: string;
    autoSave?: boolean;
    autoSaveDelay?: number;
    readOnlyFields?: string[];
    hiddenFields?: string[];
    context?: 'general' | 'study' | 'template' | 'patient';
    [key: string]: any;
}

/**
 * FormRenderer Component - Reusable form rendering engine
 * 
 * This component can render forms in different modes:
 * - 'entry': Interactive form for data entry with validation
 * - 'view': Read-only form display for viewing submitted data
 * - 'preview': Preview mode showing form structure without saving capability
 * - 'designer': Design mode showing form structure with edit capabilities
 */
const FormRenderer: React.FC<FormRendererProps> = ({
    formDefinition,
    formData = {},
    mode = 'entry',
    onDataChange = () => { },
    onValidationChange = () => { },
    onSave = () => { },
    onCancel = () => { },
    validationRules = {},
    fieldConfig = {},
    showSections = true,
    showProgress = false,
    customStyles = {},
    className = '',
    autoSave = false,
    autoSaveDelay = 2000,
    readOnlyFields = [],
    hiddenFields = [],
    context = 'general',
    ...props
}) => {
    const [currentData, setCurrentData] = useState<Record<string, any>>(formData);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [isValid, setIsValid] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    // Update internal data when external formData changes
    useEffect(() => {
        setCurrentData(formData);
        setIsDirty(false);
    }, [formData]);

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && isDirty && mode === 'entry') {
            if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
            }

            const timeout = setTimeout(() => {
                handleSave(true); // auto-save flag
            }, autoSaveDelay);

            setAutoSaveTimeout(timeout);

            return () => clearTimeout(timeout);
        }
    }, [currentData, isDirty, autoSave, autoSaveDelay]);

    // Validate individual field
    const validateField = (fieldDefinition: Field, value: any, allFormData: Record<string, any>): string[] => {
        const errors: string[] = [];
        const rules = validationRules[fieldDefinition.id] || fieldDefinition.validation || {};

        // Required validation
        if (fieldDefinition.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            errors.push(`${fieldDefinition.label || fieldDefinition.name} is required`);
        }

        // Type-specific validation
        if (value && value !== '') {
            switch (fieldDefinition.type) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push('Please enter a valid email address');
                    }
                    break;
                case 'number':
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        errors.push('Please enter a valid number');
                    } else {
                        if (rules.min !== undefined && numValue < rules.min) {
                            errors.push(`Value must be at least ${rules.min}`);
                        }
                        if (rules.max !== undefined && numValue > rules.max) {
                            errors.push(`Value must be at most ${rules.max}`);
                        }
                    }
                    break;
                case 'text':
                case 'textarea':
                    if (rules.minLength && value.length < rules.minLength) {
                        errors.push(`Must be at least ${rules.minLength} characters`);
                    }
                    if (rules.maxLength && value.length > rules.maxLength) {
                        errors.push(`Must be at most ${rules.maxLength} characters`);
                    }
                    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
                        errors.push(rules.patternMessage || 'Invalid format');
                    }
                    break;
                case 'date':
                    const dateValue = new Date(value);
                    if (isNaN(dateValue.getTime())) {
                        errors.push('Please enter a valid date');
                    } else {
                        if (rules.minDate && dateValue < new Date(rules.minDate)) {
                            errors.push(`Date must be on or after ${rules.minDate}`);
                        }
                        if (rules.maxDate && dateValue > new Date(rules.maxDate)) {
                            errors.push(`Date must be on or before ${rules.maxDate}`);
                        }
                    }
                    break;
            }
        }

        // Custom validation function
        if (rules.customValidator && typeof rules.customValidator === 'function') {
            const customError = rules.customValidator(value, allFormData, fieldDefinition);
            if (customError) {
                errors.push(customError);
            }
        }

        return errors;
    };

    // Handle field data changes
    const handleFieldChange = (fieldId: string, value: any, fieldDefinition?: Field) => {
        const newData = { ...currentData, [fieldId]: value };
        setCurrentData(newData);
        setIsDirty(true);

        // Immediate validation for the changed field
        if (mode === 'entry' && fieldDefinition) {
            const fieldErrors = validateField(fieldDefinition, value, newData);
            const newValidationErrors = { ...validationErrors };

            if (fieldErrors.length > 0) {
                newValidationErrors[fieldId] = fieldErrors;
            } else {
                delete newValidationErrors[fieldId];
            }

            setValidationErrors(newValidationErrors);
            const isFormValid = Object.keys(newValidationErrors).length === 0;
            setIsValid(isFormValid);

            onValidationChange(newValidationErrors, isFormValid);
        }

        onDataChange(newData, fieldId, value);
    };

    // Validate entire form
    const validateForm = (): Record<string, string[]> => {
        const errors: Record<string, string[]> = {};

        if (!formDefinition?.sections && !formDefinition?.fields) {
            return errors;
        }

        const allFields: Field[] = [];

        // Collect all fields from sections or direct fields array
        if (formDefinition.sections) {
            formDefinition.sections.forEach(section => {
                if (section.fields) {
                    allFields.push(...section.fields);
                }
            });
        } else if (formDefinition.fields) {
            allFields.push(...formDefinition.fields);
        }

        // Validate each field
        allFields.forEach(field => {
            if (!hiddenFields.includes(field.id)) {
                const fieldErrors = validateField(field, currentData[field.id], currentData);
                if (fieldErrors.length > 0) {
                    errors[field.id] = fieldErrors;
                }
            }
        });

        return errors;
    };

    // Handle form save
    const handleSave = async (isAutoSave = false) => {
        if (mode !== 'entry') return;

        setIsSaving(true);
        try {
            // Final validation before save
            const finalErrors = validateForm();
            if (Object.keys(finalErrors).length > 0) {
                setValidationErrors(finalErrors);
                setIsValid(false);
                if (!isAutoSave) {
                    // Only show validation errors for manual save, not auto-save
                    return;
                }
            }

            await onSave(currentData, isAutoSave);
            if (!isAutoSave) {
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Error saving form:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate completion percentage
    const getCompletionPercentage = (): number => {
        if (!formDefinition) return 0;

        const allFields: Field[] = [];

        if (formDefinition.sections) {
            formDefinition.sections.forEach(section => {
                if (section.fields) {
                    allFields.push(...section.fields);
                }
            });
        } else if (formDefinition.fields) {
            allFields.push(...formDefinition.fields);
        }

        const visibleFields = allFields.filter(field => !hiddenFields.includes(field.id));
        const completedFields = visibleFields.filter(field => {
            const value = currentData[field.id];
            return value !== undefined && value !== null && value !== '';
        });

        return visibleFields.length > 0 ? Math.round((completedFields.length / visibleFields.length) * 100) : 0;
    };

    // Render individual field
    const renderField = (field: Field) => {
        if (hiddenFields.includes(field.id)) {
            return null;
        }

        const isReadOnly = mode === 'view' || readOnlyFields.includes(field.id) || field.readOnly;
        const fieldErrors = validationErrors[field.id] || [];
        const fieldValue = currentData[field.id];

        return (
            <FormFieldRenderer
                key={field.id}
                field={field}
                value={fieldValue}
                onChange={handleFieldChange}
                mode={mode}
                isReadOnly={isReadOnly}
                errors={fieldErrors}
                context={context}
                config={fieldConfig[field.id] || {}}
                customStyles={customStyles.field || {}}
                {...(fieldConfig[field.id] || {})}
            />
        );
    };

    // Render form sections or fields
    const renderFormContent = () => {
        if (!formDefinition) {
            return <div className="text-gray-500">No form definition provided</div>;
        }

        if (formDefinition.sections && showSections) {
            return formDefinition.sections.map((section, index) => (
                <div key={section.id || index} className="form-section mb-6">
                    {section.name && (
                        <div className="section-header mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                            {section.description && (
                                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                            )}
                        </div>
                    )}
                    <div className="section-fields space-y-4">
                        {section.fields?.map(field => renderField(field))}
                    </div>
                </div>
            ));
        } else {
            // Render fields directly
            const fields = formDefinition.fields || [];
            return (
                <div className="form-fields space-y-4">
                    {fields.map(field => renderField(field))}
                </div>
            );
        }
    };

    return (
        <div className={`form-renderer form-renderer--${mode} ${className}`} style={customStyles.container}>
                {/* Form Header */}
                {formDefinition?.name && (
                    <div className="form-header mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">{formDefinition.name}</h2>
                        {formDefinition.description && (
                            <p className="text-gray-600 mt-1">{formDefinition.description}</p>
                        )}

                        {/* Progress indicator */}
                        {showProgress && mode === 'entry' && (
                            <div className="mt-3">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Completion Progress</span>
                                    <span>{getCompletionPercentage()}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getCompletionPercentage()}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Auto-save indicator */}
                        {autoSave && mode === 'entry' && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isSaving ? 'bg-yellow-400' : isDirty ? 'bg-orange-400' : 'bg-green-400'
                                    }`} />
                                {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'All changes saved'}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Content */}
                <div className="form-content">
                    {renderFormContent()}
                </div>

                {/* Form Actions */}
                {mode === 'entry' && !autoSave && (
                    <div className="form-actions flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave(false)}
                            disabled={isSaving || !isDirty}
                            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaving || !isDirty
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}

                {/* Validation Summary */}
                {mode === 'entry' && Object.keys(validationErrors).length > 0 && (
                    <div className="validation-summary mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Please correct the following errors:</h4>
                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                            {Object.entries(validationErrors).map(([fieldId, errors]) => (
                                errors.map((error, index) => (
                                    <li key={`${fieldId}-${index}`}>{error}</li>
                                ))
                            ))}
                        </ul>
                    </div>
                )}
            </div>
    );
};

export default FormRenderer;
