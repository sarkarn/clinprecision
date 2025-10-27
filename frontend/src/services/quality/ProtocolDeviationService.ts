/**
 * Protocol Deviation Service
 * Manages protocol deviation tracking and quality control
 * 
 * Features:
 * - Protocol deviation CRUD operations
 * - Deviation status lifecycle management
 * - Comment and audit trail tracking
 * - Reporting requirements (sponsor, IRB)
 * - Filtering by severity, type, status
 * 
 * Backend API: /clinops-ws/api/v1/deviations
 * 
 * @see Quality.types.ts
 * @see Backend: ProtocolDeviationController.java
 * @see Documentation: PROTOCOL_DEVIATION_BACKEND_COMPLETE.md
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import {
  ProtocolDeviation,
  ProtocolDeviationWithDetails,
  DeviationComment,
  CreateProtocolDeviationRequest,
  UpdateDeviationStatusRequest,
  AddDeviationCommentRequest,
  MarkReportedRequest,
  ProtocolDeviationResponse,
  ProtocolDeviationsResponse,
  DeviationCommentResponse,
  DeviationCommentsResponse,
  ProtocolDeviationFilterOptions,
  DeviationType,
  DeviationSeverity,
  DeviationStatus,
  DeviationTypeOption,
  SeverityLevelOption,
  StatusOption,
} from '../../types/domain/Quality.types';

// ==================== Query Keys ====================

/**
 * Query key factory for protocol deviations
 */
export const protocolDeviationKeys = {
  all: ['protocolDeviations'] as const,
  lists: () => [...protocolDeviationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...protocolDeviationKeys.lists(), filters] as const,
  details: () => [...protocolDeviationKeys.all, 'detail'] as const,
  detail: (id: number) => [...protocolDeviationKeys.details(), id] as const,
  patientDeviations: (patientId: number) => [...protocolDeviationKeys.all, 'patient', patientId] as const,
  patientActiveDeviations: (patientId: number) => [...protocolDeviationKeys.all, 'patient', patientId, 'active'] as const,
  studyDeviations: (studyId: number, filters?: ProtocolDeviationFilterOptions) => 
    [...protocolDeviationKeys.all, 'study', studyId, filters] as const,
  studyCriticalDeviations: (studyId: number) => [...protocolDeviationKeys.all, 'study', studyId, 'critical'] as const,
  unreportedDeviations: () => [...protocolDeviationKeys.all, 'unreported'] as const,
  comments: (deviationId: number) => [...protocolDeviationKeys.all, 'comments', deviationId] as const,
} as const;

// ==================== API Functions ====================

/**
 * Fetch deviation by ID
 */
async function fetchDeviationById(deviationId: number): Promise<ProtocolDeviation> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviation:', deviationId);
  const response = await ApiService.get(`/clinops-ws/api/v1/deviations/${deviationId}`);
  console.log('[PROTOCOL_DEVIATION_SERVICE] Deviation fetched:', response.data);
  return response.data;
}

/**
 * Fetch all deviations for a patient
 */
