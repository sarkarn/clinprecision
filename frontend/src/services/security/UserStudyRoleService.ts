/**
 * User Study Role Service
 * Manages user-study role assignments and team member access control
 * 
 * Features:
 * - User-study role assignment CRUD
 * - Study team member management
 * - Role-based access control
 * - Active/inactive assignment tracking
 * - Bulk assignment operations
 * - Role priority and hierarchy
 * 
 * @see Security.types.ts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import {
  UserStudyRole,
  UserStudyRoleWithDetails,
  StudyTeamMember,
  CreateUserStudyRoleRequest,
  UpdateUserStudyRoleRequest,
  BulkCreateUserStudyRolesRequest,
  BulkDeactivateUserStudyRolesRequest,
  UserStudyRoleResponse,
  UserStudyRolesResponse,
  UserStudyRolesWithDetailsResponse,
  StudyTeamMembersResponse,
  BulkOperationResponse,
  ActiveRoleCheckResponse,
  UserRoleCheckResponse,
  HighestPriorityRoleResponse,
  UserRoleHistoryResponse,
} from '../../types/domain/security/Security.types';

// ==================== Query Keys ====================

/**
 * Query key factory for user study roles
 */
export const userStudyRoleKeys = {
  all: ['userStudyRoles'] as const,
  lists: () => [...userStudyRoleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userStudyRoleKeys.lists(), filters] as const,
  details: () => [...userStudyRoleKeys.all, 'detail'] as const,
  detail: (id: string) => [...userStudyRoleKeys.details(), id] as const,
  userAssignments: (userId: string) => [...userStudyRoleKeys.all, 'user', userId] as const,
  studyAssignments: (studyId: string) => [...userStudyRoleKeys.all, 'study', studyId] as const,
  studyActiveAssignments: (studyId: string) => [...userStudyRoleKeys.all, 'study', studyId, 'active'] as const,
  userStudyAssignments: (userId: string, studyId: string) => [...userStudyRoleKeys.all, 'user', userId, 'study', studyId] as const,
  userActiveRoles: (userId: string) => [...userStudyRoleKeys.all, 'user', userId, 'active'] as const,
  studyTeam: (studyId: string) => [...userStudyRoleKeys.all, 'study', studyId, 'team'] as const,
  highestPriorityRole: (userId: string) => [...userStudyRoleKeys.all, 'user', userId, 'highest-priority'] as const,
} as const;

// ==================== API Functions ====================

/**
 * Fetch all user study role assignments
 */
async function fetchAllUserStudyRoles(): Promise<UserStudyRole[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching all user study roles');
  const response = await ApiService.get('/users-ws/api/user-study-roles');
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetched roles:', response.data.length);
  return response.data;
}

/**
 * Fetch user study role assignment by ID
 */
async function fetchUserStudyRoleById(id: string): Promise<UserStudyRole> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching user study role:', id);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/${id}`);
  return response.data;
}

/**
 * Fetch all role assignments for a specific user
 */
async function fetchUserRoleAssignments(userId: string): Promise<UserStudyRoleWithDetails[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching role assignments for user:', userId);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] User has', response.data.length, 'role assignments');
  return response.data;
}

/**
 * Fetch all role assignments for a specific study
 */
async function fetchStudyRoleAssignments(studyId: string): Promise<UserStudyRoleWithDetails[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching role assignments for study:', studyId);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Study has', response.data.length, 'role assignments');
  return response.data;
}

/**
 * Fetch active role assignments for a specific study
 */
async function fetchActiveStudyRoleAssignments(studyId: string): Promise<UserStudyRoleWithDetails[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching active role assignments for study:', studyId);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}/active`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Study has', response.data.length, 'active role assignments');
  return response.data;
}

/**
 * Fetch role assignments for a specific user in a specific study
 */
async function fetchUserStudyRoleAssignments(userId: string, studyId: string): Promise<UserStudyRoleWithDetails[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching role assignments for user', userId, 'in study', studyId);
  const response = await ApiService.get(
    `/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}`
  );
  return response.data;
}

