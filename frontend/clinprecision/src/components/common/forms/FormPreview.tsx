import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Smartphone, Tablet, Monitor, Refresh } from 'lucide-react';
import FormRenderer from './FormRenderer';
import { FormProvider } from './FormContext';

interface Field {
    id: string;
    name?: string;
    label?: string;
    type: string;
    required?: boolean;
    options?: string[];
    metadata?: Record<string, any>;
    validation?: Record<string, any>;
}

interface FormSection {
    id: string;
    name: string;
    description?: string;
    fields?: Field[];
}

interface FormDefinition {
    sections?: FormSection[];
    fields?: Field[];
    version?: string;
    metadata?: {
        estimatedTime?: number;
        [key: string]: any;
    };
}

interface FormPreviewProps {
    formDefinition: FormDefinition;
    context?: 'general' | 'study' | 'template' | 'patient';
    mode?: 'interactive' | 'static' | 'filled';
    sampleData?: Record<string, any>;
    showDevicePreview?: boolean;
    showMetadata?: boolean;
    showValidation?: boolean;
    allowDataEntry?: boolean;
    className?: string;
    onDataChange?: (data: Record<string, any>) => void;
    customStyles?: Record<string, any>;
    [key: string]: any;
}

/**
 * FormPreview - Reusable form preview component
 * 
 * Can render forms in different preview modes:
 * - Interactive preview with sample data
 * - Static preview showing form structure
 * - Responsive preview for different device sizes
 * - Read-only preview showing filled form
 */
