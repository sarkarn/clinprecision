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

            {/* This is where the actual CRF Builder component would be integrated */}
            <div className="min-h-[400px] border border-dashed border-gray-300 rounded-lg p-4 mb-6">
                <p className="text-gray-500 text-center">
                    CRF Builder Component Would Be Integrated Here
                </p>
                <p className="text-sm text-gray-400 text-center mt-2">
                    This placeholder will be replaced with the actual form builder interface
                </p>
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
