import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserTypeService from "../../../services/UserTypeService";

export default function UserTypeList() {
    const [userTypes, setUserTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserTypes();
    }, []);

    const fetchUserTypes = async () => {
        try {
            setLoading(true);
            const data = await UserTypeService.getAllUserTypes();
            setUserTypes(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching user types:", err);
            setError("Failed to load user types. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user type?")) {
            try {
                await UserTypeService.deleteUserType(id);
                // Refresh the list after deletion
                fetchUserTypes();
            } catch (err) {
                console.error("Error deleting user type:", err);
                setError("Failed to delete user type. Please try again later.");
            }
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">User Types</h3>
                <Link
                    to="/user-management/usertypes/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Add New User Type
                </Link>
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
            ) : userTypes.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
                    <p className="text-gray-600">No user types found. Click the button above to create a new one.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userTypes.map((userType) => (
                                <tr key={userType.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {userType.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {userType.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {userType.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/user-management/usertypes/edit/${userType.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(userType.id)}
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