const FormPreview: React.FC<FormPreviewProps> = ({
    formDefinition,
    context = 'general',
    mode = 'interactive',
    sampleData = {},
    showDevicePreview = true,
    showMetadata = true,
    showValidation = false,
    allowDataEntry = true,
    className = '',
    onDataChange = () => { },
    customStyles = {},
    ...props
}) => {
    const [previewMode, setPreviewMode] = useState<'interactive' | 'filled' | 'structure'>('interactive');
    const [deviceSize, setDeviceSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [showStructure, setShowStructure] = useState(false);
    const [previewData, setPreviewData] = useState<Record<string, any>>(sampleData);

    // Sample value generators
    const getSampleTextValue = (field: Field): string => {
        const samples: Record<string, string> = {
            'first_name': 'John',
            'last_name': 'Doe',
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone': '+1 (555) 123-4567',
            'address': '123 Main Street',
            'city': 'New York',
            'zip': '10001',
            'subject_id': 'SUB-001',
            'medication': 'Aspirin 81mg',
            'default': 'Sample text value'
        };

        const fieldName = field.name?.toLowerCase() || field.id?.toLowerCase() || '';

        for (const [key, value] of Object.entries(samples)) {
            if (fieldName.includes(key)) {
                return value;
            }
        }

        return samples.default;
    };

    const getSampleNumberValue = (field: Field): number => {
        const fieldName = field.name?.toLowerCase() || field.id?.toLowerCase() || '';

        if (fieldName.includes('age')) return Math.floor(Math.random() * 70) + 18;
        if (fieldName.includes('weight')) return Math.floor(Math.random() * 50) + 50;
        if (fieldName.includes('height')) return Math.floor(Math.random() * 50) + 150;
        if (fieldName.includes('temperature')) return parseFloat((Math.random() * 5 + 36).toFixed(1));
        if (fieldName.includes('pressure')) return Math.floor(Math.random() * 40) + 110;
        if (fieldName.includes('dose')) return Math.floor(Math.random() * 100) + 10;

        const min = field.metadata?.min || field.validation?.min || 0;
        const max = field.metadata?.max || field.validation?.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const getSampleDateValue = (field: Field): string => {
        const today = new Date();
        const fieldName = field.name?.toLowerCase() || field.id?.toLowerCase() || '';

        if (fieldName.includes('birth') || fieldName.includes('dob')) {
            const ageInYears = Math.floor(Math.random() * 62) + 18;
            const birthDate = new Date(today.getFullYear() - ageInYears,
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1);
            return birthDate.toISOString().split('T')[0];
        }

        if (fieldName.includes('start') || fieldName.includes('enroll')) {
            const startDate = new Date(today);
            startDate.setMonth(today.getMonth() - Math.floor(Math.random() * 6));
            return startDate.toISOString().split('T')[0];
        }

        return today.toISOString().split('T')[0];
    };

    const getSampleTextareaValue = (field: Field): string => {
        const samples: Record<string, string> = {
            'notes': 'Patient reports feeling well overall. No significant changes since last visit.',
            'history': 'Hypertension diagnosed 5 years ago. Currently managed with ACE inhibitor.',
            'symptoms': 'Occasional mild headaches, typically in the morning. No other concerning symptoms.',
            'comments': 'Well-tolerated procedure. Patient comfortable throughout.',
            'description': 'This is a sample description showing how longer text appears in the form.',
            'default': 'This is sample text content that demonstrates how textarea fields appear when filled with data.'
        };

        const fieldName = field.name?.toLowerCase() || field.id?.toLowerCase() || '';

        for (const [key, value] of Object.entries(samples)) {
            if (fieldName.includes(key)) {
                return value;
            }
        }

        return samples.default;
    };

    // Generate sample data based on form structure
    const generateSampleData = useMemo(() => {
        const sampleData: Record<string, any> = {};

        const processFields = (fields: Field[]) => {
            fields.forEach(field => {
                switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'tel':
                    case 'url':
                        sampleData[field.id] = getSampleTextValue(field);
                        break;
                    case 'number':
                    case 'integer':
                    case 'float':
                        sampleData[field.id] = getSampleNumberValue(field);
                        break;
                    case 'date':
                        sampleData[field.id] = getSampleDateValue(field);
                        break;
                    case 'time':
                        sampleData[field.id] = '14:30';
                        break;
                    case 'datetime':
                        sampleData[field.id] = new Date().toISOString().slice(0, 16);
                        break;
                    case 'textarea':
                        sampleData[field.id] = getSampleTextareaValue(field);
                        break;
                    case 'select':
                    case 'radio':
                        const options = field.options || field.metadata?.options || ['Option 1', 'Option 2'];
                        sampleData[field.id] = options[0];
                        break;
                    case 'multiselect':
                    case 'checkbox-group':
                        const multiOptions = field.options || field.metadata?.options || ['Option 1', 'Option 2'];
                        sampleData[field.id] = [multiOptions[0]];
                        break;
                    case 'checkbox':
                        sampleData[field.id] = Math.random() > 0.5;
                        break;
                    case 'range':
                        const min = field.metadata?.min || 0;
                        const max = field.metadata?.max || 100;
                        sampleData[field.id] = Math.floor(Math.random() * (max - min + 1)) + min;
                        break;
                }
            });
        };

        if (formDefinition?.sections) {
            formDefinition.sections.forEach(section => {
                if (section.fields) {
                    processFields(section.fields);
                }
            });
        } else if (formDefinition?.fields) {
            processFields(formDefinition.fields);
        }

        return sampleData;
    }, [formDefinition]);

    // Handle preview data changes
    const handlePreviewDataChange = (newData: Record<string, any>) => {
        setPreviewData(newData);
        onDataChange(newData);
    };

    // Get device-specific styles
    const getDeviceStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            transition: 'all 0.3s ease-in-out',
            margin: '0 auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
        };

        switch (deviceSize) {
            case 'mobile':
                return {
                    ...baseStyles,
                    width: '375px',
                    minHeight: '667px'
                };
            case 'tablet':
                return {
                    ...baseStyles,
                    width: '768px',
                    minHeight: '1024px'
                };
            default: // desktop
                return {
                    ...baseStyles,
                    width: '100%',
                    minHeight: '600px'
                };
        }
    };

    // Render form structure overview
    const renderFormStructure = () => {
        if (!formDefinition) return null;

        const renderFieldsList = (fields: Field[], sectionName = '') => (
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <div>
                            <span className="font-medium text-sm text-gray-900">{field.label || field.name}</span>
                            <span className="ml-2 text-xs text-gray-500">({field.type})</span>
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </div>
                        <div className="text-xs text-gray-400">
                            {sectionName && `${sectionName} • `}Field {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        );

        return (
            <div className="bg-white p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Form Structure</h3>
                    <div className="text-sm text-gray-500">
                        {formDefinition.sections ?
                            `${formDefinition.sections.length} sections` :
                            `${formDefinition.fields?.length || 0} fields`}
                    </div>
                </div>

                {formDefinition.sections ? (
                    <div className="space-y-4">
                        {formDefinition.sections.map((section) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg">
                                <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                                    <h4 className="font-medium text-blue-900">{section.name}</h4>
                                    {section.description && (
                                        <p className="text-sm text-blue-700 mt-1">{section.description}</p>
                                    )}
                                    <div className="text-xs text-blue-600 mt-1">
                                        {section.fields?.length || 0} fields
                                    </div>
                                </div>
                                <div className="p-3">
                                    {section.fields && section.fields.length > 0 ? (
                                        renderFieldsList(section.fields, section.name)
                                    ) : (
                                        <div className="text-center text-gray-500 py-4">
                                            No fields in this section
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    formDefinition.fields && formDefinition.fields.length > 0 ? (
                        renderFieldsList(formDefinition.fields)
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No fields defined in this form
                        </div>
                    )
                )}
            </div>
        );
    };

    if (!formDefinition) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No form definition provided</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`form-preview ${className}`} {...props}>
            {/* Preview Controls */}
            <div className="preview-controls bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-medium text-gray-900">Form Preview</h3>

                        {/* Preview Mode Switcher */}
                        <div className="flex bg-gray-100 rounded-md">
                            <button
                                type="button"
                                onClick={() => setPreviewMode('interactive')}
                                className={`px-3 py-2 text-sm rounded-l-md ${previewMode === 'interactive'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Interactive
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('filled')}
                                className={`px-3 py-2 text-sm ${previewMode === 'filled'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                With Data
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('structure')}
                                className={`px-3 py-2 text-sm rounded-r-md ${previewMode === 'structure'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Structure
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Device Size Selector */}
                        {showDevicePreview && previewMode !== 'structure' && (
                            <div className="flex bg-gray-100 rounded-md">
                                <button
                                    type="button"
                                    onClick={() => setDeviceSize('mobile')}
                                    className={`p-2 rounded-l-md ${deviceSize === 'mobile'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    title="Mobile View"
                                >
                                    <Smartphone className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeviceSize('tablet')}
                                    className={`p-2 ${deviceSize === 'tablet'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    title="Tablet View"
                                >
                                    <Tablet className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeviceSize('desktop')}
                                    className={`p-2 rounded-r-md ${deviceSize === 'desktop'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    title="Desktop View"
                                >
                                    <Monitor className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Refresh Sample Data */}
                        {previewMode === 'filled' && (
                            <button
                                type="button"
                                onClick={() => setPreviewData(generateSampleData)}
                                className="p-2 text-gray-600 hover:text-gray-900"
                                title="Generate New Sample Data"
                            >
                                <Refresh className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Form Metadata */}
                {showMetadata && (
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <span className="font-medium">Context:</span>
                            <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {context}
                            </span>
                        </div>
                        {formDefinition.version && (
                            <div className="flex items-center">
                                <span className="font-medium">Version:</span>
                                <span className="ml-1">{formDefinition.version}</span>
                            </div>
                        )}
                        {formDefinition.metadata?.estimatedTime && (
                            <div className="flex items-center">
                                <span className="font-medium">Est. Time:</span>
                                <span className="ml-1">{formDefinition.metadata.estimatedTime} min</span>
                            </div>
                        )}
                        <div className="flex items-center">
                            <span className="font-medium">Fields:</span>
                            <span className="ml-1">
                                {formDefinition.sections
                                    ? formDefinition.sections.reduce((total, section) =>
                                        total + (section.fields?.length || 0), 0)
                                    : formDefinition.fields?.length || 0}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Content */}
            <div className="preview-content flex-1 p-6 bg-gray-50">
                {previewMode === 'structure' ? (
                    renderFormStructure()
                ) : (
                    <div style={getDeviceStyles()}>
                        <FormProvider
                            initialData={previewMode === 'filled' ? previewData : {}}
                            mode={previewMode === 'interactive' && allowDataEntry ? 'entry' : 'view'}
                            context={context}
                            onDataChange={handlePreviewDataChange}
                            formDefinition={formDefinition}
                        >
                            <FormRenderer
                                formDefinition={formDefinition}
                                formData={previewMode === 'filled' ? previewData : {}}
                                mode={previewMode === 'interactive' && allowDataEntry ? 'entry' : 'view'}
                                context={context}
                                onDataChange={handlePreviewDataChange}
                                showSections={true}
                                showProgress={previewMode === 'interactive'}
                                customStyles={customStyles}
                                className="bg-white"
                                onSave={() => { }} // No-op save for preview
                                onCancel={() => { }} // No-op cancel for preview
                            />
                        </FormProvider>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormPreview;
