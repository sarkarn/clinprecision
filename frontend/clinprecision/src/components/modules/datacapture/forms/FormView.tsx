// FormView.tsx - Read-only Form Data Display
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFormDefinition, getFormData } from 'services/data-capture/DataEntryService';

// Type definitions
interface FieldMetadata {
    required?: boolean;
    units?: string;
    description?: string;
    options?: Array<{ value: string; label: string }>;
}

interface FormField {
    id: string;
    label: string;
    type: string;
    metadata?: FieldMetadata;
}

interface FormDefinition {
    name: string;
    description: string;
    fields: FormField[];
}

interface FormDataType {
    [key: string]: any;
    lastUpdated?: string;
}

const FormView: React.FC = () => {
    const { subjectId, visitId, formId } = useParams<{ subjectId: string; visitId: string; formId: string }>();
    const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
    const [formData, setFormData] = useState<FormDataType>({});
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFormData = async () => {
            setLoading(true);
            try {
                // Get the form definition (fields, metadata, etc.)
                const definition = await getFormDefinition(formId!) as any;
                setFormDefinition(definition);

                // Get form data
                const data = await getFormData(subjectId!, visitId!, formId!) as any;
                setFormData(data || {});
            } catch (error: any) {
                console.error('Error fetching form data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [subjectId, visitId, formId]);

    const renderFieldValue = (field: FormField): JSX.Element => {
        const value = formData[field.id];

        if (value === undefined || value === null || value === '') {
            return <span className="text-gray-400">Not provided</span>;
        }

        switch (field.type) {
            case 'text':
            case 'textarea':
                return <p>{value}</p>;

            case 'number':
                return (
                    <p>
                        {value} {field.metadata?.units && <span className="text-gray-500">{field.metadata.units}</span>}
                    </p>
                );

            case 'date':
                return <p>{new Date(value).toLocaleDateString()}</p>;

            case 'time':
                return <p>{value}</p>;

            case 'radio':
                const radioOption = field.metadata?.options?.find(opt => opt.value === value);
                return <p>{radioOption?.label || value}</p>;

            case 'checkbox':
                return <p>{value === true ? 'Yes' : 'No'}</p>;

            case 'select':
                const selectOption = field.metadata?.options?.find(opt => opt.value === value);
                return <p>{selectOption?.label || value}</p>;

            case 'multiselect':
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-gray-400">None selected</span>;
                }

                const selectedOptions = field.metadata?.options
                    ?.filter(opt => value.includes(opt.value))
                    .map(opt => opt.label);

                return (
                    <ul className="list-disc list-inside">
                        {selectedOptions?.map((label, i) => (
                            <li key={i}>{label}</li>
                        ))}
                    </ul>
                );

            default:
                return <p>{String(value)}</p>;
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Loading form data...</p>
            </div>
        );
    }

    if (!formDefinition) {
        return (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-gray-700">Form not found</p>
                <button
                    onClick={() => navigate(`/datacapture-management/subjects/${subjectId}/visits/${visitId}`)}
                    className="mt-3 text-blue-600 hover:underline"
                >
                    Return to Visit
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}`} className="text-blue-600 hover:underline">
                    &larr; Back to Visit
                </Link>
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <h3 className="text-xl font-bold">{formDefinition.name}</h3>
                        <p className="text-gray-600">{formDefinition.description}</p>
                    </div>
                    <div>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Complete
                        </span>
                    </div>
                </div>
                {formData.lastUpdated && (
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {new Date(formData.lastUpdated).toLocaleString()}
                    </p>
                )}
            </div>

            <div className="space-y-6 mb-8">
                {formDefinition.fields.map((field, index) => (
                    <div key={field.id || index} className="bg-gray-50 p-4 rounded">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.metadata?.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <div className="bg-white border border-gray-300 rounded-md p-2">
                            {renderFieldValue(field)}
                        </div>
                        {field.metadata?.description && (
                            <p className="mt-1 text-xs text-gray-500">{field.metadata.description}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
                <button
                    onClick={() => navigate(`/datacapture-management/subjects/${subjectId}/visits/${visitId}`)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                    Back to Visit
                </button>
                <Link
                    to={`/datacapture-management/subjects/${subjectId}/visits/${visitId}/forms/${formId}/entry`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Edit Form
                </Link>
            </div>
        </div>
    );
};

export default FormView;
