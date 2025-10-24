// OrganizationService.ts
// Organization and contact management service with React Query hooks

import ApiService from './ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  organizationType?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data required to create a new organization
 */
export interface OrganizationCreateData {
  name: string;
  organizationType?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: string;
}

/**
 * Data for updating an existing organization
 */
export interface OrganizationUpdateData extends Partial<OrganizationCreateData> {}

/**
 * Organization contact entity
 */
export interface OrganizationContact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data required to create a new contact
 */
export interface ContactCreateData {
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary?: boolean;
}

/**
 * Data for updating an existing contact
 */
export interface ContactUpdateData extends Partial<ContactCreateData> {}

// ============================================================================
// API BASE PATH
// ============================================================================

const API_PATH = '/organization-ws/api/organizations';

// ============================================================================
// API FUNCTIONS (Functional Exports)
// ============================================================================

/**
 * Fetch all organizations
 * 
 * @returns Promise that resolves to array of organizations
 * 
 * @example
 * const orgs = await fetchAllOrganizations();
 */
export const fetchAllOrganizations = async (): Promise<Organization[]> => {
  const response = await ApiService.get(API_PATH);
  return response.data;
};

/**
 * Fetch organization by ID
 * 
 * @param id - Organization ID
 * @returns Promise that resolves to organization details
 * 
 * @example
 * const org = await fetchOrganizationById('123');
 */
export const fetchOrganizationById = async (id: string): Promise<Organization> => {
  const response = await ApiService.get(`${API_PATH}/${id}`);
  return response.data;
};

/**
 * Create a new organization
 * 
 * @param organizationData - Organization data to create
 * @returns Promise that resolves to created organization
 * 
 * @example
 * const newOrg = await createOrganization({
 *   name: 'Acme Research',
 *   organizationType: 'CRO',
 *   email: 'contact@acme.com'
 * });
 */
export const createOrganization = async (organizationData: OrganizationCreateData): Promise<Organization> => {
  const response = await ApiService.post(API_PATH, organizationData);
  return response.data;
};

/**
 * Update an existing organization
 * 
 * @param id - Organization ID
 * @param organizationData - Updated organization data
 * @returns Promise that resolves to updated organization
 * 
 * @example
 * const updatedOrg = await updateOrganization('123', { phone: '+1-555-1234' });
 */
export const updateOrganization = async (id: string, organizationData: OrganizationUpdateData): Promise<Organization> => {
  const response = await ApiService.put(`${API_PATH}/${id}`, organizationData);
  return response.data;
};

/**
 * Delete an organization
 * 
 * @param id - Organization ID
 * @returns Promise that resolves when organization is deleted
 * 
 * @example
 * await deleteOrganization('123');
 */
export const deleteOrganization = async (id: string): Promise<void> => {
  await ApiService.delete(`${API_PATH}/${id}`);
};

/**
 * Fetch all contacts for an organization
 * 
 * @param organizationId - Organization ID
 * @returns Promise that resolves to array of contacts
 * 
 * @example
 * const contacts = await fetchOrganizationContacts('123');
 */
export const fetchOrganizationContacts = async (organizationId: string): Promise<OrganizationContact[]> => {
  const response = await ApiService.get(`${API_PATH}/${organizationId}/contacts`);
  return response.data;
};

/**
 * Add a contact to an organization
 * 
 * @param organizationId - Organization ID
 * @param contactData - Contact data to create
 * @returns Promise that resolves to created contact
 * 
 * @example
 * const contact = await addOrganizationContact('123', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@acme.com'
 * });
 */
export const addOrganizationContact = async (organizationId: string, contactData: ContactCreateData): Promise<OrganizationContact> => {
  const response = await ApiService.post(`${API_PATH}/${organizationId}/contacts`, contactData);
  return response.data;
};

/**
 * Update an organization contact
 * 
 * @param organizationId - Organization ID
 * @param contactId - Contact ID
 * @param contactData - Updated contact data
 * @returns Promise that resolves to updated contact
 * 
 * @example
 * const updatedContact = await updateOrganizationContact('123', '456', { phone: '+1-555-5678' });
 */
