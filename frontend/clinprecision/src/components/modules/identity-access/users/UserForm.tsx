import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from 'services/UserService';
import { UserTypeService } from 'services/auth/UserTypeService';
import OrganizationService from 'services/OrganizationService';
import { RoleService } from 'services/auth/RoleService';
import { useAuth } from '../../../login/AuthContext';

interface UserType {
    id: number;
    name: string;
}

interface Organization {
    id: number | string;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    selectedUserTypes: number[];
    organizationId: string;
    selectedRoles: number[];
}

const UserForm: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const isEditMode = !!userId;
    const { user } = useAuth();

    // Check if user is authenticated, redirect to login if not
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: isEditMode ? `/identity-access/users/edit/${userId}` : '/identity-access/users/create' } });
        }
    }, [user, navigate, isEditMode, userId]);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        selectedUserTypes: [],
        organizationId: '',
        selectedRoles: [],
    });

    const [availableUserTypes, setAvailableUserTypes] = useState<UserType[]>([]);
    const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all user types, organizations, and system roles in parallel
                const [userTypesData, orgsData, rolesData] = await Promise.all([
                    UserTypeService.getAllUserTypes(),
                    OrganizationService.getAllOrganizations(),
                    RoleService.getSystemRoles(),  // Only system roles for user creation
                ]);
                setAvailableUserTypes(Array.isArray(userTypesData) ? userTypesData as any : []);
                setAvailableOrganizations(Array.isArray(orgsData) ? orgsData as any : []);
                setAvailableRoles(Array.isArray(rolesData) ? rolesData as any : []);

                // If in edit mode, fetch user data
                if (isEditMode) {
                    const userData = await UserService.getUserById(userId as any);
                    const userTypeIds = await UserService.getUserTypes(userId as any);
                    // TODO: Fetch user's organization and roles if available
                    setFormData({
                        firstName: (userData as any).firstName || '',
                        lastName: (userData as any).lastName || '',
                        email: (userData as any).email || '',
                        password: '', // Don't populate password in edit mode
                        selectedUserTypes: userTypeIds as any || [],
                        organizationId: (userData as any).organizationId || '',
                        selectedRoles: (userData as any).roleIds || [],
                    });
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isEditMode]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUserTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const typeId = parseInt(e.target.value);
        const isChecked = e.target.checked;

        if (isChecked) {
            setFormData(prev => ({
                ...prev,
                selectedUserTypes: [...prev.selectedUserTypes, typeId]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedUserTypes: prev.selectedUserTypes.filter(id => id !== typeId)
            }));
        }
    };

    const handleOrganizationChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            organizationId: e.target.value
        }));
    };

    const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const roleId = parseInt(e.target.value);
        const isChecked = e.target.checked;
        if (isChecked) {
            setFormData(prev => ({
                ...prev,
                selectedRoles: [...prev.selectedRoles, roleId]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedRoles: prev.selectedRoles.filter(id => id !== roleId)
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const userData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                organizationId: formData.organizationId || null,
                roleIds: formData.selectedRoles,
            };

            // Only include password for new users or if changed
            if (formData.password) {
                userData.password = formData.password;
            }

            let userIdValue;
            if (isEditMode) {
                await UserService.updateUser(userId as any, userData);
                userIdValue = userId;
            } else {
                const result = await UserService.createUser(userData);
                userIdValue = (result as any).userId;
            }

            // Update user types (existing logic)
            const currentTypes = await UserService.getUserTypes(userIdValue as any);
            for (const typeId of currentTypes as any) {
                if (!formData.selectedUserTypes.includes(typeId)) {
                    await UserService.removeUserType(userIdValue as any, typeId as any);
                }
            }
            for (const typeId of formData.selectedUserTypes) {
                if (!(currentTypes as any).includes(typeId)) {
                    await UserService.assignUserType(userIdValue as any, typeId as any);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/identity-access/users");
            }, 1500);
        } catch (err) {
            console.error("Error saving user:", err);
            setError("Failed to save user. Please try again later.");
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4 text-center">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                    You need to be logged in to create or edit users. Redirecting to login page...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-semibold">
                    {isEditMode ? "Edit User" : "Create User"}
                </h3>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    User {isEditMode ? "updated" : "created"} successfully!
                </div>
            )}

            {loading && !isEditMode ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">
                            First Name *
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                            Password {isEditMode && '(Leave blank to keep current password)'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            {...(!isEditMode && { required: true })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Types
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md">
                            {availableUserTypes.map((type) => (
                                <div key={type.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`type-${type.id}`}
                                        value={type.id}
                                        checked={formData.selectedUserTypes.includes(type.id)}
                                        onChange={handleUserTypeChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`type-${type.id}`} className="text-gray-700">
                                        {type.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization
                        </label>
                        <select
                            name="organizationId"
                            value={formData.organizationId}
                            onChange={handleOrganizationChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select organization</option>
                            {availableOrganizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roles
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-md">
                            {availableRoles.map(role => (
                                <div key={role.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        value={role.id}
                                        checked={formData.selectedRoles.includes(role.id)}
                                        onChange={handleRoleChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`role-${role.id}`} className="text-gray-700">
                                        {role.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/identity-access/users")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                isEditMode ? 'Update User' : 'Create User'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserForm;
