import React, { useState } from 'react';
import { Settings, Code, RefreshCw } from 'lucide-react';

// Enhanced form components
import EnhancedFormField from './components/EnhancedFormField';
import FormField from './components/FormField';
import FormProgressIndicator, { StepProgressIndicator } from './components/FormProgressIndicator';
import { useEnhancedFormValidation } from './hooks/useEnhancedFormValidation';
import { formValidationConfigs } from './utils/validationUtils';

// Import enhanced styles
import './styles/enhanced-form-validation.css';

/**
 * Form Validation Demo - Showcases enhanced form validation features
 * This component demonstrates the improvements made to form validation and user feedback
 */
const FormValidationDemo = () => {
    const [demoMode, setDemoMode] = useState('enhanced'); // 'basic', 'enhanced', 'comparison'
    const [showCode, setShowCode] = useState(false);

    // Enhanced form validation for study registration
    const {
        formData,
        errors,
        isFormValid,
        completionPercentage,
        updateField,
        getFieldValidationState,
        getFieldSuggestions,
        handleFieldFocus,
        handleFieldBlur,
        validationMode,
        setValidationMode,
        resetForm
    } = useEnhancedFormValidation(
        {
            studyName: '',
            protocolNumber: '',
            phase: '',
            sponsor: '',
            principalInvestigator: '',
            description: '',
            startDate: '',
            endDate: '',
            email: ''
        },
        {
            ...formValidationConfigs.studyRegistration,
            rules: {
                ...formValidationConfigs.studyRegistration.rules,
                email: {
                    required: 'Email is required',
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                    async: async (value) => {
                        // Simulate async validation
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        if (value.includes('test@')) {
                            return 'Test email addresses are not allowed';
                        }
                        return true;
                    }
                }
            }
        }
    );

    const wizardSteps = [
        { id: 'basic', title: 'Basic Info' },
        { id: 'timeline', title: 'Timeline' },
        { id: 'personnel', title: 'Personnel' },
        { id: 'review', title: 'Review' }
    ];

    const [currentStep, setCurrentStep] = useState(0);

    const calculateRequiredFieldsCompleted = () => {
        const requiredFields = ['studyName', 'phase', 'sponsor', 'principalInvestigator'];
        return requiredFields.filter(field =>
            formData[field] && formData[field].toString().trim() !== ''
        ).length;
    };

    const totalErrors = Object.values(errors).filter(error => error).length;
    const fieldValidationStates = {};

    // Prepare field validation states for progress indicator
    Object.keys(formData).forEach(fieldName => {
        fieldValidationStates[fieldName] = getFieldValidationState(fieldName);
    });

    const renderDemoControls = () => (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Demo Controls
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Demo Mode</label>
                    <select
                        value={demoMode}
                        onChange={(e) => setDemoMode(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="basic">Basic Validation</option>
                        <option value="enhanced">Enhanced Validation</option>
                        <option value="comparison">Side-by-Side Comparison</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-gray-600 mb-1">Validation Mode</label>
                    <select
                        value={validationMode}
                        onChange={(e) => setValidationMode(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="progressive">Progressive</option>
                        <option value="realtime">Real-time</option>
                        <option value="onBlur">On Blur</option>
                        <option value="onSubmit">On Submit</option>
                    </select>
                </div>

                <div className="flex items-end space-x-2">
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                        <Code className="w-3 h-3 mr-1" />
                        {showCode ? 'Hide' : 'Show'} Code
                    </button>

                    <button
                        onClick={resetForm}
                        className="flex items-center text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                    >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBasicForm = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Form Validation</h3>
            <p className="text-sm text-gray-600 mb-4">
                Traditional form validation with basic error handling
            </p>

            <FormField
                label="Study Name"
                name="studyName"
                value={formData.studyName}
                onChange={updateField}
                error={errors.studyName}
                touched={touched.studyName}
                required
                helpText="Enter a descriptive name for your study"
            />

            <FormField
                label="Protocol Number"
                name="protocolNumber"
                value={formData.protocolNumber}
                onChange={updateField}
                error={errors.protocolNumber}
                touched={touched.protocolNumber}
                helpText="Unique protocol identifier"
            />

            <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={updateField}
                error={errors.email}
                touched={touched.email}
                required
                helpText="Contact email address"
            />
        </div>
    );

    const renderEnhancedForm = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Enhanced Form Validation</h3>
                    <p className="text-sm text-gray-600">
                        Advanced validation with real-time feedback, progressive validation, and contextual help
                    </p>
                </div>
            </div>

            {/* Form Progress Indicator */}
            <FormProgressIndicator
                completionPercentage={completionPercentage}
                requiredFieldsCompleted={calculateRequiredFieldsCompleted()}
                totalRequiredFields={4}
                totalErrors={totalErrors}
                isFormValid={isFormValid}
                fieldValidationStates={fieldValidationStates}
            />

            {/* Step Progress */}
            <StepProgressIndicator
                steps={wizardSteps}
                currentStep={currentStep}
                stepValidationStates={{
                    basic: { isValid: formData.studyName && formData.phase },
                    timeline: { isValid: formData.startDate && formData.endDate },
                    personnel: { isValid: formData.principalInvestigator },
                    review: { isValid: isFormValid }
                }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                    label="Study Name"
                    name="studyName"
                    value={formData.studyName}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('studyName')}
                    onBlur={() => handleFieldBlur('studyName')}
                    error={getFieldValidationState('studyName').error}
                    touched={getFieldValidationState('studyName').isTouched}
                    required
                    validationMode={validationMode}
                    validateAsYouType={validationMode === 'realtime'}
                    suggestions={getFieldSuggestions('studyName')}
                    helpText="Enter a descriptive name for your clinical study"
                    placeholder="e.g., Phase II Efficacy Study of Drug X"
                />

                <EnhancedFormField
                    label="Protocol Number"
                    name="protocolNumber"
                    value={formData.protocolNumber}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('protocolNumber')}
                    onBlur={() => handleFieldBlur('protocolNumber')}
                    error={getFieldValidationState('protocolNumber').error}
                    touched={getFieldValidationState('protocolNumber').isTouched}
                    validationMode={validationMode}
                    validateAsYouType={validationMode === 'realtime'}
                    suggestions={getFieldSuggestions('protocolNumber')}
                    helpText="Unique protocol identifier (format: ABC-2024-001)"
                    placeholder="ABC-2024-001"
                />

                <EnhancedFormField
                    label="Study Phase"
                    name="phase"
                    type="select"
                    value={formData.phase}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('phase')}
                    onBlur={() => handleFieldBlur('phase')}
                    error={getFieldValidationState('phase').error}
                    touched={getFieldValidationState('phase').isTouched}
                    required
                    options={[
                        { value: 'Phase 1', label: 'Phase 1' },
                        { value: 'Phase 2', label: 'Phase 2' },
                        { value: 'Phase 3', label: 'Phase 3' },
                        { value: 'Phase 4', label: 'Phase 4' }
                    ]}
                    helpText="Select the appropriate study phase"
                />

                <EnhancedFormField
                    label="Email (with async validation)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('email')}
                    onBlur={() => handleFieldBlur('email')}
                    error={getFieldValidationState('email').error}
                    touched={getFieldValidationState('email').isTouched}
                    required
                    validationMode={validationMode}
                    validateAsYouType={validationMode === 'realtime'}
                    helpText="Contact email (try typing 'test@example.com' to see async validation)"
                    placeholder="user@example.com"
                />

                <EnhancedFormField
                    label="Sponsor"
                    name="sponsor"
                    value={formData.sponsor}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('sponsor')}
                    onBlur={() => handleFieldBlur('sponsor')}
                    error={getFieldValidationState('sponsor').error}
                    touched={getFieldValidationState('sponsor').isTouched}
                    required
                    suggestions={[
                        'Pharmaceutical Company Inc.',
                        'Academic Medical Center',
                        'National Institutes of Health'
                    ]}
                    helpText="Organization sponsoring the study"
                />

                <EnhancedFormField
                    label="Principal Investigator"
                    name="principalInvestigator"
                    value={formData.principalInvestigator}
                    onChange={updateField}
                    onFocus={() => handleFieldFocus('principalInvestigator')}
                    onBlur={() => handleFieldBlur('principalInvestigator')}
                    error={getFieldValidationState('principalInvestigator').error}
                    touched={getFieldValidationState('principalInvestigator').isTouched}
                    required
                    suggestions={[
                        'Dr. John Smith, MD',
                        'Dr. Sarah Johnson, MD, PhD',
                        'Prof. Michael Brown, MD'
                    ]}
                    helpText="Lead investigator for the study"
                />
            </div>

            <EnhancedFormField
                label="Study Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={updateField}
                onFocus={() => handleFieldFocus('description')}
                onBlur={() => handleFieldBlur('description')}
                error={getFieldValidationState('description').error}
                touched={getFieldValidationState('description').isTouched}
                rows={4}
                validationMode={validationMode}
                validateAsYouType={validationMode === 'realtime'}
                helpText="Detailed description of study objectives and methodology"
            />

            {/* Navigation Controls */}
            <div className="flex justify-between">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>

                <button
                    onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                    disabled={currentStep === wizardSteps.length - 1}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderComparison = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
                {renderBasicForm()}
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
                {renderEnhancedForm()}
            </div>
        </div>
    );

    const renderCodeExample = () => {
        if (!showCode) return null;

        return (
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium mb-3">Enhanced Form Field Example</h4>
                <pre className="text-xs overflow-x-auto">
                    {`<EnhancedFormField
    label="Study Name"
    name="studyName"
    value={formData.studyName}
    onChange={updateField}
    onFocus={() => handleFieldFocus('studyName')}
    onBlur={() => handleFieldBlur('studyName')}
    error={getFieldValidationState('studyName').error}
    touched={getFieldValidationState('studyName').isTouched}
    required
    validationMode="realtime"
    validateAsYouType={true}
    suggestions={getFieldSuggestions('studyName')}
    helpText="Enter a descriptive name for your clinical study"
    placeholder="e.g., Phase II Efficacy Study of Drug X"
/>`}
                </pre>
            </div>
        );
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Form Validation & User Feedback Enhancement Demo
                </h2>
                <p className="text-gray-600">
                    Demonstrating enhanced form validation with real-time feedback, progressive validation,
                    inline suggestions, and improved user experience features.
                </p>
            </div>

            {renderDemoControls()}
            {renderCodeExample()}

            <div className="mt-6">
                {demoMode === 'basic' && renderBasicForm()}
                {demoMode === 'enhanced' && renderEnhancedForm()}
                {demoMode === 'comparison' && renderComparison()}
            </div>

            {/* Feature Summary */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Enhanced Features Demonstrated:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time validation with debounced feedback</li>
                    <li>• Progressive validation that adapts to user input patterns</li>
                    <li>• Inline suggestions and autocomplete functionality</li>
                    <li>• Visual validation status indicators with animations</li>
                    <li>• Form progress tracking and completion percentage</li>
                    <li>• Step-by-step wizard navigation with validation states</li>
                    <li>• Contextual help text and error messaging</li>
                    <li>• Async validation for server-side checks</li>
                    <li>• Multiple validation modes (progressive, real-time, on-blur, on-submit)</li>
                    <li>• Enhanced accessibility with proper ARIA attributes</li>
                </ul>
            </div>
        </div>
    );
};

export default FormValidationDemo;