import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../../services/UserService';
import { UserTypeService } from '../../../services/UserTypeService';
import { useAuth } from '../../login/AuthContext';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check if user is authenticated
    const isAuthenticated = !!user;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const usersData = await UserService.getAllUsers();
            setUsers(usersData);

            const userTypesData = await UserTypeService.getAllUserTypes();
            setUserTypes(userTypesData);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        navigate('/user-management/users/create');
    };

    const handleEditUser = (userId) => {
        navigate(`/user-management/users/edit/${userId}`);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await UserService.deleteUser(userId);
                // Refresh the list after deletion
                fetchData();
            } catch (err) {
                console.error(`Error deleting user ${userId}:`, err);
                setError('Failed to delete user. Please try again later.');
            }
        }
    };

    const getUserTypeNames = (user) => {
        if (!user.userTypes || !user.userTypes.length) return 'None';
        return user.userTypes
            .map(typeId => {
                const userType = userTypes.find(type => type.id === typeId);
                return userType ? userType.name : 'Unknown';
            })
            .join(', ');
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Users</h3>
                {isAuthenticated && (
                    <button
                        onClick={handleCreateUser}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create New User
                    </button>
                )}
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
            ) : users.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
                    <p className="text-gray-600">No users found. Click the button above to create a new one.</p>
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
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User Types
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.userId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {`${user.firstName} ${user.lastName}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {getUserTypeNames(user)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user.userId)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.userId)}
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
