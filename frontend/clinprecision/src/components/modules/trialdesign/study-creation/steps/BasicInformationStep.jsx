import React from 'react';
import FormField from '../../components/FormField';

/**
 * Step 1: Basic Study Information
 */
const BasicInformationStep = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError
}) => {
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

                {/* Sponsor */}
                <div className="md:col-span-2">
                    <FormField
                        label="Sponsor"
                        name="sponsor"
                        value={formData.sponsor}
                        onChange={onFieldChange}
                        error={getFieldError('sponsor')}
                        touched={hasFieldError('sponsor')}
                        required
                        placeholder="Enter the study sponsor name"
                        helpText="Organization responsible for the study"
                    />
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