async function fetchPatientDeviations(patientId: number): Promise<ProtocolDeviation[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviations for patient:', patientId);
  try {
    const response = await ApiService.get(`/clinops-ws/api/v1/deviations/patients/${patientId}`);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Patient deviations fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch active deviations for a patient
 */
async function fetchActiveDeviations(patientId: number): Promise<ProtocolDeviation[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching active deviations for patient:', patientId);
  try {
    const response = await ApiService.get(`/clinops-ws/api/v1/deviations/patients/${patientId}/active`);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Active deviations fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch all deviations for a study (with optional filters)
 */
async function fetchStudyDeviations(studyId: number, filters?: ProtocolDeviationFilterOptions): Promise<ProtocolDeviation[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviations for study:', studyId, 'with filters:', filters);
  
  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters?.severity) queryParams.append('severity', filters.severity);
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.requiresReporting) queryParams.append('requiresReporting', 'true');
  
  const queryString = queryParams.toString();
  const url = `/clinops-ws/api/v1/deviations/studies/${studyId}${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await ApiService.get(url);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Study deviations fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch critical deviations for a study
 */
async function fetchCriticalDeviations(studyId: number): Promise<ProtocolDeviation[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching critical deviations for study:', studyId);
  try {
    const response = await ApiService.get(`/clinops-ws/api/v1/deviations/studies/${studyId}/critical`);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Critical deviations fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch all unreported deviations
 */
async function fetchUnreportedDeviations(): Promise<ProtocolDeviation[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching unreported deviations');
  try {
    const response = await ApiService.get('/clinops-ws/api/v1/deviations/unreported');
    console.log('[PROTOCOL_DEVIATION_SERVICE] Unreported deviations fetched:', response.data?.length || 0);
    return response.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Fetch comments for a deviation
 */
async function fetchDeviationComments(deviationId: number): Promise<DeviationComment[]> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching comments for deviation:', deviationId);
  const response = await ApiService.get(`/clinops-ws/api/v1/deviations/${deviationId}/comments`);
  console.log('[PROTOCOL_DEVIATION_SERVICE] Comments fetched:', response.data?.length || 0);
  return response.data || [];
}

/**
 * Create a new protocol deviation
 */
async function createDeviation(data: CreateProtocolDeviationRequest): Promise<ProtocolDeviationResponse> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Creating deviation:', data);
  
  // Validate required fields
  if (!data.patientId) throw new Error('Patient ID is required');
  if (!data.studySiteId) throw new Error('Study Site ID is required');
  if (!data.deviationType) throw new Error('Deviation type is required');
  if (!data.severity) throw new Error('Severity is required');
  if (!data.title || data.title.trim().length === 0) throw new Error('Title is required');
  if (!data.description || data.description.trim().length === 0) throw new Error('Description is required');
  if (!data.reportedBy || data.reportedBy.trim().length === 0) throw new Error('Reported by is required');
  
  try {
    const response = await ApiService.post('/clinops-ws/api/v1/deviations', data);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Deviation created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PROTOCOL_DEVIATION_SERVICE] Error creating deviation:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Update deviation status
 */
async function updateDeviationStatus(deviationId: number, data: UpdateDeviationStatusRequest): Promise<ProtocolDeviationResponse> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Updating deviation status:', { deviationId, data });
  
  if (!data.newStatus) throw new Error('New status is required');
  if (!data.updatedBy) throw new Error('Updated by is required');
  
  try {
    const response = await ApiService.put(`/clinops-ws/api/v1/deviations/${deviationId}/status`, data);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Status updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PROTOCOL_DEVIATION_SERVICE] Error updating status:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Add a comment to a deviation
 */
async function addComment(deviationId: number, data: AddDeviationCommentRequest): Promise<DeviationCommentResponse> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Adding comment:', { deviationId, data });
  
  if (!data.comment || data.comment.trim().length === 0) throw new Error('Comment text is required');
  if (!data.commentedBy) throw new Error('Commented by is required');
  
  try {
    const response = await ApiService.post(`/clinops-ws/api/v1/deviations/${deviationId}/comments`, data);
    console.log('[PROTOCOL_DEVIATION_SERVICE] Comment added successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PROTOCOL_DEVIATION_SERVICE] Error adding comment:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Mark deviation as reported to sponsor
 */
async function markReportedToSponsor(deviationId: number, updatedBy: string): Promise<ProtocolDeviationResponse> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Marking reported to sponsor:', deviationId);
  
  try {
    const response = await ApiService.put(`/clinops-ws/api/v1/deviations/${deviationId}/reported-to-sponsor`, { updatedBy });
    console.log('[PROTOCOL_DEVIATION_SERVICE] Marked reported to sponsor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PROTOCOL_DEVIATION_SERVICE] Error marking reported to sponsor:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Mark deviation as reported to IRB
 */
async function markReportedToIrb(deviationId: number, updatedBy: string): Promise<ProtocolDeviationResponse> {
  console.log('[PROTOCOL_DEVIATION_SERVICE] Marking reported to IRB:', deviationId);
  
  try {
    const response = await ApiService.put(`/clinops-ws/api/v1/deviations/${deviationId}/reported-to-irb`, { updatedBy });
    console.log('[PROTOCOL_DEVIATION_SERVICE] Marked reported to IRB:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PROTOCOL_DEVIATION_SERVICE] Error marking reported to IRB:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// ==================== React Query Hooks ====================

/**
 * Hook to fetch deviation by ID
 */
export function useDeviationById(
  deviationId: number,
  options?: Omit<UseQueryOptions<ProtocolDeviation, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation, Error>({
    queryKey: protocolDeviationKeys.detail(deviationId),
    queryFn: () => fetchDeviationById(deviationId),
    enabled: !!deviationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch all deviations for a patient
 */
export function usePatientDeviations(
  patientId: number,
  options?: Omit<UseQueryOptions<ProtocolDeviation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation[], Error>({
    queryKey: protocolDeviationKeys.patientDeviations(patientId),
    queryFn: () => fetchPatientDeviations(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch active deviations for a patient
 */
export function useActiveDeviations(
  patientId: number,
  options?: Omit<UseQueryOptions<ProtocolDeviation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation[], Error>({
    queryKey: protocolDeviationKeys.patientActiveDeviations(patientId),
    queryFn: () => fetchActiveDeviations(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch all deviations for a study (with optional filters)
 */
export function useStudyDeviations(
  studyId: number,
  filters?: ProtocolDeviationFilterOptions,
  options?: Omit<UseQueryOptions<ProtocolDeviation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation[], Error>({
    queryKey: protocolDeviationKeys.studyDeviations(studyId, filters),
    queryFn: () => fetchStudyDeviations(studyId, filters),
    enabled: !!studyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch critical deviations for a study
 */
export function useCriticalDeviations(
  studyId: number,
  options?: Omit<UseQueryOptions<ProtocolDeviation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation[], Error>({
    queryKey: protocolDeviationKeys.studyCriticalDeviations(studyId),
    queryFn: () => fetchCriticalDeviations(studyId),
    enabled: !!studyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch all unreported deviations
 */
export function useUnreportedDeviations(
  options?: Omit<UseQueryOptions<ProtocolDeviation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProtocolDeviation[], Error>({
    queryKey: protocolDeviationKeys.unreportedDeviations(),
    queryFn: fetchUnreportedDeviations,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch comments for a deviation
 */
export function useDeviationComments(
  deviationId: number,
  options?: Omit<UseQueryOptions<DeviationComment[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DeviationComment[], Error>({
    queryKey: protocolDeviationKeys.comments(deviationId),
    queryFn: () => fetchDeviationComments(deviationId),
    enabled: !!deviationId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to create a deviation
 */
export function useCreateDeviation(
  options?: Omit<UseMutationOptions<ProtocolDeviationResponse, Error, CreateProtocolDeviationRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ProtocolDeviationResponse, Error, CreateProtocolDeviationRequest>({
    mutationFn: createDeviation,
    onSuccess: (data, variables) => {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Invalidating queries after create');
      
      // Invalidate patient deviations
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.patientDeviations(variables.patientId) });
        queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.patientActiveDeviations(variables.patientId) });
      }
      
      // Invalidate study deviations
      if (variables.studySiteId) {
        queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.all });
      }
      
      // Invalidate unreported if requires reporting
      if (variables.requiresReporting) {
        queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.unreportedDeviations() });
      }
    },
    ...options,
  });
}

/**
 * Hook to update deviation status
 */
export function useUpdateDeviationStatus(
  options?: Omit<UseMutationOptions<ProtocolDeviationResponse, Error, { deviationId: number; data: UpdateDeviationStatusRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ProtocolDeviationResponse, Error, { deviationId: number; data: UpdateDeviationStatusRequest }>({
    mutationFn: ({ deviationId, data }) => updateDeviationStatus(deviationId, data),
    onSuccess: (response, variables) => {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Invalidating queries after status update');
      
      // Invalidate specific deviation
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.detail(variables.deviationId) });
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.lists() });
      
      // Invalidate patient and study queries
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to add a comment
 */
export function useAddComment(
  options?: Omit<UseMutationOptions<DeviationCommentResponse, Error, { deviationId: number; data: AddDeviationCommentRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<DeviationCommentResponse, Error, { deviationId: number; data: AddDeviationCommentRequest }>({
    mutationFn: ({ deviationId, data }) => addComment(deviationId, data),
    onSuccess: (response, variables) => {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Invalidating queries after comment');
      
      // Invalidate comments for this deviation
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.comments(variables.deviationId) });
      
      // Invalidate deviation details (comment count may change)
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.detail(variables.deviationId) });
    },
    ...options,
  });
}

/**
 * Hook to mark as reported to sponsor
 */
export function useMarkReportedToSponsor(
  options?: Omit<UseMutationOptions<ProtocolDeviationResponse, Error, { deviationId: number; updatedBy: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ProtocolDeviationResponse, Error, { deviationId: number; updatedBy: string }>({
    mutationFn: ({ deviationId, updatedBy }) => markReportedToSponsor(deviationId, updatedBy),
    onSuccess: (response, variables) => {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Invalidating queries after sponsor reporting');
      
      // Invalidate specific deviation
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.detail(variables.deviationId) });
      
      // Invalidate unreported deviations
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.unreportedDeviations() });
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to mark as reported to IRB
 */
export function useMarkReportedToIrb(
  options?: Omit<UseMutationOptions<ProtocolDeviationResponse, Error, { deviationId: number; updatedBy: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<ProtocolDeviationResponse, Error, { deviationId: number; updatedBy: string }>({
    mutationFn: ({ deviationId, updatedBy }) => markReportedToIrb(deviationId, updatedBy),
    onSuccess: (response, variables) => {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Invalidating queries after IRB reporting');
      
      // Invalidate specific deviation
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.detail(variables.deviationId) });
      
      // Invalidate unreported deviations
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.unreportedDeviations() });
      
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: protocolDeviationKeys.lists() });
    },
    ...options,
  });
}

// ==================== Utility Functions ====================

/**
 * Get human-readable label for deviation type
 */
export function getDeviationTypeLabel(type: DeviationType): string {
  const labels: Record<DeviationType, string> = {
    [DeviationType.VISIT_WINDOW]: 'Visit Window Violation',
    [DeviationType.INCLUSION_EXCLUSION]: 'Inclusion/Exclusion Criteria',
    [DeviationType.PROTOCOL_PROCEDURE]: 'Protocol Procedure',
    [DeviationType.MEDICATION]: 'Medication Deviation',
    [DeviationType.INFORMED_CONSENT]: 'Informed Consent',
    [DeviationType.DATA_MANAGEMENT]: 'Data Management',
    [DeviationType.STUDY_CONDUCT]: 'Study Conduct',
    [DeviationType.SAFETY]: 'Safety Issue',
    [DeviationType.OTHER]: 'Other',
  };
  return labels[type] || type;
}

/**
 * Normalize deviation type labels for display.
 */
export function formatDeviationType(type: DeviationType | string | undefined): string {
  if (!type) {
    return 'Unknown';
  }

  const value = typeof type === 'string' ? type : String(type);
  const normalized = value.toUpperCase() as DeviationType;

  if ((Object.values(DeviationType) as string[]).includes(normalized)) {
    return getDeviationTypeLabel(normalized as DeviationType);
  }

  // Fallback: convert to Title Case while keeping separators readable
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get severity badge CSS classes
 */
export function getSeverityBadgeClass(severity: DeviationSeverity): string {
  const classes: Record<DeviationSeverity, string> = {
    [DeviationSeverity.MINOR]: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    [DeviationSeverity.MAJOR]: 'bg-orange-100 text-orange-800 border border-orange-300',
    [DeviationSeverity.CRITICAL]: 'bg-red-100 text-red-800 border border-red-400 font-bold',
  };
  return classes[severity] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status badge CSS classes
 */
export function getStatusBadgeClass(status: DeviationStatus): string {
  const classes: Record<DeviationStatus, string> = {
    [DeviationStatus.OPEN]: 'bg-red-100 text-red-800',
    [DeviationStatus.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
    [DeviationStatus.RESOLVED]: 'bg-green-100 text-green-800',
    [DeviationStatus.CLOSED]: 'bg-gray-100 text-gray-600',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Format deviation status into a user-friendly label.
 */
export function formatStatus(status: DeviationStatus | string | undefined): string {
  if (!status) {
    return 'Unknown';
  }

  const value = typeof status === 'string' ? status : String(status);
  const normalized = value.toUpperCase() as DeviationStatus;

  const labels: Record<DeviationStatus, string> = {
    [DeviationStatus.OPEN]: 'Open',
    [DeviationStatus.UNDER_REVIEW]: 'Under Review',
    [DeviationStatus.RESOLVED]: 'Resolved',
    [DeviationStatus.CLOSED]: 'Closed',
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get deviation types for dropdown
 */
export function getDeviationTypes(): DeviationTypeOption[] {
  return [
    { value: DeviationType.VISIT_WINDOW, label: 'Visit Window Violation' },
    { value: DeviationType.INCLUSION_EXCLUSION, label: 'Inclusion/Exclusion Criteria' },
    { value: DeviationType.PROTOCOL_PROCEDURE, label: 'Protocol Procedure' },
    { value: DeviationType.MEDICATION, label: 'Medication Deviation' },
    { value: DeviationType.INFORMED_CONSENT, label: 'Informed Consent' },
    { value: DeviationType.DATA_MANAGEMENT, label: 'Data Management' },
    { value: DeviationType.STUDY_CONDUCT, label: 'Study Conduct' },
    { value: DeviationType.SAFETY, label: 'Safety Issue' },
    { value: DeviationType.OTHER, label: 'Other' },
  ];
}

/**
 * Safe date formatter used across deviation dashboards.
 */
export function formatDate(date: string | undefined | null, locale?: string): string {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(locale || undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get severity levels for dropdown
 */
export function getSeverityLevels(): SeverityLevelOption[] {
  return [
    { value: DeviationSeverity.MINOR, label: 'Minor' },
    { value: DeviationSeverity.MAJOR, label: 'Major' },
    { value: DeviationSeverity.CRITICAL, label: 'Critical' },
  ];
}

/**
 * Get status options for dropdown
 */
export function getStatusOptions(): StatusOption[] {
  return [
    { value: DeviationStatus.OPEN, label: 'Open' },
    { value: DeviationStatus.UNDER_REVIEW, label: 'Under Review' },
    { value: DeviationStatus.RESOLVED, label: 'Resolved' },
    { value: DeviationStatus.CLOSED, label: 'Closed' },
  ];
}

/**
 * Filter deviations by severity
 */
export function filterBySeverity(deviations: ProtocolDeviation[], severity: DeviationSeverity): ProtocolDeviation[] {
  return deviations.filter((d) => d.severity === severity);
}

/**
 * Filter deviations by status
 */
export function filterByStatus(deviations: ProtocolDeviation[], status: DeviationStatus): ProtocolDeviation[] {
  return deviations.filter((d) => d.status === status);
}

/**
 * Filter deviations by type
 */
export function filterByType(deviations: ProtocolDeviation[], type: DeviationType): ProtocolDeviation[] {
  return deviations.filter((d) => d.deviationType === type);
}

/**
 * Get critical deviations
 */
export function getCriticalDeviations(deviations: ProtocolDeviation[]): ProtocolDeviation[] {
  return filterBySeverity(deviations, DeviationSeverity.CRITICAL);
}

/**
 * Get open deviations
 */
export function getOpenDeviations(deviations: ProtocolDeviation[]): ProtocolDeviation[] {
  return deviations.filter((d) => d.status === DeviationStatus.OPEN || d.status === DeviationStatus.UNDER_REVIEW);
}

/**
 * Get unreported deviations
 */
export function getUnreportedDeviations(deviations: ProtocolDeviation[]): ProtocolDeviation[] {
  return deviations.filter((d) => d.requiresReporting && !d.reportedToSponsorAt && !d.reportedToIrbAt);
}

/**
 * Sort deviations by severity (critical first)
 */
export function sortBySeverity(deviations: ProtocolDeviation[]): ProtocolDeviation[] {
  const severityOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2 };
  return [...deviations].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Sort deviations by date (newest first)
 */
export function sortByDate(deviations: ProtocolDeviation[], descending = true): ProtocolDeviation[] {
  return [...deviations].sort((a, b) => {
    const dateA = new Date(a.deviationDate).getTime();
    const dateB = new Date(b.deviationDate).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Convert a list of deviations into CSV text for downloads or reporting.
 */
export function exportDeviationsToCsv(deviations: ProtocolDeviation[]): string {
  const headers = [
    'Deviation ID',
    'Patient ID',
    'Study Site ID',
    'Deviation Type',
    'Severity',
    'Status',
    'Title',
    'Requires Reporting',
    'Deviation Date',
    'Reported To Sponsor At',
    'Reported To IRB At',
    'Resolved At',
    'Closed At',
    'Reported By',
    'Created At',
    'Updated At',
  ];

  const escapeValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }

    const normalized = String(value).replace(/\r?\n|\r/g, ' ').trim();
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const boolToYesNo = (value: boolean): string => (value ? 'Yes' : 'No');

  const rows = deviations.map((deviation) => [
    deviation.id,
    deviation.patientId,
    deviation.studySiteId,
    deviation.deviationType,
    deviation.severity,
    deviation.status,
    deviation.title,
    boolToYesNo(deviation.requiresReporting),
    deviation.deviationDate,
    deviation.reportedToSponsorAt || '',
    deviation.reportedToIrbAt || '',
    deviation.resolvedAt || '',
    deviation.closedAt || '',
    deviation.reportedBy,
    deviation.createdAt,
    deviation.updatedAt,
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeValue).join(',')),
  ];

  return csvLines.join('\n');
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy service object for backward compatibility
 */
const ProtocolDeviationService = {
  // Query functions
  getDeviationById: fetchDeviationById,
  getPatientDeviations: fetchPatientDeviations,
  getActiveDeviations: fetchActiveDeviations,
  getStudyDeviations: fetchStudyDeviations,
  getCriticalDeviations: fetchCriticalDeviations,
  getUnreportedDeviations: fetchUnreportedDeviations,
  getDeviationComments: fetchDeviationComments,
  
  // Mutation functions
  createDeviation,
  updateDeviationStatus,
  addComment,
  markReportedToSponsor,
  markReportedToIrb,
  
  // Utility functions
  getDeviationTypeLabel,
  formatDeviationType,
  getSeverityBadgeClass,
  getStatusBadgeClass,
  formatStatus,
  getDeviationTypes,
  getSeverityLevels,
  getStatusOptions,
  formatDate,
  filterBySeverity,
  filterByStatus,
  filterByType,
  getCritical: getCriticalDeviations,
  getOpenDeviations,
  getUnreported: getUnreportedDeviations,
  sortBySeverity,
  sortByDate,
  exportDeviationsToCsv,
};

export default ProtocolDeviationService;
