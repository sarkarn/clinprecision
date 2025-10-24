/**
 * Patient Status Service (TypeScript)
 * 
 * Frontend integration for patient status management REST API
 * Provides methods for status changes, history tracking, and analytics
 * Provides React Query hooks for status data management
 * 
 * @see Backend: PatientStatusController.java
 * @see Documentation: PATIENT_STATUS_API_QUICK_REFERENCE.md
 * @see Types: Patient.types.ts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../ApiService';
import {
  PatientStatus,
  StatusHistory,
  StatusChangeRequest,
  PatientStatusSummary,
  StatusTransitionSummary,
  StatusLifecycleInfo,
  StatusValidationResult,
  StatusBadgeVariant
} from '../../types/domain/Patient.types';

const API_BASE = '/clinops-ws/api/v1/patients';

// ==================== Write Operations - API Functions ====================

/**
 * Change patient status
 * Validates transition and creates status history record
 */
export async function changePatientStatus(
  patientId: number,
  statusData: StatusChangeRequest
): Promise<StatusHistory> {
  console.log('[PATIENT_STATUS_SERVICE] Changing patient status:', { patientId, statusData });
  
  // Validate required fields
  if (!statusData.newStatus) {
    throw new Error('New status is required');
  }
  if (!statusData.reason || statusData.reason.trim().length === 0) {
    throw new Error('Reason for status change is required');
  }
  if (!statusData.changedBy || statusData.changedBy.trim().length === 0) {
    throw new Error('Changed by is required');
  }

  try {
    const response = await ApiService.post(
      `${API_BASE}/${patientId}/status`,
      statusData
    );
    
    console.log('[PATIENT_STATUS_SERVICE] Status changed successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PATIENT_STATUS_SERVICE] Error changing patient status:', error);
    
    // Extract error message from API response
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// ==================== Read Operations - Patient Specific ====================

/**
 * Get complete status history for a patient
 */
export async function fetchPatientStatusHistory(patientId: number): Promise<StatusHistory[]> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status history for patient:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}/status/history`);
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes');
  return response.data || [];
}

/**
 * Get current patient status
 */
export async function fetchCurrentPatientStatus(patientId: number): Promise<StatusHistory> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching current status for patient:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}/status/current`);
  
  console.log('[PATIENT_STATUS_SERVICE] Current status:', response.data.newStatus);
  return response.data;
}

/**
 * Get comprehensive status summary for a patient
 */
export async function fetchPatientStatusSummary(patientId: number): Promise<PatientStatusSummary> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status summary for patient:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}/status/summary`);
  
  console.log('[PATIENT_STATUS_SERVICE] Status summary retrieved:', {
    currentStatus: response.data.currentStatus,
    totalChanges: response.data.totalStatusChanges,
    daysInCurrentStatus: response.data.daysInCurrentStatus
  });
  return response.data;
}

/**
 * Get patient status change count
 */
export async function fetchPatientStatusChangeCount(patientId: number): Promise<number> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status change count for patient:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}/status/count`);
  
  console.log('[PATIENT_STATUS_SERVICE] Status change count:', response.data);
  return response.data;
}

/**
 * Get valid status transitions for a patient
 */
export async function fetchValidStatusTransitions(patientId: number): Promise<string[]> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching valid transitions for patient:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}/status/valid-transitions`);
  
  console.log('[PATIENT_STATUS_SERVICE] Valid transitions:', response.data);
  return response.data || [];
}

// ==================== Read Operations - Analytics ====================

/**
 * Get status transition summary (analytics)
 */
export async function fetchStatusTransitionSummary(): Promise<StatusTransitionSummary[]> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status transition summary');
  
  const response = await ApiService.get(`${API_BASE}/status/transitions/summary`);
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'distinct transitions');
  return response.data || [];
}

/**
 * Find patients currently in a specific status
 */
export async function fetchPatientsInStatus(status: string): Promise<StatusHistory[]> {
  console.log('[PATIENT_STATUS_SERVICE] Finding patients in status:', status);
  
  const response = await ApiService.get(`${API_BASE}/status/${status}/patients`);
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'patients in status', status);
  return response.data || [];
}

/**
 * Find patients stuck in a status (bottleneck detection)
 */
export async function fetchPatientsStuckInStatus(status: string, days: number = 14): Promise<number[]> {
  console.log('[PATIENT_STATUS_SERVICE] Finding patients stuck in status:', status, 'for >', days, 'days');
  
  const response = await ApiService.get(`${API_BASE}/status/${status}/stuck?days=${days}`);
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'stuck patients');
  return response.data || [];
}

/**
 * Get status changes by date range
 */
export async function fetchStatusChangesByDateRange(
  startDate: string,
  endDate: string
): Promise<StatusHistory[]> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status changes between', startDate, 'and', endDate);
  
  const response = await ApiService.get(
    `${API_BASE}/status/changes?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes in date range');
  return response.data || [];
}

