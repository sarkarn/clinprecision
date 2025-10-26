import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserStudyRoleService } from 'services/auth/UserStudyRoleService';
import StudyService from 'services/StudyService';
import { UserService } from 'services/UserService';
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

interface TeamMember {
    id: number | string;
    userId: number | string;
    studyId: number | string;
    roleCode: string;
    startDate: string;
    endDate?: string;
    active: boolean;
}

interface NewMemberForm {
    userId: string;
    roleCode: string;
    startDate: string;
    endDate: string;
    active: boolean;
}

const StudyTeamManagement: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();

    const [study, setStudy] = useState<Study | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Add new member form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMember, setNewMember] = useState<NewMemberForm>({
        userId: '',
        roleCode: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        active: true
    });

    // Filters for team display
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

    useEffect(() => {
        if (studyId) {
            loadStudyTeamData();
        }
    }, [studyId]);

    const loadStudyTeamData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [studyData, teamData, usersData, rolesData] = await Promise.all([
                StudyService.getStudyById(studyId as any),
                UserStudyRoleService.getStudyTeamMembers(studyId as any),
                UserService.getAllUsers(),
                RoleService.getNonSystemRoles()  // Only non-system roles for study team management
            ]);

            setStudy(studyData as any);
            setTeamMembers(teamData as any);
            setAvailableUsers(usersData as any);
            setRoles(rolesData as any);
        } catch (err) {
            setError('Failed to load study team data');
            console.error('Error loading study team data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const memberData = {
                ...newMember,
                userId: parseInt(newMember.userId),
                studyId: parseInt(studyId as string),
                endDate: newMember.endDate || null
            };

            await UserStudyRoleService.createUserStudyRole(memberData as any);

            setSuccess('Team member added successfully');
            setShowAddForm(false);
            setNewMember({
                userId: '',
                roleCode: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                active: true
            });

            // Reload team data
            await loadStudyTeamData();
        } catch (err) {
            setError('Failed to add team member');
            console.error('Error adding team member:', err);
        }
    };

    const handleRemoveMember = async (assignmentId: number | string, userName: string) => {
        if (window.confirm(`Are you sure you want to remove ${userName} from the study team?`)) {
            try {
                await UserStudyRoleService.deleteUserStudyRole(assignmentId as any);
                setSuccess('Team member removed successfully');
                await loadStudyTeamData();
            } catch (err) {
                setError('Failed to remove team member');
                console.error('Error removing team member:', err);
            }
        }
    };

    const handleDeactivateMember = async (assignmentId: number | string, userName: string) => {
        const endDate = prompt('Enter end date (YYYY-MM-DD):');
        if (!endDate) return;

        try {
            await UserStudyRoleService.deactivateUserStudyRoles({
                ids: [assignmentId.toString()],
                endDate,
                updatedBy: 'current-user' // TODO: Get from auth context
            } as any);
            setSuccess(`${userName} deactivated successfully`);
            await loadStudyTeamData();
        } catch (err) {
            setError('Failed to deactivate team member');
            console.error('Error deactivating team member:', err);
        }
    };

    const getFilteredTeamMembers = (): TeamMember[] => {
        let filtered = [...teamMembers];

        // Filter by role
        if (roleFilter) {
            filtered = filtered.filter(member => member.roleCode === roleFilter);
        }

        // Filter by status
        if (statusFilter === 'active') {
            filtered = filtered.filter(member => member.active);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(member => !member.active);
        }

        return filtered;
    };

    const getUserName = (userId: number | string): string => {
        const user = availableUsers.find(u => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    };

    const getUserEmail = (userId: number | string): string => {
        const user = availableUsers.find(u => u.id === userId);
        return user ? user.email : 'Unknown Email';
    };

    const getRoleName = (roleCode: string): string => {
        const role = roles.find(r => r.code === roleCode);
        return role ? role.name : roleCode;
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Get unique roles from team members for filtering
    const uniqueRoles = [...new Set(teamMembers.map(member => member.roleCode))];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !study) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        );
    }

    const filteredMembers = getFilteredTeamMembers();

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold">Study Team Management</h3>
                        {study && (
                            <p className="text-gray-600 mt-2">
                                Managing team for: <span className="font-semibold">{study.title}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to="/user-management/user-study-roles"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            All Assignments
                        </Link>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            {showAddForm ? 'Cancel' : 'Add Team Member'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-900 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                    <button
                        onClick={() => setSuccess(null)}
                        className="ml-2 text-green-900 hover:text-green-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Add New Member Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4">Add New Team Member</h4>
                    <form onSubmit={handleAddMember}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User *</label>
                                <select
                                    value={newMember.userId}
                                    onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="">Select user...</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                <select
                                    value={newMember.roleCode}
                                    onChange={(e) => setNewMember({ ...newMember, roleCode: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="">Select role...</option>
                                    {roles.map(role => (
                                        <option key={role.code} value={role.code}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                                <input
                                    type="date"
                                    value={newMember.startDate}
                                    onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={newMember.endDate}
                                    onChange={(e) => setNewMember({ ...newMember, endDate: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center">
                            <input
                                type="checkbox"
                                id="active"
                                checked={newMember.active}
                                onChange={(e) => setNewMember({ ...newMember, active: e.target.checked })}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active Assignment
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Member
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="">All Roles</option>
                            {uniqueRoles.map(roleCode => (
                                <option key={roleCode} value={roleCode}>
                                    {getRoleName(roleCode)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setRoleFilter('');
                            setStatusFilter('all');
                        }}
                        className="text-sm bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Team Members Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-lg font-semibold">
                        Team Members ({filteredMembers.length} of {teamMembers.length})
                    </h4>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Team Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Start Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    End Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {getUserName(member.userId)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {getUserEmail(member.userId)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {getRoleName(member.roleCode)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(member.startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(member.endDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {member.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/user-management/user-study-roles/edit/${member.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </Link>
                                            {member.active && (
                                                <button
                                                    onClick={() => handleDeactivateMember(member.id, getUserName(member.userId))}
                                                    className="text-orange-600 hover:text-orange-900"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveMember(member.id, getUserName(member.userId))}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMembers.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {teamMembers.length === 0
                                ? 'No team members assigned to this study yet.'
                                : 'No team members match the current filters.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Study Team Summary */}
            {teamMembers.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Study Team Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                        <div>
                            <strong>Total Members:</strong> {teamMembers.length}
                        </div>
                        <div>
                            <strong>Active Members:</strong> {teamMembers.filter(m => m.active).length}
                        </div>
                        <div>
                            <strong>Unique Roles:</strong> {uniqueRoles.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyTeamManagement;
