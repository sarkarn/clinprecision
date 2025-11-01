import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../login/AuthContext';
import UserService, { type User } from '../../services/UserService';
import RoleService from '../../services/RoleService';
import UserStudyRoleService from '../../services/UserStudyRoleService';
import StudyService from 'services/StudyService';
import type { Study } from '../../types';
import type { Role } from '../../types/domain/User.types';
import type {
    CreateUserStudyRoleRequest,
    UpdateUserStudyRoleRequest,
    UserStudyRole,
} from '../../types/domain/Security.types';
import { AssignmentStatus } from '../../types/domain/Security.types';

type RoleOption = Role & { code?: string; roleCode?: string };

interface UserStudyRoleFormState {
    userId: string;
    studyId: string;
    roleId: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    notes: string;
}

type ValidationErrors = Partial<Record<'userId' | 'studyId' | 'roleId' | 'startDate' | 'endDate', string>>;

const createDefaultFormState = (): UserStudyRoleFormState => ({
    userId: '',
    studyId: '',
    roleId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
    notes: '',
});

const formatDateFromApi = (value?: string | null): string => {
    if (!value) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    try {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
    } catch (err) {
        console.error('Failed to parse date from API value', value, err);
    }

    return '';
};

const UserStudyRoleForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const { user: authUser } = useAuth();

    const [formData, setFormData] = useState<UserStudyRoleFormState>(createDefaultFormState);

    const [users, setUsers] = useState<User[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const loadReferenceData = useCallback(async () => {
        try {
            setError(null);
            const [usersData, studiesData, rolesData] = await Promise.all([
                UserService.getAllUsers(),
                StudyService.getStudies(),
                RoleService.getNonSystemRoles(), // Only non-system roles for study assignments
            ]);

            setUsers(usersData as User[]);
            setStudies(studiesData as Study[]);
            setRoles((rolesData as Role[]).map((role) => ({ ...role })));
        } catch (err) {
            setError('Failed to load reference data');
            console.error('Error loading reference data:', err);
        }
    }, []);

    const loadUserStudyRole = useCallback(async () => {
        try {
            setLoading(true);
            const data = await UserStudyRoleService.getUserStudyRoleById(id) as UserStudyRole;

            const resolvedRoleId = data.roleId ?? data.roleName ?? '';
            if (!data.roleId) {
                console.warn('UserStudyRole assignment missing roleId, falling back to display name', data);
            }

            setFormData({
                userId: data.userId?.toString() ?? '',
                studyId: data.studyId?.toString() ?? '',
                roleId: resolvedRoleId.toString(),
                startDate: formatDateFromApi(data.startDate),
                endDate: formatDateFromApi(data.endDate ?? undefined),
                isActive: data.status ? data.status === AssignmentStatus.ACTIVE : true,
                notes: data.notes ?? '',
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
        } else {
            setFormData(createDefaultFormState());
            setValidationErrors({});
            setError(null);
        }
    }, [id, isEditing, loadReferenceData, loadUserStudyRole]);

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.userId) {
            errors.userId = 'User is required';
        }

        if (!formData.studyId) {
            errors.studyId = 'Study is required';
        }

        if (!formData.roleId) {
            errors.roleId = 'Role is required';
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        const actor = authUser?.userId ?? authUser?.email ?? 'system';
        const trimmedUserId = formData.userId.trim();
        const trimmedStudyId = formData.studyId.trim();
        const trimmedRoleId = formData.roleId.trim();

        if (!trimmedUserId || !trimmedStudyId || !trimmedRoleId) {
            setError('Please complete all required fields.');
            setLoading(false);
            return;
        }

        try {
            if (isEditing && id) {
                const updatePayload: UpdateUserStudyRoleRequest = {
                    roleId: trimmedRoleId,
                    startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
                    endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
                    notes: formData.notes || undefined,
                    status: formData.isActive ? AssignmentStatus.ACTIVE : AssignmentStatus.INACTIVE,
                    updatedBy: actor,
                };

                await UserStudyRoleService.updateUserStudyRole(id, updatePayload);
            } else {
                const createPayload: CreateUserStudyRoleRequest = {
                    userId: trimmedUserId,
                    studyId: trimmedStudyId,
                    roleId: trimmedRoleId,
                    startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
                    endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
                    notes: formData.notes || undefined,
                    assignedBy: actor,
                    isPrimaryRole: false,
                };

                await UserStudyRoleService.createUserStudyRole(createPayload);
            }

            navigate('/identity-access/study-assignments');
        } catch (submitError: unknown) {
            console.error('Error saving user study role:', submitError);
            setError(isEditing ? 'Failed to update assignment' : 'Failed to create assignment');

            const maybeResponse = submitError as { response?: { status?: number } };
            if (maybeResponse.response?.status === 400) {
                setError('Invalid data. Please check your inputs and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const { name, value } = target;
        const field = name as keyof UserStudyRoleFormState;

        setFormData((prev) => {
            if (field === 'isActive' && target instanceof HTMLInputElement) {
                return { ...prev, isActive: target.checked };
            }

            return {
                ...prev,
                [field]: value,
            };
        });

        const errorKey = field as keyof ValidationErrors;
        if (validationErrors[errorKey]) {
            setValidationErrors((prev) => ({
                ...prev,
                [errorKey]: undefined,
            }));
        }
    };

    const handleCancel = () => {
        navigate('/identity-access/study-assignments');
    };

    const getUserDisplayName = (user: User): string => {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        const label = fullName.length > 0 ? fullName : user.username ?? user.email;
        return `${label} (${user.email})`;
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
                                {studies.map((study) => {
                                    const identifier = (study.id ?? study.uuid ?? '').toString();
                                    const displayName = study.title ?? study.name ?? `Study #${study.id ?? identifier}`;
                                    return (
                                        <option key={identifier || displayName} value={identifier}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                            {validationErrors.studyId && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.studyId}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                                Role *
                            </label>
                            <select
                                id="roleId"
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleInputChange}
                                className={`w-full border rounded-md px-3 py-2 ${validationErrors.roleId ? 'border-red-300' : 'border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={loading}
                            >
                                <option value="">Select a role...</option>
                                {roles.map((role) => {
                                    const identifier = role.id ?? role.code ?? role.roleCode;
                                    if (identifier === undefined || identifier === null) {
                                        return null;
                                    }

                                    const displayName = role.name ?? role.code ?? role.roleCode ?? 'Unnamed role';
                                    const value = identifier.toString();

                                    return (
                                        <option key={value} value={value}>
                                            {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                            {validationErrors.roleId && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.roleId}</p>
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
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={loading}
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
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
};

export default UserStudyRoleForm;
