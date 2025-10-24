import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserStudyRoleService } from '../../../../services/auth/UserStudyRoleService';
import { UserService } from '../../../../services/UserService';
import StudyService from '../../../../services/StudyService';
import { RoleService } from '../../../../services/auth/RoleService';

export default function UserStudyRoleForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        userId: '',
        studyId: '',
        roleCode: '',
        startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        endDate: '',
        active: true,
        notes: ''
    });

    const [users, setUsers] = useState([]);
    const [studies, setStudies] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const loadReferenceData = useCallback(async () => {
        try {
            const [usersData, studiesData, rolesData] = await Promise.all([
                UserService.getAllUsers(),
                StudyService.getStudies(),
                RoleService.getNonSystemRoles()  // Only non-system roles for study assignments
            ]);

            setUsers(usersData);
            setStudies(studiesData);
            setRoles(rolesData);
        } catch (err) {
            setError('Failed to load reference data');
            console.error('Error loading reference data:', err);
        }
    }, []);

    const loadUserStudyRole = useCallback(async () => {
        try {
            setLoading(true);
            const data = await UserStudyRoleService.getUserStudyRoleById(id);

            // Helper function to safely format date
            const formatDate = (dateValue) => {
                if (!dateValue) return '';

                // If it's already a string in YYYY-MM-DD format, return it
                if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                    return dateValue;
                }

                // If it contains time (ISO format), split it
                if (typeof dateValue === 'string' && dateValue.includes('T')) {
                    return dateValue.split('T')[0];
                }

                // If it's a Date object or timestamp, convert it
                try {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.error('Error parsing date:', dateValue, e);
                }

                return '';
            };

            setFormData({
                userId: data.userId || '',
                studyId: data.studyId || '',
                roleCode: data.roleCode || '',
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                active: data.active !== undefined ? data.active : true,
                notes: data.notes || ''
            });
        } catch (err) {
            setError('Failed to load user study role assignment');
            console.error('Error loading user study role:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadReferenceData();
        if (isEditing) {
            loadUserStudyRole();
        }
    }, [id, isEditing, loadReferenceData, loadUserStudyRole]);

    const validateForm = () => {
        const errors = {};

        if (!formData.userId) {
            errors.userId = 'User is required';
        }

        if (!formData.studyId) {
            errors.studyId = 'Study is required';
        }

        if (!formData.roleCode) {
            errors.roleCode = 'Role is required';
        }

        if (!formData.startDate) {
            errors.startDate = 'Start date is required';
        }

        if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
            errors.endDate = 'End date must be after start date';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Debug logging to see what we're working with
            console.log('Form data before conversion:', formData);

            // More robust ID parsing
            const parseUserId = (userIdValue) => {
                if (!userIdValue) return null;

                // If it's already a number, return it
                if (typeof userIdValue === 'number') return userIdValue;

                // If it's a string that represents a number, parse it
                if (typeof userIdValue === 'string') {
                    const parsed = parseInt(userIdValue);
                    if (!isNaN(parsed)) return parsed;
                }

                console.warn('Unable to parse userId:', userIdValue);
                return null;
            };

            const submitData = {
                ...formData,
                userId: parseUserId(formData.userId),
                studyId: formData.studyId ? parseInt(formData.studyId) : null,
                // Convert date strings to LocalDateTime format (YYYY-MM-DDTHH:MM:SS)
                startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
                endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null
            };

            console.log('Submit data after conversion:', submitData);            // Additional safety check before sending
            if (!submitData.userId || isNaN(submitData.userId)) {
                console.log('userId validation failed:', {
                    originalUserId: formData.userId,
                    convertedUserId: submitData.userId,
                    isNaN: isNaN(submitData.userId)
                });
                setError('User selection is required');
                setLoading(false);
                return;
            }

            if (!submitData.studyId || isNaN(submitData.studyId)) {
                console.log('studyId validation failed:', {
                    originalStudyId: formData.studyId,
                    convertedStudyId: submitData.studyId,
                    isNaN: isNaN(submitData.studyId)
                });
                setError('Study selection is required');
                setLoading(false);
                return;
            }

            if (isEditing) {
                await UserStudyRoleService.updateUserStudyRole(id, submitData);
            } else {
                await UserStudyRoleService.createUserStudyRole(submitData);
            }

            navigate('/user-management/user-study-roles');
        } catch (err) {
            setError(isEditing ? 'Failed to update assignment' : 'Failed to create assignment');
            console.error('Error saving user study role:', err);

            // Handle validation errors from backend
            if (err.response && err.response.status === 400) {
                setError('Invalid data. Please check your inputs and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCancel = () => {
        navigate('/identity-access/study-assignments');
    };

    const getUserDisplayName = (user) => {
        return `${user.firstName} ${user.lastName} (${user.email})`;
    };

    if (loading && isEditing) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold">
                    {isEditing ? 'Edit User Study Role Assignment' : 'Create User Study Role Assignment'}
                </h3>
                <p className="text-gray-600 mt-2">
                    {isEditing ? 'Update the user study role assignment details' : 'Assign a user to a role in a specific study'}
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Selection */}
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                                User *
                            </label>
                            <select
                                id="userId"
                                name="userId"
                                value={formData.userId}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.userId ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            >
                                <option value="">Select a user...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {getUserDisplayName(user)}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.userId && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.userId}</p>
                            )}
                        </div>

                        {/* Study Selection */}
                        <div>
                            <label htmlFor="studyId" className="block text-sm font-medium text-gray-700 mb-2">
                                Study *
                            </label>
                            <select
                                id="studyId"
                                name="studyId"
                                value={formData.studyId}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.studyId ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            >
                                <option value="">Select a study...</option>
                                {studies.map(study => (
                                    <option key={study.id} value={study.id}>
                                        {study.title}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.studyId && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.studyId}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="roleCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Role *
                            </label>
                            <select
                                id="roleCode"
                                name="roleCode"
                                value={formData.roleCode}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.roleCode ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            >
                                <option value="">Select a role...</option>
                                {roles.map(role => (
                                    <option key={role.code} value={role.code}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.roleCode && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.roleCode}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.startDate ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            />
                            {validationErrors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.endDate ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            />
                            {validationErrors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Leave empty for ongoing assignments
                            </p>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="active"
                                name="active"
                                checked={formData.active}
                                onChange={handleInputChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active Assignment
                            </label>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Any additional notes about this role assignment..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Assignment' : 'Create Assignment')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Help Text */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Assignment Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Each user can have multiple roles in different studies</li>
                    <li>• Each user can have multiple roles in the same study (if business rules allow)</li>
                    <li>• Start date cannot be in the future beyond reasonable planning periods</li>
                    <li>• End date is optional - leave empty for ongoing assignments</li>
                    <li>• Inactive assignments are maintained for historical tracking</li>
                </ul>
            </div>
        </div>
    );
}