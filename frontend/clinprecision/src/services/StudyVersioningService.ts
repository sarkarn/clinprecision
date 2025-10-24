// src/services/StudyVersioningService.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from './ApiService';
import type { ApiResponse } from '../types';

// ============================================================================
// Types
// ============================================================================

export type ProtocolVersionStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED';

export interface ProtocolVersion {
  id?: number;
  uuid?: string;
  studyId?: number;
  studyUuid?: string;
  versionNumber?: string;
  versionName?: string;
  status?: ProtocolVersionStatus;
  effectiveDate?: string;
  expirationDate?: string;
  description?: string;
  amendmentReason?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface ProtocolVersionCreateData {
  studyId: number;
  versionNumber?: string;
  versionName: string;
  description?: string;
  amendmentReason?: string;
  effectiveDate?: string;
}

export interface ProtocolVersionUpdateData {
  versionName?: string;
  description?: string;
  amendmentReason?: string;
  effectiveDate?: string;
  expirationDate?: string;
}

export interface ProtocolVersionStatusUpdate {
  newStatus: ProtocolVersionStatus;
  reason?: string;
  userId?: number;
}

// ============================================================================
// Core API Functions
// ============================================================================

const API_BASE = '/api/v1/study-design/protocol-versions';

/**
 * Fetch all versions for a study
 * @param studyId - Study UUID or numeric ID
 */
export const fetchStudyVersions = async (studyId: string | number): Promise<ProtocolVersion[]> => {
  const response = await ApiService.get(`${API_BASE}/study/${studyId}`);
  const apiResponse = response.data as ApiResponse<ProtocolVersion[]>;
  return apiResponse.data || [];
};

/**
 * Fetch version history for a study (alias for fetchStudyVersions)
 * @param studyId - Study UUID or numeric ID
 */
export const fetchVersionHistory = async (studyId: string | number): Promise<ProtocolVersion[]> => {
  const response = await ApiService.get(`${API_BASE}/study/${studyId}`);
  const apiResponse = response.data as ApiResponse<ProtocolVersion[]>;
  return apiResponse.data || [];
};

/**
 * Fetch a specific protocol version by ID
 * @param versionId - Version UUID or numeric ID
 */
export const fetchProtocolVersion = async (versionId: string | number): Promise<ProtocolVersion> => {
  const response = await ApiService.get(`${API_BASE}/${versionId}`);
  const apiResponse = response.data as ApiResponse<ProtocolVersion>;
  return apiResponse.data;
};

/**
 * Create a new protocol version
 * @param data - Version creation data
 */
export const createProtocolVersion = async (data: ProtocolVersionCreateData): Promise<ProtocolVersion> => {
  const response = await ApiService.post(`${API_BASE}`, data);
  const apiResponse = response.data as ApiResponse<ProtocolVersion>;
  return apiResponse.data;
};

/**
 * Update a protocol version
 * @param versionId - Version ID to update
 * @param data - Update data
 */
export const updateProtocolVersion = async ({ id, data }: { id: string | number; data: ProtocolVersionUpdateData }): Promise<ProtocolVersion> => {
  const response = await ApiService.put(`${API_BASE}/${id}`, data);
  const apiResponse = response.data as ApiResponse<ProtocolVersion>;
  return apiResponse.data;
};

/**
 * Update version status (for approval workflow)
 * @param versionId - Version ID
 * @param status - New status
 * @param reason - Optional reason for status change
 * @param userId - Optional user ID (for audit)
 */
export const updateProtocolVersionStatus = async ({ id, status, reason, userId }: { id: string | number; status: ProtocolVersionStatus; reason?: string; userId?: number }): Promise<ProtocolVersion> => {
  const payload: ProtocolVersionStatusUpdate = {
    newStatus: status,  // Backend expects 'newStatus', not 'status'
    reason: reason || 'Status update',
    userId: userId || 1  // TODO: Get from auth context
  };
  const response = await ApiService.put(`${API_BASE}/${id}/status`, payload);
  const apiResponse = response.data as ApiResponse<ProtocolVersion>;
  return apiResponse.data;
};

/**
 * Delete a protocol version
 * @param versionId - Version ID to delete
 */
export const deleteProtocolVersion = async (versionId: string | number): Promise<void> => {
  await ApiService.delete(`${API_BASE}/${versionId}`);
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all versions for a study
 * 
 * @example
 * ```tsx
 * const { data: versions, isLoading } = useProtocolVersions(studyId);
 * ```
 */
export const useProtocolVersions = (studyId: string | number | undefined): UseQueryResult<ProtocolVersion[], Error> => {
  return useQuery({
    queryKey: ['protocol-versions', 'study', studyId],
    queryFn: () => fetchStudyVersions(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to fetch version history for a study (alias for useProtocolVersions)
 * 
 * @example
 * ```tsx
 * const { data: history } = useVersionHistory(studyId);
 * ```
 */
export const useVersionHistory = (studyId: string | number | undefined): UseQueryResult<ProtocolVersion[], Error> => {
  return useQuery({
    queryKey: ['protocol-versions', 'history', studyId],
    queryFn: () => fetchVersionHistory(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to fetch a specific protocol version
 * 
 * @example
 * ```tsx
 * const { data: version } = useProtocolVersion(versionId);
 * ```
 */
export const useProtocolVersion = (versionId: string | number | undefined): UseQueryResult<ProtocolVersion, Error> => {
  return useQuery({
    queryKey: ['protocol-version', versionId],
    queryFn: () => fetchProtocolVersion(versionId!),
    enabled: !!versionId,
  });
};

/**
 * Hook to create a new protocol version
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateProtocolVersion();
 * await createMutation.mutateAsync({
 *   studyId: 123,
 *   versionName: 'Protocol Amendment 1',
 *   description: 'Added new endpoint',
 *   amendmentReason: 'Safety concern addressed'
 * });
 * ```
 */
export const useCreateProtocolVersion = (): UseMutationResult<ProtocolVersion, Error, ProtocolVersionCreateData, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProtocolVersion,
    onSuccess: (data, variables) => {
      // Invalidate version list for this study
      queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'study', variables.studyId] });
      queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'history', variables.studyId] });
    },
  });
};

/**
 * Hook to update a protocol version
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateProtocolVersion();
 * await updateMutation.mutateAsync({
 *   id: versionId,
 *   data: { versionName: 'Updated Version Name' }
 * });
 * ```
 */
export const useUpdateProtocolVersion = (): UseMutationResult<ProtocolVersion, Error, { id: string | number; data: ProtocolVersionUpdateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProtocolVersion,
    onSuccess: (data, variables) => {
      // Update cache for this specific version
      queryClient.setQueryData(['protocol-version', variables.id], data);
      // Invalidate version lists (studyId might be in data)
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'study', data.studyId] });
        queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'history', data.studyId] });
      }
    },
  });
};

