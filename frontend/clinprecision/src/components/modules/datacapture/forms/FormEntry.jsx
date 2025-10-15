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
            // Calculate current completion stats to send to backend
            const currentCompletion = calculateCompletion();

            await saveFormData(subjectId, visitId, formId, {
                ...formData,
                status,
                lastUpdated: new Date().toISOString()
            }, currentCompletion);

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

    // Calculate field completion statistics
    const calculateCompletion = () => {
        if (!formDefinition?.fields) return { completed: 0, total: 0, percentage: 0 };

        const totalFields = formDefinition.fields.length;
        const requiredFields = formDefinition.fields.filter(f => f.metadata?.required);
        const completedFields = formDefinition.fields.filter(field => {
            const value = formData[field.id];
            // Check if field has a value (handles strings, numbers, booleans)
            if (field.type === 'checkbox') {
                return value === true;
            }
            return value !== undefined && value !== null && value !== '';
        });

        const completedRequiredFields = requiredFields.filter(field => {
            const value = formData[field.id];
            if (field.type === 'checkbox') {
                return value === true;
            }
            return value !== undefined && value !== null && value !== '';
        });

        const percentage = totalFields > 0 ? (completedFields.length / totalFields) * 100 : 0;

        return {
            completed: completedFields.length,
            total: totalFields,
            requiredCompleted: completedRequiredFields.length,
            requiredTotal: requiredFields.length,
            percentage: Math.round(percentage)
        };
    };

    const completion = calculateCompletion();

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

            {/* Field Completion Tracker */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Form Completion</h4>
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-blue-600">{completion.completed}</span>
                                <span className="text-gray-600"> of </span>
                                <span className="font-semibold text-gray-700">{completion.total}</span>
                                <span className="text-gray-600"> fields completed</span>
                            </div>
                            {completion.requiredTotal > 0 && (
                                <div className="border-l border-gray-300 pl-4">
                                    <span className="font-semibold text-red-600">{completion.requiredCompleted}</span>
                                    <span className="text-gray-600"> of </span>
                                    <span className="font-semibold text-gray-700">{completion.requiredTotal}</span>
                                    <span className="text-gray-600"> required fields</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{completion.percentage}%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${completion.percentage === 100 ? 'bg-green-600' :
                                completion.percentage >= 75 ? 'bg-blue-600' :
                                    completion.percentage >= 50 ? 'bg-yellow-500' :
                                        completion.percentage > 0 ? 'bg-orange-500' : 'bg-gray-400'
                            }`}
                        style={{ width: `${completion.percentage}%` }}
                    ></div>
                </div>
                {completion.requiredTotal > 0 && completion.requiredCompleted < completion.requiredTotal && (
                    <p className="mt-2 text-xs text-orange-600 font-medium">
                        ⚠ {completion.requiredTotal - completion.requiredCompleted} required field(s) remaining
                    </p>
                )}
            </div>

            {validationErrors.length > 0 && (
                <ValidationErrors errors={validationErrors} />
            )}

            <div className="space-y-6 mb-8">
                {formDefinition.fields.map((field, index) => {
                    const value = formData[field.id];
                    const isCompleted = field.type === 'checkbox'
                        ? value === true
                        : (value !== undefined && value !== null && value !== '');

                    return (
                        <div key={field.id || index} className={`p-4 rounded border-2 transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    {isCompleted && (
                                        <span className="mr-2 text-green-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                    {!isCompleted && field.metadata?.required && (
                                        <span className="mr-2 text-orange-500">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                    {field.label}
                                    {field.metadata?.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {isCompleted && (
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                        Completed
                                    </span>
                                )}
                            </div>
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
                    );
                })}
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