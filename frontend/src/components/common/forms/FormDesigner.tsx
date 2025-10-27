import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Trash2,
    Edit3,
    Copy,
    Eye,
    Settings,
    Move,
    ChevronDown,
    ChevronUp,
    Save,
    Undo,
    Redo
} from 'lucide-react';
import FormRenderer from './FormRenderer';
import { FormProvider } from './FormContext';
import FieldTypeSelector from './designer/FieldTypeSelector';
import FieldPropertiesEditor from './designer/FieldPropertiesEditor';
import SectionEditor from './designer/SectionEditor';
import FormPreview from './FormPreview';

// Interfaces
interface Field {
    id: string;
    type: string;
    name: string;
    label: string;
    required?: boolean;
    validation?: Record<string, any>;
    metadata?: Record<string, any>;
    options?: (string | { value: string; label: string })[];
    [key: string]: any;
}

interface FormSection {
    id: string;
    name: string;
    description?: string;
    order: number;
    fields: Field[];
}

interface FormDefinition {
    id: string | null;
    name: string;
    description?: string;
    version?: string;
    status?: string;
    context?: string;
    metadata?: Record<string, any>;
    sections?: FormSection[];
    fields?: Field[];
    validation?: {
        rules?: Record<string, any>;
        required?: string[];
        dependencies?: Record<string, any>;
    };
}

interface FieldType {
    value: string;
    label: string;
}

interface ValidationErrors {
    [key: string]: string;
}

interface FormDesignerProps {
    formDefinition?: FormDefinition | null;
    context?: 'template' | 'study' | 'patient' | 'general';
    onSave?: (formDefinition: FormDefinition) => void | Promise<void>;
    onCancel?: () => void;
    onPreview?: () => void;
    onValidationChange?: (errors: ValidationErrors, isValid: boolean) => void;
    readOnly?: boolean;
    showPreview?: boolean;
    showValidation?: boolean;
    allowSectionManagement?: boolean;
    allowFieldReordering?: boolean;
    customFieldTypes?: FieldType[];
    fieldTypeCategories?: Record<string, string[]>;
    validationRules?: Record<string, (field: Field) => ValidationErrors>;
    formMetadata?: Record<string, any>;
    className?: string;
}

interface TargetLocation {
    sectionId: string;
}

