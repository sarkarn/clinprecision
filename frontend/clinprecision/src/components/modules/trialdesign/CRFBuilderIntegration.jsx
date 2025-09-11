import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Settings, Table, List, ChevronDown, ChevronUp, Eye, Edit3 } from 'lucide-react';
import FormService from '../../../services/FormService';
import FormVersionService from '../../../services/FormVersionService';

/**
 * This component acts as a bridge between the CRF Builder (to be implemented) 
 * and our form services
 */
const CRFBuilderIntegration = () => {
    const { formId, versionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(null);
    const [formVersion, setFormVersion] = useState(null);
    const [saving, setSaving] = useState(false);
    const [changes, setChanges] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [showFieldMetadata, setShowFieldMetadata] = useState({});
    const [previewMode, setPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState({});

    // CRF data would be loaded from or passed to the CRF Builder component
    const [crfData, setCrfData] = useState(null);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (formId) {
                    // Load existing form
                    const formData = await FormService.getFormById(formId);
                    setForm(formData);

                    if (versionId) {
                        // Load specific version
                        const versionData = await FormVersionService.getFormVersion(formId, versionId);
                        setFormVersion(versionData);
                        setCrfData(versionData.structure || {});
                    } else {
                        // Load current version
                        const currentVersion = await FormVersionService.getCurrentFormVersion(formId);
                        setFormVersion(currentVersion);
                        setCrfData(currentVersion.structure || {});
                    }
                } else {
                    // New form - initialize empty CRF data
                    setCrfData({
                        sections: [],
                        fields: []
                    });
                }

                setLoading(false);
            } catch (err) {
                console.error("Error loading form data:", err);
                setError("Failed to load form data. Please try again.");
                setLoading(false);
            }
        };

        loadFormData();
    }, [formId, versionId]);

    // Handle updates from the CRF Builder
    const handleCrfDataUpdate = (newData) => {
        setCrfData(newData);
        setChanges(true);
    };

    // Toggle section expansion
    const toggleSectionExpansion = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Toggle field metadata visibility
    const toggleFieldMetadata = (fieldId) => {
        setShowFieldMetadata(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    // Create new section
    const createSection = (type = 'regular') => {
        const newSection = {
            id: `section_${Date.now()}`,
            name: 'New Section',
            type: type, // 'regular' or 'table'
            description: '',
            fields: [],
            metadata: {
                isRequired: false,
                helpText: '',
                displayOrder: (crfData?.sections?.length || 0) + 1
            }
        };
        const updatedData = {
            ...crfData,
            sections: [...(crfData.sections || []), newSection]
        };
        handleCrfDataUpdate(updatedData);
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    // Create new field
    const createField = (sectionIndex, section) => {
        const newField = {
            id: `field_${Date.now()}`,
            name: 'New Field',
            label: 'New Field Label',
            type: 'text',
            required: false,
            metadata: {
                description: '',
                helpText: '',
                placeholder: '',
                validation: {
                    minLength: '',
                    maxLength: '',
                    pattern: '',
                    min: '',
                    max: '',
                    errorMessage: ''
                },
                options: [], // For select, radio, checkbox fields
                defaultValue: '',
                displayOrder: (section.fields?.length || 0) + 1,
                fieldWidth: 'full', // full, half, third, quarter
                isReadOnly: false,
                isCalculated: false,
                calculationFormula: '',
                conditionalLogic: {
                    showIf: '',
                    hideIf: '',
                    requiredIf: ''
                }
            }
        };

        const updatedSections = [...crfData.sections];
        updatedSections[sectionIndex] = {
            ...section,
            fields: [...(section.fields || []), newField]
        };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
        setShowFieldMetadata(prev => ({ ...prev, [newField.id]: false }));
    };

    // Update section
    const updateSection = (sectionIndex, updates) => {
        const updatedSections = [...crfData.sections];
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Update field
    const updateField = (sectionIndex, fieldIndex, updates) => {
        const updatedSections = [...crfData.sections];
        const updatedFields = [...updatedSections[sectionIndex].fields];
        updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...updates };
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields: updatedFields };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Remove section
    const removeSection = (sectionIndex) => {
        const updatedSections = crfData.sections.filter((_, i) => i !== sectionIndex);
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Remove field
    const removeField = (sectionIndex, fieldIndex) => {
        const updatedSections = [...crfData.sections];
        const updatedFields = updatedSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields: updatedFields };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Toggle preview mode
    const togglePreviewMode = () => {
        setPreviewMode(!previewMode);
    };

    // Handle preview form data changes
    const handlePreviewDataChange = (fieldId, value) => {
        setPreviewData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    // Render field input based on type
    const renderFieldInput = (field, value, onChange, disabled = false) => {
        const fieldClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        minLength={field.metadata?.validation?.minLength}
                        maxLength={field.metadata?.validation?.maxLength}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        min={field.metadata?.validation?.min}
                        max={field.metadata?.validation?.max}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'datetime':
                return (
                    <input
                        type="datetime-local"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'time':
                return (
                    <input
                        type="time"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        rows={4}
                        minLength={field.metadata?.validation?.minLength}
                        maxLength={field.metadata?.validation?.maxLength}
                    />
                );

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    >
                        <option value="">-- Select an option --</option>
                        {field.metadata?.options?.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'multiselect':
                return (
                    <select
                        multiple
                        value={Array.isArray(value) ? value : []}
                        onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                            onChange(field.id, selectedValues);
                        }}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        size={Math.min(field.metadata?.options?.length || 3, 5)}
                    >
                        {field.metadata?.options?.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.metadata?.options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(field.id, e.target.value)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    disabled={disabled || field.metadata?.isReadOnly}
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                if (field.metadata?.options?.length > 0) {
                    // Multiple checkboxes
                    return (
                        <div className="space-y-2">
                            {field.metadata.options.map((option, index) => (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={Array.isArray(value) && value.includes(option)}
                                        onChange={(e) => {
                                            const currentValues = Array.isArray(value) ? value : [];
                                            const newValues = e.target.checked
                                                ? [...currentValues, option]
                                                : currentValues.filter(v => v !== option);
                                            onChange(field.id, newValues);
                                        }}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        disabled={disabled || field.metadata?.isReadOnly}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    );
                } else {
                    // Single checkbox
                    return (
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => onChange(field.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={disabled || field.metadata?.isReadOnly}
                            />
                            <span className="ml-2 text-sm text-gray-700">{field.label || field.name}</span>
                        </label>
                    );
                }

            case 'file':
                return (
                    <input
                        type="file"
                        onChange={(e) => onChange(field.id, e.target.files[0]?.name || '')}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );
        }
    };

    // Get field width class
    const getFieldWidthClass = (width) => {
        switch (width) {
            case 'half': return 'col-span-6';
            case 'third': return 'col-span-4';
            case 'quarter': return 'col-span-3';
            default: return 'col-span-12';
        }
    };

    // Render preview section
    const renderPreviewSection = (section) => {
        if (section.type === 'table' && section.fields?.length > 0) {
            return (
                <div className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                        {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        )}
                    </div>

                    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {section.fields.map((field) => (
                                        <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {field.label || field.name}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                            {field.metadata?.helpText && (
                                                <div className="text-xs text-gray-400 mt-1 font-normal normal-case">
                                                    {field.metadata.helpText}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    {section.fields.map((field) => (
                                        <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                                            {renderFieldInput(field, previewData[field.id], handlePreviewDataChange)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Regular section
            return (
                <div className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                        {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-12 gap-4">
                            {section.fields?.map((field) => (
                                <div key={field.id} className={getFieldWidthClass(field.metadata?.fieldWidth)}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label || field.name}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {renderFieldInput(field, previewData[field.id], handlePreviewDataChange)}

                                    {field.metadata?.helpText && (
                                        <p className="text-xs text-gray-500 mt-1">{field.metadata.helpText}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Save form changes
    const handleSave = async () => {
        try {
            setSaving(true);

            if (!formId) {
                // Create new form
                const newFormData = {
                    name: form?.name || "New Form",
                    description: form?.description || "Form created with CRF Builder",
                    structure: crfData,
                    formType: "custom" // Add default formType
                };

                const result = await FormService.createForm(newFormData);
                alert("Form created successfully!");
                navigate(`/study-design/forms/${result.id}/versions`);
            } else if (formVersion) {
                // Create new version of existing form
                const versionData = {
                    structure: crfData,
                    notes: "Updated via CRF Builder"
                };

                await FormVersionService.createFormVersion(formId, versionData);
                alert("Form version created successfully!");
                navigate(`/study-design/forms/${formId}/versions`);
            }

            setSaving(false);
            setChanges(false);
        } catch (err) {
            console.error("Error saving form:", err);
            alert(`Failed to save form: ${err.message || "Unknown error"}`);
            setSaving(false);
        }
    };

    // Prompt user before leaving if there are unsaved changes
    useEffect(() => {
        if (changes) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            };

            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [changes]);

    if (loading) return <div className="text-center p-6">Loading CRF Builder...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">
                {formId ? `Edit Form: ${form?.name}` : "Create New Form"}
            </h2>

            {formId && formVersion && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                        Editing Version: {formVersion.version}
                        {formVersion.isActive && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Active
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Form metadata editor */}
            {!formId && (
                <div className="mb-6 border-b pb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formName">
                            Form Name
                        </label>
                        <input
                            id="formName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            placeholder="Enter form name"
                            value={form?.name || ""}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formDescription">
                            Description
                        </label>
                        <textarea
                            id="formDescription"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter form description"
                            value={form?.description || ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* Enhanced CRF Builder Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {previewMode ? 'Form Preview' : 'Form Builder'}
                        </h3>
                        <button
                            onClick={togglePreviewMode}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${previewMode
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {previewMode ? (
                                <>
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit Mode</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </>
                            )}
                        </button>
                    </div>

                    {!previewMode && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => createSection('regular')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md flex items-center space-x-1"
                            >
                                <List className="w-4 h-4" />
                                <span>Add Section</span>
                            </button>
                            <button
                                onClick={() => createSection('table')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md flex items-center space-x-1"
                            >
                                <Table className="w-4 h-4" />
                                <span>Add Table Section</span>
                            </button>
                        </div>
                    )}
                </div>

                {previewMode ? (
                    /* Form Preview */
                    <div className="space-y-6">
                        {/* Form Header in Preview */}
                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {form?.name || 'Form Preview'}
                            </h2>
                            {form?.description && (
                                <p className="text-gray-600 mt-2">{form.description}</p>
                            )}
                        </div>

                        {/* Preview Sections */}
                        {crfData?.sections?.map((section) => (
                            <div key={section.id}>
                                {renderPreviewSection(section)}
                            </div>
                        ))}

                        {/* No sections message */}
                        {(!crfData?.sections || crfData.sections.length === 0) && (
                            <div className="text-center py-12 text-gray-500">
                                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">No content to preview</h3>
                                <p className="text-sm">Switch to edit mode and add some sections to see the preview.</p>
                            </div>
                        )}

                        {/* Preview Actions */}
                        {crfData?.sections?.length > 0 && (
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        onClick={() => setPreviewData({})}
                                    >
                                        Clear Form
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Submit Preview
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Form Builder Mode */
                    <div>
                        {/* Form Sections */}
                        {crfData?.sections?.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                {/* Section Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <button
                                                onClick={() => toggleSectionExpansion(section.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {expandedSections[section.id] ?
                                                    <ChevronUp className="w-5 h-5" /> :
                                                    <ChevronDown className="w-5 h-5" />
                                                }
                                            </button>
                                            <div className="flex items-center space-x-2">
                                                {section.type === 'table' ?
                                                    <Table className="w-4 h-4 text-green-600" /> :
                                                    <List className="w-4 h-4 text-blue-600" />
                                                }
                                                <input
                                                    type="text"
                                                    value={section.name}
                                                    onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                                                    className="text-lg font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                                    placeholder="Section name"
                                                />
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {section.type === 'table' ? 'Table' : 'Regular'}
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={section.description || ''}
                                            onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                                            className="text-sm text-gray-600 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-full"
                                            placeholder="Section description (optional)"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => createField(sectionIndex, section)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1 px-2 rounded flex items-center space-x-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{section.type === 'table' ? 'Add Column' : 'Add Field'}</span>
                                        </button>
                                        <button
                                            onClick={() => removeSection(sectionIndex)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium py-1 px-2 rounded flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Remove Section</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Section Content */}
                                {expandedSections[section.id] !== false && (
                                    <>
                                        {/* Table Section Layout */}
                                        {section.type === 'table' && section.fields?.length > 0 && (
                                            <div className="mb-4">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Table Preview</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    {section.fields.map((field) => (
                                                                        <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300 last:border-r-0">
                                                                            {field.label || field.name}
                                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    {section.fields.map((field) => (
                                                                        <td key={field.id} className="px-3 py-2 text-xs text-gray-500 border-r border-gray-300 last:border-r-0">
                                                                            {field.type}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fields in this section */}
                                        {section.fields?.map((field, fieldIndex) => (
                                            <div key={field.id} className="bg-gray-50 rounded p-3 mb-3 last:mb-0">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {section.type === 'table' ? 'Column Name' : 'Field Name'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { name: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Field name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                                        <input
                                                            type="text"
                                                            value={field.label || ''}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Display label"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { type: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="text">Text</option>
                                                            <option value="number">Number</option>
                                                            <option value="date">Date</option>
                                                            <option value="datetime">Date & Time</option>
                                                            <option value="time">Time</option>
                                                            <option value="email">Email</option>
                                                            <option value="tel">Phone</option>
                                                            <option value="url">URL</option>
                                                            <option value="select">Select</option>
                                                            <option value="multiselect">Multi-Select</option>
                                                            <option value="textarea">Textarea</option>
                                                            <option value="checkbox">Checkbox</option>
                                                            <option value="radio">Radio</option>
                                                            <option value="file">File Upload</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, { required: e.target.checked })}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Required</span>
                                                        </label>
                                                        <button
                                                            onClick={() => toggleFieldMetadata(field.id)}
                                                            className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                                                            title="Field Settings"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeField(sectionIndex, fieldIndex)}
                                                            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                                            title="Remove Field"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Field Metadata Panel */}
                                                {showFieldMetadata[field.id] && (
                                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Field Metadata & Settings</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Basic Metadata */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                                <textarea
                                                                    value={field.metadata?.description || ''}
                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                        metadata: { ...field.metadata, description: e.target.value }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    rows="2"
                                                                    placeholder="Field description for documentation"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
                                                                <textarea
                                                                    value={field.metadata?.helpText || ''}
                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                        metadata: { ...field.metadata, helpText: e.target.value }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    rows="2"
                                                                    placeholder="Help text shown to users"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                                                                <input
                                                                    type="text"
                                                                    value={field.metadata?.placeholder || ''}
                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                        metadata: { ...field.metadata, placeholder: e.target.value }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="Placeholder text"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Value</label>
                                                                <input
                                                                    type="text"
                                                                    value={field.metadata?.defaultValue || ''}
                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                        metadata: { ...field.metadata, defaultValue: e.target.value }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="Default value"
                                                                />
                                                            </div>

                                                            {/* Validation Rules */}
                                                            {(field.type === 'text' || field.type === 'textarea') && (
                                                                <>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                                                                        <input
                                                                            type="number"
                                                                            value={field.metadata?.validation?.minLength || ''}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: {
                                                                                    ...field.metadata,
                                                                                    validation: { ...field.metadata?.validation, minLength: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                                                                        <input
                                                                            type="number"
                                                                            value={field.metadata?.validation?.maxLength || ''}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: {
                                                                                    ...field.metadata,
                                                                                    validation: { ...field.metadata?.validation, maxLength: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {field.type === 'number' && (
                                                                <>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                                                                        <input
                                                                            type="number"
                                                                            value={field.metadata?.validation?.min || ''}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: {
                                                                                    ...field.metadata,
                                                                                    validation: { ...field.metadata?.validation, min: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                                                                        <input
                                                                            type="number"
                                                                            value={field.metadata?.validation?.max || ''}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: {
                                                                                    ...field.metadata,
                                                                                    validation: { ...field.metadata?.validation, max: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* Options for select/radio/checkbox fields */}
                                                            {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio' || field.type === 'checkbox') && (
                                                                <div className="col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                                                                    <textarea
                                                                        value={(field.metadata?.options || []).join('\n')}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                options: e.target.value.split('\n').filter(option => option.trim())
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        rows="4"
                                                                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Field Display Settings */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Field Width</label>
                                                                <select
                                                                    value={field.metadata?.fieldWidth || 'full'}
                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                        metadata: { ...field.metadata, fieldWidth: e.target.value }
                                                                    })}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                >
                                                                    <option value="full">Full Width</option>
                                                                    <option value="half">Half Width</option>
                                                                    <option value="third">One Third</option>
                                                                    <option value="quarter">One Quarter</option>
                                                                </select>
                                                            </div>

                                                            {/* Additional Field Settings */}
                                                            <div className="col-span-2">
                                                                <div className="flex flex-wrap gap-4">
                                                                    <label className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={field.metadata?.isReadOnly || false}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: { ...field.metadata, isReadOnly: e.target.checked }
                                                                            })}
                                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <span className="ml-2 text-sm text-gray-700">Read Only</span>
                                                                    </label>
                                                                    <label className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={field.metadata?.isCalculated || false}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: { ...field.metadata, isCalculated: e.target.checked }
                                                                            })}
                                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <span className="ml-2 text-sm text-gray-700">Calculated Field</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Calculation Formula */}
                                                            {field.metadata?.isCalculated && (
                                                                <div className="col-span-2">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Formula</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.calculationFormula || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...field.metadata, calculationFormula: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="e.g., field1 + field2 * 0.1"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {section.fields?.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                <p className="mb-2">No {section.type === 'table' ? 'columns' : 'fields'} in this section.</p>
                                                <p className="text-sm">Click "Add {section.type === 'table' ? 'Column' : 'Field'}" to get started.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        {(!crfData?.sections || crfData.sections.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="mb-4">No sections created yet.</p>
                                <p className="text-sm">Click "Add Section" or "Add Table Section" to start building your form.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => {
                        if (changes && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                            return;
                        }
                        navigate(formId ? `/study-design/forms/${formId}/versions` : "/study-design/forms");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                    disabled={saving}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    disabled={saving || !changes}
                >
                    {saving ? "Saving..." : "Save Form"}
                </button>
            </div>
        </div>
    );
};

export default CRFBuilderIntegration;
