import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import { StudyOrganizationService } from '../../../../../services/StudyOrganizationService';
import StudyService from '../../../../../services/StudyService';

/**
 * Step 1: Basic Study Information
 */
const BasicInformationStep = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError,
    lookupData = { studyPhases: [], studyStatuses: [], regulatoryStatuses: [] },
    availableOrganizations: providedOrganizations = null
}) => {
    const [organizationList, setOrganizationList] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(true);
    const [organizationError, setOrganizationError] = useState(null);

    // Transform lookup data to options format
    const studyPhases = (lookupData.studyPhases || []).map(phase => ({
        value: phase.id, // Use ID as value for backend
        label: phase.label || phase.name || `Phase ${phase.id}`, // Handle both 'label' and 'name' fields with fallback
        description: phase.description || ''
    })).filter(option => option.value != null && option.label);

    const studyStatuses = (lookupData.studyStatuses || []).map(status => ({
        value: status.id, // Use ID as value for backend
        label: status.label || status.name || `Status ${status.id}`, // Handle both 'label' and 'name' fields with fallback
        description: status.description || ''
    })).filter(option => option.value != null && option.label);

    const regulatoryStatuses = (lookupData.regulatoryStatuses || []).map(regStatus => ({
        value: regStatus.id, // Use ID as value for backend
        label: regStatus.label || regStatus.name || `Regulatory ${regStatus.id}`, // Handle both 'label' and 'name' fields with fallback
        description: regStatus.description || ''
    })).filter(option => option.value != null && option.label);

    const organizationOptions = organizationList.map(org => ({
        value: org.id,
        label: `${org.name}${org.organizationType ? ` (${org.organizationType.name})` : ''}`,
        entity: org
    })).filter(option => option.value != null && option.label);

    // Handle organization selection change
    const handleOrganizationChange = (fieldName, value) => {
        const numericValue = value !== '' && !Number.isNaN(Number(value)) ? Number(value) : null;
        onFieldChange(fieldName, numericValue);

        if (numericValue) {
            const selectedOrg = organizationList.find(org => org.id === numericValue);
            if (selectedOrg) {
                onFieldChange('sponsor', selectedOrg.name);
            }
        }
    };

    // Load organizations for sponsor dropdown
    useEffect(() => {
        const initialiseOrganizations = async () => {
            try {
                setLoadingOrganizations(true);
                let orgs = providedOrganizations;

                if (!Array.isArray(orgs) || orgs.length === 0) {
                    orgs = await StudyOrganizationService.getAllOrganizations();
                }

                setOrganizationList(Array.isArray(orgs) ? orgs : []);
                setOrganizationError(null);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setOrganizationError('Failed to load organizations. Please try again.');
                setOrganizationList([]);
            } finally {
                setLoadingOrganizations(false);
            }
        };

        initialiseOrganizations();
    }, [providedOrganizations]);

    const studyTypeOptions = [
        { value: 'interventional', label: 'Interventional' },
        { value: 'observational', label: 'Observational' },
        { value: 'expanded-access', label: 'Expanded Access' }
    ];

    // Debug current form data (will help diagnose validation issues)
    console.log('BasicInformationStep - Current form data:', {
        studyPhaseId: formData.studyPhaseId,
        studyPhaseIdType: typeof formData.studyPhaseId,
        availablePhases: studyPhases.map(p => ({ value: p.value, valueType: typeof p.value, label: p.label }))
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Study Information</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Provide the essential details about your clinical study.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Study Name */}
                <div className="md:col-span-2">
                    <FormField
                        label="Study Name"
                        name="name"
                        value={formData.name}
                        onChange={onFieldChange}
                        error={getFieldError('name')}
                        touched={hasFieldError('name')}
                        required
                        placeholder="Enter the full study name"
                        helpText="Use a descriptive name that clearly identifies the study"
                    />
                </div>

                {/* Protocol Number */}
                <FormField
                    label="Protocol Number"
                    name="protocolNumber"
                    value={formData.protocolNumber}
                    onChange={onFieldChange}
                    error={getFieldError('protocolNumber')}
                    touched={hasFieldError('protocolNumber')}
                    required
                    placeholder="e.g., PROTO-2025-001"
                    helpText="Use uppercase letters, numbers, and hyphens only"
                />

                {/* Study Phase */}
                <FormField
                    label="Study Phase"
                    name="studyPhaseId"
                    type="select"
                    value={formData.studyPhaseId || ''}
                    onChange={(fieldName, value) => {
                        // Convert to number if it's a valid number, otherwise keep as string
                        const numValue = !isNaN(value) && value !== '' ? Number(value) : value;
                        onFieldChange(fieldName, numValue);
                    }}
                    error={getFieldError('studyPhaseId')}
                    touched={hasFieldError('studyPhaseId')}
                    required
                    options={studyPhases.filter(option => option && option.value && option.label)}
                    placeholder="Select study phase"
                    disabled={false}
                />

                {/* Study Type */}
                <FormField
                    label="Study Type"
                    name="studyType"
                    type="select"
                    value={formData.studyType}
                    onChange={onFieldChange}
                    error={getFieldError('studyType')}
                    touched={hasFieldError('studyType')}
                    options={studyTypeOptions}
                    helpText="The primary classification of the study"
                />

                {/* Status */}
                <FormField
                    label="Current Status"
                    name="studyStatusId"
                    type="select"
                    value={formData.studyStatusId}
                    onChange={onFieldChange}
                    error={getFieldError('studyStatusId')}
                    touched={hasFieldError('studyStatusId')}
                    options={studyStatuses}
                    placeholder="Select current status"
                    disabled={false}
                    helpText="Current stage of the study lifecycle"
                />

                {/* Owning Organization */}
                <FormField
                    label="Owning Organization"
                    name="organizationId"
                    type="select"
                    value={formData.organizationId != null ? formData.organizationId : ''}
                    onChange={handleOrganizationChange}
                    error={getFieldError('organizationId') || organizationError}
                    touched={hasFieldError('organizationId')}
                    required
                    options={organizationOptions}
                    placeholder={loadingOrganizations ? "Loading organizations..." : "Select primary organization"}
                    disabled={loadingOrganizations}
                    helpText="Select the organization responsible for this study"
                />

                {/* Primary Sponsor */}
                <div className="md:col-span-2">
                    <FormField
                        label="Primary Sponsor Name"
                        name="sponsor"
                        value={formData.sponsor}
                        onChange={onFieldChange}
                        error={getFieldError('sponsor')}
                        touched={hasFieldError('sponsor')}
                        required
                        placeholder="Enter the primary sponsor organization name"
                        helpText="This defaults to the selected organization but can be customized"
                    />
                    {loadingOrganizations && (
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading organizations...
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <FormField
                        label="Study Description"
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={onFieldChange}
                        error={getFieldError('description')}
                        touched={hasFieldError('description')}
                        placeholder="Provide a brief description of the study objectives and methodology"
                        rows={4}
                        helpText="Include the primary purpose and key characteristics of the study"
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInformationStep;
