import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStudyRoleService } from 'services/auth/UserStudyRoleService';
import { UserService } from 'services/UserService';
import StudyService from 'services/StudyService';
import { RoleService } from 'services/auth/RoleService';

interface User {
    id: number | string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Study {
    id: number | string;
    title: string;
}

interface Role {
    id: number | string;
    name: string;
    code: string;
}

interface Assignment {
    userId: number;
    studyId: number;
    roleCode: string;
    startDate: string | null;
    endDate: string | null;
    active: boolean;
    notes: string;
}

const UserStudyRoleBulkAssignment: React.FC = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Assignment configuration
    const [selectedStudy, setSelectedStudy] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [active, setActive] = useState(true);
    const [notes, setNotes] = useState('');

    // User selection
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // Preview assignments
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        loadReferenceData();
    }, []);

    useEffect(() => {
        generateAssignments();
    }, [selectedUsers, selectedStudy, selectedRole, startDate, endDate, active, notes]);

    const loadReferenceData = async () => {
        try {
            const [usersData, studiesData, rolesData] = await Promise.all([
                UserService.getAllUsers(),
                StudyService.getStudies(),
                RoleService.getNonSystemRoles()  // Only non-system roles for study assignments
            ]);

            setUsers(usersData as any);
            setStudies(studiesData as any);
            setRoles(rolesData as any);
        } catch (err) {
            setError('Failed to load reference data');
            console.error('Error loading reference data:', err);
        }
    };

    const generateAssignments = () => {
        if (!selectedStudy || !selectedRole || selectedUsers.length === 0) {
            setAssignments([]);
            return;
        }

        const newAssignments = selectedUsers.map(userId => ({
            userId: parseInt(userId),
            studyId: parseInt(selectedStudy),
            roleCode: selectedRole,
            startDate: startDate ? `${startDate}T00:00:00` : null,
            endDate: endDate ? `${endDate}T23:59:59` : null,
            active,
            notes
        }));

        setAssignments(newAssignments);
    };

    const getFilteredUsers = (): User[] => {
        if (!userSearchTerm) return users;

        const term = userSearchTerm.toLowerCase();
        return users.filter(user =>
            user.firstName?.toLowerCase().includes(term) ||
            user.lastName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
    };

    const handleUserSelection = (userId: number | string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, userId.toString()]);
        } else {
            setSelectedUsers(prev => prev.filter(id => id !== userId.toString()));
        }
    };

    const handleSelectAllUsers = (checked: boolean) => {
        if (checked) {
            const filteredUserIds = getFilteredUsers().map(user => user.id.toString());
            setSelectedUsers(filteredUserIds);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (assignments.length === 0) {
            setError('No assignments to create');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await UserStudyRoleService.createMultipleUserStudyRoles(assignments as any) as any;
            setSuccess(`Successfully created ${result.length} role assignments`);

            // Clear form after successful submission
            setSelectedUsers([]);
            setSelectedStudy('');
            setSelectedRole('');
            setNotes('');
            setAssignments([]);
            setShowPreview(false);

        } catch (err: any) {
            setError('Failed to create bulk assignments');
            console.error('Error creating bulk assignments:', err);

            if (err.response && err.response.status === 400) {
                setError('Invalid assignment data. Please check your inputs and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/user-management/user-study-roles');
    };

    const getUserDisplayName = (user: User): string => {
        return `${user.firstName} ${user.lastName} (${user.email})`;
    };

    const getStudyName = (studyId: number): string => {
        const study = studies.find(s => s.id === studyId);
        return study ? study.title : 'Unknown Study';
    };

    const getRoleName = (roleCode: string): string => {
        const role = roles.find(r => r.code === roleCode);
        return role ? role.name : roleCode;
    };

    const filteredUsers = getFilteredUsers();
    const allFilteredUsersSelected = filteredUsers.length > 0 &&
        filteredUsers.every(user => selectedUsers.includes(user.id.toString()));

    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold">Bulk User Study Role Assignment</h3>
                <p className="text-gray-600 mt-2">
                    Assign the same role to multiple users in a study
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold mb-4">Assignment Configuration</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Study Selection */}
                            <div>
                                <label htmlFor="study" className="block text-sm font-medium text-gray-700 mb-2">
                                    Study *
                                </label>
                                <select
                                    id="study"
                                    value={selectedStudy}
                                    onChange={(e) => setSelectedStudy(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                    required
                                >
                                    <option value="">Select a study...</option>
                                    {studies.map(study => (
                                        <option key={study.id} value={study.id}>
                                            {study.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    id="role"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                    required
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map(role => (
                                        <option key={role.code} value={role.code}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                    Active Assignments
                                </label>
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Notes for all assignments..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-between">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                                    disabled={assignments.length === 0 || loading}
                                >
                                    {showPreview ? 'Hide Preview' : 'Preview Assignments'}
                                </button>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={assignments.length === 0 || loading}
                                >
                                    {loading ? 'Creating...' : `Create ${assignments.length} Assignment(s)`}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* User Selection Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold mb-4">
                        Select Users ({selectedUsers.length} selected)
                    </h4>

                    {/* Search Users */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Select All Toggle */}
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="selectAll"
                            checked={allFilteredUsersSelected}
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                            Select all filtered users ({filteredUsers.length})
                        </label>
                    </div>

                    {/* User List */}
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id.toString())}
                                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No users found matching your search criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Preview */}
            {showPreview && assignments.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h4 className="text-lg font-semibold">
                            Assignment Preview ({assignments.length} assignments)
                        </h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Study
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.map((assignment, index) => {
                                    const user = users.find(u => u.id === assignment.userId);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user ? getUserDisplayName(user) : 'Unknown User'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getStudyName(assignment.studyId)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getRoleName(assignment.roleCode)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assignment.startDate || 'Not specified'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${assignment.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {assignment.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Bulk Assignment Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All selected users will receive the same role assignment configuration</li>
                    <li>• Duplicate assignments (same user, study, role) will be rejected by the system</li>
                    <li>• Use the preview to verify assignments before creation</li>
                    <li>• Individual assignments can be modified after creation if needed</li>
                </ul>
            </div>
        </div>
    );
};

export default UserStudyRoleBulkAssignment;
