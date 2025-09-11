import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
                    <h3 className="text-lg font-semibold text-gray-900">Form Builder</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                const newSection = {
                                    id: `section_${Date.now()}`,
                                    name: 'New Section',
                                    fields: []
                                };
                                const updatedData = {
                                    ...crfData,
                                    sections: [...(crfData.sections || []), newSection]
                                };
                                handleCrfDataUpdate(updatedData);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md"
                        >
                            Add Section
                        </button>
                    </div>
                </div>

                {/* Form Sections */}
                {crfData?.sections?.map((section, sectionIndex) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                value={section.name}
                                onChange={(e) => {
                                    const updatedSections = [...crfData.sections];
                                    updatedSections[sectionIndex] = { ...section, name: e.target.value };
                                    handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                }}
                                className="text-lg font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                placeholder="Section name"
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        const newField = {
                                            id: `field_${Date.now()}`,
                                            name: 'New Field',
                                            type: 'text',
                                            required: false
                                        };
                                        const updatedSections = [...crfData.sections];
                                        updatedSections[sectionIndex] = {
                                            ...section,
                                            fields: [...(section.fields || []), newField]
                                        };
                                        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1 px-2 rounded"
                                >
                                    Add Field
                                </button>
                                <button
                                    onClick={() => {
                                        const updatedSections = crfData.sections.filter((_, i) => i !== sectionIndex);
                                        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium py-1 px-2 rounded"
                                >
                                    Remove Section
                                </button>
                            </div>
                        </div>

                        {/* Fields in this section */}
                        {section.fields?.map((field, fieldIndex) => (
                            <div key={field.id} className="bg-gray-50 rounded p-3 mb-3 last:mb-0">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => {
                                                const updatedSections = [...crfData.sections];
                                                const updatedFields = [...section.fields];
                                                updatedFields[fieldIndex] = { ...field, name: e.target.value };
                                                updatedSections[sectionIndex] = { ...section, fields: updatedFields };
                                                handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Field name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={field.type}
                                            onChange={(e) => {
                                                const updatedSections = [...crfData.sections];
                                                const updatedFields = [...section.fields];
                                                updatedFields[fieldIndex] = { ...field, type: e.target.value };
                                                updatedSections[sectionIndex] = { ...section, fields: updatedFields };
                                                handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="select">Select</option>
                                            <option value="textarea">Textarea</option>
                                            <option value="checkbox">Checkbox</option>
                                            <option value="radio">Radio</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => {
                                                    const updatedSections = [...crfData.sections];
                                                    const updatedFields = [...section.fields];
                                                    updatedFields[fieldIndex] = { ...field, required: e.target.checked };
                                                    updatedSections[sectionIndex] = { ...section, fields: updatedFields };
                                                    handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                                }}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Required</span>
                                        </label>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => {
                                                const updatedSections = [...crfData.sections];
                                                const updatedFields = section.fields.filter((_, i) => i !== fieldIndex);
                                                updatedSections[sectionIndex] = { ...section, fields: updatedFields };
                                                handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium py-1 px-2 rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {section.fields?.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No fields in this section. Click "Add Field" to get started.
                            </div>
                        )}
                    </div>
                ))}

                {(!crfData?.sections || crfData.sections.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="mb-4">No sections created yet.</p>
                        <p className="text-sm">Click "Add Section" to start building your form.</p>
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