/**
 * Get status changes by user (audit trail)
 */
export async function fetchStatusChangesByUser(user: string): Promise<StatusHistory[]> {
  console.log('[PATIENT_STATUS_SERVICE] Fetching status changes by user:', user);
  
  const response = await ApiService.get(
    `${API_BASE}/status/changes/by-user?user=${encodeURIComponent(user)}`
  );
  
  console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes by user', user);
  return response.data || [];
}

/**
 * Check service health
 */
export async function checkStatusServiceHealth(): Promise<string> {
  const response = await ApiService.get(`${API_BASE}/status/health`);
  return response.data;
}

// ==================== React Query Hooks ====================

/**
 * Hook: Fetch patient status history
 */
export function usePatientStatusHistory(
  patientId: number | undefined,
  options?: Omit<UseQueryOptions<StatusHistory[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<StatusHistory[], Error>({
    queryKey: ['patients', patientId, 'status-history'],
    queryFn: () => fetchPatientStatusHistory(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}

/**
 * Hook: Fetch current patient status
 */
export function useCurrentPatientStatus(
  patientId: number | undefined,
  options?: Omit<UseQueryOptions<StatusHistory, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<StatusHistory, Error>({
    queryKey: ['patients', patientId, 'status-current'],
    queryFn: () => fetchCurrentPatientStatus(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch patient status summary
 */
export function usePatientStatusSummary(
  patientId: number | undefined,
  options?: Omit<UseQueryOptions<PatientStatusSummary, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<PatientStatusSummary, Error>({
    queryKey: ['patients', patientId, 'status-summary'],
    queryFn: () => fetchPatientStatusSummary(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch valid status transitions
 */
export function useValidStatusTransitions(
  patientId: number | undefined,
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<string[], Error>({
    queryKey: ['patients', patientId, 'valid-transitions'],
    queryFn: () => fetchValidStatusTransitions(patientId!),
    enabled: !!patientId,
    staleTime: 15 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch status transition summary (analytics)
 */
export function useStatusTransitionSummary(
  options?: Omit<UseQueryOptions<StatusTransitionSummary[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StatusTransitionSummary[], Error>({
    queryKey: ['patients', 'status-transitions-summary'],
    queryFn: fetchStatusTransitionSummary,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options
  });
}

/**
 * Hook: Fetch patients in specific status
 */
export function usePatientsInStatus(
  status: string | undefined,
  options?: Omit<UseQueryOptions<StatusHistory[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<StatusHistory[], Error>({
    queryKey: ['patients', 'in-status', status],
    queryFn: () => fetchPatientsInStatus(status!),
    enabled: !!status,
    staleTime: 10 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Change patient status mutation
 */
export function useChangePatientStatus(
  options?: Omit<UseMutationOptions<StatusHistory, Error, { patientId: number; statusData: StatusChangeRequest }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<StatusHistory, Error, { patientId: number; statusData: StatusChangeRequest }>({
    mutationFn: ({ patientId, statusData }) => changePatientStatus(patientId, statusData),
    onSuccess: (_, variables) => {
      const { patientId } = variables;
      
      // Invalidate all status-related queries for this patient
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'status-history'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'status-current'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'status-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] });
      
      // Invalidate analytics queries
      queryClient.invalidateQueries({ queryKey: ['patients', 'status-transitions-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'in-status'] });
      
      console.log('[PATIENT_STATUS_SERVICE] Patient status updated successfully');
    },
    ...options
  });
}

// ==================== Utility Functions ====================

/**
 * Format status for display
 */
export function formatStatus(status: string | { status?: string; displayName?: string } | undefined): string {
  if (!status) return 'Unknown';
  
  const statusStr = typeof status === 'string' ? status : (status.status || status.displayName || '');
  
  if (!statusStr) return 'Unknown';
  
  return statusStr.charAt(0) + statusStr.slice(1).toLowerCase();
}

/**
 * Get status badge variant for UI
 */
export function getStatusBadgeVariant(status: string | undefined): StatusBadgeVariant {
  const statusVariantMap: Record<string, StatusBadgeVariant> = {
    'REGISTERED': 'info',
    'SCREENING': 'warning',
    'ENROLLED': 'success',
    'ACTIVE': 'violet',
    'COMPLETED': 'neutral',
    'WITHDRAWN': 'danger'
  };
  
  return status ? (statusVariantMap[status] || 'neutral') : 'neutral';
}

/**
 * Validate status change data
 */
export function validateStatusChangeData(statusData: Partial<StatusChangeRequest>): StatusValidationResult {
  const errors: string[] = [];

  if (!statusData.newStatus || (statusData.newStatus as string).trim().length === 0) {
    errors.push('New status is required');
  }

  if (!statusData.reason || statusData.reason.trim().length === 0) {
    errors.push('Reason for status change is required');
  } else if (statusData.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters long');
  }

  if (!statusData.changedBy || statusData.changedBy.trim().length === 0) {
    errors.push('Changed by is required');
  }

  // Validate status is one of the valid values
  const validStatuses = Object.values(PatientStatus);
  if (statusData.newStatus && !validStatuses.includes(statusData.newStatus)) {
    errors.push('Invalid status value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get status lifecycle order
 */
export function getStatusLifecycle(): StatusLifecycleInfo[] {
  return [
    { status: PatientStatus.REGISTERED, displayName: 'Registered', order: 1, description: 'Initial registration' },
    { status: PatientStatus.SCREENING, displayName: 'Screening', order: 2, description: 'Undergoing screening' },
    { status: PatientStatus.ENROLLED, displayName: 'Enrolled', order: 3, description: 'Enrolled in study' },
    { status: PatientStatus.ACTIVE, displayName: 'Active', order: 4, description: 'Active treatment' },
    { status: PatientStatus.COMPLETED, displayName: 'Completed', order: 5, description: 'Study completed' },
    { status: PatientStatus.WITHDRAWN, displayName: 'Withdrawn', order: 6, description: 'Withdrawn from study' }
  ];
}

/**
 * Calculate days between status changes
 */
export function calculateDaysBetweenChanges(statusHistory: StatusHistory[]): number[] {
  if (!statusHistory || statusHistory.length < 2) {
    return [];
  }

  const durations: number[] = [];
  for (let i = 0; i < statusHistory.length - 1; i++) {
    const current = new Date(statusHistory[i].changedAt);
    const previous = new Date(statusHistory[i + 1].changedAt);
    const days = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    durations.push(days);
  }

  return durations;
}

/**
 * Get average days between status changes
 */
export function getAverageDaysBetweenChanges(statusHistory: StatusHistory[]): number | null {
  const durations = calculateDaysBetweenChanges(statusHistory);
  if (durations.length === 0) return null;
  
  const sum = durations.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / durations.length) * 10) / 10; // Round to 1 decimal
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy object export for backward compatibility
 * @deprecated Use named exports and hooks instead
 */
export const PatientStatusService = {
  // Write operations
  changePatientStatus,
  
  // Read operations - patient specific
  getPatientStatusHistory: fetchPatientStatusHistory,
  getCurrentPatientStatus: fetchCurrentPatientStatus,
  getPatientStatusSummary: fetchPatientStatusSummary,
  getPatientStatusChangeCount: fetchPatientStatusChangeCount,
  getValidStatusTransitions: fetchValidStatusTransitions,
  
  // Read operations - analytics
  getStatusTransitionSummary: fetchStatusTransitionSummary,
  findPatientsInStatus: fetchPatientsInStatus,
  findPatientsStuckInStatus: fetchPatientsStuckInStatus,
  getStatusChangesByDateRange: fetchStatusChangesByDateRange,
  getStatusChangesByUser: fetchStatusChangesByUser,
  
  // Utility methods
  checkHealth: checkStatusServiceHealth,
  formatStatus,
  getStatusBadgeVariant,
  validateStatusChangeData,
  getStatusLifecycle,
  calculateDaysBetweenChanges,
  getAverageDaysBetweenChanges
};

export default PatientStatusService;
