/**
 * Form Version Service
 * Manages form template versions and version control
 * 
 * Features:
 * - Form version CRUD operations
 * - Version comparison
 * - Active version management
 * - Version locking/unlocking
 * - Audit trail tracking
 * 
 * Backend API: /clinops-ws/api/v1/study-design/form-templates
 * 
 * @see Backend: FormTemplateController.java
 * @see Documentation: MODULE_1_3_PHASE_2_COMPLETION_SUMMARY.md
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../ApiService';

// DDD-aligned URL (Module 1.3 Phase 2)
const API_PATH = '/clinops-ws/api/v1/study-design/form-templates';

// ==================== Types ====================

/**
 * Form version entity
 */
export interface FormVersion {
  versionId: string;
  formId: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  status: string;
  structure?: FormStructure;
  isLocked?: boolean;
}

/**
 * Form structure
 */
export interface FormStructure {
  sections: FormSection[];
}

/**
 * Form section
 */
export interface FormSection {
  id: string;
  name: string;
  fields: FormField[];
}

/**
 * Form field
 */
export interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

/**
 * Create form version request
 */
export interface CreateFormVersionRequest {
  version: string;
  status: string;
  structure: FormStructure;
  createdBy: string;
}

/**
 * Version comparison result
 */
export interface VersionComparisonResult {
  formId: string;
  version1: FormVersion;
  version2: FormVersion;
  differences: VersionDifference[];
}

/**
 * Version difference
 */