/**
 * Hook to update protocol version status (approve, publish, reject, etc.)
 * 
 * @example
 * ```tsx
 * const approveProtocol = useUpdateProtocolVersionStatus();
 * await approveProtocol.mutateAsync({
 *   id: versionId,
 *   status: 'APPROVED',
 *   reason: 'All regulatory requirements met',
 *   userId: currentUser.id
 * });
 * ```
 */
export const useUpdateProtocolVersionStatus = (): UseMutationResult<ProtocolVersion, Error, { id: string | number; status: ProtocolVersionStatus; reason?: string; userId?: number }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProtocolVersionStatus,
    onSuccess: (data, variables) => {
      // Update cache for this specific version
      queryClient.setQueryData(['protocol-version', variables.id], data);
      // Invalidate version lists
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'study', data.studyId] });
        queryClient.invalidateQueries({ queryKey: ['protocol-versions', 'history', data.studyId] });
      }
    },
  });
};

/**
 * Hook to delete a protocol version
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteProtocolVersion();
 * await deleteMutation.mutateAsync(versionId);
 * ```
 */
export const useDeleteProtocolVersion = (): UseMutationResult<void, Error, string | number, { previousVersions?: ProtocolVersion[] }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProtocolVersion,
    onMutate: async (versionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['protocol-version', versionId] });

      // Snapshot previous value for rollback
      const previousVersions = queryClient.getQueryData<ProtocolVersion[]>(['protocol-versions']);

      return { previousVersions };
    },
    onSuccess: (data, versionId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['protocol-version', versionId] });
      // Invalidate all version lists (we don't know the studyId here)
      queryClient.invalidateQueries({ queryKey: ['protocol-versions'] });
    },
    onError: (err, versionId, context) => {
      // Rollback on error if we have previous data
      if (context?.previousVersions) {
        queryClient.setQueryData(['protocol-versions'], context.previousVersions);
      }
    },
  });
};

