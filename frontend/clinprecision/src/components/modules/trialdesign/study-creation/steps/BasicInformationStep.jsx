import React, { useState, useEffect } from 'react';
import FormField from '../../components/FormField';
import { OrganizationService } from '../../../../../services/OrganizationService';

/**
 * Step 1: Basic Study Information
 */
const BasicInformationStep = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError
}) => {
    const [organizations, setOrganizations] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(true);
    const [organizationError, setOrganizationError] = useState(null);
    const [showManualSponsor, setShowManualSponsor] = useState(false);

    // Handle sponsor selection change
    const handleSponsorChange = (fieldName, value) => {
        if (value === '__other__') {
            setShowManualSponsor(true);
            onFieldChange(fieldName, ''); // Clear the field for manual entry
        } else {
            setShowManualSponsor(false);
            onFieldChange(fieldName, value);
        }
    };

    // Load organizations for sponsor dropdown
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setLoadingOrganizations(true);
                const orgs = await OrganizationService.getAllOrganizations();

                // Transform organizations to options format for dropdown
                const orgOptions = Array.isArray(orgs) ? orgs.map(org => ({
                    value: org.name, // Use name as value to match existing backend expectations
                    label: `${org.name}${org.organizationType ? ` (${org.organizationType.name})` : ''}`,
                    id: org.id // Keep ID for future reference
                })) : [];

                // Add "Other" option for manual entry fallback
                orgOptions.push({
                    value: '__other__',
                    label: '-- Other (Manual Entry) --'
                });

                setOrganizations(orgOptions);
                setOrganizationError(null);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setOrganizationError('Failed to load organizations. Using manual entry mode.');
                setShowManualSponsor(true); // Fallback to manual entry if service fails
                setOrganizations([]);
            } finally {
                setLoadingOrganizations(false);
            }
        };

        fetchOrganizations();
    }, []);
    const phaseOptions = [
        { value: 'Phase 1', label: 'Phase I' },
        { value: 'Phase 2', label: 'Phase II' },
        { value: 'Phase 3', label: 'Phase III' },
        { value: 'Phase 4', label: 'Phase IV' },
        { value: 'Pilot', label: 'Pilot Study' },
        { value: 'Exploratory', label: 'Exploratory' }
    ];

    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'in-review', label: 'In Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'active', label: 'Active' },
        { value: 'recruiting', label: 'Recruiting' },
        { value: 'completed', label: 'Completed' },
        { value: 'terminated', label: 'Terminated' },
        { value: 'suspended', label: 'Suspended' }
    ];

    const studyTypeOptions = [
        { value: 'interventional', label: 'Interventional' },
        { value: 'observational', label: 'Observational' },
        { value: 'expanded-access', label: 'Expanded Access' }
    ];

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
                    name="phase"
                    type="select"
                    value={formData.phase}
                    onChange={onFieldChange}
                    error={getFieldError('phase')}
                    touched={hasFieldError('phase')}
                    required
                    options={phaseOptions}
                    placeholder="Select study phase"
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
                    name="status"
                    type="select"
                    value={formData.status}
                    onChange={onFieldChange}
                    error={getFieldError('status')}
                    touched={hasFieldError('status')}
                    options={statusOptions}
                    helpText="Current stage of the study lifecycle"
                />

                {/* Primary Sponsor */}
                <div className="md:col-span-2">
                    {!showManualSponsor ? (
                        <FormField
                            label="Primary Sponsor Name"
                            name="sponsor"
                            type="select"
                            value={formData.sponsor}
                            onChange={handleSponsorChange}
                            error={getFieldError('sponsor') || organizationError}
                            touched={hasFieldError('sponsor')}
                            required
                            options={organizations}
                            placeholder={loadingOrganizations ? "Loading organizations..." : "Select primary sponsor organization"}
                            disabled={loadingOrganizations}
                            helpText="Select the organization that will serve as the primary sponsor for this study"
                        />
                    ) : (
                        <div>
                            <FormField
                                label="Primary Sponsor Name"
                                name="sponsor"
                                value={formData.sponsor}
                                onChange={onFieldChange}
                                error={getFieldError('sponsor')}
                                touched={hasFieldError('sponsor')}
                                required
                                placeholder="Enter the primary sponsor organization name"
                                helpText="Enter the name of the organization that will serve as the primary sponsor"
                            />
                            <button
                                type="button"
                                onClick={() => setShowManualSponsor(false)}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                ← Back to organization list
                            </button>
                        </div>
                    )}
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
