import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormService from '../../../services/FormService';
import FormVersionService from '../../../services/FormVersionService';
import CRFBuilder from './designer/CRFBuilder';

const FormDesigner = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [formVersion, setFormVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('edit'); // 'edit', 'view', 'create'
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                if (formId) {
                    // Editing or viewing existing form
                    const formData = await FormService.getFormById(formId);
                    setForm(formData);

                    // Get the latest version of the form
                    try {
                        const versionData = await FormVersionService.getCurrentFormVersion(formId);
                        setFormVersion(versionData);
                    } catch (versionError) {
                        console.warn("Could not fetch current form version:", versionError);
                    }

                    setMode(formId ? 'edit' : 'create');
                } else {
                    // Creating a new form
                    setForm({
                        name: '',
                        description: '',
                        fields: [],
                        fieldGroups: [],
                    });
                    setMode('create');
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load form data');
                setLoading(false);
                console.error(err);
            }
        };

        fetchForm();
    }, [formId]);

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (mode === 'create') {
                // Create a new form
                const response = await FormService.createForm(formData);
                alert('Form created successfully!');
                navigate(`/study-design/forms/${response.id}`);
            } else {
                // Update existing form
                const response = await FormService.updateForm(formId, formData);

                // Create a new version if needed
                if (formVersion) {
                    await FormVersionService.createFormVersion(formId, {
                        fields: formData.fields,
                        fieldGroups: formData.fieldGroups,
                        name: formData.name,
                        description: formData.description
                    });
                }

                setForm(response);
                alert('Form saved successfully!');
            }
        } catch (err) {
            alert(`Error saving form: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/study-design/forms');
    };

    if (loading) return <div className="text-center py-4">Loading form...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">
                    {mode === 'create' ? 'Create New Form' : (mode === 'view' ? 'View Form' : 'Edit Form')}
                </h2>
                {formVersion && (
                    <div className="text-sm text-gray-500">
                        Version: {formVersion.version} ({new Date(formVersion.createdAt).toLocaleDateString()})
                    </div>
                )}
            </div>

            <CRFBuilder
                onSave={handleSave}
                onCancel={handleCancel}
                initialData={{
                    name: form?.name || '',
                    fields: form?.fields || [],
                    fieldGroups: form?.fieldGroups || [],
                    templateId: form?.templateId
                }}
                readOnly={mode === 'view'}
            />

            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <p className="text-lg">Saving form...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormDesigner;
