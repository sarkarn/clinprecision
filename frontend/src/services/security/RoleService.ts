// src/services/auth/RoleService.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import {
  Role,
  RolesResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../../types/domain/User.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  system: () => [...roleKeys.all, 'system'] as const,
  nonSystem: () => [...roleKeys.all, 'non-system'] as const,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all roles (system and non-system)
 */
export const fetchAllRoles = async (): Promise<Role[]> => {
  try {
    console.log('*** RoleService: Fetching all roles');
    const response = await ApiService.get('/users-ws/roles');
    console.log('*** RoleService: Fetched', response.data.length, 'roles');
    return response.data;
  } catch (error) {
    console.error('*** RoleService: Error fetching roles:', error);
    throw error;
  }
};

/**
 * Get system roles only
 */
export const fetchSystemRoles = async (): Promise<Role[]> => {
  try {
    console.log('*** RoleService: Fetching system roles');
    const response = await ApiService.get('/users-ws/roles/system');
    console.log('*** RoleService: Fetched', response.data.length, 'system roles');
    return response.data;
  } catch (error) {
    console.error('*** RoleService: Error fetching system roles:', error);
    throw error;
  }
};

/**
 * Get non-system roles only
 */
export const fetchNonSystemRoles = async (): Promise<Role[]> => {
  try {
    console.log('*** RoleService: Fetching non-system roles');
    const response = await ApiService.get('/users-ws/roles/non-system');
    console.log('*** RoleService: Fetched', response.data.length, 'non-system roles');
    return response.data;
  } catch (error) {
    console.error('*** RoleService: Error fetching non-system roles:', error);
    throw error;
  }
};

/**
 * Get a specific role by ID
 */
export const fetchRoleById = async (id: number): Promise<Role> => {
  try {
    console.log('*** RoleService: Fetching role by ID:', id);
    const response = await ApiService.get(`/users-ws/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`*** RoleService: Error fetching role ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new role
 */
export const createRole = async (roleData: CreateRoleRequest): Promise<Role> => {
  try {
    console.log('*** RoleService: Creating role:', roleData);
    const response = await ApiService.post('/users-ws/roles', roleData);
    console.log('*** RoleService: Role created successfully');
    return response.data;
  } catch (error) {
    console.error('*** RoleService: Error creating role:', error);
    throw error;
  }
};

/**
 * Update an existing role
 */
export const updateRole = async (id: number, roleData: UpdateRoleRequest): Promise<Role> => {
  try {
    console.log('*** RoleService: Updating role:', id, roleData);
    const response = await ApiService.put(`/users-ws/roles/${id}`, roleData);
    console.log('*** RoleService: Role updated successfully');
    return response.data;
  } catch (error) {
    console.error(`*** RoleService: Error updating role ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a role
 */
export const deleteRole = async (id: number): Promise<void> => {
  try {
    console.log('*** RoleService: Deleting role:', id);
    await ApiService.delete(`/users-ws/roles/${id}`);
    console.log('*** RoleService: Role deleted successfully');
  } catch (error) {
    console.error(`*** RoleService: Error deleting role ${id}:`, error);
    throw error;
  }
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all roles
 * @example
 * const { data: roles, isLoading } = useAllRoles();
 */
export const useAllRoles = (
  options?: UseQueryOptions<Role[], Error>
) => {
  return useQuery<Role[], Error>({
    queryKey: roleKeys.lists(),
    queryFn: fetchAllRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch system roles only
 * @example
 * const { data: systemRoles, isLoading } = useSystemRoles();
 */
export const useSystemRoles = (
  options?: UseQueryOptions<Role[], Error>
) => {
  return useQuery<Role[], Error>({
    queryKey: roleKeys.system(),
    queryFn: fetchSystemRoles,
    staleTime: 10 * 60 * 1000, // 10 minutes (system roles change rarely)
    ...options,
  });
};

/**
 * Hook to fetch non-system roles only
 * @example
 * const { data: nonSystemRoles, isLoading } = useNonSystemRoles();
 */
export const useNonSystemRoles = (
  options?: UseQueryOptions<Role[], Error>
) => {
  return useQuery<Role[], Error>({
    queryKey: roleKeys.nonSystem(),
    queryFn: fetchNonSystemRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a specific role by ID
 * @example
 * const { data: role, isLoading } = useRoleById(roleId);
 */
export const useRoleById = (
  id: number,
  options?: UseQueryOptions<Role, Error>
) => {
  return useQuery<Role, Error>({
    queryKey: roleKeys.detail(id),
    queryFn: () => fetchRoleById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create a new role
 * @example
 * const createMutation = useCreateRole();
 * createMutation.mutate({ name: 'New Role', isSystemRole: false });
 */
export const useCreateRole = (
  options?: UseMutationOptions<Role, Error, CreateRoleRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, CreateRoleRequest>({
    mutationFn: createRole,
    onSuccess: (data) => {
      // Invalidate all role lists
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.system() });
      queryClient.invalidateQueries({ queryKey: roleKeys.nonSystem() });
      console.log('*** RoleService: Role cache invalidated after create');
    },
    ...options,
  });
};

/**
 * Hook to update a role
 * @example
 * const updateMutation = useUpdateRole();
 * updateMutation.mutate({ id: 1, roleData: { name: 'Updated Role' } });
 */
export const useUpdateRole = (
  options?: UseMutationOptions<Role, Error, { id: number; roleData: UpdateRoleRequest }>
) => {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, { id: number; roleData: UpdateRoleRequest }>({
    mutationFn: ({ id, roleData }) => updateRole(id, roleData),
    onSuccess: (data, variables) => {
      // Invalidate specific role and all lists
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.system() });
      queryClient.invalidateQueries({ queryKey: roleKeys.nonSystem() });
      console.log('*** RoleService: Role cache invalidated after update');
    },
    ...options,
  });
};

/**
 * Hook to delete a role
 * @example
 * const deleteMutation = useDeleteRole();
 * deleteMutation.mutate(roleId);
 */
export const useDeleteRole = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteRole,
    onSuccess: (data, roleId) => {
      // Invalidate specific role and all lists
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.system() });
      queryClient.invalidateQueries({ queryKey: roleKeys.nonSystem() });
      console.log('*** RoleService: Role cache invalidated after delete');
    },
    ...options,
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get role name by ID from a list of roles
 */
export const getRoleNameById = (roles: Role[], id: number): string | undefined => {
  return roles.find(role => role.id === id)?.name;
};

/**
 * Filter roles by system/non-system
 */
export const filterRolesByType = (roles: Role[], isSystem: boolean): Role[] => {
  return roles.filter(role => role.isSystemRole === isSystem);
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (role: Role, permission: string): boolean => {
  return role.permissions?.includes(permission) ?? false;
};

// ============================================================================
// LEGACY COMPATIBILITY - Maintain backward compatibility
// ============================================================================

export const RoleService = {
  getAllRoles: fetchAllRoles,
  getSystemRoles: fetchSystemRoles,
  getNonSystemRoles: fetchNonSystemRoles,
  getRoleById: fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRoleNameById,
  filterRolesByType,
  roleHasPermission,
};

export default RoleService;
