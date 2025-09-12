import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrganizationService } from "../../../services/OrganizationService";

export default function OrganizationList() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch organizations
                const orgsData = await OrganizationService.getAllOrganizations();
                setOrganizations(orgsData);
                setError(null);
            } catch (err) {
                console.error("Error fetching organization data:", err);
                setError("Failed to load organizations. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateOrganization = () => {
        navigate('/user-management/organizations/create');
    };

    const handleEditOrganization = (id) => {
        navigate(`/user-management/organizations/edit/${id}`);
    };

    const handleViewOrganization = (id) => {
        navigate(`/user-management/organizations/view/${id}`);
    };

    const handleDeleteOrganization = async (id) => {
        if (window.confirm("Are you sure you want to delete this organization?")) {
            try {
                await OrganizationService.deleteOrganization(id);
                // Refresh the list after deletion
                setOrganizations(organizations.filter(org => org.id !== id));
            } catch (err) {
                console.error("Error deleting organization:", err);
                setError("Failed to delete organization. Please try again later.");
            }
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Organizations</h3>
                <button
                    onClick={handleCreateOrganization}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create New Organization
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
                    <p className="text-gray-600">No organizations found. Click the button above to create a new one.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {organizations.map((org) => (
                                <tr key={org.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {org.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {org.city && org.country ? `${org.city}, ${org.country}` : 'No location data'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${org.status === 'active' ? 'bg-green-100 text-green-800' :
                                                org.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewOrganization(org.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEditOrganization(org.id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOrganization(org.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
