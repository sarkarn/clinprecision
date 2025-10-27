import React, { useState } from 'react';
import { FormProvider } from '../FormContext';
import FormRenderer from '../FormRenderer';
import FormPreview from '../FormPreview';
import FormDesigner from '../FormDesigner';

/**
 * FormIntegrationExamples - Demonstrates how the reusable form components work across different contexts
 * 
 * This example shows how the same reusable components can be used for:
 * 1. Form Library Design - Creating reusable form templates
 * 2. Study-Specific Form Design - Customizing forms for specific clinical studies  
 * 3. Patient Data Capture - Using forms for actual patient data entry
 */

// Interfaces
interface FieldOption {
    value: string;
    label: string;
}

interface Field {
    id: string;
    type: string;
    label: string;
    required?: boolean;
    readOnly?: boolean;
    description?: string;
    value?: any;
    options?: (string | FieldOption)[];
    validation?: Record<string, any>;
    units?: string;
    min?: number;
    max?: number;
    referenceRange?: { min: number; max: number };
    precision?: number;
}

interface FormSection {
    id: string;
    name: string;
    description?: string;
    fields: Field[];
}

interface FormTemplate {
    id: string;
    name: string;
    version: string;
    context: string;
    extends?: string;
    patientId?: string;
    visitId?: string;
    sections: FormSection[];
}

interface FormTemplates {
    general: FormTemplate;
    study: FormTemplate;
    patient: FormTemplate;
}

// Example form definitions for different contexts
const FORM_TEMPLATES: FormTemplates = {
    // General form template that can be reused
    general: {
        id: 'general_patient_intake',
        name: 'Patient Intake Form',
        version: '1.0',
        context: 'general',
        sections: [
            {
                id: 'demographics',
                name: 'Demographics',
                description: 'Basic patient demographic information',
                fields: [
                    {
                        id: 'first_name',
                        type: 'text',
                        label: 'First Name',
                        required: true,
                        validation: { minLength: 2, maxLength: 50 }
                    },
                    {
                        id: 'last_name',
                        type: 'text',
                        label: 'Last Name',
                        required: true,
                        validation: { minLength: 2, maxLength: 50 }
                    },
                    {
                        id: 'date_of_birth',
                        type: 'date',
                        label: 'Date of Birth',
                        required: true,
                        validation: { noFutureDates: true }
                    },
                    {
                        id: 'gender',
                        type: 'select',
                        label: 'Gender',
                        required: true,
                        options: [
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                            { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ]
                    }
                ]
            },
            {
                id: 'contact_info',
                name: 'Contact Information',
                fields: [
                    {
                        id: 'email',
                        type: 'email',
                        label: 'Email Address',
                        required: true
                    },
                    {
                        id: 'phone',
                        type: 'tel',
                        label: 'Phone Number',
                        required: true
                    }
                ]
            }
        ]
    },

    // Study-specific form extending the general template
    study: {
        id: 'hypertension_study_enrollment',
        name: 'Hypertension Study - Enrollment Form',
        version: '2.1',
        context: 'study',
        extends: 'general_patient_intake',
        sections: [
            {
                id: 'demographics',
                name: 'Demographics',
                description: 'Basic patient demographic information',
                fields: [
                    {
                        id: 'first_name',
                        type: 'text',
                        label: 'First Name',
                        required: true,
                        validation: { minLength: 2, maxLength: 50 }
                    },
                    {
                        id: 'last_name',
                        type: 'text',
                        label: 'Last Name',
                        required: true,
                        validation: { minLength: 2, maxLength: 50 }
                    },
                    {
                        id: 'date_of_birth',
                        type: 'date',
                        label: 'Date of Birth',
                        required: true,
                        validation: { noFutureDates: true }
                    },
                    {
                        id: 'gender',
                        type: 'select',
                        label: 'Gender',
                        required: true,
                        options: [
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                            { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ]
                    },
                    {
                        id: 'subject_id',
                        type: 'text',
                        label: 'Subject ID',
                        required: true,
                        readOnly: true,
                        description: 'Automatically assigned study participant identifier'
                    }
                ]
            },
            {
                id: 'contact_info',
                name: 'Contact Information',
                fields: [
                    {
                        id: 'email',
                        type: 'email',
                        label: 'Email Address',
                        required: true
                    },
                    {
                        id: 'phone',
                        type: 'tel',
                        label: 'Phone Number',
                        required: true
                    }
                ]
            },
            {
                id: 'baseline_vitals',
                name: 'Baseline Vital Signs',
                description: 'Initial vital sign measurements for study enrollment',
                fields: [
                    {
                        id: 'systolic_bp',
                        type: 'number',
                        label: 'Systolic Blood Pressure',
                        required: true,
                        units: 'mmHg',
                        min: 80,
                        max: 250,
                        referenceRange: { min: 90, max: 120 }
                    },
                    {
                        id: 'diastolic_bp',
                        type: 'number',
                        label: 'Diastolic Blood Pressure',
                        required: true,
                        units: 'mmHg',
                        min: 40,
                        max: 150,
                        referenceRange: { min: 60, max: 80 }
                    },
                    {
                        id: 'heart_rate',
                        type: 'number',
                        label: 'Heart Rate',
                        required: true,
                        units: 'bpm',
                        min: 30,
                        max: 200,
                        referenceRange: { min: 60, max: 100 }
                    },
                    {
                        id: 'weight',
                        type: 'number',
                        label: 'Weight',
                        required: true,
                        units: 'kg',
                        min: 30,
                        max: 300,
                        precision: 1
                    },
                    {
                        id: 'height',
                        type: 'number',
                        label: 'Height',
                        required: true,
                        units: 'cm',
                        min: 100,
                        max: 250
                    }
                ]
            },
            {
                id: 'medical_history',
                name: 'Medical History',
                fields: [
                    {
                        id: 'hypertension_history',
                        type: 'checkbox-group',
                        label: 'Hypertension History',
                        options: [
                            { value: 'family_history', label: 'Family history of hypertension' },
                            { value: 'previous_diagnosis', label: 'Previously diagnosed with hypertension' },
                            { value: 'medication_history', label: 'Previous hypertension medication' },
                            { value: 'complications', label: 'Hypertension-related complications' }
                        ]
                    },
                    {
                        id: 'current_medications',
                        type: 'textarea',
                        label: 'Current Medications',
                        description: 'List all current medications including dosages'
                    },
                    {
                        id: 'allergies',
                        type: 'textarea',
                        label: 'Known Allergies',
                        description: 'List any known drug allergies or adverse reactions'
                    }
                ]
            }
        ]
    },

    // Patient data capture form (runtime instance)
    patient: {
        id: 'patient_data_capture',
        name: 'Patient Visit - Data Capture',
        version: '1.0',
        context: 'patient',
        patientId: 'PAT-12345',
        visitId: 'VISIT-67890',
        sections: [
            {
                id: 'visit_info',
                name: 'Visit Information',
                fields: [
                    {
                        id: 'visit_date',
                        type: 'date',
                        label: 'Visit Date',
                        value: new Date().toISOString().split('T')[0],
                        readOnly: true
                    },
                    {
                        id: 'visit_type',
                        type: 'select',
                        label: 'Visit Type',
                        required: true,
                        options: [
                            'Baseline',
                            'Follow-up',
                            'Unscheduled',
                            'Final'
                        ]
                    }
                ]
            },
            {
                id: 'vital_signs',
                name: 'Vital Signs',
                fields: [
                    {
                        id: 'systolic_bp',
                        type: 'number',
                        label: 'Systolic BP',
                        units: 'mmHg',
                        referenceRange: { min: 90, max: 120 },
                        required: true
                    },
                    {
                        id: 'diastolic_bp',
                        type: 'number',
                        label: 'Diastolic BP',
                        units: 'mmHg',
                        referenceRange: { min: 60, max: 80 },
                        required: true
                    }
                ]
            }
        ]
    }
};

type ExampleType = 'library_design' | 'study_design' | 'patient_capture' | 'reusability';
type FormContextType = 'general' | 'study' | 'patient';

const FormIntegrationExamples: React.FC = () => {
    const [activeExample, setActiveExample] = useState<ExampleType>('library_design');
    const [selectedForm, setSelectedForm] = useState<FormContextType>('general');
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [designerForm, setDesignerForm] = useState<FormTemplate>(FORM_TEMPLATES.general);

    // Example 1: Form Library Design
    const renderFormLibraryExample = (): React.ReactElement => (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Form Library Design
                </h3>
                <p className="text-blue-800 text-sm">
                    Use FormDesigner to create reusable form templates that can be shared across studies and organizations.
                    The same designer component works for creating general templates, study-specific forms, and patient capture forms.
                </p>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">FormDesigner Component</h4>
                        <div className="flex space-x-2">
                            <select
                                value={selectedForm}
                                onChange={(e) => {
                                    const newForm = e.target.value as FormContextType;
                                    setSelectedForm(newForm);
                                    setDesignerForm(FORM_TEMPLATES[newForm]);
                                }}
                                className="px-3 py-1 text-sm border rounded"
                            >
                                <option value="general">General Template</option>
                                <option value="study">Study-Specific Form</option>
                                <option value="patient">Patient Capture Form</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <FormDesigner
                        formDefinition={designerForm as any}
                        context={selectedForm}
                        onSave={(updatedForm: any) => {
                            setDesignerForm(updatedForm);
                            console.log('Form saved:', updatedForm);
                        }}
                        onCancel={() => console.log('Design cancelled')}
                        showPreview={true}
                        allowSectionManagement={true}
                    />
                </div>
            </div>
        </div>
    );

    // Example 2: Study-Specific Form Design  
    const renderStudyDesignExample = (): React.ReactElement => (
        <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                    Study-Specific Form Design
                </h3>
                <p className="text-green-800 text-sm">
                    Extend general form templates with study-specific fields. The same FormRenderer handles both
                    general and clinical contexts, automatically showing appropriate field types and validation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Preview */}
                <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                        <h4 className="font-medium">Form Preview</h4>
                    </div>
                    <div className="p-4">
                        <FormPreview
                            formDefinition={FORM_TEMPLATES.study as any}
                            context="study"
                            mode="filled"
                        />
                    </div>
                </div>

                {/* Form Structure */}
                <div className="border rounded-lg">
                    <div className="p-4 border-b bg-gray-50">
                        <h4 className="font-medium">Form Structure</h4>
                    </div>
                    <div className="p-4">
                        <FormPreview
                            formDefinition={FORM_TEMPLATES.study as any}
                            context="study"
                            mode="interactive"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Example 3: Patient Data Capture
    const renderPatientCaptureExample = (): React.ReactElement => (
        <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-2">
                    Patient Data Capture
                </h3>
                <p className="text-purple-800 text-sm">
                    Use FormRenderer in entry mode for actual patient data capture. The same form components
                    adapt to the patient context, showing reference ranges, validation, and clinical indicators.
                </p>
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Patient Data Entry Form</h4>
                        <div className="text-sm text-gray-600">
                            Patient: {FORM_TEMPLATES.patient.patientId} | Visit: {FORM_TEMPLATES.patient.visitId}
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <FormProvider
                        initialData={formData}
                        context="patient"
                        mode="entry"
                        onDataChange={setFormData}
                        formDefinition={FORM_TEMPLATES.patient as any}
                    >
                        <FormRenderer
                            formDefinition={FORM_TEMPLATES.patient as any}
                            formData={formData}
                            mode="entry"
                            context="patient"
                            onDataChange={setFormData}
                            onSave={(data: Record<string, any>) => {
                                console.log('Patient data saved:', data);
                                alert('Patient data saved successfully!');
                            }}
                            onCancel={() => {
                                setFormData({});
                                alert('Data entry cancelled');
                            }}
                        />
                    </FormProvider>
                </div>
            </div>
        </div>
    );

    // Example 4: Component Reusability Demonstration
    const renderReusabilityExample = (): React.ReactElement => (
        <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-orange-900 mb-2">
                    Component Reusability
                </h3>
                <p className="text-orange-800 text-sm">
                    The same core components (FormRenderer, field components, FormContext) work across all contexts.
                    Only the configuration and data change - the components adapt automatically.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* General Context */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-blue-600">General Context</h4>
                    <div className="space-y-2 text-sm">
                        <div>• Basic field types</div>
                        <div>• Standard validation</div>
                        <div>• Generic styling</div>
                        <div>• Template mode</div>
                    </div>
                </div>

                {/* Study Context */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-green-600">Study Context</h4>
                    <div className="space-y-2 text-sm">
                        <div>• Clinical field types</div>
                        <div>• Enhanced validation</div>
                        <div>• Study-specific features</div>
                        <div>• Research compliance</div>
                    </div>
                </div>

                {/* Patient Context */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-purple-600">Patient Context</h4>
                    <div className="space-y-2 text-sm">
                        <div>• Reference ranges</div>
                        <div>• Real-time validation</div>
                        <div>• Clinical indicators</div>
                        <div>• Data capture mode</div>
                    </div>
                </div>
            </div>

            {/* Code Example */}
            <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-medium">Code Example: Same Components, Different Contexts</h4>
                </div>
                <div className="p-4 bg-gray-900 text-green-400 text-sm font-mono">
                    <pre>{`// General form template design
<FormDesigner
  formDefinition={generalTemplate}
  context="general"
  mode="design"
/>

// Study-specific form design  
<FormDesigner
  formDefinition={studyTemplate}
  context="study"
  mode="design"
  showClinicalFields={true}
/>

// Patient data capture
<FormRenderer
  formDefinition={patientForm}
  context="patient" 
  mode="entry"
  showReferenceRanges={true}
/>`}</pre>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Reusable Form Components Integration Examples
                </h1>
                <p className="text-lg text-gray-600">
                    Demonstrating how the same reusable form components work across different contexts:
                    form library design, study-specific forms, and patient data capture.
                </p>
            </div>

            {/* Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'library_design' as ExampleType, label: 'Form Library Design', icon: '📚' },
                            { id: 'study_design' as ExampleType, label: 'Study-Specific Design', icon: '🔬' },
                            { id: 'patient_capture' as ExampleType, label: 'Patient Data Capture', icon: '👤' },
                            { id: 'reusability' as ExampleType, label: 'Component Reusability', icon: '♻️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveExample(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeExample === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="min-h-screen">
                {activeExample === 'library_design' && renderFormLibraryExample()}
                {activeExample === 'study_design' && renderStudyDesignExample()}
                {activeExample === 'patient_capture' && renderPatientCaptureExample()}
                {activeExample === 'reusability' && renderReusabilityExample()}
            </div>
        </div>
    );
};

export default FormIntegrationExamples;
