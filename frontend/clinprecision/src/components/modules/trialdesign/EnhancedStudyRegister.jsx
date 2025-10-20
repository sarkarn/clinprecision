import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyService from '../../../services/StudyService';
import { StudyOrganizationService } from '../../../services/StudyOrganizationService';

// Enhanced form components
import EnhancedFormField from './components/EnhancedFormField';
import FormProgressIndicator from './components/FormProgressIndicator';
import { useEnhancedFormValidation } from './hooks/useEnhancedFormValidation';
import { formValidationConfigs } from './utils/validationUtils';

const EnhancedStudyRegister = () => {
    const navigate = useNavigate();
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Enhanced form validation
    const {
        formData,
        errors,
        touched,
        validationStatus,
        isFormValid,
        completionPercentage,
        updateField,
        validateForm,
        getFieldValidationState,
        getFieldSuggestions,
        handleFieldFocus,
        handleFieldBlur,
        validationMode,
        setValidationMode
    } = useEnhancedFormValidation(
        {
            name: '',
            phase: '',
            status: 'draft',
            startDate: '',
            endDate: '',
            sponsor: '',
            principalInvestigator: '',
            description: '',
            protocolNumber: '',
            organizations: []
        },
        formValidationConfigs.studyRegistration
    );

    useEffect(() => {
        // Fetch organizations for selection
        const fetchOrgs = async () => {
            try {
                const orgs = await StudyOrganizationService.getAllOrganizations();
                setAvailableOrganizations(Array.isArray(orgs) ? orgs : []);
            } catch (err) {
                setAvailableOrganizations([]);
            }
        };
        fetchOrgs();
    }, []);

    const handleOrgRoleChange = (orgId, role) => {
        const currentOrgs = formData.organizations || [];
        const orgs = currentOrgs.filter(o => o.organizationId !== orgId);
        if (role) {
            orgs.push({ organizationId: orgId, role });
        }
        updateField('organizations', orgs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);

        try {
            // Validate entire form
            const isValid = await validateForm();
            if (!isValid) {
                setSubmitError('Please fix all validation errors before submitting');
                setLoading(false);
                return;
            }

            // Prepare API data
            const apiFormData = { ...formData };

            // Format dates if needed
            if (apiFormData.startDate) {
                apiFormData.startDate = apiFormData.startDate;
            }
            if (apiFormData.endDate) {
                apiFormData.endDate = apiFormData.endDate;
            }

            console.log('Attempting to register study with data:', apiFormData);

            const response = await StudyService.registerStudy(apiFormData);
            console.log('Study registration successful:', response);
            setLoading(false);

            // Navigate to the study list after successful registration
            navigate('/study-design/studies');
        } catch (err) {
            console.error('Study registration error:', err);
            setSubmitError(err.message || 'Failed to register study');
            setLoading(false);
        }
    };

    const calculateRequiredFieldsCompleted = () => {
        const requiredFields = ['name', 'phase'];
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

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">Register New Study</h3>
                    <p className="text-gray-600 text-sm">
                        Create a new clinical study with enhanced validation and real-time feedback
                    </p>
                </div>

                {/* Validation Mode Selector */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Validation Mode:</label>
                    <select
                        value={validationMode}
                        onChange={(e) => setValidationMode(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="progressive">Progressive</option>
                        <option value="realtime">Real-time</option>
                        <option value="onBlur">On Blur</option>
                        <option value="onSubmit">On Submit</option>
                    </select>
                </div>
            </div>

            {/* Form Progress Indicator */}
            <FormProgressIndicator
                completionPercentage={completionPercentage}
                requiredFieldsCompleted={calculateRequiredFieldsCompleted()}
                totalRequiredFields={2} // name and phase are required
                totalErrors={totalErrors}
                isFormValid={isFormValid}
                fieldValidationStates={fieldValidationStates}
                className="mb-6"
            />

            {submitError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <EnhancedFormField
                        label="Study Name"
                        name="name"
                        value={formData.name}
                        onChange={updateField}
                        onFocus={() => handleFieldFocus('name')}
                        onBlur={() => handleFieldBlur('name')}
                        error={getFieldValidationState('name').error}
                        touched={getFieldValidationState('name').isTouched}
                        required
                        validationMode={validationMode}
                        validateAsYouType={validationMode === 'realtime'}
                        suggestions={getFieldSuggestions('name')}
                        helpText="Enter a descriptive name for your clinical study"
                        placeholder="e.g., Phase II Efficacy Study of Drug X in Cancer Patients"
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
                            { value: 'Phase 4', label: 'Phase 4' },
                            { value: 'Phase 1/2', label: 'Phase 1/2' },
                            { value: 'Phase 2/3', label: 'Phase 2/3' }
                        ]}
                        helpText="Select the appropriate phase for your study"
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
                        helpText="Unique protocol identifier (uppercase letters, numbers, and hyphens only)"
                        placeholder="e.g., ABC-2024-001"
                    />

                    <EnhancedFormField
                        label="Study Status"
                        name="status"
                        type="select"
                        value={formData.status}
                        onChange={updateField}
                        options={[
                            { value: 'draft', label: 'Draft' },
                            { value: 'active', label: 'Active' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'terminated', label: 'Terminated' }
                        ]}
                        helpText="Current status of the study"
                    />

                    <EnhancedFormField
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={updateField}
                        onFocus={() => handleFieldFocus('startDate')}
                        onBlur={() => handleFieldBlur('startDate')}
                        error={getFieldValidationState('startDate').error}
                        touched={getFieldValidationState('startDate').isTouched}
                        helpText="First patient first visit (FPFV)"
                    />

                    <EnhancedFormField
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={updateField}
                        onFocus={() => handleFieldFocus('endDate')}
                        onBlur={() => handleFieldBlur('endDate')}
                        error={getFieldValidationState('endDate').error}
                        touched={getFieldValidationState('endDate').isTouched}
                        helpText="Last patient last visit (LPLV)"
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
                        suggestions={getFieldSuggestions('sponsor')}
                        helpText="Organization sponsoring the study"
                        placeholder="e.g., Pharmaceutical Company Inc."
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
                        suggestions={getFieldSuggestions('principalInvestigator')}
                        helpText="Lead investigator responsible for the study"
                        placeholder="e.g., Dr. Jane Smith, MD, PhD"
                    />
                </div>

                <div className="mb-6">
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
                        helpText="Detailed description of the study objectives and methodology"
                        placeholder="Provide a comprehensive description of the study..."
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Associated Organizations & Roles
                    </label>
                    <div className="space-y-2">
                        {availableOrganizations.length === 0 && (
                            <div className="text-gray-500">No organizations available.</div>
                        )}
                        {availableOrganizations.map(org => (
                            <div key={org.id} className="flex items-center space-x-2">
                                <span className="w-48 inline-block">{org.name}</span>
                                <select
                                    value={formData.organizations.find(o => o.organizationId === org.id)?.role || ''}
                                    onChange={e => handleOrgRoleChange(org.id, e.target.value)}
                                    className="border border-gray-300 rounded-md px-2 py-1"
                                >
                                    <option value="">Not Associated</option>
                                    <option value="sponsor">Sponsor</option>
                                    <option value="cro">CRO</option>
                                    <option value="site">Site</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="laboratory">Laboratory</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/study-design/studies')}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded transition-colors ${isFormValid
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            }`}
                        disabled={loading || !isFormValid}
                    >
                        {loading ? 'Registering...' : 'Register Study'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EnhancedStudyRegister;