export const updateOrganizationContact = async (organizationId: string, contactId: string, contactData: ContactUpdateData): Promise<OrganizationContact> => {
  const response = await ApiService.put(`${API_PATH}/${organizationId}/contacts/${contactId}`, contactData);
  return response.data;
};

/**
 * Delete an organization contact
 * 
 * @param organizationId - Organization ID
 * @param contactId - Contact ID
 * @returns Promise that resolves when contact is deleted
 * 
 * @example
 * await deleteOrganizationContact('123', '456');
 */
export const deleteOrganizationContact = async (organizationId: string, contactId: string): Promise<void> => {
  await ApiService.delete(`${API_PATH}/${organizationId}/contacts/${contactId}`);
};

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * React Query hook to fetch all organizations
 * 
 * @example
 * const { data: organizations, isLoading } = useOrganizations();
 */
export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchAllOrganizations,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to fetch organization by ID
 * 
 * @param id - Organization ID
 * 
 * @example
 * const { data: organization, isLoading } = useOrganization('123');
 */
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => fetchOrganizationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to create a new organization
 * 
 * @example
 * const createMutation = useCreateOrganization();
 * await createMutation.mutateAsync({
 *   name: 'New Org',
 *   email: 'contact@neworg.com'
 * });
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      // Invalidate organizations list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

/**
 * React Query hook to update an organization
 * 
 * @example
 * const updateMutation = useUpdateOrganization();
 * await updateMutation.mutateAsync({ id: '123', data: { phone: '+1-555-1234' } });
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdateData }) => 
      updateOrganization(id, data),
    onSuccess: (data, variables) => {
      // Update organization in cache
      queryClient.setQueryData(['organization', variables.id], data);
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

/**
 * React Query hook to delete an organization
 * 
 * @example
 * const deleteMutation = useDeleteOrganization();
 * await deleteMutation.mutateAsync('123');
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['organization', deletedId] });
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    }
  });
};

/**
 * React Query hook to fetch organization contacts
 * 
 * @param organizationId - Organization ID
 * 
 * @example
 * const { data: contacts, isLoading } = useOrganizationContacts('123');
 */
export const useOrganizationContacts = (organizationId: string) => {
  return useQuery({
    queryKey: ['organization', organizationId, 'contacts'],
    queryFn: () => fetchOrganizationContacts(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to add a contact to an organization
 * 
 * @example
 * const addContactMutation = useAddOrganizationContact();
 * await addContactMutation.mutateAsync({
 *   organizationId: '123',
 *   data: { firstName: 'John', lastName: 'Doe' }
 * });
 */
export const useAddOrganizationContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: ContactCreateData }) => 
      addOrganizationContact(organizationId, data),
    onSuccess: (_, variables) => {
      // Invalidate contacts list for this organization
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId, 'contacts'] });
    }
  });
};

/**
 * React Query hook to update an organization contact
 * 
 * @example
 * const updateContactMutation = useUpdateOrganizationContact();
 * await updateContactMutation.mutateAsync({
 *   organizationId: '123',
 *   contactId: '456',
 *   data: { phone: '+1-555-5678' }
 * });
 */
export const useUpdateOrganizationContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, contactId, data }: { organizationId: string; contactId: string; data: ContactUpdateData }) => 
      updateOrganizationContact(organizationId, contactId, data),
    onSuccess: (_, variables) => {
      // Invalidate contacts list for this organization
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId, 'contacts'] });
    }
  });
};

/**
 * React Query hook to delete an organization contact
 * 
 * @example
 * const deleteContactMutation = useDeleteOrganizationContact();
 * await deleteContactMutation.mutateAsync({ organizationId: '123', contactId: '456' });
 */
export const useDeleteOrganizationContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, contactId }: { organizationId: string; contactId: string }) => 
      deleteOrganizationContact(organizationId, contactId),
    onSuccess: (_, variables) => {
      // Invalidate contacts list for this organization
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId, 'contacts'] });
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
const OrganizationService = {
  getAllOrganizations: fetchAllOrganizations,
  getOrganizationById: fetchOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationContacts: fetchOrganizationContacts,
  addOrganizationContact,
  updateOrganizationContact,
  deleteOrganizationContact
};

export default OrganizationService;