const FormDesigner: React.FC<FormDesignerProps> = ({
    formDefinition: initialFormDefinition = null,
    context = 'general',
    onSave = () => { },
    onCancel = () => { },
    onPreview = () => { },
    onValidationChange = () => { },
    readOnly = false,
    showPreview = true,
    showValidation = true,
    allowSectionManagement = true,
    allowFieldReordering = true,
    customFieldTypes = [],
    fieldTypeCategories = {},
    validationRules = {},
    formMetadata = {},
    className = ''
}) => {
    // Create empty form definition
    const createEmptyFormDefinition = (): FormDefinition => {
        return {
            id: null,
            name: 'New Form',
            description: '',
            version: '1.0',
            status: 'DRAFT',
            context: context,
            metadata: {
                createdAt: new Date().toISOString(),
                createdBy: 'current-user',
                estimatedTime: 5,
                category: 'GENERAL',
                ...formMetadata
            },
            sections: allowSectionManagement ? [
                {
                    id: 'section-1',
                    name: 'General Information',
                    description: 'Basic form fields',
                    order: 0,
                    fields: []
                }
            ] : [],
            fields: allowSectionManagement ? [] : [],
            validation: {
                rules: validationRules,
                required: [],
                dependencies: {}
            }
        };
    };

    // Form definition state
    const [formDefinition, setFormDefinition] = useState<FormDefinition>(
        initialFormDefinition || createEmptyFormDefinition()
    );

    // Designer state
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const [designerMode, setDesignerMode] = useState<'design' | 'preview' | 'properties'>('design');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isDirty, setIsDirty] = useState(false);

    // History management for undo/redo
    const [history, setHistory] = useState<FormDefinition[]>([formDefinition]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Initialize expanded sections
    useEffect(() => {
        if (formDefinition?.sections) {
            const initialExpanded: Record<string, boolean> = {};
            formDefinition.sections.forEach((section, index) => {
                initialExpanded[section.id] = index === 0;
            });
            setExpandedSections(initialExpanded);
        }
    }, [formDefinition?.sections]);

    // Add to history when form changes
    const addToHistory = useCallback((newFormDefinition: FormDefinition) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(newFormDefinition);
            return newHistory.slice(-50);
        });
        setHistoryIndex(prev => prev + 1);
        setIsDirty(true);
    }, [historyIndex]);

    // Undo operation
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setFormDefinition(history[historyIndex - 1]);
            setIsDirty(true);
        }
    }, [history, historyIndex]);

    // Redo operation
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setFormDefinition(history[historyIndex + 1]);
            setIsDirty(true);
        }
    }, [history, historyIndex]);

    // Update form metadata
    const updateFormMetadata = useCallback((updates: Partial<FormDefinition>) => {
        const updatedForm: FormDefinition = {
            ...formDefinition,
            ...updates,
            metadata: {
                ...formDefinition.metadata,
                updatedAt: new Date().toISOString(),
                updatedBy: 'current-user'
            }
        };
        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
    }, [formDefinition, addToHistory]);

    // Add new section
    const addSection = useCallback(() => {
        if (!allowSectionManagement) return;

        const newSection: FormSection = {
            id: `section-${Date.now()}`,
            name: `Section ${(formDefinition.sections || []).length + 1}`,
            description: '',
            order: (formDefinition.sections || []).length,
            fields: []
        };

        const updatedForm: FormDefinition = {
            ...formDefinition,
            sections: [...(formDefinition.sections || []), newSection]
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
        setSelectedSection(newSection.id);
    }, [formDefinition, allowSectionManagement, addToHistory]);

    // Update section
    const updateSection = useCallback((sectionId: string, updates: Partial<FormSection>) => {
        const updatedForm: FormDefinition = {
            ...formDefinition,
            sections: (formDefinition.sections || []).map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
            )
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
    }, [formDefinition, addToHistory]);

    // Delete section
    const deleteSection = useCallback((sectionId: string) => {
        if (!allowSectionManagement) return;

        const updatedForm: FormDefinition = {
            ...formDefinition,
            sections: (formDefinition.sections || []).filter(section => section.id !== sectionId)
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);

        if (selectedSection === sectionId) {
            setSelectedSection(null);
        }
    }, [formDefinition, selectedSection, allowSectionManagement, addToHistory]);

    // Create new field based on type and context
    const createNewField = (fieldType: string, fieldContext: string): Field => {
        const baseField: Field = {
            id: `field-${Date.now()}`,
            type: fieldType,
            name: `${fieldType}_field`,
            label: fieldType.charAt(0).toUpperCase() + fieldType.slice(1) + ' Field',
            required: false,
            validation: {},
            metadata: {
                createdAt: new Date().toISOString(),
                placeholder: '',
                helpText: ''
            }
        };

        // Add context-specific metadata
        switch (fieldContext) {
            case 'patient':
                baseField.metadata!.clinicalRelevance = 'standard';
                baseField.metadata!.dataSource = 'manual';
                break;
            case 'study':
                baseField.metadata!.studyPhase = 'all';
                baseField.metadata!.visitApplicability = [];
                break;
            case 'template':
                baseField.metadata!.category = 'general';
                baseField.metadata!.reusable = true;
                break;
        }

        // Add field type specific properties
        switch (fieldType) {
            case 'select':
            case 'multiselect':
            case 'radio':
            case 'checkbox':
                baseField.options = ['Option 1', 'Option 2', 'Option 3'];
                break;
            case 'number':
                baseField.metadata!.units = '';
                baseField.validation = { min: 0, max: 1000 };
                break;
            case 'date':
                baseField.validation = {
                    minDate: '',
                    maxDate: ''
                };
                break;
            case 'textarea':
                baseField.metadata!.rows = 4;
                baseField.validation = { maxLength: 500 };
                break;
        }

        return baseField;
    };

    // Add new field
    const addField = useCallback((fieldType: string, targetLocation: TargetLocation | null = null) => {
        const newField = createNewField(fieldType, context);
        let updatedForm: FormDefinition = { ...formDefinition };

        if (allowSectionManagement && formDefinition.sections) {
            const sectionId = targetLocation?.sectionId || formDefinition.sections[0]?.id;
            updatedForm.sections = formDefinition.sections.map(section =>
                section.id === sectionId
                    ? { ...section, fields: [...section.fields, newField] }
                    : section
            );
        } else {
            updatedForm.fields = [...(formDefinition.fields || []), newField];
        }

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
        setSelectedField(newField.id);
        setShowFieldSelector(false);
    }, [formDefinition, allowSectionManagement, context, addToHistory]);

    // Update field
    const updateField = useCallback((fieldId: string, updates: Partial<Field>) => {
        let updatedForm: FormDefinition = { ...formDefinition };

        if (allowSectionManagement && formDefinition.sections) {
            updatedForm.sections = formDefinition.sections.map(section => ({
                ...section,
                fields: section.fields.map(field =>
                    field.id === fieldId ? { ...field, ...updates } : field
                )
            }));
        } else {
            updatedForm.fields = (formDefinition.fields || []).map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
            );
        }

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
    }, [formDefinition, allowSectionManagement, addToHistory]);

    // Delete field
    const deleteField = useCallback((fieldId: string) => {
        let updatedForm: FormDefinition = { ...formDefinition };

        if (allowSectionManagement && formDefinition.sections) {
            updatedForm.sections = formDefinition.sections.map(section => ({
                ...section,
                fields: section.fields.filter(field => field.id !== fieldId)
            }));
        } else {
            updatedForm.fields = (formDefinition.fields || []).filter(field => field.id !== fieldId);
        }

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);

        if (selectedField === fieldId) {
            setSelectedField(null);
        }
    }, [formDefinition, selectedField, allowSectionManagement, addToHistory]);

    // Duplicate field
    const duplicateField = useCallback((fieldId: string) => {
        let fieldToDuplicate: Field | null = null;
        let targetSectionId: string | null = null;

        if (allowSectionManagement && formDefinition.sections) {
            for (const section of formDefinition.sections) {
                const field = section.fields.find(f => f.id === fieldId);
                if (field) {
                    fieldToDuplicate = field;
                    targetSectionId = section.id;
                    break;
                }
            }
        } else {
            fieldToDuplicate = (formDefinition.fields || []).find(f => f.id === fieldId) || null;
        }

        if (fieldToDuplicate) {
            const duplicatedField: Field = {
                ...fieldToDuplicate,
                id: `field-${Date.now()}`,
                name: `${fieldToDuplicate.name}_copy`,
                label: `${fieldToDuplicate.label} (Copy)`
            };

            let updatedForm: FormDefinition = { ...formDefinition };

            if (allowSectionManagement && formDefinition.sections && targetSectionId) {
                updatedForm.sections = formDefinition.sections.map(section =>
                    section.id === targetSectionId
                        ? { ...section, fields: [...section.fields, duplicatedField] }
                        : section
                );
            } else {
                updatedForm.fields = [...(formDefinition.fields || []), duplicatedField];
            }

            setFormDefinition(updatedForm);
            addToHistory(updatedForm);
            setSelectedField(duplicatedField.id);
        }
    }, [formDefinition, allowSectionManagement, addToHistory]);

    // Handle drag and drop reordering (simplified without react-beautiful-dnd)
    const onDragEnd = useCallback((result: any) => {
        // Drag and drop logic would go here if react-beautiful-dnd is installed
        console.log('Drag and drop requires react-beautiful-dnd library');
    }, [formDefinition, allowSectionManagement, allowFieldReordering, readOnly, addToHistory]);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const errors: ValidationErrors = {};

        if (!formDefinition.name || formDefinition.name.trim() === '') {
            errors.name = 'Form name is required';
        }

        if (allowSectionManagement && formDefinition.sections) {
            formDefinition.sections.forEach((section, sectionIndex) => {
                if (!section.name || section.name.trim() === '') {
                    errors[`section-${sectionIndex}-name`] = 'Section name is required';
                }

                section.fields.forEach((field) => {
                    if (!field.label || field.label.trim() === '') {
                        errors[`field-${field.id}-label`] = 'Field label is required';
                    }
                });
            });
        } else if (formDefinition.fields) {
            formDefinition.fields.forEach((field) => {
                if (!field.label || field.label.trim() === '') {
                    errors[`field-${field.id}-label`] = 'Field label is required';
                }
            });
        }

        setValidationErrors(errors);
        onValidationChange(errors, Object.keys(errors).length === 0);

        return Object.keys(errors).length === 0;
    }, [formDefinition, allowSectionManagement, onValidationChange]);

    // Save form
    const handleSave = useCallback(async () => {
        if (readOnly) return;

        if (validateForm()) {
            try {
                await onSave(formDefinition);
                setIsDirty(false);
            } catch (error) {
                console.error('Error saving form:', error);
            }
        }
    }, [formDefinition, readOnly, validateForm, onSave]);

    // Helper function to find field by ID
    const findFieldById = (fieldId: string): Field | null => {
        if (allowSectionManagement && formDefinition.sections) {
            for (const section of formDefinition.sections) {
                const field = section.fields.find(f => f.id === fieldId);
                if (field) return field;
            }
        } else if (formDefinition.fields) {
            return formDefinition.fields.find(f => f.id === fieldId) || null;
        }
        return null;
    };

    // Helper function to find section by ID
    const findSectionById = (sectionId: string): FormSection | undefined => {
        return formDefinition.sections?.find(s => s.id === sectionId);
    };

    const defaultFieldTypes: FieldType[] = [
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
    ];

    return (
        <FormProvider
            initialData={{}}
            mode="designer"
            context={context}
            formDefinition={formDefinition}
        >
            <div className={`form-designer ${className}`}>
                {/* Designer Header */}
                <div className="designer-header bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Form Designer
                                <span className="ml-2 text-sm text-gray-500">({context})</span>
                            </h2>
                            {isDirty && (
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                    Unsaved changes
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Undo/Redo */}
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex === 0}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                                title="Undo"
                            >
                                <Undo className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                                title="Redo"
                            >
                                <Redo className="h-4 w-4" />
                            </button>

                            {/* Mode Switcher */}
                            <div className="flex bg-gray-100 rounded-md">
                                <button
                                    type="button"
                                    onClick={() => setDesignerMode('design')}
                                    className={`px-3 py-2 text-sm rounded-l-md ${
                                        designerMode === 'design'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Edit3 className="h-4 w-4 mr-1 inline" />
                                    Design
                                </button>
                                {showPreview && (
                                    <button
                                        type="button"
                                        onClick={() => setDesignerMode('preview')}
                                        className={`px-3 py-2 text-sm ${
                                            designerMode === 'preview'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Eye className="h-4 w-4 mr-1 inline" />
                                        Preview
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setDesignerMode('properties')}
                                    className={`px-3 py-2 text-sm rounded-r-md ${
                                        designerMode === 'properties'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Settings className="h-4 w-4 mr-1 inline" />
                                    Properties
                                </button>
                            </div>

                            {/* Actions */}
                            {!readOnly && (
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        <Save className="h-4 w-4 mr-1 inline" />
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Basic Info */}
                    {designerMode === 'properties' && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Form Name
                                </label>
                                <input
                                    type="text"
                                    value={formDefinition.name}
                                    onChange={(e) => updateFormMetadata({ name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly={readOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Version
                                </label>
                                <input
                                    type="text"
                                    value={formDefinition.version || ''}
                                    onChange={(e) => updateFormMetadata({ version: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly={readOnly}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formDefinition.description || ''}
                                    onChange={(e) => updateFormMetadata({ description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Designer Content */}
                <div className="designer-content flex-1 flex">
                    {designerMode === 'design' && (
                        <div className="flex-1 flex">
                            <div className="w-2/3 p-6 bg-gray-50">
                                <div className="text-center text-gray-500 py-8">
                                    Form designer content (sections/fields rendering) would go here.
                                    <br />
                                    Full implementation requires SectionDesigner and FieldDesigner components.
                                </div>
                            </div>

                            {/* Properties Panel */}
                            <div className="w-1/3 bg-white border-l border-gray-200 p-6">
                                <div className="text-center text-gray-500 py-8">
                                    Select a field or section to edit its properties
                                </div>
                            </div>
                        </div>
                    )}

                    {designerMode === 'preview' && showPreview && (
                        <div className="flex-1 p-6">
                            <div className="text-center text-gray-500 py-8">
                                Form preview (FormPreview component integration pending)
                            </div>
                        </div>
                    )}

                    {designerMode === 'properties' && (
                        <div className="flex-1 p-6">
                            <div className="text-center text-gray-500 py-8">
                                Form properties editor coming soon
                            </div>
                        </div>
                    )}
                </div>

                {/* Field Type Selector Modal */}
                {showFieldSelector && !readOnly && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl">
                            <h3 className="text-lg font-medium mb-4">Select Field Type</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {defaultFieldTypes.map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => addField(type.value)}
                                        className="p-4 border rounded hover:bg-gray-50 text-left"
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowFieldSelector(false)}
                                className="mt-4 px-4 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Validation Errors */}
                {showValidation && Object.keys(validationErrors).length > 0 && (
                    <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                            {Object.values(validationErrors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </FormProvider>
    );
};

export default FormDesigner;
