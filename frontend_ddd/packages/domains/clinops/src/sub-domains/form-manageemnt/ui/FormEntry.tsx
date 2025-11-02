// FormEntry.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFormDefinition, getFormData, saveFormData } from 'services/data-capture/DataEntryService';
import ValidationErrors from '../utils/ValidationErrors';
import ValidationEngine from 'services/quality/ValidationEngine';
import OptionLoaderService from 'services/OptionLoaderService';

// Interface definitions
interface FieldOption {
    value: string;
    label: string;
    description?: string;
}

interface FieldMetadata {
    required?: boolean;
    placeholder?: string;
    description?: string;
    units?: string;
    minValue?: number;
    maxValue?: number;
    rows?: number;
    maxLength?: number;
    checkboxLabel?: string;
    codeListCategory?: string;
    formula?: string;
    options?: FieldOption[];
}

interface FormField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'radio' | 'checkbox' | 'select' | 'multiselect' | 'checkbox-group' | 'datetime' | 'datetime-local' | 'calculated';
    metadata?: FieldMetadata;
}

interface FormDefinition {
    name: string;
    description: string;
    fields: FormField[];
}

interface FormDataType {
    [key: string]: any;
    status?: string;
    lastUpdated?: string;
}

interface ValidationError {
    message: string;
}

interface ValidationWarning {
    message: string;
}

interface ValidationResult {
    valid: boolean;
    fieldErrors?: { [key: string]: ValidationError[] };
    fieldWarnings?: { [key: string]: ValidationWarning[] };
    errors?: any[];
}

interface FieldValidationResult {
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
}

interface CompletionStats {
    completed: number;
    total: number;
    requiredCompleted: number;
    requiredTotal: number;
    percentage: number;
}

interface LoadContext {
    studyId: string;
    subjectId: string;
    visitId: string;
    formId: string;
}

const validationEngine = ValidationEngine as any;

