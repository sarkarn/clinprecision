import React from 'react';
import { Alert } from '../../components/UIComponents';

/**
 * Step 4: Review and Confirmation
 */
const ReviewConfirmationStep = ({
    formData,
    availableOrganizations = [],
    onEdit
}) => {
    // Helper function to get organization name by ID
    const getOrganizationName = (orgId) => {
        const org = availableOrganizations.find(o => o.id === orgId);
        return org?.name || 'Unknown Organization';
    };

    // Helper function to format role display
    const formatRole = (role) => {
        const roleLabels = {
            'sponsor': 'Sponsor',
            'cro': 'Contract Research Organization (CRO)',
            'site': 'Investigational Site',
            'laboratory': 'Central Laboratory',
            'vendor': 'Vendor/Service Provider',
            'regulatory': 'Regulatory Consultant',
            'statistics': 'Statistical Analysis',
            'safety': 'Safety Monitoring'
        };
        return roleLabels[role] || role;
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to format boolean
    const formatBoolean = (value) => value ? 'Yes' : 'No';

    // Validation summary
    const getValidationSummary = () => {
        const issues = [];

        if (!formData.name) issues.push('Study name is required');
        if (!formData.protocolNumber) issues.push('Protocol number is required');
        if (!formData.phase) issues.push('Study phase is required');
        if (!formData.sponsor) issues.push('Sponsor is required');
        if (!formData.principalInvestigator) issues.push('Principal Investigator is required');

        return issues;
    };

    const validationIssues = getValidationSummary();
    const isValid = validationIssues.length === 0;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Confirm</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Please review all the information before creating the study.
                </p>
            </div>

            {/* Validation Issues */}
            {!isValid && (
                <Alert
                    type="error"
                    title="Please complete required fields"
                    message={
                        <ul className="list-disc list-inside space-y-1">
                            {validationIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    }
                />
            )}

            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-gray-800">Basic Information</h4>
                    <button
                        onClick={() => onEdit(0)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Study Name:</span>
                        <p className="text-gray-900">{formData.name || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Protocol Number:</span>
                        <p className="text-gray-900">{formData.protocolNumber || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Phase:</span>
                        <p className="text-gray-900">{formData.phase || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Study Type:</span>
                        <p className="text-gray-900 capitalize">{formData.studyType || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <p className="text-gray-900 capitalize">{formData.status || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Sponsor:</span>
                        <p className="text-gray-900">{formData.sponsor || 'Not specified'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="text-gray-900 mt-1">{formData.description || 'Not specified'}</p>
                    </div>
                </div>
            </div>

            {/* Timeline & Personnel */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-gray-800">Timeline & Personnel</h4>
                    <button
                        onClick={() => onEdit(1)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Start Date:</span>
                        <p className="text-gray-900">{formatDate(formData.startDate)}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">End Date:</span>
                        <p className="text-gray-900">{formatDate(formData.endDate)}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Estimated Duration:</span>
                        <p className="text-gray-900">{formData.estimatedDuration || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Principal Investigator:</span>
                        <p className="text-gray-900">{formData.principalInvestigator || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Study Coordinator:</span>
                        <p className="text-gray-900">{formData.studyCoordinator || 'Not specified'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Medical Monitor:</span>
                        <p className="text-gray-900">{formData.medicalMonitor || 'Not specified'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Primary Objective:</span>
                        <p className="text-gray-900 mt-1">{formData.primaryObjective || 'Not specified'}</p>
                    </div>
                    {formData.secondaryObjectives && formData.secondaryObjectives.length > 0 && (
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Secondary Objectives:</span>
                            <ul className="text-gray-900 mt-1 list-disc list-inside">
                                {formData.secondaryObjectives.map((objective, index) => (
                                    <li key={index}>{objective}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Organizations & Regulatory */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-gray-800">Organizations & Regulatory</h4>
                    <button
                        onClick={() => onEdit(2)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                </div>

                <div className="space-y-4 text-sm">
                    {/* Organizations */}
                    <div>
                        <span className="font-medium text-gray-700">Associated Organizations:</span>
                        {formData.organizations && formData.organizations.length > 0 ? (
                            <div className="mt-2 space-y-2">
                                {formData.organizations.map((orgAssoc, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span>{getOrganizationName(orgAssoc.organizationId)}</span>
                                        <span className="text-blue-700">
                                            {formatRole(orgAssoc.role)}
                                            {orgAssoc.isPrimary && ' (Primary)'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-1">No organizations associated</p>
                        )}
                    </div>

                    {/* Regulatory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="font-medium text-gray-700">Regulatory Status:</span>
                            <p className="text-gray-900">{formData.regulatoryStatus || 'Not specified'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Ethics Approval Required:</span>
                            <p className="text-gray-900">{formatBoolean(formData.ethicsApproval)}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">FDA IND Required:</span>
                            <p className="text-gray-900">{formatBoolean(formData.fdaInd)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation */}
            {isValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-medium text-green-800">Ready to Create Study</h4>
                            <p className="text-sm text-green-700 mt-1">
                                All required information has been provided. Click "Create Study" to proceed.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewConfirmationStep;
