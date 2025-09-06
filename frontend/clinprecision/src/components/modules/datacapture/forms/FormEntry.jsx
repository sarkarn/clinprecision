// FormEntry.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFormDefinition, getFormData, saveFormData } from '../../../../services/DataEntryService';
import ValidationErrors from '../validation/ValidationErrors';

export default function FormEntry() {
    const { subjectId, visitId, formId } = useParams();
    const [formDefinition, setFormDefinition] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {
                // Get the form definition (fields, metadata, etc.)
                const definition = await getFormDefinition(formId);
                setFormDefinition(definition);

                // Get any existing data for this form/subject/visit
                const data = await getFormData(subjectId, visitId, formId);
                setFormData(data || {});
            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [subjectId, visitId, formId]);

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        setIsDirty(true);
    };

    const validateForm = () => {
        const errors = [];

        if (!formDefinition?.fields) return true;

        formDefinition.fields.forEach(field => {
            if (field.metadata?.required && !formData[field.id]) {
                errors.push({
                    fieldId: field.id,
                    message: `${field.label} is required`
                });
            }

            // Number validation
            if (field.type === 'number' && formData[field.id]) {
                const value = parseFloat(formData[field.id]);

                if (isNaN(value)) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} must be a valid number`
                    });
                } else if (field.metadata?.minValue !== undefined && value < field.metadata.minValue) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} must be at least ${field.metadata.minValue}`
                    });
                } else if (field.metadata?.maxValue !== undefined && value > field.metadata.maxValue) {
                    errors.push({
                        fieldId: field.id,
                        message: `${field.label} must not exceed ${field.metadata.maxValue}`
                    });
                }
            }

            // Date validation could be added here
            // Text length validation could be added here
        });

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = async (status = 'incomplete') => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await saveFormData(subjectId, visitId, formId, {
                ...formData,
                status,
                lastUpdated: new Date().toISOString()
            });

            setIsDirty(false);

            if (status === 'complete') {
                // Navigate back to visit details
                navigate(`/datacapture-management/subjects/${subjectId}/visits/${visitId}`);
            }
        } catch (error) {
            console.error('Error saving form data:', error);
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field) => {
        const value = formData[field.id] || '';
        const hasError = validationErrors.some(err => err.fieldId === field.id);
        const fieldClass = `border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md w-full px-3 py-2`;

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={fieldClass}
                        placeholder={field.metadata?.placeholder || ''}
                    />
                );

            case 'number':
                return (
                    <div className="flex items-center">
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={fieldClass}
                            step="any"
                            min={field.metadata?.minValue}
                            max={field.metadata?.maxValue}
                        />
                        {field.metadata?.units && (
                            <span className="ml-2 text-gray-500">{field.metadata.units}</span>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={fieldClass}
                    />
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.metadata?.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`${field.id}_${i}`}
                                    name={field.id}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={() => handleInputChange(field.id, option.value)}
                                    className="h-4 w-4 border-gray-300 text-blue-600"
                                />
                                <label htmlFor={`${field.id}_${i}`} className="ml-2 text-gray-700">
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={field.id}
                            checked={value === true}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            className="h-4 w-4 border-gray-300 rounded text-blue-600"
                        />
                        <label htmlFor={field.id} className="ml-2 text-gray-700">
                            {field.metadata?.checkboxLabel || field.label}
                        </label>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Select an option</option>
                        {field.metadata?.options?.map((option, i) => (
                            <option key={i} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            default:
                return <div>Unsupported field type: {field.type}</div>;
        }
    };

    if (loading) return <div className="text-center py-4">Loading form...</div>;
    if (!formDefinition) return <div className="text-center py-4">Form not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}`} className="text-blue-600 hover:underline">
                    &larr; Back to Visit
                </Link>
                <h3 className="text-xl font-bold mt-2">{formDefinition.name}</h3>
                <p className="text-gray-600">{formDefinition.description}</p>
            </div>

            {validationErrors.length > 0 && (
                <ValidationErrors errors={validationErrors} />
            )}

            <div className="space-y-6 mb-8">
                {formDefinition.fields.map((field, index) => (
                    <div key={field.id || index} className="bg-gray-50 p-4 rounded">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.metadata?.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {field.metadata?.description && (
                            <p className="mt-1 text-xs text-gray-500">{field.metadata.description}</p>
                        )}
                        {validationErrors.map((error, i) =>
                            error.fieldId === field.id ? (
                                <p key={i} className="mt-1 text-xs text-red-500">{error.message}</p>
                            ) : null
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
                <button
                    onClick={() => navigate(`/datacapture-management/subjects/${subjectId}/visits/${visitId}`)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleSave('incomplete')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    disabled={saving || !isDirty}
                >
                    Save as Incomplete
                </button>
                <button
                    onClick={() => handleSave('complete')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Mark as Complete'}
                </button>
            </div>
        </div>
    );
}