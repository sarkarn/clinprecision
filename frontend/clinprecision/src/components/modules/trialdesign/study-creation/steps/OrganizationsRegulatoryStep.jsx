import React, { useState, useEffect } from 'react';
import { OrganizationService } from '../../../../../services/OrganizationService';
import { LoadingOverlay, Alert } from '../../components/UIComponents';

/**
 * Step 3: Organizations and Regulatory Information
 */
const OrganizationsRegulatoryStep = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError
}) => {
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load available organizations
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                setLoading(true);
                const orgs = await OrganizationService.getAllOrganizations();
                setAvailableOrganizations(Array.isArray(orgs) ? orgs : []);
                setError(null);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setError('Failed to load organizations. You can still proceed and add organizations later.');
                setAvailableOrganizations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    const roleOptions = [
        { value: 'sponsor', label: 'Sponsor' },
        { value: 'cro', label: 'Contract Research Organization (CRO)' },
        { value: 'site', label: 'Investigational Site' },
        { value: 'laboratory', label: 'Central Laboratory' },
        { value: 'vendor', label: 'Vendor/Service Provider' },
        { value: 'regulatory', label: 'Regulatory Consultant' },
        { value: 'statistics', label: 'Statistical Analysis' },
        { value: 'safety', label: 'Safety Monitoring' }
    ];

    const regulatoryStatusOptions = [
        { value: 'pre-ind', label: 'Pre-IND' },
        { value: 'ind-submitted', label: 'IND Submitted' },
        { value: 'ind-approved', label: 'IND Approved' },
        { value: 'ide-required', label: 'IDE Required' },
        { value: 'ide-approved', label: 'IDE Approved' },
        { value: 'exempt', label: 'Exempt' },
        { value: 'not-applicable', label: 'Not Applicable' }
    ];

    // Handle organization role assignment
    const handleOrgRoleChange = (orgId, role, isPrimary = false) => {
        const currentOrgs = formData.organizations || [];
        const existingIndex = currentOrgs.findIndex(o => o.organizationId === orgId);

        if (!role) {
            // Remove organization if no role selected
            if (existingIndex !== -1) {
                const newOrgs = currentOrgs.filter((_, index) => index !== existingIndex);
                onFieldChange('organizations', newOrgs);
            }
        } else {
            // Add or update organization
            const orgAssociation = {
                organizationId: orgId,
                role,
                isPrimary
            };

            if (existingIndex !== -1) {
                // Update existing
                const newOrgs = [...currentOrgs];
                newOrgs[existingIndex] = orgAssociation;
                onFieldChange('organizations', newOrgs);
            } else {
                // Add new
                onFieldChange('organizations', [...currentOrgs, orgAssociation]);
            }
        }
    };

    // Set primary organization for a role
    const handleSetPrimary = (orgId, role) => {
        const currentOrgs = formData.organizations || [];
        const newOrgs = currentOrgs.map(org => ({
            ...org,
            isPrimary: org.organizationId === orgId && org.role === role
        }));
        onFieldChange('organizations', newOrgs);
    };

    // Get current role for an organization
    const getCurrentRole = (orgId) => {
        const org = formData.organizations?.find(o => o.organizationId === orgId);
        return org?.role || '';
    };

    // Check if organization is primary for its role
    const isPrimaryForRole = (orgId) => {
        const org = formData.organizations?.find(o => o.organizationId === orgId);
        return org?.isPrimary || false;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Organizations & Regulatory</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Associate organizations with the study and provide regulatory information.
                </p>
            </div>

            {/* Organizations Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-4">Organization Associations</h4>

                <LoadingOverlay isLoading={loading} message="Loading organizations...">
                    {error && (
                        <Alert
                            type="warning"
                            message={error}
                            className="mb-4"
                        />
                    )}

                    {availableOrganizations.length === 0 && !loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2h10z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm">No organizations available.</p>
                            <p className="text-xs text-gray-400 mt-1">Organizations can be added later from the User Management module.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableOrganizations.map(org => {
                                const currentRole = getCurrentRole(org.id);
                                const isPrimary = isPrimaryForRole(org.id);

                                return (
                                    <div key={org.id} className="bg-white p-4 rounded-md border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{org.name}</h5>
                                                {org.organizationType && (
                                                    <p className="text-sm text-gray-600">Type: {org.organizationType.name}</p>
                                                )}
                                                {org.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{org.description}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <select
                                                    value={currentRole}
                                                    onChange={(e) => handleOrgRoleChange(org.id, e.target.value)}
                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Not Associated</option>
                                                    {roleOptions.map(role => (
                                                        <option key={role.value} value={role.value}>
                                                            {role.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                {currentRole && (
                                                    <label className="flex items-center text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={isPrimary}
                                                            onChange={(e) => handleSetPrimary(org.id, currentRole)}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-gray-700">Primary</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </LoadingOverlay>
            </div>

            {/* Associated Organizations Summary */}
            {formData.organizations && formData.organizations.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-blue-800 mb-3">Study Associations Summary</h4>
                    <div className="space-y-2">
                        {formData.organizations.map(orgAssoc => {
                            const org = availableOrganizations.find(o => o.id === orgAssoc.organizationId);
                            const role = roleOptions.find(r => r.value === orgAssoc.role);

                            return (
                                <div key={`${orgAssoc.organizationId}-${orgAssoc.role}`} className="flex justify-between items-center text-sm">
                                    <span className="font-medium">{org?.name || 'Unknown Organization'}</span>
                                    <span className="text-blue-700">
                                        {role?.label || orgAssoc.role}
                                        {orgAssoc.isPrimary && ' (Primary)'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Regulatory Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-4">Regulatory Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Regulatory Status
                        </label>
                        <select
                            value={formData.regulatoryStatus || ''}
                            onChange={(e) => onFieldChange('regulatoryStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Status</option>
                            {regulatoryStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={formData.ethicsApproval || false}
                                onChange={(e) => onFieldChange('ethicsApproval', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">Ethics Committee Approval Required</span>
                        </label>

                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={formData.fdaInd || false}
                                onChange={(e) => onFieldChange('fdaInd', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">FDA IND Required</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationsRegulatoryStep;
