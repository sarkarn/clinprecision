import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
import { FormRenderer } from './FormRenderer';
import { FormProvider } from './FormContext';
import { FieldTypeSelector } from './designer/FieldTypeSelector';
import { FieldPropertiesEditor } from './designer/FieldPropertiesEditor';
import { SectionEditor } from './designer/SectionEditor';
import { FormPreview } from './FormPreview';

/**
 * FormDesigner - Reusable form designer component
 * 
 * Can be used for:
 * - Form library template design (context: 'template')
 * - Study-specific form design (context: 'study') 
 * - General form design (context: 'general')
 * - Patient data capture form design (context: 'patient')
 */
const FormDesigner = ({
    formDefinition: initialFormDefinition = null,
    context = 'general', // 'template', 'study', 'patient', 'general'
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
    className = '',
    ...props
}) => {
    // Form definition state
    const [formDefinition, setFormDefinition] = useState(
        initialFormDefinition || createEmptyFormDefinition()
    );

    // Designer state
    const [selectedField, setSelectedField] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const [showPreviewMode, setShowPreviewMode] = useState(false);
    const [designerMode, setDesignerMode] = useState('design'); // 'design', 'preview', 'properties'
    const [expandedSections, setExpandedSections] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // History management for undo/redo
    const [history, setHistory] = useState([formDefinition]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Create empty form definition
    function createEmptyFormDefinition() {
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
    }

    // Initialize expanded sections
    useEffect(() => {
        if (formDefinition?.sections) {
            const initialExpanded = {};
            formDefinition.sections.forEach((section, index) => {
                initialExpanded[section.id] = index === 0; // Expand first section by default
            });
            setExpandedSections(initialExpanded);
        }
    }, [formDefinition?.sections]);

    // Add to history when form changes
    const addToHistory = useCallback((newFormDefinition) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(newFormDefinition);
            return newHistory.slice(-50); // Keep last 50 changes
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
    const updateFormMetadata = useCallback((updates) => {
        const updatedForm = {
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

        const newSection = {
            id: `section-${Date.now()}`,
            name: `Section ${formDefinition.sections.length + 1}`,
            description: '',
            fields: []
        };

        const updatedForm = {
            ...formDefinition,
            sections: [...formDefinition.sections, newSection]
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
        setSelectedSection(newSection.id);
    }, [formDefinition, allowSectionManagement, addToHistory]);

    // Update section
    const updateSection = useCallback((sectionId, updates) => {
        const updatedForm = {
            ...formDefinition,
            sections: formDefinition.sections.map(section =>
                section.id === sectionId ? { ...section, ...updates } : section
            )
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
    }, [formDefinition, addToHistory]);

    // Delete section
    const deleteSection = useCallback((sectionId) => {
        if (!allowSectionManagement) return;

        const updatedForm = {
            ...formDefinition,
            sections: formDefinition.sections.filter(section => section.id !== sectionId)
        };

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);

        if (selectedSection === sectionId) {
            setSelectedSection(null);
        }
    }, [formDefinition, selectedSection, allowSectionManagement, addToHistory]);

    // Add new field
    const addField = useCallback((fieldType, targetLocation = null) => {
        const newField = createNewField(fieldType, context);
        let updatedForm = { ...formDefinition };

        if (allowSectionManagement && formDefinition.sections) {
            // Add to specific section or first section
            const sectionId = targetLocation?.sectionId || formDefinition.sections[0]?.id;
            updatedForm.sections = formDefinition.sections.map(section =>
                section.id === sectionId
                    ? { ...section, fields: [...section.fields, newField] }
                    : section
            );
        } else {
            // Add to form fields directly
            updatedForm.fields = [...(formDefinition.fields || []), newField];
        }

        setFormDefinition(updatedForm);
        addToHistory(updatedForm);
        setSelectedField(newField.id);
        setShowFieldSelector(false);
    }, [formDefinition, allowSectionManagement, context, addToHistory]);

    // Create new field based on type and context
    const createNewField = (fieldType, context) => {
        const baseField = {
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
        switch (context) {
            case 'patient':
                baseField.metadata.clinicalRelevance = 'standard';
                baseField.metadata.dataSource = 'manual';
                break;
            case 'study':
                baseField.metadata.studyPhase = 'all';
                baseField.metadata.visitApplicability = [];
                break;
            case 'template':
                baseField.metadata.category = 'general';
                baseField.metadata.reusable = true;
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
                baseField.metadata.units = '';
                baseField.validation = { min: 0, max: 1000 };
                break;
            case 'date':
                baseField.validation = {
                    minDate: '',
                    maxDate: ''
                };
                break;
            case 'textarea':
                baseField.metadata.rows = 4;
                baseField.validation = { maxLength: 500 };
                break;
        }

        return baseField;
    };

    // Update field
    const updateField = useCallback((fieldId, updates) => {
        let updatedForm = { ...formDefinition };

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
    const deleteField = useCallback((fieldId) => {
        let updatedForm = { ...formDefinition };

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
    const duplicateField = useCallback((fieldId) => {
        // Find the field to duplicate
        let fieldToDuplicate = null;
        let targetSectionId = null;

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
            fieldToDuplicate = (formDefinition.fields || []).find(f => f.id === fieldId);
        }

        if (fieldToDuplicate) {
            const duplicatedField = {
                ...fieldToDuplicate,
                id: `field-${Date.now()}`,
                name: `${fieldToDuplicate.name}_copy`,
                label: `${fieldToDuplicate.label} (Copy)`
            };

            let updatedForm = { ...formDefinition };

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

    // Handle drag and drop reordering
    const onDragEnd = useCallback((result) => {
        if (!allowFieldReordering || !result.destination || readOnly) return;

        const { source, destination, draggableId } = result;

        // Reordering within the same section/list
        if (source.droppableId === destination.droppableId) {
            let updatedForm = { ...formDefinition };

            if (allowSectionManagement && formDefinition.sections) {
                const sectionId = source.droppableId;
                updatedForm.sections = formDefinition.sections.map(section => {
                    if (section.id === sectionId) {
                        const newFields = Array.from(section.fields);
                        const [removed] = newFields.splice(source.index, 1);
                        newFields.splice(destination.index, 0, removed);
                        return { ...section, fields: newFields };
                    }
                    return section;
                });
            } else {
                const newFields = Array.from(formDefinition.fields || []);
                const [removed] = newFields.splice(source.index, 1);
                newFields.splice(destination.index, 0, removed);
                updatedForm.fields = newFields;
            }

            setFormDefinition(updatedForm);
            addToHistory(updatedForm);
        }
        // TODO: Handle moving between sections
    }, [formDefinition, allowSectionManagement, allowFieldReordering, readOnly, addToHistory]);

    // Validate form
    const validateForm = useCallback(() => {
        const errors = {};

        // Validate form metadata
        if (!formDefinition.name || formDefinition.name.trim() === '') {
            errors.name = 'Form name is required';
        }

        // Validate sections and fields
        if (allowSectionManagement && formDefinition.sections) {
            formDefinition.sections.forEach((section, sectionIndex) => {
                if (!section.name || section.name.trim() === '') {
                    errors[`section-${sectionIndex}-name`] = 'Section name is required';
                }

                section.fields.forEach((field, fieldIndex) => {
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

    // Render the main designer interface
    return (
        <FormProvider
            initialData={{}}
            mode="designer"
            context={context}
            formDefinition={formDefinition}
        >
            <div className={`form-designer ${className}`} {...props}>
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
                                    className={`px-3 py-2 text-sm rounded-l-md ${designerMode === 'design'
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
                                        className={`px-3 py-2 text-sm ${designerMode === 'preview'
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
                                    className={`px-3 py-2 text-sm rounded-r-md ${designerMode === 'properties'
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
                                    value={formDefinition.version}
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
                                    value={formDefinition.description}
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
                            {/* Form Structure Panel */}
                            <div className="w-2/3 p-6 bg-gray-50">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    {allowSectionManagement && formDefinition.sections ? (
                                        // Render sections
                                        <div className="space-y-6">
                                            {formDefinition.sections.map((section) => (
                                                <SectionDesigner
                                                    key={section.id}
                                                    section={section}
                                                    onUpdateSection={updateSection}
                                                    onDeleteSection={deleteSection}
                                                    onAddField={(fieldType) => addField(fieldType, { sectionId: section.id })}
                                                    onUpdateField={updateField}
                                                    onDeleteField={deleteField}
                                                    onDuplicateField={duplicateField}
                                                    onSelectField={setSelectedField}
                                                    selectedField={selectedField}
                                                    expanded={expandedSections[section.id]}
                                                    onToggleExpanded={(sectionId) =>
                                                        setExpandedSections(prev => ({
                                                            ...prev,
                                                            [sectionId]: !prev[sectionId]
                                                        }))
                                                    }
                                                    readOnly={readOnly}
                                                    allowFieldReordering={allowFieldReordering}
                                                />
                                            ))}

                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={addSection}
                                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
                                                >
                                                    <Plus className="h-5 w-5 mx-auto mb-2" />
                                                    Add Section
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        // Render fields directly
                                        <div className="space-y-4">
                                            <Droppable droppableId="form-fields">
                                                {(provided) => (
                                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                                        {(formDefinition.fields || []).map((field, index) => (
                                                            <FieldDesigner
                                                                key={field.id}
                                                                field={field}
                                                                index={index}
                                                                onUpdateField={updateField}
                                                                onDeleteField={deleteField}
                                                                onDuplicateField={duplicateField}
                                                                onSelectField={setSelectedField}
                                                                isSelected={selectedField === field.id}
                                                                readOnly={readOnly}
                                                                allowFieldReordering={allowFieldReordering}
                                                            />
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>

                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFieldSelector(true)}
                                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
                                                >
                                                    <Plus className="h-5 w-5 mx-auto mb-2" />
                                                    Add Field
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </DragDropContext>
                            </div>

                            {/* Properties Panel */}
                            <div className="w-1/3 bg-white border-l border-gray-200 p-6">
                                {selectedField ? (
                                    <FieldPropertiesEditor
                                        field={findFieldById(selectedField)}
                                        context={context}
                                        onSave={(updatedField) => {
                                            updateField(updatedField.id, updatedField);
                                            setSelectedField(null);
                                        }}
                                        onCancel={() => setSelectedField(null)}
                                        onDelete={(fieldId) => {
                                            deleteField(fieldId);
                                            setSelectedField(null);
                                        }}
                                        onDuplicate={(field) => {
                                            duplicateField(field.id);
                                        }}
                                        availableFieldTypes={customFieldTypes.length > 0 ? customFieldTypes : [
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
                                        ]}
                                        customValidators={validationRules}
                                    />
                                ) : selectedSection ? (
                                    <SectionEditor
                                        section={findSectionById(selectedSection)}
                                        onUpdateSection={updateSection}
                                        readOnly={readOnly}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Select a field or section to edit its properties
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {designerMode === 'preview' && showPreview && (
                        <div className="flex-1 p-6">
                            <FormPreview
                                formDefinition={formDefinition}
                                context={context}
                                mode="preview"
                            />
                        </div>
                    )}

                    {designerMode === 'properties' && (
                        <div className="flex-1 p-6">
                            {/* Form-level properties editor would go here */}
                            <div className="text-center text-gray-500 py-8">
                                Form properties editor coming soon
                            </div>
                        </div>
                    )}
                </div>

                {/* Field Type Selector Modal */}
                {showFieldSelector && !readOnly && (
                    <FieldTypeSelector
                        onSelectField={(fieldType) => addField(fieldType)}
                        onClose={() => setShowFieldSelector(false)}
                        context={context}
                        customFieldTypes={customFieldTypes}
                        fieldTypeCategories={fieldTypeCategories}
                    />
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

    // Helper function to find field by ID
    function findFieldById(fieldId) {
        if (allowSectionManagement && formDefinition.sections) {
            for (const section of formDefinition.sections) {
                const field = section.fields.find(f => f.id === fieldId);
                if (field) return field;
            }
        } else if (formDefinition.fields) {
            return formDefinition.fields.find(f => f.id === fieldId);
        }
        return null;
    }

    // Helper function to find section by ID
    function findSectionById(sectionId) {
        return formDefinition.sections?.find(s => s.id === sectionId);
    }
};

// Placeholder components that would need to be implemented
const SectionDesigner = ({ section, onUpdateSection, onDeleteSection, expanded, onToggleExpanded, readOnly, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <button onClick={() => onToggleExpanded(section.id)} className="text-gray-400">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <h3 className="font-medium text-gray-900">{section.name}</h3>
            </div>
            {!readOnly && (
                <button
                    onClick={() => onDeleteSection(section.id)}
                    className="text-red-400 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
        {expanded && (
            <div className="p-4">
                {children}
            </div>
        )}
    </div>
);

const FieldDesigner = ({ field, index, onSelectField, isSelected, readOnly }) => (
    <div className={`p-4 border rounded-lg cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
        <div onClick={() => onSelectField(field.id)}>
            <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{field.label}</span>
                <span className="text-sm text-gray-500">{field.type}</span>
            </div>
        </div>
    </div>
);

FormDesigner.propTypes = {
    formDefinition: PropTypes.object,
    context: PropTypes.oneOf(['template', 'study', 'patient', 'general']),
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onPreview: PropTypes.func,
    onValidationChange: PropTypes.func,
    readOnly: PropTypes.bool,
    showPreview: PropTypes.bool,
    showValidation: PropTypes.bool,
    allowSectionManagement: PropTypes.bool,
    allowFieldReordering: PropTypes.bool,
    customFieldTypes: PropTypes.array,
    fieldTypeCategories: PropTypes.object,
    validationRules: PropTypes.object,
    formMetadata: PropTypes.object,
    className: PropTypes.string
};

export default FormDesigner;