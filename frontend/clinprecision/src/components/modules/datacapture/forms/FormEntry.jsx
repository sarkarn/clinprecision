// FormEntry.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFormDefinition, getFormData, saveFormData } from '../../../../services/DataEntryService';
import ValidationErrors from '../validation/ValidationErrors';
import ValidationEngine from '../../../../services/ValidationEngine';
import OptionLoaderService from '../../../../services/OptionLoaderService';

export default function FormEntry() {
    const { subjectId, visitId, formId } = useParams();
    const [formDefinition, setFormDefinition] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [fieldWarnings, setFieldWarnings] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [fieldOptions, setFieldOptions] = useState({}); // {fieldId: options[]}
    const [loadingOptions, setLoadingOptions] = useState({}); // {fieldId: boolean}
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

    // Load options for select, radio, and multiselect fields
    useEffect(() => {
        if (!formDefinition?.fields) return;

        const loadAllOptions = async () => {
            // Get current study ID from URL or context
            const studyId = window.location.pathname.split('/')[2]; // Assuming /studies/{studyId}/...

            const context = {
                studyId,
                subjectId,
                visitId,
                formId
            };

            for (const field of formDefinition.fields) {
                // Only load options for fields that need them
                if (['select', 'radio', 'multiselect'].includes(field.type)) {
                    await loadFieldOptions(field, context);
                }
            }
        };

        loadAllOptions();
    }, [formDefinition, subjectId, visitId, formId]);

    const loadFieldOptions = async (field, context) => {
        setLoadingOptions(prev => ({ ...prev, [field.id]: true }));

        try {
            const options = await OptionLoaderService.loadFieldOptions(field, context);
            setFieldOptions(prev => ({ ...prev, [field.id]: options }));
        } catch (error) {
            console.error(`Error loading options for field ${field.id}:`, error);
            // On error, use empty array or static fallback
            setFieldOptions(prev => ({ ...prev, [field.id]: [] }));
        } finally {
            setLoadingOptions(prev => ({ ...prev, [field.id]: false }));
        }
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        setIsDirty(true);
    };

    const validateForm = () => {
        if (!formDefinition?.fields) return true;

        // Use ValidationEngine for comprehensive validation
        const result = ValidationEngine.validateForm(formData, formDefinition);

        // Update state with validation results
        setFieldErrors(result.fieldErrors || {});
        setFieldWarnings(result.fieldWarnings || {});
        setValidationErrors(result.errors || []); // Keep for backward compatibility

        return result.valid;
    };

    // Field-level validation on blur for immediate feedback
    const handleFieldBlur = (fieldId) => {
        if (!formDefinition?.fields) return;

        const field = formDefinition.fields.find(f => f.id === fieldId);
        if (!field) return;

        // Validate single field
        const result = ValidationEngine.validateField(
            fieldId,
            formData[fieldId],
            field.metadata,
            formData
        );

        // Update field-level errors and warnings
        setFieldErrors(prev => ({
            ...prev,
            [fieldId]: result.errors || []
        }));

        setFieldWarnings(prev => ({
            ...prev,
            [fieldId]: result.warnings || []
        }));
    };

    const handleSave = async (status = 'incomplete') => {
        if (!validateForm()) return;

        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            // Calculate current completion stats to send to backend
            const currentCompletion = calculateCompletion();

            await saveFormData(subjectId, visitId, formId, {
                ...formData,
                status,
                lastUpdated: new Date().toISOString()
            }, currentCompletion);

            setIsDirty(false);
            setSaveSuccess(true);

            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);

            if (status === 'complete') {
                // Navigate back to visit details after a short delay to show success message
                setTimeout(() => {
                    navigate(`/datacapture-management/subjects/${subjectId}/visits/${visitId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving form data:', error);
            setSaveError(error.message || 'Failed to save form data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field) => {
        const value = formData[field.id] || '';
        const hasError = fieldErrors[field.id] && fieldErrors[field.id].length > 0;
        const hasWarning = fieldWarnings[field.id] && fieldWarnings[field.id].length > 0;

        // Determine border color: red for errors, yellow for warnings, gray otherwise
        const borderColor = hasError ? 'border-red-500' : (hasWarning ? 'border-yellow-400' : 'border-gray-300');
        const fieldClass = `border ${borderColor} rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`;

        const renderValidationMessages = () => (
            <>
                {hasError && fieldErrors[field.id].map((error, idx) => (
                    <div key={`error-${idx}`} className="text-red-600 text-sm mt-1 flex items-start">
                        <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error.message}
                    </div>
                ))}
                {hasWarning && fieldWarnings[field.id].map((warning, idx) => (
                    <div key={`warning-${idx}`} className="text-orange-600 text-sm mt-1 flex items-start">
                        <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {warning.message}
                    </div>
                ))}
            </>
        );

        switch (field.type) {
            case 'text':
                return (
                    <div>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                            placeholder={field.metadata?.placeholder || ''}
                        />
                        {renderValidationMessages()}
                    </div>
                );

            case 'number':
                return (
                    <div>
                        <div className="flex items-center">
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                onBlur={() => handleFieldBlur(field.id)}
                                className={fieldClass}
                                step="any"
                                min={field.metadata?.minValue}
                                max={field.metadata?.maxValue}
                            />
                            {field.metadata?.units && (
                                <span className="ml-2 text-gray-500 font-medium">{field.metadata.units}</span>
                            )}
                        </div>
                        {renderValidationMessages()}
                    </div>
                );

            case 'date':
                return (
                    <div>
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                        />
                        {renderValidationMessages()}
                    </div>
                );

            case 'radio':
                const radioOptions = fieldOptions[field.id] || [];
                const isLoadingRadioOptions = loadingOptions[field.id];

                return (
                    <div>
                        {isLoadingRadioOptions ? (
                            <div className="text-sm text-gray-500">
                                <span className="inline-block animate-spin mr-1">⏳</span>
                                Loading options...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {radioOptions.map((option, i) => (
                                    <div key={i} className="flex items-center">
                                        <input
                                            type="radio"
                                            id={`${field.id}_${i}`}
                                            name={field.id}
                                            value={option.value}
                                            checked={value === option.value}
                                            onChange={() => {
                                                handleInputChange(field.id, option.value);
                                                // Validate after selection
                                                setTimeout(() => handleFieldBlur(field.id), 0);
                                            }}
                                            className="h-4 w-4 border-gray-300 text-blue-600"
                                        />
                                        <label htmlFor={`${field.id}_${i}`} className="ml-2 text-gray-700" title={option.description}>
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {renderValidationMessages()}
                    </div>
                );

            case 'checkbox':
                return (
                    <div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={field.id}
                                checked={value === true}
                                onChange={(e) => {
                                    handleInputChange(field.id, e.target.checked);
                                    // Validate after change
                                    setTimeout(() => handleFieldBlur(field.id), 0);
                                }}
                                className="h-4 w-4 border-gray-300 rounded text-blue-600"
                            />
                            <label htmlFor={field.id} className="ml-2 text-gray-700">
                                {field.metadata?.checkboxLabel || field.label}
                            </label>
                        </div>
                        {renderValidationMessages()}
                    </div>
                );

            case 'select':
                const options = fieldOptions[field.id] || [];
                const isLoadingOptions = loadingOptions[field.id];

                return (
                    <div>
                        <select
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                            disabled={isLoadingOptions}
                        >
                            <option value="">
                                {isLoadingOptions ? 'Loading options...' : 'Select an option'}
                            </option>
                            {options.map((option, i) => (
                                <option key={i} value={option.value} title={option.description}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {isLoadingOptions && (
                            <div className="mt-1 text-sm text-gray-500">
                                <span className="inline-block animate-spin mr-1">⏳</span>
                                Loading options...
                            </div>
                        )}
                        {renderValidationMessages()}
                    </div>
                );

            case 'datetime':
            case 'datetime-local':
                return (
                    <div>
                        <input
                            type="datetime-local"
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                        />
                        {renderValidationMessages()}
                    </div>
                );

            case 'textarea':
                return (
                    <div>
                        <textarea
                            value={value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                            placeholder={field.metadata?.placeholder || ''}
                            rows={field.metadata?.rows || 4}
                            maxLength={field.metadata?.maxLength}
                        />
                        {renderValidationMessages()}
                    </div>
                );

            case 'calculated':
                // Calculated fields are read-only, value is computed from formula
                return (
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                value={value}
                                readOnly
                                className={`${fieldClass} bg-gray-100 cursor-not-allowed`}
                                placeholder={field.metadata?.placeholder || 'Automatically calculated'}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        {field.metadata?.formula && (
                            <div className="text-xs text-gray-500 mt-1 italic">
                                Formula: {field.metadata.formula}
                            </div>
                        )}
                        {renderValidationMessages()}
                    </div>
                );

            default:
                return (
                    <div>
                        <div className="text-orange-600 text-sm bg-orange-50 border border-orange-200 rounded p-2">
                            ⚠️ Unsupported field type: <span className="font-semibold">{field.type}</span>
                        </div>
                    </div>
                );
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
                                <p className="mt-1 text-xs text-gray-500 italic">{field.metadata.description}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800 font-medium">Form data saved successfully!</span>
                </div>
            )}

            {/* Error Message */}
            {saveError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <span className="text-red-800 font-medium">Error saving form:</span>
                        <p className="text-red-700 text-sm mt-1">{saveError}</p>
                    </div>
                    <button
                        onClick={() => setSaveError(null)}
                        className="text-red-600 hover:text-red-800 ml-2"
                    >
                        ×
                    </button>
                </div>
            )}

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