/**
 * Fetch all active roles for a specific user across all studies
 */
async function fetchUserActiveRoles(userId: string): Promise<UserStudyRoleWithDetails[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching active roles for user:', userId);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/active`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] User has', response.data.length, 'active roles');
  return response.data;
}

/**
 * Fetch study team members (all active role assignments for a study)
 */
async function fetchStudyTeamMembers(studyId: string): Promise<StudyTeamMember[]> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching team members for study:', studyId);
  const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}/team`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Study has', response.data.length, 'team members');
  return response.data;
}

/**
 * Fetch highest priority role for a user
 */
async function fetchHighestPriorityRole(userId: string): Promise<HighestPriorityRoleResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Fetching highest priority role for user:', userId);
  const response = await ApiService.get(
    `/users-ws/api/user-study-roles/users/${userId}/highest-priority`
  );
  return response.data;
}

/**
 * Create a new user study role assignment
 */
async function createUserStudyRole(data: CreateUserStudyRoleRequest): Promise<UserStudyRoleResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Creating user study role assignment:', data);
  const response = await ApiService.post('/users-ws/api/user-study-roles', data);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Created assignment:', response.data);
  return response.data;
}

/**
 * Update an existing user study role assignment
 */
async function updateUserStudyRole(id: string, data: UpdateUserStudyRoleRequest): Promise<UserStudyRoleResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Updating user study role assignment:', id, data);
  const response = await ApiService.put(`/users-ws/api/user-study-roles/${id}`, data);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Updated assignment:', response.data);
  return response.data;
}

/**
 * Delete a user study role assignment
 */
async function deleteUserStudyRole(id: string): Promise<void> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Deleting user study role assignment:', id);
  await ApiService.delete(`/users-ws/api/user-study-roles/${id}`);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Deleted assignment:', id);
}

/**
 * Create multiple user study role assignments in bulk
 */
async function createMultipleUserStudyRoles(data: BulkCreateUserStudyRolesRequest): Promise<BulkOperationResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Creating multiple user study roles:', data.assignments.length, 'assignments');
  const response = await ApiService.post('/users-ws/api/user-study-roles/bulk', data.assignments);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Bulk create result:', response.data);
  return response.data;
}

/**
 * Deactivate multiple user study role assignments
 */
async function deactivateUserStudyRoles(data: BulkDeactivateUserStudyRolesRequest): Promise<BulkOperationResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Deactivating user study roles:', data.ids.length, 'assignments');
  const response = await ApiService.put('/users-ws/api/user-study-roles/bulk/deactivate', data);
  console.log('*** [USER_STUDY_ROLE_SERVICE] Bulk deactivate result:', response.data);
  return response.data;
}

/**
 * Check if user has active role in study
 */
async function checkActiveRoleInStudy(userId: string, studyId: string): Promise<ActiveRoleCheckResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Checking active role for user', userId, 'in study', studyId);
  const response = await ApiService.get(
    `/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}/has-active-role`
  );
  return response.data;
}

/**
 * Check if user has specific role in study
 */
async function checkRoleInStudy(userId: string, studyId: string, roleName: string): Promise<UserRoleCheckResponse> {
  console.log('*** [USER_STUDY_ROLE_SERVICE] Checking role', roleName, 'for user', userId, 'in study', studyId);
  const response = await ApiService.get(
    `/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}/roles/${roleName}/has-role`
  );
  return response.data;
}

// ==================== React Query Hooks ====================

/**
 * Hook to fetch all user study role assignments
 */
export function useAllUserStudyRoles(options?: Omit<UseQueryOptions<UserStudyRole[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<UserStudyRole[], Error>({
    queryKey: userStudyRoleKeys.lists(),
    queryFn: fetchAllUserStudyRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch user study role assignment by ID
 */
export function useUserStudyRoleById(
  id: string,
  options?: Omit<UseQueryOptions<UserStudyRole, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRole, Error>({
    queryKey: userStudyRoleKeys.detail(id),
    queryFn: () => fetchUserStudyRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch all role assignments for a specific user
 */
export function useUserRoleAssignments(
  userId: string,
  options?: Omit<UseQueryOptions<UserStudyRoleWithDetails[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRoleWithDetails[], Error>({
    queryKey: userStudyRoleKeys.userAssignments(userId),
    queryFn: () => fetchUserRoleAssignments(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch all role assignments for a specific study
 */
export function useStudyRoleAssignments(
  studyId: string,
  options?: Omit<UseQueryOptions<UserStudyRoleWithDetails[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRoleWithDetails[], Error>({
    queryKey: userStudyRoleKeys.studyAssignments(studyId),
    queryFn: () => fetchStudyRoleAssignments(studyId),
    enabled: !!studyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch active role assignments for a specific study
 */
export function useActiveStudyRoleAssignments(
  studyId: string,
  options?: Omit<UseQueryOptions<UserStudyRoleWithDetails[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRoleWithDetails[], Error>({
    queryKey: userStudyRoleKeys.studyActiveAssignments(studyId),
    queryFn: () => fetchActiveStudyRoleAssignments(studyId),
    enabled: !!studyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch role assignments for a specific user in a specific study
 */
export function useUserStudyRoleAssignments(
  userId: string,
  studyId: string,
  options?: Omit<UseQueryOptions<UserStudyRoleWithDetails[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRoleWithDetails[], Error>({
    queryKey: userStudyRoleKeys.userStudyAssignments(userId, studyId),
    queryFn: () => fetchUserStudyRoleAssignments(userId, studyId),
    enabled: !!userId && !!studyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch all active roles for a specific user across all studies
 */
export function useUserActiveRoles(
  userId: string,
  options?: Omit<UseQueryOptions<UserStudyRoleWithDetails[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserStudyRoleWithDetails[], Error>({
    queryKey: userStudyRoleKeys.userActiveRoles(userId),
    queryFn: () => fetchUserActiveRoles(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch study team members
 */
export function useStudyTeamMembers(
  studyId: string,
  options?: Omit<UseQueryOptions<StudyTeamMember[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyTeamMember[], Error>({
    queryKey: userStudyRoleKeys.studyTeam(studyId),
    queryFn: () => fetchStudyTeamMembers(studyId),
    enabled: !!studyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch highest priority role for a user
 */
export function useHighestPriorityRole(
  userId: string,
  options?: Omit<UseQueryOptions<HighestPriorityRoleResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<HighestPriorityRoleResponse, Error>({
    queryKey: userStudyRoleKeys.highestPriorityRole(userId),
    queryFn: () => fetchHighestPriorityRole(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes (less frequently changing)
    ...options,
  });
}

/**
 * Hook to create a user study role assignment
 */
export function useCreateUserStudyRole(
  options?: Omit<UseMutationOptions<UserStudyRoleResponse, Error, CreateUserStudyRoleRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<UserStudyRoleResponse, Error, CreateUserStudyRoleRequest>({
    mutationFn: createUserStudyRole,
    onSuccess: (data, variables) => {
      console.log('*** [USER_STUDY_ROLE_SERVICE] Invalidating queries after create');
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.lists() });
      
      // Invalidate user-specific queries
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.userAssignments(variables.userId) });
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.userActiveRoles(variables.userId) });
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.highestPriorityRole(variables.userId) });
      }
      
      // Invalidate study-specific queries
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.studyAssignments(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.studyActiveAssignments(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.studyTeam(variables.studyId) });
      }
      
      // Invalidate user-study queries
      if (variables.userId && variables.studyId) {
        queryClient.invalidateQueries({
          queryKey: userStudyRoleKeys.userStudyAssignments(variables.userId, variables.studyId),
        });
      }
    },
    ...options,
  });
}

/**
 * Hook to update a user study role assignment
 */
export function useUpdateUserStudyRole(
  options?: Omit<UseMutationOptions<UserStudyRoleResponse, Error, { id: string; data: UpdateUserStudyRoleRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<UserStudyRoleResponse, Error, { id: string; data: UpdateUserStudyRoleRequest }>({
    mutationFn: ({ id, data }) => updateUserStudyRole(id, data),
    onSuccess: (response, variables) => {
      console.log('*** [USER_STUDY_ROLE_SERVICE] Invalidating queries after update');
      
      // Invalidate specific assignment
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.detail(variables.id) });
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.lists() });
      
      // Invalidate related queries (we don't have userId/studyId here, so invalidate broader queries)
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a user study role assignment
 */
export function useDeleteUserStudyRole(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteUserStudyRole,
    onSuccess: (_, id) => {
      console.log('*** [USER_STUDY_ROLE_SERVICE] Invalidating queries after delete');
      
      // Invalidate specific assignment
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.detail(id) });
      
      // Invalidate all lists and related queries
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to create multiple user study role assignments in bulk
 */
export function useCreateMultipleUserStudyRoles(
  options?: Omit<UseMutationOptions<BulkOperationResponse, Error, BulkCreateUserStudyRolesRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<BulkOperationResponse, Error, BulkCreateUserStudyRolesRequest>({
    mutationFn: createMultipleUserStudyRoles,
    onSuccess: () => {
      console.log('*** [USER_STUDY_ROLE_SERVICE] Invalidating queries after bulk create');
      
      // Invalidate all queries (bulk operations affect multiple users/studies)
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to deactivate multiple user study role assignments
 */
export function useDeactivateUserStudyRoles(
  options?: Omit<UseMutationOptions<BulkOperationResponse, Error, BulkDeactivateUserStudyRolesRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<BulkOperationResponse, Error, BulkDeactivateUserStudyRolesRequest>({
    mutationFn: deactivateUserStudyRoles,
    onSuccess: () => {
      console.log('*** [USER_STUDY_ROLE_SERVICE] Invalidating queries after bulk deactivate');
      
      // Invalidate all queries (bulk operations affect multiple users/studies)
      queryClient.invalidateQueries({ queryKey: userStudyRoleKeys.all });
    },
    ...options,
  });
}

// ==================== Utility Functions ====================

/**
 * Get all assignments for a user in a specific study
 */
export function getUserStudyAssignments(
  assignments: UserStudyRoleWithDetails[],
  userId: string,
  studyId: string
): UserStudyRoleWithDetails[] {
  return assignments.filter((a) => a.userId === userId && a.studyId === studyId);
}

/**
 * Get active assignments only
 */
export function getActiveAssignments(assignments: UserStudyRoleWithDetails[]): UserStudyRoleWithDetails[] {
  return assignments.filter((a) => a.status === 'ACTIVE');
}

/**
 * Get user's primary role in a study
 */
export function getPrimaryRole(
  assignments: UserStudyRoleWithDetails[],
  userId: string,
  studyId: string
): UserStudyRoleWithDetails | undefined {
  const userStudyAssignments = getUserStudyAssignments(assignments, userId, studyId);
  const activeAssignments = getActiveAssignments(userStudyAssignments);
  
  // Find primary role or return highest priority
  return (
    activeAssignments.find((a) => a.isPrimaryRole) ||
    activeAssignments.sort((a, b) => (a.rolePriority || 999) - (b.rolePriority || 999))[0]
  );
}

/**
 * Check if user has active assignment in study
 */
export function hasActiveAssignment(
  assignments: UserStudyRoleWithDetails[],
  userId: string,
  studyId: string
): boolean {
  return getUserStudyAssignments(assignments, userId, studyId).some((a) => a.status === 'ACTIVE');
}

/**
 * Check if user has specific role in study
 */
export function hasRoleInStudy(
  assignments: UserStudyRoleWithDetails[],
  userId: string,
  studyId: string,
  roleName: string
): boolean {
  const userStudyAssignments = getUserStudyAssignments(assignments, userId, studyId);
  const activeAssignments = getActiveAssignments(userStudyAssignments);
  return activeAssignments.some((a) => a.roleName === roleName);
}

/**
 * Get all unique studies a user has assignments in
 */
export function getUserStudies(assignments: UserStudyRoleWithDetails[], userId: string): string[] {
  const studyIds = assignments.filter((a) => a.userId === userId).map((a) => a.studyId);
  return Array.from(new Set(studyIds));
}

/**
 * Get all unique users in a study
 */
export function getStudyUsers(assignments: UserStudyRoleWithDetails[], studyId: string): string[] {
  const userIds = assignments.filter((a) => a.studyId === studyId).map((a) => a.userId);
  return Array.from(new Set(userIds));
}

/**
 * Filter assignments by date range
 */
export function filterByDateRange(
  assignments: UserStudyRoleWithDetails[],
  startDate?: string,
  endDate?: string
): UserStudyRoleWithDetails[] {
  return assignments.filter((a) => {
    if (startDate && a.startDate < startDate) return false;
    if (endDate && a.endDate && a.endDate > endDate) return false;
    return true;
  });
}

/**
 * Sort assignments by priority (ascending)
 */
export function sortByPriority(assignments: UserStudyRoleWithDetails[]): UserStudyRoleWithDetails[] {
  return [...assignments].sort((a, b) => (a.rolePriority || 999) - (b.rolePriority || 999));
}

/**
 * Group assignments by study
 */
export function groupByStudy(
  assignments: UserStudyRoleWithDetails[]
): Record<string, UserStudyRoleWithDetails[]> {
  return assignments.reduce((acc, assignment) => {
    const studyId = assignment.studyId;
    if (!acc[studyId]) {
      acc[studyId] = [];
    }
    acc[studyId].push(assignment);
    return acc;
  }, {} as Record<string, UserStudyRoleWithDetails[]>);
}

/**
 * Group assignments by user
 */
export function groupByUser(
  assignments: UserStudyRoleWithDetails[]
): Record<string, UserStudyRoleWithDetails[]> {
  return assignments.reduce((acc, assignment) => {
    const userId = assignment.userId;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(assignment);
    return acc;
  }, {} as Record<string, UserStudyRoleWithDetails[]>);
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy service object for backward compatibility
 */
const UserStudyRoleService = {
  // Query functions
  getAllUserStudyRoles: fetchAllUserStudyRoles,
  getUserStudyRoleById: fetchUserStudyRoleById,
  getUserRoleAssignments: fetchUserRoleAssignments,
  getStudyRoleAssignments: fetchStudyRoleAssignments,
  getActiveStudyRoleAssignments: fetchActiveStudyRoleAssignments,
  getUserStudyRoleAssignments: fetchUserStudyRoleAssignments,
  getUserActiveRoles: fetchUserActiveRoles,
  getStudyTeamMembers: fetchStudyTeamMembers,
  getHighestPriorityRole: fetchHighestPriorityRole,
  
  // Mutation functions
  createUserStudyRole,
  updateUserStudyRole,
  deleteUserStudyRole,
  createMultipleUserStudyRoles,
  deactivateUserStudyRoles,
  
  // Check functions
  hasActiveRoleInStudy: checkActiveRoleInStudy,
  checkRoleInStudy: checkRoleInStudy,
  
  // Utility functions
  getUserStudyAssignments,
  getActiveAssignments,
  getPrimaryRole,
  hasActiveAssignment,
  hasRole: hasRoleInStudy,
  getUserStudies,
  getStudyUsers,
  filterByDateRange,
  sortByPriority,
  groupByStudy,
  groupByUser,
};

export default UserStudyRoleService;

// Named export for components using destructured imports
export { UserStudyRoleService };