const FormEntry: React.FC = () => {
    const { subjectId, visitId, formId } = useParams<{ subjectId: string; visitId: string; formId: string }>();
    const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
    const [formData, setFormData] = useState<FormDataType>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: ValidationError[] }>({});
    const [fieldWarnings, setFieldWarnings] = useState<{ [key: string]: ValidationWarning[] }>({});
    const [isDirty, setIsDirty] = useState(false);
    const [fieldOptions, setFieldOptions] = useState<{ [key: string]: FieldOption[] }>({}); // {fieldId: options[]}
    const [loadingOptions, setLoadingOptions] = useState<{ [key: string]: boolean }>({}); // {fieldId: boolean}
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {
                // Get the form definition (fields, metadata, etc.)
                const definition = await getFormDefinition(formId!) as any;
                setFormDefinition(definition);

                // Get any existing data for this form/subject/visit
                const data = await (getFormData as any)(subjectId!, visitId!, formId!) as any;
                setFormData(data || {});
            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [subjectId, visitId, formId]);

    // Load options for select, radio, multiselect, and checkbox-group fields
    useEffect(() => {
        if (!formDefinition?.fields) return;

        const loadAllOptions = async () => {
            // Get current study ID from URL or context
            const studyId = window.location.pathname.split('/')[2]; // Assuming /studies/{studyId}/...

            const context: LoadContext = {
                studyId,
                subjectId: subjectId!,
                visitId: visitId!,
                formId: formId!
            };

            console.log('🔍 [FormEntry] Starting to load options for fields...');
            console.log('🔍 [FormEntry] Total fields:', formDefinition.fields.length);

            for (const field of formDefinition.fields) {
                // Only load options for fields that need them
                if (['select', 'radio', 'multiselect', 'checkbox-group'].includes(field.type)) {
                    console.log(`🔍 [FormEntry] Loading options for field: ${field.id}, type: ${field.type}`);
                    console.log(`🔍 [FormEntry] Field metadata:`, field.metadata);
                    console.log(`🔍 [FormEntry] Code list category:`, field.metadata?.codeListCategory);
                    await loadFieldOptions(field, context);
                }
            }

            console.log('🔍 [FormEntry] Finished loading all options');
        };

        loadAllOptions();
    }, [formDefinition, subjectId, visitId, formId]);

    const loadFieldOptions = async (field: FormField, context: LoadContext) => {
        setLoadingOptions(prev => ({ ...prev, [field.id]: true }));

        try {
            const options = await OptionLoaderService.loadFieldOptions(field, context) as any;
            console.log(`✅ [FormEntry] Loaded ${options.length} options for field ${field.id}:`, options);
            setFieldOptions(prev => ({ ...prev, [field.id]: options }));
        } catch (error) {
            console.error(`❌ [FormEntry] Error loading options for field ${field.id}:`, error);
            // On error, use empty array or static fallback
            setFieldOptions(prev => ({ ...prev, [field.id]: [] }));
        } finally {
            setLoadingOptions(prev => ({ ...prev, [field.id]: false }));
        }
    };

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        setIsDirty(true);
    };

    const validateForm = (): boolean => {
        if (!formDefinition?.fields) return true;

        // Use ValidationEngine for comprehensive validation
    const result = validationEngine.validateForm(formData, formDefinition) as any as ValidationResult;

        // Update state with validation results
        setFieldErrors(result.fieldErrors || {});
        setFieldWarnings(result.fieldWarnings || {});
        setValidationErrors(result.errors || []); // Keep for backward compatibility

        return result.valid;
    };

    // Field-level validation on blur for immediate feedback
    const handleFieldBlur = (fieldId: string) => {
        if (!formDefinition?.fields) return;

        const field = formDefinition.fields.find((f: FormField) => f.id === fieldId);
        if (!field) return;

        // Validate single field
    const result = validationEngine.validateField(
            fieldId,
            formData[fieldId],
            field.metadata,
            formData
        ) as any as FieldValidationResult;

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

    const handleSave = async (status: 'incomplete' | 'complete' = 'incomplete') => {
        if (!validateForm()) return;

        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            // Calculate current completion stats to send to backend
            const currentCompletion = calculateCompletion();

            await saveFormData(subjectId!, visitId!, formId!, {
                ...formData,
                status,
                lastUpdated: new Date().toISOString()
            }, currentCompletion as any) as any;

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
        } catch (error: any) {
            console.error('Error saving form data:', error);
            setSaveError(error.message || 'Failed to save form data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field: FormField): React.ReactElement => {
        const value = formData[field.id] || '';
        const hasError = fieldErrors[field.id] && fieldErrors[field.id].length > 0;
        const hasWarning = fieldWarnings[field.id] && fieldWarnings[field.id].length > 0;

        // Determine border color: red for errors, yellow for warnings, gray otherwise
        const borderColor = hasError ? 'border-red-500' : (hasWarning ? 'border-yellow-400' : 'border-gray-300');
        const fieldClass = `border ${borderColor} rounded-md w-full px-3 py-2 focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`;

    const renderValidationMessages = (): React.ReactElement => (
            <>
                {hasError && fieldErrors[field.id].map((error: ValidationError, idx: number) => (
                    <div key={`error-${idx}`} className="text-red-600 text-sm mt-1 flex items-start">
                        <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error.message}
                    </div>
                ))}
                {hasWarning && fieldWarnings[field.id].map((warning: ValidationWarning, idx: number) => (
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
                                {radioOptions.map((option: FieldOption, i: number) => (
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

                console.log(`🎯 [SELECT RENDER] Field ${field.id}:`, {
                    optionsCount: options.length,
                    options: options,
                    isLoading: isLoadingOptions,
                    allFieldOptions: Object.keys(fieldOptions),
                    fieldOptionsForThisField: fieldOptions[field.id]
                });

                return (
                    <div>
                        <select
                            value={value || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            onBlur={() => handleFieldBlur(field.id)}
                            className={fieldClass}
                            disabled={isLoadingOptions}
                        >
                            <option value="">
                                {isLoadingOptions ? 'Loading options...' : 'Select an option'}
                            </option>
                            {options.map((option: FieldOption, i: number) => (
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

            case 'multiselect':
                const multiselectOptions = fieldOptions[field.id] || [];
                const isLoadingMultiselectOptions = loadingOptions[field.id];
                const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

                return (
                    <div>
                        {isLoadingMultiselectOptions ? (
                            <div className="text-sm text-gray-500">
                                <span className="inline-block animate-spin mr-1">⏳</span>
                                Loading options...
                            </div>
                        ) : (
                            <select
                                multiple
                                value={selectedValues}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                                    handleInputChange(field.id, selected);
                                }}
                                onBlur={() => handleFieldBlur(field.id)}
                                className={`${fieldClass} h-auto`}
                                size={Math.min(multiselectOptions.length, 6)}
                                disabled={isLoadingMultiselectOptions}
                            >
                                {multiselectOptions.map((option: FieldOption, i: number) => (
                                    <option key={i} value={option.value} title={option.description}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        {selectedValues.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {selectedValues.map((val: string, idx: number) => {
                                    const opt = multiselectOptions.find((o: FieldOption) => o.value === val);
                                    return opt ? (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {opt.label}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValues = selectedValues.filter((v: string) => v !== val);
                                                    handleInputChange(field.id, newValues);
                                                }}
                                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                            Hold Ctrl (Windows) or Cmd (Mac) to select multiple options
                        </div>
                        {renderValidationMessages()}
                    </div>
                );

            case 'checkbox-group':
                const checkboxGroupOptions = fieldOptions[field.id] || [];
                const isLoadingCheckboxOptions = loadingOptions[field.id];
                const checkedValues = Array.isArray(value) ? value : (value ? [value] : []);

                return (
                    <div>
                        {isLoadingCheckboxOptions ? (
                            <div className="text-sm text-gray-500">
                                <span className="inline-block animate-spin mr-1">⏳</span>
                                Loading options...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {checkboxGroupOptions.map((option: FieldOption, i: number) => {
                                    const isChecked = checkedValues.includes(option.value);
                                    return (
                                        <div key={i} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`${field.id}_${i}`}
                                                value={option.value}
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    let newValues: string[];
                                                    if (e.target.checked) {
                                                        newValues = [...checkedValues, option.value];
                                                    } else {
                                                        newValues = checkedValues.filter((v: string) => v !== option.value);
                                                    }
                                                    handleInputChange(field.id, newValues);
                                                    // Validate after selection
                                                    setTimeout(() => handleFieldBlur(field.id), 0);
                                                }}
                                                className="h-4 w-4 border-gray-300 rounded text-blue-600"
                                            />
                                            <label
                                                htmlFor={`${field.id}_${i}`}
                                                className="ml-2 text-gray-700 cursor-pointer"
                                                title={option.description}
                                            >
                                                {option.label}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {checkedValues.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {checkedValues.map((val: string, idx: number) => {
                                    const opt = checkboxGroupOptions.find((o: FieldOption) => o.value === val);
                                    return opt ? (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {opt.label}
                                        </span>
                                    ) : null;
                                })}
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
    const calculateCompletion = (): CompletionStats => {
        if (!formDefinition?.fields) return { completed: 0, total: 0, requiredCompleted: 0, requiredTotal: 0, percentage: 0 };

        const totalFields = formDefinition.fields.length;
        const requiredFields = formDefinition.fields.filter((f: FormField) => f.metadata?.required);
        const completedFields = formDefinition.fields.filter((field: FormField) => {
            const value = formData[field.id];
            // Check if field has a value (handles strings, numbers, booleans, arrays)
            if (field.type === 'checkbox') {
                return value === true;
            }
            if (field.type === 'multiselect' || field.type === 'checkbox-group') {
                return Array.isArray(value) && value.length > 0;
            }
            return value !== undefined && value !== null && value !== '';
        });

        const completedRequiredFields = requiredFields.filter((field: FormField) => {
            const value = formData[field.id];
            if (field.type === 'checkbox') {
                return value === true;
            }
            if (field.type === 'multiselect' || field.type === 'checkbox-group') {
                return Array.isArray(value) && value.length > 0;
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
                {formDefinition.fields.map((field: FormField, index: number) => {
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
};

export default FormEntry;
