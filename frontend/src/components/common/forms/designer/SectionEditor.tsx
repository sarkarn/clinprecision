import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Interfaces
interface Field {
    id: string;
    name: string;
    label: string;
    type: string;
    required?: boolean;
    order: number;
    visible?: boolean;
    [key: string]: any;
}

interface Section {
    id: string;
    name: string;
    description?: string;
    order: number;
    visible?: boolean;
    visibilityCondition?: string;
    fields?: Field[];
    [key: string]: any;
}

interface ValidationErrors {
    [key: string]: string;
}

interface SectionEditorProps {
    section: Section;
    context?: 'general' | 'study' | 'template' | 'patient';
    onSave: (section: Section) => void;
    onCancel: () => void;
    onDelete?: (sectionId: string) => void;
    onFieldAdd?: (sectionId: string) => void;
    onFieldEdit?: (sectionId: string, field: Field) => void;
    onFieldDelete?: (sectionId: string, fieldId: string) => void;
    onFieldReorder?: (sectionId: string, fieldId: string, direction: 'up' | 'down') => void;
    availableFieldTypes?: any[];
    className?: string;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
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
    const [editedSection, setEditedSection] = useState<Section>(section);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isDirty, setIsDirty] = useState(false);
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

    // Update when section prop changes
    useEffect(() => {
        setEditedSection(section);
        setIsDirty(false);
    }, [section]);

    // Generate section ID from name
    const generateSectionId = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    // Handle section property changes
    const handleSectionChange = (field: string, value: any): void => {
        const updated = { ...editedSection };
        
        // Handle nested properties
        if (field.includes('.')) {
            const parts = field.split('.');
            let current: any = updated;
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } else {
            updated[field] = value;
        }

        // Auto-generate ID from name if name changes
        if (field === 'name' && value) {
            updated.id = generateSectionId(value);
        }

        setEditedSection(updated);
        setIsDirty(true);
        validateSection(updated);
    };

    // Validate section
    const validateSection = (sectionToValidate: Section): void => {
        const errors: ValidationErrors = {};

        if (!sectionToValidate.name || sectionToValidate.name.trim() === '') {
            errors.name = 'Section name is required';
        }

        if (!sectionToValidate.id || sectionToValidate.id.trim() === '') {
            errors.id = 'Section ID is required';
        } else if (!/^[a-z0-9_]+$/.test(sectionToValidate.id)) {
            errors.id = 'Section ID must contain only lowercase letters, numbers, and underscores';
        }

        if (sectionToValidate.order === undefined || sectionToValidate.order === null) {
            errors.order = 'Section order is required';
        } else if (sectionToValidate.order < 0) {
            errors.order = 'Section order must be non-negative';
        }

        setValidationErrors(errors);
    };

    // Handle save
    const handleSave = (): void => {
        if (Object.keys(validationErrors).length === 0) {
            onSave(editedSection);
        }
    };

    // Handle cancel
    const handleCancel = (): void => {
        setEditedSection(section);
        setValidationErrors({});
        setIsDirty(false);
        onCancel();
    };

    // Handle delete
    const handleDelete = (): void => {
        if (onDelete && window.confirm(`Are you sure you want to delete section "${editedSection.name}"?`)) {
            onDelete(editedSection.id);
        }
    };

    // Toggle field expansion
    const toggleFieldExpansion = (fieldId: string): void => {
        const newExpanded = new Set(expandedFields);
        if (newExpanded.has(fieldId)) {
            newExpanded.delete(fieldId);
        } else {
            newExpanded.add(fieldId);
        }
        setExpandedFields(newExpanded);
    };

    // Render field summary
    const renderFieldSummary = (field: Field, index: number): React.ReactElement => {
        const isExpanded = expandedFields.has(field.id);

        return (
            <div key={field.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Field Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center space-x-3 flex-1">
                        <button
                            type="button"
                            onClick={() => toggleFieldExpansion(field.id)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronUp className="h-4 w-4" />
                            )}
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{field.label}</span>
                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                                    {field.type}
                                </span>
                                {field.required && (
                                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                                        Required
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">
                                Order: {field.order} | ID: {field.id}
                            </div>
                        </div>
                    </div>

                    {/* Field Actions */}
                    <div className="flex items-center space-x-2">
                        {onFieldReorder && index > 0 && (
                            <button
                                type="button"
                                onClick={() => onFieldReorder(editedSection.id, field.id, 'up')}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Move Up"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                        )}
                        {onFieldReorder && editedSection.fields && index < editedSection.fields.length - 1 && (
                            <button
                                type="button"
                                onClick={() => onFieldReorder(editedSection.id, field.id, 'down')}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                                title="Move Down"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        )}
                        {field.visible !== false ? (
                            <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        {onFieldEdit && (
                            <button
                                type="button"
                                onClick={() => onFieldEdit(editedSection.id, field)}
                                className="px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            >
                                Edit
                            </button>
                        )}
                        {onFieldDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`Delete field "${field.label}"?`)) {
                                        onFieldDelete(editedSection.id, field.id);
                                    }
                                }}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete Field"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded Field Details */}
                {isExpanded && (
                    <div className="p-3 bg-white border-t border-gray-200">
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <dt className="font-medium text-gray-700">Field Name:</dt>
                                <dd className="text-gray-600">{field.name}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-700">Type:</dt>
                                <dd className="text-gray-600">{field.type}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-700">Required:</dt>
                                <dd className="text-gray-600">{field.required ? 'Yes' : 'No'}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-700">Visible:</dt>
                                <dd className="text-gray-600">{field.visible !== false ? 'Yes' : 'No'}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                    {section.id ? 'Edit Section' : 'New Section'}
                </h3>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Section Properties */}
            <div className="p-4 space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Name *
                    </label>
                    <input
                        type="text"
                        value={editedSection.name || ''}
                        onChange={(e) => handleSectionChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter section name"
                    />
                    {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                </div>

                {/* ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section ID *
                    </label>
                    <input
                        type="text"
                        value={editedSection.id || ''}
                        onChange={(e) => handleSectionChange('id', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="section_id (auto-generated from name)"
                    />
                    {validationErrors.id && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.id}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Lowercase letters, numbers, and underscores only
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={editedSection.description || ''}
                        onChange={(e) => handleSectionChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter section description"
                    />
                </div>

                {/* Order and Visibility */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order *
                        </label>
                        <input
                            type="number"
                            value={editedSection.order ?? 0}
                            onChange={(e) => handleSectionChange('order', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                validationErrors.order ? 'border-red-300' : 'border-gray-300'
                            }`}
                            min="0"
                        />
                        {validationErrors.order && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.order}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visibility
                        </label>
                        <div className="flex items-center h-10">
                            <input
                                type="checkbox"
                                checked={editedSection.visible !== false}
                                onChange={(e) => handleSectionChange('visible', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Section is visible
                            </label>
                        </div>
                    </div>
                </div>

                {/* Visibility Condition */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visibility Condition (Advanced)
                    </label>
                    <input
                        type="text"
                        value={editedSection.visibilityCondition || ''}
                        onChange={(e) => handleSectionChange('visibilityCondition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., field.age > 18"
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

export default SectionEditor;
