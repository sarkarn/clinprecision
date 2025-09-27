import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserStudyRoleService } from '../../../services/UserStudyRoleService';
import { UserService } from '../../../services/UserService';
import StudyService from '../../../services/StudyService';
import { RoleService } from '../../../services/RoleService';

export default function UserStudyRoleList() {
    const [userStudyRoles, setUserStudyRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [studies, setStudies] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedStudy, setSelectedStudy] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Selection for bulk operations
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [userStudyRoles, selectedUser, selectedStudy, selectedRole, activeOnly, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, studiesData, rolesData] = await Promise.all([
                UserService.getAllUsers(),
                StudyService.getStudies(),
                RoleService.getNonSystemRoles()  // Only non-system roles for study assignments
            ]);

            setUsers(usersData);
            setStudies(studiesData);
            setRoles(rolesData);

            // Load all user study roles - we'll filter on frontend for better UX
            // In production, consider server-side filtering for large datasets
            await loadUserStudyRoles();
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUserStudyRoles = async () => {
        try {
            // Use the new get all endpoint instead of aggregating by study
            const allRoles = await UserStudyRoleService.getAllUserStudyRoles();
            setUserStudyRoles(allRoles);
        } catch (err) {
            console.error('Error loading user study roles:', err);
            setError('Failed to load user study role assignments');
        }
    };

    const applyFilters = () => {
        let filtered = [...userStudyRoles];

        // Filter by user
        if (selectedUser) {
            filtered = filtered.filter(role => role.userId.toString() === selectedUser);
        }

        // Filter by study
        if (selectedStudy) {
            filtered = filtered.filter(role => role.studyId.toString() === selectedStudy);
        }

        // Filter by role
        if (selectedRole) {
            filtered = filtered.filter(role => role.roleCode === selectedRole);
        }

        // Filter by active status
        if (activeOnly) {
            filtered = filtered.filter(role => role.active);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(role => {
                const user = users.find(u => u.id === role.userId);
                const study = studies.find(s => s.id === role.studyId);
                const roleObj = roles.find(r => r.code === role.roleCode);

                return (
                    (user && (user.email?.toLowerCase().includes(term) ||
                        user.firstName?.toLowerCase().includes(term) ||
                        user.lastName?.toLowerCase().includes(term))) ||
                    (study && study.title?.toLowerCase().includes(term)) ||
                    (roleObj && roleObj.name?.toLowerCase().includes(term)) ||
                    role.roleCode?.toLowerCase().includes(term)
                );
            });
        }

        setFilteredRoles(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this role assignment?')) {
            try {
                await UserStudyRoleService.deleteUserStudyRole(id);
                await loadUserStudyRoles(); // Reload data
            } catch (err) {
                setError('Failed to delete role assignment');
                console.error('Error deleting role assignment:', err);
            }
        }
    };

    const handleBulkDeactivate = async () => {
        if (selectedItems.length === 0) return;

        const endDate = prompt('Enter end date (YYYY-MM-DD):');
        if (!endDate) return;

        try {
            await UserStudyRoleService.deactivateUserStudyRoles(selectedItems, endDate);
            setSelectedItems([]);
            await loadUserStudyRoles();
        } catch (err) {
            setError('Failed to deactivate role assignments');
            console.error('Error deactivating role assignments:', err);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const currentPageItems = getCurrentPageItems().map(role => role.id);
            setSelectedItems(currentPageItems);
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id, checked) => {
        if (checked) {
            setSelectedItems(prev => [...prev, id]);
        } else {
            setSelectedItems(prev => prev.filter(item => item !== id));
        }
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredRoles.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    };

    const getStudyName = (studyId) => {
        const study = studies.find(s => s.id === studyId);
        return study ? study.title : 'Unknown Study';
    };

    const getRoleName = (roleCode) => {
        const role = roles.find(r => r.code === roleCode);
        return role ? role.name : roleCode;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold">User Study Role Assignments</h3>
                <Link
                    to="/user-management/user-study-roles/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    New Assignment
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h4 className="text-lg font-semibold mb-4">Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Users</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Study</label>
                        <select
                            value={selectedStudy}
                            onChange={(e) => setSelectedStudy(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Studies</option>
                            {studies.map(study => (
                                <option key={study.id} value={study.id}>
                                    {study.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role.code} value={role.code}>
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users, studies, roles..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activeOnly"
                            checked={activeOnly}
                            onChange={(e) => setActiveOnly(e.target.checked)}
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
                        to="/user-management/user-study-roles/bulk-assign"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Bulk Assignment
                    </Link>
                </div>
            </div>

            {/* Bulk Actions */}
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

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold">
                            Assignments ({filteredRoles.length})
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
                                        checked={selectedItems.length === getCurrentPageItems().length && getCurrentPageItems().length > 0}
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
                            {getCurrentPageItems().map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(role.id)}
                                            onChange={(e) => handleSelectItem(role.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getUserName(role.userId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {getStudyName(role.studyId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {getRoleName(role.roleCode)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(role.startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(role.endDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {role.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/user-management/user-study-roles/edit/${role.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(role.id)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRoles.length)} of {filteredRoles.length} results
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${currentPage === i + 1
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

            {filteredRoles.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No user study role assignments found.</p>
                </div>
            )}
        </div>
    );
}