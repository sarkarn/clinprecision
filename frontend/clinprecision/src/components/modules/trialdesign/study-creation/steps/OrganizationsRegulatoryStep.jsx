import React, { useState, useEffect, useMemo } from 'react';
import { OrganizationService } from '../../../../../services/OrganizationService';
import StudyService from '../../../../../services/StudyService';
import { LoadingOverlay, Alert } from '../../components/UIComponents';

/**
 * Step 3: Organizations and Regulatory Information
 */
const OrganizationsRegulatoryStep = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError,
    lookupData = { regulatoryStatuses: [] } // Add lookupData prop with default
}) => {
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for regulatory statuses
    const [regulatoryStatuses, setRegulatoryStatuses] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [lookupError, setLookupError] = useState(null);

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

    // Process regulatory status lookup data (use prop data if available, otherwise fetch)
    useEffect(() => {
        const processRegulatoryStatuses = async () => {
            // Don't re-run if we already have data
            if (regulatoryStatuses.length > 0) {
                return;
            }

            try {
                setLoadingLookups(true);
                setLookupError(null);

                let statuses = [];

                // Use lookupData prop if available
                if (lookupData?.regulatoryStatuses && Array.isArray(lookupData.regulatoryStatuses) && lookupData.regulatoryStatuses.length > 0) {
                    statuses = lookupData.regulatoryStatuses;
                } else {
                    // Fallback to independent loading if no prop data
                    try {
                        statuses = await StudyService.getRegulatoryStatuses();
                    } catch (fetchError) {
                        console.error('Error fetching regulatory statuses:', fetchError);
                        throw fetchError;
                    }
                }

                // Transform to options format
                const statusOptions = (statuses || []).map(status => ({
                    value: status.id, // Use ID as value for backend
                    label: status.name || status.label || `Status ${status.id}`, // Use 'name' field primarily, fallback to 'label' or ID
                    description: status.description || ''
                })).filter(option => option.value != null && option.label);

                setRegulatoryStatuses(statusOptions);
                setLookupError(null);
            } catch (err) {
                console.error('Error processing regulatory statuses:', err);
                setLookupError('Failed to load regulatory statuses. Using fallback values.');

                // Fallback to default values if everything fails
                setRegulatoryStatuses([
                    { value: 1, label: 'Pre-IND' },
                    { value: 2, label: 'IND Submitted' },
                    { value: 3, label: 'IND Approved' },
                    { value: 4, label: 'IDE Required' },
                    { value: 5, label: 'IDE Approved' },
                    { value: 6, label: 'Exempt' },
                    { value: 7, label: 'Not Applicable' }
                ]);
            } finally {
                setLoadingLookups(false);
            }
        };

        processRegulatoryStatuses();
    }, []); // Empty dependency array - only run once

    // Separate effect to handle prop changes
    useEffect(() => {
        if (lookupData?.regulatoryStatuses && Array.isArray(lookupData.regulatoryStatuses) && lookupData.regulatoryStatuses.length > 0) {
            const statusOptions = lookupData.regulatoryStatuses.map(status => ({
                value: status.id,
                label: status.name || status.label || `Status ${status.id}`,
                description: status.description || ''
            })).filter(option => option.value != null && option.label);

            if (statusOptions.length > 0) {
                setRegulatoryStatuses(statusOptions);
                setLoadingLookups(false);
                setLookupError(null);
            }
        }
    }, [lookupData]);

    // Memoize role options to prevent unnecessary re-renders
    const roleOptions = useMemo(() => [
        { value: 'sponsor', label: 'Sponsor' },
        { value: 'cro', label: 'Contract Research Organization (CRO)' },
        { value: 'site', label: 'Investigational Site' },
        { value: 'laboratory', label: 'Central Laboratory' },
        { value: 'vendor', label: 'Vendor/Service Provider' },
        { value: 'regulatory', label: 'Regulatory Consultant' },
        { value: 'statistics', label: 'Statistical Analysis' },
        { value: 'safety', label: 'Safety Monitoring' }
    ], []);

    // Memoize filtered regulatory status options
    const filteredRegulatoryOptions = useMemo(() => {
        return regulatoryStatuses.filter(option => option && option.value && option.label);
    }, [regulatoryStatuses]);

    // Handle organization role assignment
    const handleOrgRoleChange = (orgId, role, isPrimary = false) => {
        try {
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
        } catch (error) {
            console.error('Error updating organization role:', error);
        }
    };

    // Set primary organization for a role
    const handleSetPrimary = (orgId, role) => {
        try {
            const currentOrgs = formData.organizations || [];
            const newOrgs = currentOrgs.map(org => ({
                ...org,
                // Only clear isPrimary for organizations with the SAME role
                // This allows one primary per role type, not one primary total
                isPrimary: org.role === role
                    ? (org.organizationId === orgId) // Set true for selected org, false for others in same role
                    : org.isPrimary // Keep existing isPrimary for different roles
            }));
            onFieldChange('organizations', newOrgs);
        } catch (error) {
            console.error('Error setting primary organization:', error);
        }
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

    // Get the primary organization for a specific role
    const getPrimaryForRole = (role) => {
        return formData.organizations?.find(org => org.role === role && org.isPrimary);
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
                                                    <div className="flex flex-col items-center">
                                                        <label className="flex items-center text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={isPrimary}
                                                                onChange={(e) => handleSetPrimary(org.id, currentRole)}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="ml-2 text-gray-700">Primary</span>
                                                        </label>
                                                        {/* Show hint if another org is already primary for this role */}
                                                        {!isPrimary && getPrimaryForRole(currentRole) && (
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                Another {currentRole} is primary
                                                            </span>
                                                        )}
                                                    </div>
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
                            value={formData.regulatoryStatusId || ''}
                            onChange={(e) => {
                                // Convert to number if it's a valid number, otherwise keep as string
                                const value = e.target.value;
                                const numValue = !isNaN(value) && value !== '' ? Number(value) : value;
                                onFieldChange('regulatoryStatusId', numValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loadingLookups}
                        >
                            <option value="">{loadingLookups ? "Loading..." : "Select Status"}</option>
                            {filteredRegulatoryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {lookupError && (
                            <p className="mt-1 text-sm text-amber-600">{lookupError}</p>
                        )}
                        {loadingLookups && (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading regulatory statuses...
                            </div>
                        )}
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
