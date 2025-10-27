// src/services/auth/UserTypeService.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import {
  UserType,
  UserTypesResponse,
  CreateUserTypeRequest,
  UpdateUserTypeRequest,
} from '../../types/domain/User.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userTypeKeys = {
  all: ['userTypes'] as const,
  lists: () => [...userTypeKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userTypeKeys.lists(), filters] as const,
  details: () => [...userTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...userTypeKeys.details(), id] as const,
  active: () => [...userTypeKeys.all, 'active'] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all user types
 */
export const fetchAllUserTypes = async (): Promise<UserType[]> => {
  try {
    console.log('*** UserTypeService: Fetching all user types');
    const response = await ApiService.get('/users-ws/usertypes');
    console.log('*** UserTypeService: Fetched', response.data.length, 'user types');
    return response.data;
  } catch (error) {
    console.error('*** UserTypeService: Error fetching user types:', error);
    throw error;
  }
};

/**
 * Get active user types only
 */
export const fetchActiveUserTypes = async (): Promise<UserType[]> => {
  try {
    console.log('*** UserTypeService: Fetching active user types');
    const response = await ApiService.get('/users-ws/usertypes/active');
    console.log('*** UserTypeService: Fetched', response.data.length, 'active user types');
    return response.data;
  } catch (error) {
    console.error('*** UserTypeService: Error fetching active user types:', error);
    throw error;
  }
};

/**
 * Get a specific user type by ID
 */
export const fetchUserTypeById = async (id: number): Promise<UserType> => {
  try {
    console.log('*** UserTypeService: Fetching user type by ID:', id);
    const response = await ApiService.get(`/users-ws/usertypes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`*** UserTypeService: Error fetching user type ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new user type
 */
export const createUserType = async (userTypeData: CreateUserTypeRequest): Promise<UserType> => {
  try {
    console.log('*** UserTypeService: Creating user type:', userTypeData);
    const response = await ApiService.post('/users-ws/usertypes', userTypeData);
    console.log('*** UserTypeService: User type created successfully');
    return response.data;
  } catch (error) {
    console.error('*** UserTypeService: Error creating user type:', error);
    throw error;
  }
};

/**
 * Update an existing user type
 */
export const updateUserType = async (id: number, userTypeData: UpdateUserTypeRequest): Promise<UserType> => {
  try {
    console.log('*** UserTypeService: Updating user type:', id, userTypeData);
    const response = await ApiService.put(`/users-ws/usertypes/${id}`, userTypeData);
    console.log('*** UserTypeService: User type updated successfully');
    return response.data;
  } catch (error) {
    console.error(`*** UserTypeService: Error updating user type ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a user type
 */
export const deleteUserType = async (id: number): Promise<void> => {
  try {
    console.log('*** UserTypeService: Deleting user type:', id);
    await ApiService.delete(`/users-ws/usertypes/${id}`);
    console.log('*** UserTypeService: User type deleted successfully');
  } catch (error) {
    console.error(`*** UserTypeService: Error deleting user type ${id}:`, error);
    throw error;
  }
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all user types
 * @example
 * const { data: userTypes, isLoading } = useAllUserTypes();
 */
export const useAllUserTypes = (
  options?: UseQueryOptions<UserType[], Error>
) => {
  return useQuery<UserType[], Error>({
    queryKey: userTypeKeys.lists(),
    queryFn: fetchAllUserTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch active user types only
 * @example
 * const { data: activeUserTypes, isLoading } = useActiveUserTypes();
 */
export const useActiveUserTypes = (
  options?: UseQueryOptions<UserType[], Error>
) => {
  return useQuery<UserType[], Error>({
    queryKey: userTypeKeys.active(),
    queryFn: fetchActiveUserTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a specific user type by ID
 * @example
 * const { data: userType, isLoading } = useUserTypeById(userTypeId);
 */
export const useUserTypeById = (
  id: number,
  options?: UseQueryOptions<UserType, Error>
) => {
  return useQuery<UserType, Error>({
    queryKey: userTypeKeys.detail(id),
    queryFn: () => fetchUserTypeById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create a new user type
 * @example
 * const createMutation = useCreateUserType();
 * createMutation.mutate({ name: 'New User Type', code: 'NUT', isActive: true });
 */
export const useCreateUserType = (
  options?: UseMutationOptions<UserType, Error, CreateUserTypeRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<UserType, Error, CreateUserTypeRequest>({
    mutationFn: createUserType,
    onSuccess: (data) => {
      // Invalidate all user type lists
      queryClient.invalidateQueries({ queryKey: userTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userTypeKeys.active() });
      console.log('*** UserTypeService: User type cache invalidated after create');
    },
    ...options,
  });
};

/**
 * Hook to update a user type
 * @example
 * const updateMutation = useUpdateUserType();
 * updateMutation.mutate({ id: 1, userTypeData: { name: 'Updated User Type' } });
 */
export const useUpdateUserType = (
  options?: UseMutationOptions<UserType, Error, { id: number; userTypeData: UpdateUserTypeRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<UserType, Error, { id: number; userTypeData: UpdateUserTypeRequest }>({
    mutationFn: ({ id, userTypeData }) => updateUserType(id, userTypeData),
    onSuccess: (data, variables) => {
      // Invalidate specific user type and all lists
      queryClient.invalidateQueries({ queryKey: userTypeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userTypeKeys.active() });
      console.log('*** UserTypeService: User type cache invalidated after update');
    },
    ...options,
  });
};

/**
 * Hook to delete a user type
 * @example
 * const deleteMutation = useDeleteUserType();
 * deleteMutation.mutate(userTypeId);
 */
export const useDeleteUserType = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteUserType,
    onSuccess: (data, userTypeId) => {
      // Invalidate specific user type and all lists
      queryClient.invalidateQueries({ queryKey: userTypeKeys.detail(userTypeId) });
      queryClient.invalidateQueries({ queryKey: userTypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userTypeKeys.active() });
      console.log('*** UserTypeService: User type cache invalidated after delete');
    },
    ...options,
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user type name by ID from a list of user types
 */
export const getUserTypeNameById = (userTypes: UserType[], id: number): string | undefined => {
  return userTypes.find(ut => ut.id === id)?.name;
};

/**
 * Get user type by code
 */
export const getUserTypeByCode = (userTypes: UserType[], code: string): UserType | undefined => {
  return userTypes.find(ut => ut.code === code);
};

/**
 * Filter active user types
 */
export const filterActiveUserTypes = (userTypes: UserType[]): UserType[] => {
  return userTypes.filter(ut => ut.isActive);
};

/**
 * Sort user types by name
 */
export const sortUserTypesByName = (userTypes: UserType[]): UserType[] => {
  return [...userTypes].sort((a, b) => a.name.localeCompare(b.name));
};

// ============================================================================
// LEGACY COMPATIBILITY - Maintain backward compatibility
// ============================================================================

export const UserTypeService = {
  getAllUserTypes: fetchAllUserTypes,
  getUserTypeById: fetchUserTypeById,
  createUserType,
  updateUserType,
  deleteUserType,
  getUserTypeNameById,
  getUserTypeByCode,
  filterActiveUserTypes,
  sortUserTypesByName,
};

export default UserTypeService;
