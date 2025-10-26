import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';

type UserRole = 
    | 'SYSTEM_ADMIN'
    | 'PRINCIPAL_INVESTIGATOR'
    | 'STUDY_COORDINATOR'
    | 'DATA_MANAGER'
    | 'CRA'
    | 'SITE_USER'
    | 'MEDICAL_CODER'
    | 'AUDITOR';

type UserStatus = 'ACTIVE' | 'INACTIVE';

interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string | null;
}

interface NewUser {
    name: string;
    email: string;
    role: UserRole;
}

interface RoleOption {
    value: UserRole;
    label: string;
    description: string;
}

const RoleManagement: React.FC = () => {
    const { userRole, userRoleDisplay, getModulePermissions } = useRoleBasedNavigation();
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUser, setShowAddUser] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<NewUser>({
        name: '',
        email: '',
        role: 'SITE_USER'
    });

    // Available roles for assignment
    const availableRoles: RoleOption[] = [
        { value: 'SYSTEM_ADMIN', label: 'System Administrator', description: 'Full system access and user management' },
        { value: 'PRINCIPAL_INVESTIGATOR', label: 'Principal Investigator', description: 'Study oversight and clinical decisions' },
        { value: 'STUDY_COORDINATOR', label: 'Study Coordinator', description: 'Clinical operations and patient coordination' },
        { value: 'DATA_MANAGER', label: 'Data Manager', description: 'Data quality and integration management' },
        { value: 'CRA', label: 'Clinical Research Associate', description: 'Site monitoring and compliance' },
        { value: 'SITE_USER', label: 'Site User', description: 'Basic data entry access' },
        { value: 'MEDICAL_CODER', label: 'Medical Coder', description: 'Medical coding and adverse event coding' },
        { value: 'AUDITOR', label: 'Auditor', description: 'Read-only access for auditing purposes' }
    ];

    // Mock users data - replace with actual API call
    useEffect(() => {
        // Simulated API call
        setUsers([
            { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@clinic.com', role: 'PRINCIPAL_INVESTIGATOR', status: 'ACTIVE', lastLogin: '2024-01-15' },
            { id: 2, name: 'Mike Smith', email: 'mike.smith@clinic.com', role: 'STUDY_COORDINATOR', status: 'ACTIVE', lastLogin: '2024-01-14' },
            { id: 3, name: 'Lisa Chen', email: 'lisa.chen@clinic.com', role: 'DATA_MANAGER', status: 'ACTIVE', lastLogin: '2024-01-15' },
            { id: 4, name: 'John Doe', email: 'john.doe@clinic.com', role: 'CRA', status: 'INACTIVE', lastLogin: '2024-01-10' },
            { id: 5, name: 'Emma Wilson', email: 'emma.wilson@clinic.com', role: 'SITE_USER', status: 'ACTIVE', lastLogin: '2024-01-15' }
        ]);
    }, []);

    const handleAddUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user: User = {
            id: users.length + 1,
            ...newUser,
            status: 'ACTIVE',
            lastLogin: null
        };
        setUsers([...users, user]);
        setNewUser({ name: '', email: '', role: 'SITE_USER' });
        setShowAddUser(false);
    };

    const handleRoleChange = (userId: number, newRole: UserRole) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ));
    };

    const handleStatusToggle = (userId: number) => {
        setUsers(users.map(user =>
            user.id === userId ? {
                ...user,
                status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            } : user
        ));
    };

    const getRoleColor = (role: UserRole): string => {
        const colors: Record<UserRole, string> = {
            'SYSTEM_ADMIN': 'bg-red-100 text-red-800',
            'PRINCIPAL_INVESTIGATOR': 'bg-purple-100 text-purple-800',
            'STUDY_COORDINATOR': 'bg-blue-100 text-blue-800',
            'DATA_MANAGER': 'bg-green-100 text-green-800',
            'CRA': 'bg-yellow-100 text-yellow-800',
            'SITE_USER': 'bg-gray-100 text-gray-800',
            'MEDICAL_CODER': 'bg-indigo-100 text-indigo-800',
            'AUDITOR': 'bg-orange-100 text-orange-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    // Check if current user can manage users
    const canManageUsers = getModulePermissions('user-management').canManageUsers;

    if (!canManageUsers) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to manage users.</p>
                <p className="text-sm text-gray-500 mt-2">Current role: {userRoleDisplay}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User & Role Management</h1>
                    <p className="text-gray-600">Manage user accounts and role assignments</p>
                </div>
                <button
                    onClick={() => setShowAddUser(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add User</span>
                </button>
            </div>

            {/* Current User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">You</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Current User</p>
                        <p className="text-sm text-blue-600">Role: {userRoleDisplay}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">System Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {availableRoles.map(role => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(user.id)}
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${user.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                        >
                                            {user.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Descriptions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Role Descriptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRoles.map(role => (
                        <div key={role.value} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role.value)}`}>
                                    {role.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.name}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUser(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
