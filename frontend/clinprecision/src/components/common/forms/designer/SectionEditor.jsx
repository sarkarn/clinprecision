import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * SectionEditor - Edits form section properties and manages section fields
 * Used within FormDesigner for editing section configuration
 */
const SectionEditor = ({
    section,
    context = 'general',
    onSave,
    onCancel,
    onDelete,
    onFieldAdd,
    onFieldEdit,
    onFieldDelete,
    onFieldReorder,
    availableFieldTypes = [],
    className = ''
}) => {
    const [editedSection, setEditedSection] = useState({ ...section });
    const [validationErrors, setValidationErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [expandedFields, setExpandedFields] = useState(new Set());

    // Update local state when section changes
    useEffect(() => {
        setEditedSection({ ...section });
        setIsDirty(false);
        setValidationErrors({});
    }, [section]);

    // Handle section property changes
    const handleSectionChange = (property, value) => {
        const updatedSection = { ...editedSection };

        if (property.includes('.')) {
            // Handle nested properties
            const parts = property.split('.');
            let current = updatedSection;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } else {
            updatedSection[property] = value;
        }

        // Auto-generate section ID from name if needed
        if (property === 'name' && (!editedSection.id || editedSection.id === generateSectionId(editedSection.name))) {
            updatedSection.id = generateSectionId(value);
        }

        setEditedSection(updatedSection);
        setIsDirty(true);

        // Clear validation error for this property
        if (validationErrors[property]) {
            const newErrors = { ...validationErrors };
            delete newErrors[property];
            setValidationErrors(newErrors);
        }
    };

    // Generate section ID from name
    const generateSectionId = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    // Validate section
    const validateSection = () => {
        const errors = {};

        // Required fields
        if (!editedSection.name?.trim()) {
            errors.name = 'Section name is required';
        }

        if (!editedSection.id?.trim()) {
            errors.id = 'Section ID is required';
        } else if (!/^[a-z][a-z0-9_]*$/i.test(editedSection.id)) {
            errors.id = 'Section ID must start with a letter and contain only letters, numbers, and underscores';
        }

        // Order validation
        if (editedSection.order !== undefined && editedSection.order !== null) {
            if (editedSection.order < 0) {
                errors.order = 'Order must be a non-negative number';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle save
    const handleSave = () => {
        if (validateSection()) {
            onSave(editedSection);
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

    // Toggle field expansion
    const toggleFieldExpansion = (fieldId) => {
        const newExpanded = new Set(expandedFields);
        if (newExpanded.has(fieldId)) {
            newExpanded.delete(fieldId);
        } else {
            newExpanded.add(fieldId);
        }
        setExpandedFields(newExpanded);
    };

    // Handle field reordering
    const moveField = (fieldIndex, direction) => {
        if (!editedSection.fields) return;

        const fields = [...editedSection.fields];
        const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

        if (newIndex < 0 || newIndex >= fields.length) return;

        // Swap fields
        [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];

        handleSectionChange('fields', fields);

        if (onFieldReorder) {
            onFieldReorder(editedSection.id, fieldIndex, newIndex);
        }
    };

    // Remove field from section
    const handleRemoveField = (fieldIndex) => {
        if (!editedSection.fields) return;

        const field = editedSection.fields[fieldIndex];
        if (confirm(`Remove field "${field.label || field.name || field.id}" from this section?`)) {
            const fields = [...editedSection.fields];
            fields.splice(fieldIndex, 1);
            handleSectionChange('fields', fields);

            if (onFieldDelete) {
                onFieldDelete(field.id);
            }
        }
    };

    // Render field summary
    const renderFieldSummary = (field, index) => {
        const isExpanded = expandedFields.has(field.id);

        return (
            <div key={field.id} className="border border-gray-200 rounded-md">
                {/* Field Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center flex-1">
                        <button
                            type="button"
                            onClick={() => toggleFieldExpansion(field.id)}
                            className="mr-2 text-gray-400 hover:text-gray-600"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronUp className="h-4 w-4 transform rotate-180" />
                            )}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center">
                                <span className="font-medium text-sm text-gray-900">
                                    {field.label || field.name || field.id}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    {field.type}
                                </span>
                                {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                )}
                                {field.hidden && (
                                    <EyeOff className="ml-1 h-3 w-3 text-gray-400" />
                                )}
                            </div>
                            {field.description && (
                                <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Field Order Controls */}
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => moveField(index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Move Up"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveField(index, 'down')}
                                disabled={index === editedSection.fields.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Move Down"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Field Actions */}
                        <button
                            type="button"
                            onClick={() => onFieldEdit && onFieldEdit(field)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Remove Field"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Field Details (when expanded) */}
                {isExpanded && (
                    <div className="p-3 border-t bg-white space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">ID:</span>
                                <span className="ml-2 text-gray-600">{field.id}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Type:</span>
                                <span className="ml-2 text-gray-600">{field.type}</span>
                            </div>
                            {field.validation && Object.keys(field.validation).length > 0 && (
                                <div>
                                    <span className="font-medium text-gray-700">Validation:</span>
                                    <span className="ml-2 text-gray-600">
                                        {Object.keys(field.validation).join(', ')}
                                    </span>
                                </div>
                            )}
                            {field.options && field.options.length > 0 && (
                                <div>
                                    <span className="font-medium text-gray-700">Options:</span>
                                    <span className="ml-2 text-gray-600">
                                        {field.options.length} option(s)
                                    </span>
                                </div>
                            )}
                        </div>

                        {field.conditions && (
                            <div>
                                <span className="font-medium text-gray-700 text-sm">Show When:</span>
                                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                    {field.conditions}
                                </code>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`section-editor bg-white border rounded-lg shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                    Edit Section: {editedSection.name || 'Untitled Section'}
                </h3>
                <div className="flex items-center space-x-2">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(editedSection.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Delete Section"
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

            {/* Section Properties */}
            <div className="p-4 space-y-4 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Section Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Name *
                        </label>
                        <input
                            type="text"
                            value={editedSection.name || ''}
                            onChange={(e) => handleSectionChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter section name"
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                        )}
                    </div>

                    {/* Section ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section ID *
                        </label>
                        <input
                            type="text"
                            value={editedSection.id || ''}
                            onChange={(e) => handleSectionChange('id', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="section_id"
                        />
                        {validationErrors.id && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.id}</p>
                        )}
                    </div>
                </div>

                {/* Section Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={editedSection.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional section description"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Section Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={editedSection.order || ''}
                            onChange={(e) => handleSectionChange('order', parseInt(e.target.value) || null)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.order ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {validationErrors.order && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.order}</p>
                        )}
                    </div>

                    {/* Collapsible */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Behavior
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editedSection.collapsible || false}
                                    onChange={(e) => handleSectionChange('collapsible', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Collapsible</span>
                            </label>

                            {editedSection.collapsible && (
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={editedSection.collapsed || false}
                                        onChange={(e) => handleSectionChange('collapsed', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Start collapsed</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Required */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Requirements
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editedSection.required || false}
                                    onChange={(e) => handleSectionChange('required', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Required section</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editedSection.hidden || false}
                                    onChange={(e) => handleSectionChange('hidden', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Hidden section</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Conditional Logic */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Show When (Conditional Logic)
                    </label>
                    <textarea
                        value={editedSection.conditions || ''}
                        onChange={(e) => handleSectionChange('conditions', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., other_field === 'value'"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        JavaScript expression that determines when this section should be visible
                    </p>
                </div>
            </div>

            {/* Section Fields */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                        Fields ({editedSection.fields?.length || 0})
                    </h4>
                    {onFieldAdd && (
                        <button
                            type="button"
                            onClick={() => onFieldAdd(editedSection.id)}
                            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Field
                        </button>
                    )}
                </div>

                {/* Fields List */}
                {editedSection.fields && editedSection.fields.length > 0 ? (
                    <div className="space-y-3">
                        {editedSection.fields.map((field, index) =>
                            renderFieldSummary(field, index)
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="mb-2">No fields in this section</p>
                        {onFieldAdd && (
                            <button
                                type="button"
                                onClick={() => onFieldAdd(editedSection.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Add the first field
                            </button>
                        )}
                    </div>
                )}
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
                        Save Section
                    </button>
                </div>
            </div>
        </div>
    );
};

SectionEditor.propTypes = {
    section: PropTypes.object.isRequired,
    context: PropTypes.oneOf(['general', 'study', 'template', 'patient']),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onFieldAdd: PropTypes.func,
    onFieldEdit: PropTypes.func,
    onFieldDelete: PropTypes.func,
    onFieldReorder: PropTypes.func,
    availableFieldTypes: PropTypes.array,
    className: PropTypes.string
};

export default SectionEditor;