// UserService.ts
// User management and user type assignment service with React Query hooks

import ApiService from './ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User entity
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  isActive?: boolean;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data required to create a new user
 */
export interface UserCreateData {
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  isActive?: boolean;
  organizationId?: string;
}

/**
 * Data for updating an existing user
 */
export interface UserUpdateData extends Partial<Omit<UserCreateData, 'username' | 'password'>> {}

/**
 * User type/role entity
 */
export interface UserType {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// API BASE PATH
// ============================================================================

const API_PATH = '/users-ws/users';

// ============================================================================
// API FUNCTIONS (Functional Exports)
// ============================================================================

/**
 * Fetch all users
 * 
 * @returns Promise that resolves to array of users
 * 
 * @example
 * const users = await fetchAllUsers();
 */
export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await ApiService.get(API_PATH);
  return response.data;
};

/**
 * Fetch user by ID
 * 
 * @param id - User ID
 * @returns Promise that resolves to user details
 * 
 * @example
 * const user = await fetchUserById('123');
 */
export const fetchUserById = async (id: string): Promise<User> => {
  const response = await ApiService.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Create a new user
 * 
 * @param userData - User data to create
 * @returns Promise that resolves to created user
 * 
 * @example
 * const newUser = await createUser({
 *   username: 'jdoe',
 *   email: 'john.doe@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 */
export const createUser = async (userData: UserCreateData): Promise<User> => {
  const response = await ApiService.post(API_PATH, userData);
  return response.data;
};

/**
 * Update an existing user
 * 
 * @param id - User ID
 * @param userData - Updated user data
 * @returns Promise that resolves to updated user
 * 
 * @example
 * const updatedUser = await updateUser('123', { phone: '+1-555-1234' });
 */
export const updateUser = async (id: string, userData: UserUpdateData): Promise<User> => {
  const response = await ApiService.put(`${API_PATH}/${id}`, userData);
  return response.data;
};

/**
 * Delete a user
 * 
 * @param id - User ID
 * @returns Promise that resolves when user is deleted
 * 
 * @example
 * await deleteUser('123');
 */
export const deleteUser = async (id: string): Promise<void> => {
  await ApiService.delete(`${API_PATH}/${id}`);
};

/**
 * Fetch user types/roles for a user
 * 
 * @param userId - User ID
 * @returns Promise that resolves to array of user types
 * 
 * @example
 * const userTypes = await fetchUserTypes('123');
 */
export const fetchUserTypes = async (userId: string): Promise<UserType[]> => {
  const response = await ApiService.get(`${API_PATH}/${userId}/types`);
  return response.data;
};

/**
 * Assign a user type/role to a user
 * 
 * @param userId - User ID
 * @param userTypeId - User type ID to assign
 * @returns Promise that resolves when type is assigned
 * 
 * @example
 * await assignUserType('123', '456');
 */
export const assignUserType = async (userId: string, userTypeId: string): Promise<void> => {
  await ApiService.post(`${API_PATH}/${userId}/types/${userTypeId}`, {});
};

/**
 * Remove a user type/role from a user
 * 
 * @param userId - User ID
 * @param userTypeId - User type ID to remove
 * @returns Promise that resolves when type is removed
 * 
 * @example
 * await removeUserType('123', '456');
 */
export const removeUserType = async (userId: string, userTypeId: string): Promise<void> => {
  await ApiService.delete(`${API_PATH}/${userId}/types/${userTypeId}`);
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * React Query hook to fetch all users
 * 
 * @example
 * const { data: users, isLoading } = useUsers();
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to fetch user by ID
 * 
 * @param id - User ID
 * 
 * @example
 * const { data: user, isLoading } = useUser('123');
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to create a new user
 * 
 * @example
 * const createMutation = useCreateUser();
 * await createMutation.mutateAsync({
 *   username: 'jdoe',
 *   email: 'john.doe@example.com'
 * });
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * React Query hook to update a user
 * 
 * @example
 * const updateMutation = useUpdateUser();
 * await updateMutation.mutateAsync({ id: '123', data: { phone: '+1-555-1234' } });
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) => 
      updateUser(id, data),
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(['user', variables.id], data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * React Query hook to delete a user
 * 
 * @example
 * const deleteMutation = useDeleteUser();
 * await deleteMutation.mutateAsync('123');
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['user', deletedId] });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * React Query hook to fetch user types for a user
 * 
 * @param userId - User ID
 * 
 * @example
 * const { data: userTypes, isLoading } = useUserTypes('123');
 */
export const useUserTypes = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId, 'types'],
    queryFn: () => fetchUserTypes(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to assign a user type to a user
 * 
 * @example
 * const assignMutation = useAssignUserType();
 * await assignMutation.mutateAsync({ userId: '123', userTypeId: '456' });
 */
export const useAssignUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userTypeId }: { userId: string; userTypeId: string }) => 
      assignUserType(userId, userTypeId),
    onSuccess: (_, variables) => {
      // Invalidate user types list for this user
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'types'] });
    }
  });
};

/**
 * React Query hook to remove a user type from a user
 * 
 * @example
 * const removeMutation = useRemoveUserType();
 * await removeMutation.mutateAsync({ userId: '123', userTypeId: '456' });
 */
export const useRemoveUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userTypeId }: { userId: string; userTypeId: string }) => 
      removeUserType(userId, userTypeId),
    onSuccess: (_, variables) => {
      // Invalidate user types list for this user
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId, 'types'] });
    }
  });
};

// ============================================================================
// LEGACY EXPORTS (For Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use named exports and React Query hooks instead
 * This export maintains backward compatibility with existing code
 */
const UserService = {
  getAllUsers: fetchAllUsers,
  getUserById: fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserTypes: fetchUserTypes,
  assignUserType,
  removeUserType
};

export default UserService;