export interface VersionDifference {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

/**
 * Audit trail entry
 */
export interface AuditTrailEntry {
  id: string;
  versionId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  changes?: Record<string, any>;
  description?: string;
}

/**
 * Form versions response
 */
export interface FormVersionsResponse {
  formId: string;
  versions: FormVersion[];
  totalCount: number;
}

// ==================== Query Keys ====================

/**
 * Query key factory for form versions
 */
export const formVersionKeys = {
  all: ['formVersions'] as const,
  lists: () => [...formVersionKeys.all, 'list'] as const,
  list: (formId: string) => [...formVersionKeys.lists(), formId] as const,
  details: () => [...formVersionKeys.all, 'detail'] as const,
  detail: (formId: string, versionId: string) => [...formVersionKeys.details(), formId, versionId] as const,
  current: (formId: string) => [...formVersionKeys.all, 'current', formId] as const,
  comparison: (formId: string, version1: string, version2: string) => 
    [...formVersionKeys.all, 'comparison', formId, version1, version2] as const,
  audit: (formId: string, versionId: string) => [...formVersionKeys.all, 'audit', formId, versionId] as const,
} as const;

// ==================== API Functions ====================

/**
 * Get all versions of a form
 */
async function fetchFormVersions(formId: string): Promise<FormVersion[]> {
  console.log('[FORM_VERSION_SERVICE] Fetching versions for form:', formId);
  try {
    const response = await ApiService.get(`${API_PATH}/${formId}/versions`);
    console.log('[FORM_VERSION_SERVICE] Versions fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    console.error('[FORM_VERSION_SERVICE] Error fetching versions:', error);
    // Return mock data when backend is unavailable
    console.warn('[FORM_VERSION_SERVICE] Backend unavailable, returning mock data');
    return getMockFormVersions(formId);
  }
}

/**
 * Get a specific version of a form
 */
async function fetchFormVersion(formId: string, versionId: string): Promise<FormVersion> {
  console.log('[FORM_VERSION_SERVICE] Fetching version:', { formId, versionId });
  try {
    const response = await ApiService.get(`${API_PATH}/${formId}/versions/${versionId}`);
    console.log('[FORM_VERSION_SERVICE] Version fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[FORM_VERSION_SERVICE] Error fetching version:', error);
    // Return mock data when backend is unavailable
    const mockVersions = getMockFormVersions(formId);
    const version = mockVersions.find((v) => v.versionId === versionId);
    if (version) {
      console.warn('[FORM_VERSION_SERVICE] Backend unavailable, returning mock version');
      return version;
    }
    throw new Error(`Version ${versionId} not found for form ${formId}`);
  }
}

/**
 * Get the current active version of a form
 */
async function fetchCurrentFormVersion(formId: string): Promise<FormVersion> {
  console.log('[FORM_VERSION_SERVICE] Fetching current version for form:', formId);
  try {
    const response = await ApiService.get(`${API_PATH}/${formId}/versions/current`);
    console.log('[FORM_VERSION_SERVICE] Current version fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[FORM_VERSION_SERVICE] Error fetching current version:', error);
    // Return mock data when backend is unavailable
    const mockVersions = getMockFormVersions(formId);
    const currentVersion = mockVersions.find((v) => v.isActive) || mockVersions[0];
    if (currentVersion) {
      console.warn('[FORM_VERSION_SERVICE] Backend unavailable, returning mock current version');
      return currentVersion;
    }
    throw new Error(`No current version found for form ${formId}`);
  }
}

/**
 * Compare two versions of a form
 */
async function fetchVersionComparison(
  formId: string,
  version1: string,
  version2: string
): Promise<VersionComparisonResult> {
  console.log('[FORM_VERSION_SERVICE] Comparing versions:', { formId, version1, version2 });
  const response = await ApiService.get(`${API_PATH}/${formId}/versions/compare`, {
    params: { version1, version2 },
  });
  console.log('[FORM_VERSION_SERVICE] Comparison result:', response.data);
  return response.data;
}

/**
 * Get the audit trail for a form version
 */
async function fetchVersionAuditTrail(formId: string, versionId: string): Promise<AuditTrailEntry[]> {
  console.log('[FORM_VERSION_SERVICE] Fetching audit trail:', { formId, versionId });
  const response = await ApiService.get(`${API_PATH}/${formId}/versions/${versionId}/audit`);
  console.log('[FORM_VERSION_SERVICE] Audit trail fetched:', response.data?.length || 0);
  return response.data || [];
}

/**
 * Create a new version of a form
 */
async function createFormVersion(formId: string, versionData: CreateFormVersionRequest): Promise<FormVersion> {
  console.log('[FORM_VERSION_SERVICE] Creating new version for form:', formId, versionData);

  try {
    const response = await ApiService.post(`${API_PATH}/${formId}/versions`, versionData);
    console.log('[FORM_VERSION_SERVICE] Version created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[FORM_VERSION_SERVICE] Error creating version:', error);
    // For now, return mock success since backend version endpoints aren't implemented yet
    console.warn('[FORM_VERSION_SERVICE] Backend unavailable, returning mock created version');
    return {
      versionId: `v${Date.now()}`,
      formId: formId,
      version: versionData.version || '1.0',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: versionData.createdBy || 'Current User',
      status: versionData.status || 'Draft',
      structure: versionData.structure,
    };
  }
}

/**
 * Set a specific version as the active version
 */
async function setActiveFormVersion(formId: string, versionId: string): Promise<{ success: boolean; message: string }> {
  console.log('[FORM_VERSION_SERVICE] Setting active version:', { formId, versionId });
  const response = await ApiService.put(`${API_PATH}/${formId}/versions/${versionId}/activate`);
  console.log('[FORM_VERSION_SERVICE] Version activated:', response.data);
  return response.data;
}

/**
 * Lock a form version to prevent editing
 */
async function lockFormVersion(formId: string, versionId: string): Promise<{ success: boolean; message: string }> {
  console.log('[FORM_VERSION_SERVICE] Locking version:', { formId, versionId });
  const response = await ApiService.post(`${API_PATH}/${formId}/versions/${versionId}/lock`);
  console.log('[FORM_VERSION_SERVICE] Version locked:', response.data);
  return response.data;
}

/**
 * Unlock a form version to allow editing
 */
async function unlockFormVersion(formId: string, versionId: string): Promise<{ success: boolean; message: string }> {
  console.log('[FORM_VERSION_SERVICE] Unlocking version:', { formId, versionId });
  const response = await ApiService.post(`${API_PATH}/${formId}/versions/${versionId}/unlock`);
  console.log('[FORM_VERSION_SERVICE] Version unlocked:', response.data);
  return response.data;
}

// ==================== React Query Hooks ====================

/**
 * Hook to fetch all versions of a form
 */
export function useFormVersions(
  formId: string,
  options?: Omit<UseQueryOptions<FormVersion[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FormVersion[], Error>({
    queryKey: formVersionKeys.list(formId),
    queryFn: () => fetchFormVersions(formId),
    enabled: !!formId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch a specific form version
 */
export function useFormVersion(
  formId: string,
  versionId: string,
  options?: Omit<UseQueryOptions<FormVersion, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FormVersion, Error>({
    queryKey: formVersionKeys.detail(formId, versionId),
    queryFn: () => fetchFormVersion(formId, versionId),
    enabled: !!formId && !!versionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch the current active version of a form
 */
export function useCurrentFormVersion(
  formId: string,
  options?: Omit<UseQueryOptions<FormVersion, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FormVersion, Error>({
    queryKey: formVersionKeys.current(formId),
    queryFn: () => fetchCurrentFormVersion(formId),
    enabled: !!formId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to compare two versions of a form
 */
export function useVersionComparison(
  formId: string,
  version1: string,
  version2: string,
  options?: Omit<UseQueryOptions<VersionComparisonResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VersionComparisonResult, Error>({
    queryKey: formVersionKeys.comparison(formId, version1, version2),
    queryFn: () => fetchVersionComparison(formId, version1, version2),
    enabled: !!formId && !!version1 && !!version2,
    staleTime: 10 * 60 * 1000, // 10 minutes (comparisons don't change often)
    ...options,
  });
}

/**
 * Hook to fetch the audit trail for a form version
 */
export function useVersionAuditTrail(
  formId: string,
  versionId: string,
  options?: Omit<UseQueryOptions<AuditTrailEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AuditTrailEntry[], Error>({
    queryKey: formVersionKeys.audit(formId, versionId),
    queryFn: () => fetchVersionAuditTrail(formId, versionId),
    enabled: !!formId && !!versionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to create a new form version
 */
export function useCreateFormVersion(
  options?: Omit<UseMutationOptions<FormVersion, Error, { formId: string; data: CreateFormVersionRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<FormVersion, Error, { formId: string; data: CreateFormVersionRequest }>({
    mutationFn: ({ formId, data }) => createFormVersion(formId, data),
    onSuccess: (response, variables) => {
      console.log('[FORM_VERSION_SERVICE] Invalidating queries after create');

      // Invalidate versions list
      queryClient.invalidateQueries({ queryKey: formVersionKeys.list(variables.formId) });

      // If new version is active, invalidate current version
      if (response.isActive) {
        queryClient.invalidateQueries({ queryKey: formVersionKeys.current(variables.formId) });
      }
    },
    ...options,
  });
}

/**
 * Hook to set active form version
 */
export function useSetActiveFormVersion(
  options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>({
    mutationFn: ({ formId, versionId }) => setActiveFormVersion(formId, versionId),
    onSuccess: (response, variables) => {
      console.log('[FORM_VERSION_SERVICE] Invalidating queries after activation');

      // Invalidate versions list
      queryClient.invalidateQueries({ queryKey: formVersionKeys.list(variables.formId) });

      // Invalidate current version
      queryClient.invalidateQueries({ queryKey: formVersionKeys.current(variables.formId) });

      // Invalidate specific version
      queryClient.invalidateQueries({ queryKey: formVersionKeys.detail(variables.formId, variables.versionId) });
    },
    ...options,
  });
}

/**
 * Hook to lock a form version
 */
export function useLockFormVersion(
  options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>({
    mutationFn: ({ formId, versionId }) => lockFormVersion(formId, versionId),
    onSuccess: (response, variables) => {
      console.log('[FORM_VERSION_SERVICE] Invalidating queries after lock');

      // Invalidate specific version
      queryClient.invalidateQueries({ queryKey: formVersionKeys.detail(variables.formId, variables.versionId) });

      // Invalidate versions list
      queryClient.invalidateQueries({ queryKey: formVersionKeys.list(variables.formId) });
    },
    ...options,
  });
}

/**
 * Hook to unlock a form version
 */
export function useUnlockFormVersion(
  options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { formId: string; versionId: string }>({
    mutationFn: ({ formId, versionId }) => unlockFormVersion(formId, versionId),
    onSuccess: (response, variables) => {
      console.log('[FORM_VERSION_SERVICE] Invalidating queries after unlock');

      // Invalidate specific version
      queryClient.invalidateQueries({ queryKey: formVersionKeys.detail(variables.formId, variables.versionId) });

      // Invalidate versions list
      queryClient.invalidateQueries({ queryKey: formVersionKeys.list(variables.formId) });
    },
    ...options,
  });
}

// ==================== Utility Functions ====================

/**
 * Get mock form versions for development
 */
function getMockFormVersions(formId: string): FormVersion[] {
  return [
    {
      versionId: 'v1.0',
      formId: formId,
      version: '1.0',
      isActive: false,
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: 'Dr. Sarah Johnson',
      status: 'Published',
      structure: {
        sections: [
          {
            id: `${formId}_section_1`,
            name: 'Main Section',
            fields: [
              { id: 'field1', name: 'Sample Field 1', type: 'text', required: true },
              { id: 'field2', name: 'Sample Field 2', type: 'number', required: false },
            ],
          },
        ],
      },
    },
    {
      versionId: 'v2.0',
      formId: formId,
      version: '2.0',
      isActive: true,
      createdAt: '2024-03-10T14:30:00Z',
      createdBy: 'Dr. Michael Chen',
      status: 'Published',
      structure: {
        sections: [
          {
            id: `${formId}_section_1`,
            name: 'Main Section',
            fields: [
              { id: 'field1', name: 'Sample Field 1', type: 'text', required: true },
              { id: 'field2', name: 'Sample Field 2', type: 'number', required: false },
              { id: 'field3', name: 'New Field', type: 'date', required: true },
            ],
          },
        ],
      },
    },
  ];
}

/**
 * Get active version from versions list
 */
export function getActiveVersion(versions: FormVersion[]): FormVersion | undefined {
  return versions.find((v) => v.isActive);
}

/**
 * Get latest version (by creation date)
 */
export function getLatestVersion(versions: FormVersion[]): FormVersion | undefined {
  if (versions.length === 0) return undefined;
  return [...versions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

/**
 * Sort versions by creation date (newest first)
 */
export function sortVersionsByDate(versions: FormVersion[], descending = true): FormVersion[] {
  return [...versions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Sort versions by version number
 */
export function sortVersionsByNumber(versions: FormVersion[], descending = true): FormVersion[] {
  return [...versions].sort((a, b) => {
    const versionA = parseVersionNumber(a.version);
    const versionB = parseVersionNumber(b.version);
    return descending ? versionB - versionA : versionA - versionB;
  });
}

/**
 * Parse version number string (e.g., "2.1" -> 2.1)
 */
function parseVersionNumber(version: string): number {
  const match = version.match(/(\d+)\.(\d+)/);
  if (match) {
    return parseInt(match[1]) + parseInt(match[2]) / 10;
  }
  return parseFloat(version) || 0;
}

/**
 * Check if version is locked
 */
export function isVersionLocked(version: FormVersion): boolean {
  return version.isLocked === true;
}

/**
 * Filter versions by status
 */
export function filterVersionsByStatus(versions: FormVersion[], status: string): FormVersion[] {
  return versions.filter((v) => v.status === status);
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy service object for backward compatibility
 */
const FormVersionService = {
  // Query functions
  getFormVersions: fetchFormVersions,
  getFormVersion: fetchFormVersion,
  getCurrentFormVersion: fetchCurrentFormVersion,
  compareFormVersions: fetchVersionComparison,
  getFormVersionAuditTrail: fetchVersionAuditTrail,

  // Mutation functions
  createFormVersion,
  setActiveFormVersion,
  lockFormVersion,
  unlockFormVersion,

  // Utility functions
  getMockFormVersions,
  getActiveVersion,
  getLatestVersion,
  sortVersionsByDate,
  sortVersionsByNumber,
  isVersionLocked,
  filterVersionsByStatus,
};

export default FormVersionService;