/**
 * Helper hook to approve a protocol (convenience wrapper)
 * 
 * @example
 * ```tsx
 * const approveProtocol = useApproveProtocol();
 * await approveProtocol.mutateAsync({
 *   id: versionId,
 *   reason: 'IRB approved',
 *   userId: currentUser.id
 * });
 * ```
 */
export const useApproveProtocol = (): UseMutationResult<ProtocolVersion, Error, { id: string | number; reason?: string; userId?: number }, unknown> => {
  const updateStatus = useUpdateProtocolVersionStatus();

  return useMutation({
    mutationFn: async ({ id, reason, userId }) => {
      return updateStatus.mutateAsync({
        id,
        status: 'APPROVED',
        reason: reason || 'Protocol approved',
        userId,
      });
    },
  });
};

/**
 * Helper hook to publish a protocol (convenience wrapper)
 * 
 * @example
 * ```tsx
 * const publishProtocol = usePublishProtocol();
 * await publishProtocol.mutateAsync({
 *   id: versionId,
 *   reason: 'Ready for use in production',
 *   userId: currentUser.id
 * });
 * ```
 */
export const usePublishProtocol = (): UseMutationResult<ProtocolVersion, Error, { id: string | number; reason?: string; userId?: number }, unknown> => {
  const updateStatus = useUpdateProtocolVersionStatus();

  return useMutation({
    mutationFn: async ({ id, reason, userId }) => {
      return updateStatus.mutateAsync({
        id,
        status: 'PUBLISHED',
        reason: reason || 'Protocol published',
        userId,
      });
    },
  });
};

/**
 * Helper hook to reject a protocol (convenience wrapper)
 * 
 * @example
 * ```tsx
 * const rejectProtocol = useRejectProtocol();
 * await rejectProtocol.mutateAsync({
 *   id: versionId,
 *   reason: 'Insufficient safety data',
 *   userId: currentUser.id
 * });
 * ```
 */
export const useRejectProtocol = (): UseMutationResult<ProtocolVersion, Error, { id: string | number; reason?: string; userId?: number }, unknown> => {
  const updateStatus = useUpdateProtocolVersionStatus();

  return useMutation({
    mutationFn: async ({ id, reason, userId }) => {
      return updateStatus.mutateAsync({
        id,
        status: 'REJECTED',
        reason: reason || 'Protocol rejected',
        userId,
      });
    },
  });
};

// ============================================================================
// Backwards Compatibility - Legacy Service Class
// ============================================================================

class StudyVersioningService {
  static API_BASE = API_BASE;

  static async getStudyVersions(studyId: string | number): Promise<ProtocolVersion[]> {
    return fetchStudyVersions(studyId);
  }

  static async getVersionHistory(studyId: string | number): Promise<ProtocolVersion[]> {
    return fetchVersionHistory(studyId);
  }

  static async getVersion(versionId: string | number): Promise<ProtocolVersion> {
    return fetchProtocolVersion(versionId);
  }

  static async createVersion(studyId: number, versionData: Omit<ProtocolVersionCreateData, 'studyId'>): Promise<ProtocolVersion> {
    return createProtocolVersion({ ...versionData, studyId });
  }

  static async updateVersion(versionId: string | number, updateData: ProtocolVersionUpdateData): Promise<ProtocolVersion> {
    return updateProtocolVersion({ id: versionId, data: updateData });
  }

  static async updateVersionStatus(versionId: string | number, status: ProtocolVersionStatus, reason?: string | null): Promise<ProtocolVersion> {
    return updateProtocolVersionStatus({ id: versionId, status, reason: reason || undefined });
  }

  static async deleteVersion(versionId: string | number): Promise<void> {
    return deleteProtocolVersion(versionId);
  }
}

export default StudyVersioningService;
