// UserStudyRoleList.tsx
// ...file content omitted for brevity (see previous tool result)...
import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import UserStudyRoleService from '../../services/UserStudyRoleService';
import UserService, { type User } from '../../services/UserService';
import RoleService from '../../services/RoleService';
import StudyService from 'services/StudyService';
import { useAuth } from '../login/AuthContext';
import type { Study } from '../../types';
import type { Role } from '../../types/domain/User.types';
import type { UserStudyRole } from '../../types/domain/Security.types';
import { AssignmentStatus } from '../../types/domain/Security.types';

const ITEMS_PER_PAGE = 10;

const toStringId = (value?: string | number | null): string => {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value);
};

const parseDate = (value?: string | null): Date | null => {
    if (!value) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T00:00:00`);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateForDisplay = (value?: string | null): string => {
    const parsed = parseDate(value);
    if (!parsed) {
        return 'N/A';
    }

    return parsed.toLocaleDateString();
};

const formatStatusLabel = (status?: AssignmentStatus): string => {
    if (!status) {
        return 'Unknown';
    }

    return status
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const getStatusBadgeClass = (status?: AssignmentStatus): string => {
    switch (status) {
        case AssignmentStatus.ACTIVE:
            return 'bg-green-100 text-green-800';
        case AssignmentStatus.PENDING:
            return 'bg-blue-100 text-blue-800';
        case AssignmentStatus.EXPIRED:
        case AssignmentStatus.INACTIVE:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const isAssignmentActive = (assignment: UserStudyRole): boolean => {
    if (assignment.status) {
        return assignment.status === AssignmentStatus.ACTIVE || assignment.status === AssignmentStatus.PENDING;
    }

    if (assignment.endDate) {
        const parsedEndDate = parseDate(assignment.endDate);
        if (parsedEndDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return parsedEndDate >= today;
        }
    }

    return true;
};

const UserStudyRoleList: React.FC = () => {
    const { user: authUser } = useAuth();

    const [userStudyRoles, setUserStudyRoles] = useState<UserStudyRole[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState('');
    const [selectedStudy, setSelectedStudy] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [usersData, studiesData, rolesData, assignmentsData] = await Promise.all([
                    UserService.getAllUsers(),
                    StudyService.getStudies(),
                    RoleService.getNonSystemRoles(),
                    UserStudyRoleService.getAllUserStudyRoles(),
                ]);

                if (!isMounted) {
                    return;
                }

                setUsers(usersData as User[]);
                setStudies(studiesData as Study[]);
                setRoles((rolesData as Role[]).map((role) => ({ ...role })));
                setUserStudyRoles(assignmentsData as UserStudyRole[]);
            } catch (err) {
                console.error('Error loading identity access data:', err);
                if (isMounted) {
                    setError('Failed to load user study role assignments');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    const reloadAssignments = useCallback(async () => {
        setError(null);
        setLoading(true);

        try {
            const assignments = await UserStudyRoleService.getAllUserStudyRoles();
            setUserStudyRoles(assignments as UserStudyRole[]);
            setSelectedItems([]);
        } catch (err) {
            console.error('Error reloading user study roles:', err);
            setError('Failed to load user study role assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    const studyIdentifier = useCallback((study: Study): string => {
        return toStringId(study.id ?? study.uuid ?? '');
    }, []);

    const filteredAssignments = useMemo(() => {
        let filtered = [...userStudyRoles];

        if (selectedUser) {
            filtered = filtered.filter((assignment) => toStringId(assignment.userId) === selectedUser);
        }

        if (selectedStudy) {
            filtered = filtered.filter((assignment) => toStringId(assignment.studyId) === selectedStudy);
        }

        if (selectedRole) {
            filtered = filtered.filter((assignment) => toStringId(assignment.roleId) === selectedRole);
        }

        if (activeOnly) {
            filtered = filtered.filter((assignment) => isAssignmentActive(assignment));
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((assignment) => {
                const user = users.find((candidate) => toStringId(candidate.id) === toStringId(assignment.userId));
                const study = studies.find((candidate) => studyIdentifier(candidate) === toStringId(assignment.studyId));
                const role = roles.find((candidate) => toStringId(candidate.id) === toStringId(assignment.roleId));

                const userMatches = Boolean(user) && [user?.email, user?.firstName, user?.lastName]
                    .some((field) => field?.toLowerCase().includes(term));

                const studyMatches = Boolean(study) && [study?.title, study?.name, study?.protocolNumber]
                    .some((field) => field?.toLowerCase().includes(term));

                const roleMatches = Boolean(role?.name?.toLowerCase().includes(term));
                const assignmentMatches = [assignment.roleName, assignment.notes]
                    .some((field) => field?.toLowerCase().includes(term));

                return userMatches || studyMatches || roleMatches || assignmentMatches;
            });
        }

        return filtered;
    }, [userStudyRoles, selectedUser, selectedStudy, selectedRole, activeOnly, searchTerm, users, studies, roles, studyIdentifier]);

    useEffect(() => {
        setSelectedItems((prev) => prev.filter((id) => filteredAssignments.some((assignment) => assignment.id === id)));
    }, [filteredAssignments]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedUser, selectedStudy, selectedRole, activeOnly, searchTerm]);

    useEffect(() => {
        const total = Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE));
        if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [filteredAssignments.length, currentPage]);

    const currentPageItems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAssignments.slice(startIndex, endIndex);
    }, [filteredAssignments, currentPage]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE)), [filteredAssignments.length]);

    const handleDelete = async (assignmentId: string) => {
        if (!window.confirm('Are you sure you want to delete this role assignment?')) {
            return;
        }

        try {
            await UserStudyRoleService.deleteUserStudyRole(assignmentId);
            await reloadAssignments();
        } catch (err) {
            console.error('Error deleting user study role:', err);
            setError('Failed to delete role assignment');
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedItems.length === 0) {
            return;
        }

        const endDate = prompt('Enter end date (YYYY-MM-DD):');
        if (!endDate) {
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            alert('Please enter a valid date in YYYY-MM-DD format.');
            return;
        }

        const actor = authUser?.userId ?? authUser?.email ?? 'system';

        try {
            await UserStudyRoleService.deactivateUserStudyRoles({
                ids: selectedItems,
                endDate: `${endDate}T23:59:59`,
                updatedBy: actor,
            });
            setSelectedItems([]);
            await reloadAssignments();
        } catch (err) {
            console.error('Error deactivating user study roles:', err);
            setError('Failed to deactivate role assignments');
        }
    };

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const idsToAdd = currentPageItems.map((assignment) => assignment.id);
            setSelectedItems((prev) => Array.from(new Set([...prev, ...idsToAdd])));
        } else {
            const idsToRemove = new Set(currentPageItems.map((assignment) => assignment.id));
            setSelectedItems((prev) => prev.filter((id) => !idsToRemove.has(id)));
        }
    };

    const handleSelectItem = (assignmentId: string, checked: boolean) => {
        if (checked) {
            setSelectedItems((prev) => (prev.includes(assignmentId) ? prev : [...prev, assignmentId]));
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== assignmentId));
        }
    };

    const getUserName = (userId: string): string => {
        const user = users.find((candidate) => toStringId(candidate.id) === toStringId(userId));
        if (!user) {
            return 'Unknown User';
        }

        const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        return name.length > 0 ? name : user.email ?? 'Unknown User';
    };

    const getStudyName = (studyId: string): string => {
        const study = studies.find((candidate) => studyIdentifier(candidate) === toStringId(studyId));
        return study?.title ?? study?.name ?? `Study ${studyId}`;
    };

    const getRoleName = (assignment: UserStudyRole): string => {
        const role = roles.find((candidate) => toStringId(candidate.id) === toStringId(assignment.roleId));
        return role?.name ?? assignment.roleName ?? 'Unknown Role';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold">User Study Role Assignments</h3>
                <Link
                    to="/identity-access/study-assignments/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    New Assignment
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4">Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                        <select
                            value={selectedUser}
                            onChange={(event) => setSelectedUser(event.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Users</option>
                            {users.map((user) => (
                                <option key={user.id} value={toStringId(user.id)}>
                                    {getUserName(toStringId(user.id))} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Study</label>
                        <select
                            value={selectedStudy}
                            onChange={(event) => setSelectedStudy(event.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Studies</option>
                            {studies.map((study) => {
                                const value = studyIdentifier(study);
                                const label = study.title ?? study.name ?? `Study ${value || 'Unknown'}`;
                                return (
                                    <option key={value || label} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(event) => setSelectedRole(event.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Roles</option>
                            {roles.map((role) => (
                                <option key={role.id} value={toStringId(role.id)}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search users, studies, roles..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activeOnly"
                            checked={activeOnly}
                            onChange={(event) => setActiveOnly(event.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
                            Active Only
                        </label>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedUser('');
                            setSelectedStudy('');
                            setSelectedRole('');
                            setActiveOnly(false);
                            setSearchTerm('');
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                        Clear Filters
                    </button>

                    <Link
                        to="/identity-access/study-assignments/bulk-assign"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Bulk Assignment
                    </Link>
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                            {selectedItems.length} item(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkDeactivate}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                            >
                                Deactivate Selected
                            </button>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">
                            Assignments ({filteredAssignments.length})
                        </h4>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={currentPageItems.length > 0 && currentPageItems.every((assignment) => selectedItems.includes(assignment.id))}
                                    />
                                </th>
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
                            {currentPageItems.map((assignment) => (
                                <tr key={assignment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(assignment.id)}
                                            onChange={(event) => handleSelectItem(assignment.id, event.target.checked)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getUserName(assignment.userId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {getStudyName(assignment.studyId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {getRoleName(assignment)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateForDisplay(assignment.startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateForDisplay(assignment.endDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                                            {formatStatusLabel(assignment.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/identity-access/study-assignments/edit/${assignment.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(assignment.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length)} of {filteredAssignments.length} results
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${currentPage === index + 1
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {filteredAssignments.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No user study role assignments found.</p>
                </div>
            )}
        </div>
    );
};

export default UserStudyRoleList;
