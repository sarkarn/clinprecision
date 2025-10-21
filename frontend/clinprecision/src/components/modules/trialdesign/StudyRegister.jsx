
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyService from '../../../services/StudyService';
import { StudyOrganizationService } from '../../../services/StudyOrganizationService';

const StudyRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phase: '',
        status: 'draft',
        startDate: '',
        endDate: '',
        sponsor: '',
        principalInvestigator: '',  // This will be handled in the API or stored in metadata
        description: '',
        protocolNumber: '',
        organizations: [] // { organizationId, role }
    });
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle organization-role assignment
    const handleOrgRoleChange = (orgId, role) => {
        setFormData(prev => {
            const orgs = prev.organizations.filter(o => o.organizationId !== orgId);
            if (role) {
                orgs.push({ organizationId: orgId, role });
            }
            return { ...prev, organizations: orgs };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Basic validation
            if (!formData.name || !formData.phase) {
                throw new Error('Study name and phase are required');
            }

            // Create a copy of formData to prepare for API
            const apiFormData = { ...formData };

            // Handle principalInvestigator and other fields - now using standard field name
            // No need to store in metadata since backend accepts principalInvestigator directly

            // Format dates if needed
            if (apiFormData.startDate) {
                apiFormData.startDate = apiFormData.startDate; // Already in YYYY-MM-DD format
            }
            if (apiFormData.endDate) {
                apiFormData.endDate = apiFormData.endDate; // Already in YYYY-MM-DD format
            }

            console.log('Attempting to register study with data:', apiFormData);
            console.log('API_PATH being used:', '/study-design-ws/api/studies');

            try {
                const response = await StudyService.registerStudy(apiFormData);
                console.log('Study registration successful:', response);
                setLoading(false);

                // Navigate to the study list or edit page after successful registration
                navigate('/study-design/studies');
            } catch (apiError) {
                console.error('API Error details:', apiError);
                console.error('Error response:', apiError.response ? {
                    status: apiError.response.status,
                    statusText: apiError.response.statusText,
                    data: apiError.response.data,
                    headers: apiError.response.headers,
                    url: apiError.response.config?.url
                } : 'No response object');

                throw new Error(`API Error: ${apiError.response?.status} ${apiError.response?.statusText || ''} - ${apiError.message}`);
            }
        } catch (err) {
            console.error('Study registration error details:', err);
            setError(err.message || 'Failed to register study');
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Register New Study</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Study Name*
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phase*
                        </label>
                        <select
                            name="phase"
                            value={formData.phase}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                            required
                        >
                            <option value="">Select Phase</option>
                            <option value="Phase 1">Phase 1</option>
                            <option value="Phase 2">Phase 2</option>
                            <option value="Phase 3">Phase 3</option>
                            <option value="Phase 4">Phase 4</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sponsor
                        </label>
                        <input
                            type="text"
                            name="sponsor"
                            value={formData.sponsor}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Protocol Number
                        </label>
                        <input
                            type="text"
                            name="protocolNumber"
                            value={formData.protocolNumber}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Principal Investigator
                        </label>
                        <input
                            type="text"
                            name="principalInvestigator"
                            value={formData.principalInvestigator || ''}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md w-full px-3 py-2"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="border border-gray-300 rounded-md w-full px-3 py-2"
                    ></textarea>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register Study'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudyRegister;