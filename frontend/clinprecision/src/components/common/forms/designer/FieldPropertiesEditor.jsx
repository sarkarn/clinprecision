import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash2, Eye, EyeOff, Copy, Check, AlertCircle } from 'lucide-react';

/**
 * FieldPropertiesEditor - Edits field properties and configuration
 * Used within FormDesigner for editing selected field properties
 */
const FieldPropertiesEditor = ({
    field,
    context = 'general',
    onSave,
    onCancel,
    onDelete,
    onDuplicate,
    availableFieldTypes = [],
    customValidators = {},
    className = ''
}) => {
    const [editedField, setEditedField] = useState({ ...field });
    const [activeTab, setActiveTab] = useState('basic');
    const [validationErrors, setValidationErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // Update local state when field changes
    useEffect(() => {
        setEditedField({ ...field });
        setIsDirty(false);
        setValidationErrors({});
    }, [field]);

    // Field type configurations
    const fieldTypeConfigs = {
        text: {
            supportedAttributes: ['placeholder', 'maxLength', 'pattern', 'autocomplete'],
            validationRules: ['required', 'minLength', 'maxLength', 'pattern'],
            defaultMetadata: { maxLength: 255 }
        },
        textarea: {
            supportedAttributes: ['placeholder', 'rows', 'cols', 'maxLength'],
            validationRules: ['required', 'minLength', 'maxLength'],
            defaultMetadata: { rows: 4, maxLength: 1000 }
        },
        number: {
            supportedAttributes: ['min', 'max', 'step', 'placeholder'],
            validationRules: ['required', 'min', 'max', 'integer'],
            defaultMetadata: { step: 1 }
        },
        email: {
            supportedAttributes: ['placeholder', 'maxLength'],
            validationRules: ['required', 'email'],
            defaultMetadata: { maxLength: 255 }
        },
        tel: {
            supportedAttributes: ['placeholder', 'pattern'],
            validationRules: ['required', 'pattern'],
            defaultMetadata: {}
        },
        url: {
            supportedAttributes: ['placeholder'],
            validationRules: ['required', 'url'],
            defaultMetadata: {}
        },
        date: {
            supportedAttributes: ['min', 'max'],
            validationRules: ['required', 'dateRange'],
            defaultMetadata: {}
        },
        time: {
            supportedAttributes: ['min', 'max', 'step'],
            validationRules: ['required', 'timeRange'],
            defaultMetadata: { step: 60 }
        },
        datetime: {
            supportedAttributes: ['min', 'max'],
            validationRules: ['required', 'datetimeRange'],
            defaultMetadata: {}
        },
        select: {
            supportedAttributes: ['options', 'placeholder'],
            validationRules: ['required', 'validOption'],
            defaultMetadata: { options: [] },
            requiresOptions: true
        },
        multiselect: {
            supportedAttributes: ['options', 'placeholder', 'maxSelections'],
            validationRules: ['required', 'validOptions', 'maxSelections'],
            defaultMetadata: { options: [], maxSelections: null },
            requiresOptions: true
        },
        radio: {
            supportedAttributes: ['options', 'layout'],
            validationRules: ['required', 'validOption'],
            defaultMetadata: { options: [], layout: 'vertical' },
            requiresOptions: true
        },
        'checkbox-group': {
            supportedAttributes: ['options', 'layout', 'maxSelections'],
            validationRules: ['required', 'validOptions', 'maxSelections'],
            defaultMetadata: { options: [], layout: 'vertical', maxSelections: null },
            requiresOptions: true
        },
        checkbox: {
            supportedAttributes: ['checkedValue', 'uncheckedValue'],
            validationRules: ['required'],
            defaultMetadata: { checkedValue: true, uncheckedValue: false }
        },
        file: {
            supportedAttributes: ['accept', 'multiple', 'maxSize', 'maxFiles'],
            validationRules: ['required', 'fileType', 'fileSize', 'maxFiles'],
            defaultMetadata: { multiple: false, maxFiles: 1, maxSize: 10485760 }
        },
        range: {
            supportedAttributes: ['min', 'max', 'step'],
            validationRules: ['required', 'min', 'max'],
            defaultMetadata: { min: 0, max: 100, step: 1 }
        }
    };

    // Get current field type config
    const getCurrentConfig = () => {
        return fieldTypeConfigs[editedField.type] || {
            supportedAttributes: [],
            validationRules: [],
            defaultMetadata: {}
        };
    };

    // Handle field property changes
    const handleFieldChange = (property, value) => {
        const updatedField = { ...editedField };

        if (property.includes('.')) {
            // Handle nested properties like 'metadata.placeholder'
            const parts = property.split('.');
            let current = updatedField;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } else {
            updatedField[property] = value;
        }

        // Auto-generate field ID from label if needed
        if (property === 'label' && (!editedField.id || editedField.id === generateFieldId(editedField.label))) {
            updatedField.id = generateFieldId(value);
        }

        // Handle field type changes
        if (property === 'type') {
            const newConfig = fieldTypeConfigs[value] || {};
            updatedField.metadata = {
                ...newConfig.defaultMetadata,
                ...updatedField.metadata
            };

            // Clear incompatible validation rules
            if (updatedField.validation) {
                const supportedRules = newConfig.validationRules || [];
                const filteredValidation = {};
                supportedRules.forEach(rule => {
                    if (updatedField.validation[rule] !== undefined) {
                        filteredValidation[rule] = updatedField.validation[rule];
                    }
                });
                updatedField.validation = filteredValidation;
            }
        }

        setEditedField(updatedField);
        setIsDirty(true);

        // Clear validation error for this field
        if (validationErrors[property]) {
            const newErrors = { ...validationErrors };
            delete newErrors[property];
            setValidationErrors(newErrors);
        }
    };

    // Generate field ID from label
    const generateFieldId = (label) => {
        return label
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    // Validate field
    const validateField = () => {
        const errors = {};

        // Required fields
        if (!editedField.label?.trim()) {
            errors.label = 'Label is required';
        }

        if (!editedField.id?.trim()) {
            errors.id = 'Field ID is required';
        } else if (!/^[a-z][a-z0-9_]*$/i.test(editedField.id)) {
            errors.id = 'Field ID must start with a letter and contain only letters, numbers, and underscores';
        }

        // Field type specific validation
        const config = getCurrentConfig();

        if (config.requiresOptions) {
            if (!editedField.options || editedField.options.length === 0) {
                errors.options = 'At least one option is required';
            }
        }

        // Custom validation
        if (customValidators[editedField.type]) {
            const customErrors = customValidators[editedField.type](editedField);
            Object.assign(errors, customErrors);
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle save
    const handleSave = () => {
        if (validateField()) {
            onSave(editedField);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (isDirty) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    // Handle option management for select/radio/checkbox fields
    const handleOptionAdd = () => {
        const currentOptions = editedField.options || [];
        const newOption = {
            value: `option_${currentOptions.length + 1}`,
            label: `Option ${currentOptions.length + 1}`
        };
        handleFieldChange('options', [...currentOptions, newOption]);
    };

    const handleOptionChange = (index, property, value) => {
        const currentOptions = [...(editedField.options || [])];
        if (typeof currentOptions[index] === 'string') {
            // Convert string options to objects
            currentOptions[index] = { value: currentOptions[index], label: currentOptions[index] };
        }
        currentOptions[index] = { ...currentOptions[index], [property]: value };
        handleFieldChange('options', currentOptions);
    };

    const handleOptionRemove = (index) => {
        const currentOptions = [...(editedField.options || [])];
        currentOptions.splice(index, 1);
        handleFieldChange('options', currentOptions);
    };

    // Render basic properties tab
    const renderBasicTab = () => (
        <div className="space-y-4">
            {/* Field Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Type
                </label>
                <select
                    value={editedField.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {availableFieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Label */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label *
                </label>
                <input
                    type="text"
                    value={editedField.label || ''}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.label ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Enter field label"
                />
                {validationErrors.label && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.label}</p>
                )}
            </div>

            {/* Field ID */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field ID *
                </label>
                <input
                    type="text"
                    value={editedField.id || ''}
                    onChange={(e) => handleFieldChange('id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="field_id"
                />
                {validationErrors.id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.id}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={editedField.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional field description or help text"
                />
            </div>

            {/* Required */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="required"
                    checked={editedField.required || false}
                    onChange={(e) => handleFieldChange('required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                    Required field
                </label>
            </div>

            {/* Read Only */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="readonly"
                    checked={editedField.readOnly || false}
                    onChange={(e) => handleFieldChange('readOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="readonly" className="ml-2 text-sm text-gray-700">
                    Read only
                </label>
            </div>

            {/* Hidden */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="hidden"
                    checked={editedField.hidden || false}
                    onChange={(e) => handleFieldChange('hidden', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hidden" className="ml-2 text-sm text-gray-700">
                    Hidden field
                </label>
            </div>
        </div>
    );

    // Render validation tab
    const renderValidationTab = () => {
        const config = getCurrentConfig();

        return (
            <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                    Configure validation rules for this field type: <strong>{editedField.type}</strong>
                </div>

                {config.validationRules.includes('minLength') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Length
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={editedField.validation?.minLength || ''}
                            onChange={(e) => handleFieldChange('validation.minLength', parseInt(e.target.value) || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {config.validationRules.includes('maxLength') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Length
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={editedField.validation?.maxLength || ''}
                            onChange={(e) => handleFieldChange('validation.maxLength', parseInt(e.target.value) || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {config.validationRules.includes('min') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Value
                        </label>
                        <input
                            type="number"
                            value={editedField.validation?.min || ''}
                            onChange={(e) => handleFieldChange('validation.min', parseFloat(e.target.value) || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {config.validationRules.includes('max') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Value
                        </label>
                        <input
                            type="number"
                            value={editedField.validation?.max || ''}
                            onChange={(e) => handleFieldChange('validation.max', parseFloat(e.target.value) || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {config.validationRules.includes('pattern') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pattern (Regular Expression)
                        </label>
                        <input
                            type="text"
                            value={editedField.validation?.pattern || ''}
                            onChange={(e) => handleFieldChange('validation.pattern', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., ^[A-Za-z]+$"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Regular expression pattern for validation
                        </p>
                    </div>
                )}

                {/* Custom Validation Message */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Validation Message
                    </label>
                    <input
                        type="text"
                        value={editedField.validation?.message || ''}
                        onChange={(e) => handleFieldChange('validation.message', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Custom error message for validation failures"
                    />
                </div>
            </div>
        );
    };

    // Render options tab (for select, radio, checkbox-group fields)
    const renderOptionsTab = () => {
        if (!getCurrentConfig().requiresOptions) {
            return (
                <div className="text-center py-8 text-gray-500">
                    Options are not applicable for this field type.
                </div>
            );
        }

        const options = editedField.options || [];

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Options</h4>
                    <button
                        type="button"
                        onClick={handleOptionAdd}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                    </button>
                </div>

                {options.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No options defined. Click "Add Option" to create the first option.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {options.map((option, index) => {
                            const isStringOption = typeof option === 'string';
                            const optionValue = isStringOption ? option : option.value;
                            const optionLabel = isStringOption ? option : option.label;

                            return (
                                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Value</label>
                                            <input
                                                type="text"
                                                value={optionValue}
                                                onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Label</label>
                                            <input
                                                type="text"
                                                value={optionLabel}
                                                onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleOptionRemove(index)}
                                        className="p-1 text-red-600 hover:text-red-700"
                                        title="Remove option"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {validationErrors.options && (
                    <p className="text-sm text-red-600">{validationErrors.options}</p>
                )}
            </div>
        );
    };

    // Render advanced tab
    const renderAdvancedTab = () => {
        const config = getCurrentConfig();

        return (
            <div className="space-y-4">
                {/* Placeholder */}
                {config.supportedAttributes.includes('placeholder') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Placeholder Text
                        </label>
                        <input
                            type="text"
                            value={editedField.metadata?.placeholder || ''}
                            onChange={(e) => handleFieldChange('metadata.placeholder', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* CSS Classes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSS Classes
                    </label>
                    <input
                        type="text"
                        value={editedField.className || ''}
                        onChange={(e) => handleFieldChange('className', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="custom-class another-class"
                    />
                </div>

                {/* Field Width */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Width
                    </label>
                    <select
                        value={editedField.width || 'full'}
                        onChange={(e) => handleFieldChange('width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                        <option value="third">One Third</option>
                        <option value="quarter">One Quarter</option>
                    </select>
                </div>

                {/* Field Order */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                    </label>
                    <input
                        type="number"
                        value={editedField.order || ''}
                        onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Conditional Logic */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Show When (Conditional Logic)
                    </label>
                    <textarea
                        value={editedField.conditions || ''}
                        onChange={(e) => handleFieldChange('conditions', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., other_field === 'value'"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        JavaScript expression that determines when this field should be visible
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={`field-properties-editor bg-white border rounded-lg shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                    Edit Field: {editedField.label || 'Untitled Field'}
                </h3>
                <div className="flex items-center space-x-2">
                    {onDuplicate && (
                        <button
                            type="button"
                            onClick={() => onDuplicate(editedField)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title="Duplicate Field"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(editedField.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Delete Field"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="p-2 text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <nav className="-mb-px flex">
                    {[
                        { id: 'basic', label: 'Basic' },
                        { id: 'validation', label: 'Validation' },
                        { id: 'options', label: 'Options' },
                        { id: 'advanced', label: 'Advanced' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 px-4 text-sm font-medium border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                            {tab.id === 'options' && getCurrentConfig().requiresOptions && (
                                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {(editedField.options || []).length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activeTab === 'basic' && renderBasicTab()}
                {activeTab === 'validation' && renderValidationTab()}
                {activeTab === 'options' && renderOptionsTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="flex items-center text-sm text-gray-500">
                    {isDirty && (
                        <>
                            <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                            Unsaved changes
                        </>
                    )}
                    {Object.keys(validationErrors).length > 0 && (
                        <>
                            <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                            {Object.keys(validationErrors).length} validation error(s)
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!isDirty || Object.keys(validationErrors).length > 0}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

FieldPropertiesEditor.propTypes = {
    field: PropTypes.object.isRequired,
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onDuplicate: PropTypes.func,
    availableFieldTypes: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
    })),
    customValidators: PropTypes.object,
    className: PropTypes.string
};

FieldPropertiesEditor.defaultProps = {
    availableFieldTypes: [
        { value: 'text', label: 'Text Input' },
        { value: 'textarea', label: 'Text Area' },
        { value: 'number', label: 'Number' },
        { value: 'email', label: 'Email' },
        { value: 'tel', label: 'Phone' },
        { value: 'url', label: 'URL' },
        { value: 'date', label: 'Date' },
        { value: 'time', label: 'Time' },
        { value: 'datetime', label: 'Date & Time' },
        { value: 'select', label: 'Dropdown' },
        { value: 'multiselect', label: 'Multi-Select' },
        { value: 'radio', label: 'Radio Buttons' },
        { value: 'checkbox-group', label: 'Checkboxes' },
        { value: 'checkbox', label: 'Single Checkbox' },
        { value: 'file', label: 'File Upload' },
        { value: 'range', label: 'Range Slider' }
    ],
    customValidators: {}
};

export default FieldPropertiesEditor;