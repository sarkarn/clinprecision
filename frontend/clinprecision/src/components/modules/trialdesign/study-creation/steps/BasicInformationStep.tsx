import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import { StudyOrganizationService } from 'services/StudyOrganizationService';
import { Organization as ImportedOrganization } from '../../../../../types/study/StudyOrganization.types';
import { useCodeList } from '../../../../../hooks/useCodeList';

interface LookupItem {
    id: number | string;
    label?: string;
    name?: string;
    description?: string;
}

interface Organization {
    id: string | number;
    name: string;
    organizationType?: {
        name: string;
    };
}

interface LookupData {
    studyPhases?: LookupItem[];
    studyStatuses?: LookupItem[];
    regulatoryStatuses?: LookupItem[];
}

interface BasicInformationStepProps {
    formData: {
        name?: string;
        protocolNumber?: string;
        studyPhaseId?: number | string;
        studyType?: string;
        studyStatusId?: number | string;
        organizationId?: number | null;
        sponsor?: string;
        description?: string;
    };
    onFieldChange: (name: string, value: any) => void;
    getFieldError: (fieldName: string) => string | undefined;
    hasFieldError: (fieldName: string) => boolean;
    lookupData?: LookupData;
    availableOrganizations?: Organization[] | null;
}

interface SelectOption {
    value: string;
    label: string;
    description?: string;
    entity?: Organization;
}

/**
 * Step 1: Basic Study Information
 */
const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError,
    lookupData = { studyPhases: [], studyStatuses: [], regulatoryStatuses: [] },
    availableOrganizations: providedOrganizations = null
}) => {
    const [organizationList, setOrganizationList] = useState<Organization[]>([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState<boolean>(true);
    const [organizationError, setOrganizationError] = useState<string | null>(null);

    // Fetch study phases and statuses from CodeList API
    const { data: studyPhaseData, loading: loadingPhases } = useCodeList('STUDY_PHASE_CATEGORY');
    const { data: studyStatusData, loading: loadingStatuses } = useCodeList('STUDY_STATUS');
    const { data: regulatoryStatusData, loading: loadingRegStatuses } = useCodeList('REGULATORY_STATUS');

    // Transform CodeList data to options format
    const studyPhases: SelectOption[] = studyPhaseData.map(phase => ({
        value: phase.id, // Use numeric database ID (backend expects Long)
        label: phase.label,
        description: phase.description || ''
    }));

    const studyStatuses: SelectOption[] = studyStatusData.map(status => ({
        value: status.id, // Use numeric database ID (backend expects Long)
        label: status.label,
        description: status.description || ''
    }));

    const regulatoryStatuses: SelectOption[] = regulatoryStatusData.map(regStatus => ({
        value: regStatus.id, // Use numeric database ID (backend expects Long)
        label: regStatus.label,
        description: regStatus.description || ''
    }));

    const organizationOptions: SelectOption[] = organizationList.map(org => ({
        value: String(org.id),
        label: `${org.name}${org.organizationType ? ` (${org.organizationType.name})` : ''}`,
        entity: org
    })).filter(option => option.value != null && option.label);

    // Handle organization selection change
    const handleOrganizationChange = (fieldName: string, value: any): void => {
        const numericValue = value !== '' && !Number.isNaN(Number(value)) ? Number(value) : null;
        onFieldChange(fieldName, numericValue);

        if (numericValue) {
            const selectedOrg = organizationList.find(org => String(org.id) === String(value));
            if (selectedOrg) {
                onFieldChange('sponsor', selectedOrg.name);
            }
        }
    };

    // Load organizations for sponsor dropdown
    useEffect(() => {
        const initialiseOrganizations = async (): Promise<void> => {
            try {
                setLoadingOrganizations(true);
                let orgs: Organization[] | null = providedOrganizations;

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

    const studyTypeOptions: SelectOption[] = [
        { value: 'interventional', label: 'Interventional' },
        { value: 'observational', label: 'Observational' },
        { value: 'expanded-access', label: 'Expanded Access' }
    ];

    // Debug current form data (will help diagnose validation issues)
    console.log('BasicInformationStep - Current form data:', {
        studyPhaseId: formData.studyPhaseId,
        studyPhaseIdType: typeof formData.studyPhaseId,
        studyStatusId: formData.studyStatusId,
        studyStatusIdType: typeof formData.studyStatusId,
        availablePhases: studyPhases.map(p => ({ value: p.value, valueType: typeof p.value, label: p.label })),
        availableStatuses: studyStatuses.map(s => ({ value: s.value, valueType: typeof s.value, label: s.label }))
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
                    value={formData.studyPhaseId != null ? String(formData.studyPhaseId) : ''}
                    onChange={(fieldName, value) => {
                        // Convert to number if it's a valid number, otherwise keep as string
                        const numValue = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
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
                    value={formData.studyStatusId != null ? String(formData.studyStatusId) : ''}
                    onChange={(fieldName, value) => {
                        // Convert to number if it's a valid number, otherwise keep as string
                        const numValue = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
                        onFieldChange(fieldName, numValue);
                    }}
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
                    value={formData.organizationId != null ? String(formData.organizationId) : ''}
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
