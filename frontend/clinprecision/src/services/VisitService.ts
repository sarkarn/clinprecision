import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from './ApiService';
import { API_BASE_URL } from '../config';
import type { ApiResponse } from '../types';

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = '/clinops-ws/api/v1/visits';

/**
 * Visit type constants
 */
export const VISIT_TYPES = {
  SCREENING: 'SCREENING',
  ENROLLMENT: 'ENROLLMENT',
  DISCONTINUATION: 'DISCONTINUATION',
  ADVERSE_EVENT: 'ADVERSE_EVENT'
} as const;

/**
 * Visit status constants
 */
export const VISIT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

// ============================================================================
// Types
// ============================================================================

export type VisitType = typeof VISIT_TYPES[keyof typeof VISIT_TYPES];
export type VisitStatus = typeof VISIT_STATUS[keyof typeof VISIT_STATUS];

export interface UnscheduledVisit {
  visitId?: string;
  patientId: number;
  studyId: number;
  siteId: number;
  visitType: VisitType | string;
  visitDate: string; // YYYY-MM-DD format
  visitStatus?: VisitStatus;
  createdBy: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnscheduledVisitCreateData {
  patientId: number;
  studyId: number;
  siteId: number;
  visitType: VisitType | string;
  visitDate: string; // YYYY-MM-DD format
  createdBy: string;
  notes?: string;
}

export interface UnscheduledVisitType {
  id: number;
  name: string;
  visitCode: string;
  visitType?: string;
  description?: string;
  isUnscheduled?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map patient status to visit type
 * Used for determining which visit type to create after status change
 * 
 * @param newStatus - Patient status enum value
 * @returns Visit type or null if no visit needed
 * 
 * @example
 * ```tsx
 * const visitType = getVisitTypeForStatus('SCREENING');
 * console.log(visitType); // 'SCREENING'
 * ```
 */
export const getVisitTypeForStatus = (newStatus: string): VisitType | null => {
  const statusToVisitMap: Record<string, VisitType> = {
    'SCREENING': VISIT_TYPES.SCREENING,
    'ENROLLED': VISIT_TYPES.ENROLLMENT,
    'WITHDRAWN': VISIT_TYPES.DISCONTINUATION
  };
  
  return statusToVisitMap[newStatus] || null;
};

/**
 * Check if status change should prompt for visit creation
 * 
 * @param newStatus - Patient status enum value
 * @returns True if visit should be prompted
 * 
 * @example
 * ```tsx
 * if (shouldPromptForVisit('SCREENING')) {
 *     showVisitPrompt();
 * }
 * ```
 */
export const shouldPromptForVisit = (newStatus: string): boolean => {
  return getVisitTypeForStatus(newStatus) !== null;
};

/**
 * Get user-friendly visit type label
 * 
 * @param visitType - Visit type enum value
 * @returns Display label
 * 
 * @example
 * ```tsx
 * const label = getVisitTypeLabel('SCREENING');
 * console.log(label); // 'Screening Visit'
 * ```
 */
export const getVisitTypeLabel = (visitType: string): string => {
  const labels: Record<string, string> = {
    'SCREENING': 'Screening Visit',
    'ENROLLMENT': 'Enrollment Visit',
    'DISCONTINUATION': 'Discontinuation Visit',
    'ADVERSE_EVENT': 'Adverse Event Visit'
  };
  
  return labels[visitType] || visitType;
};

/**
 * Get visit type color for UI badges
 * 
 * @param visitType - Visit type enum value
 * @returns Tailwind CSS color classes
 * 
 * @example
 * ```tsx
 * const colorClass = getVisitTypeColor('SCREENING');
 * console.log(colorClass); // 'bg-yellow-100 text-yellow-800'
 * ```
 */
export const getVisitTypeColor = (visitType: string): string => {
  const colors: Record<string, string> = {
    'SCREENING': 'bg-yellow-100 text-yellow-800',
    'ENROLLMENT': 'bg-green-100 text-green-800',
    'DISCONTINUATION': 'bg-red-100 text-red-800',
    'ADVERSE_EVENT': 'bg-orange-100 text-orange-800'
  };
  
  return colors[visitType] || 'bg-gray-100 text-gray-800';
};

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Create an unscheduled visit
 * 
 * @param visitData - Visit creation data
 * @returns Visit response with visitId
 * 
 * @example
 * ```tsx
 * const visit = await createUnscheduledVisit({
 *     patientId: 123,
 *     studyId: 456,
 *     siteId: 789,
 *     visitType: 'SCREENING',
 *     visitDate: '2025-10-15',
 *     createdBy: 'Dr. Smith',
 *     notes: 'Initial screening assessment'
 * });
 * console.log('Visit created:', visit.visitId);
 * ```
 */
export const createUnscheduledVisit = async (visitData: UnscheduledVisitCreateData): Promise<UnscheduledVisit> => {
  console.log('[VISIT SERVICE] Creating unscheduled visit:', visitData);
  
  const response = await ApiService.post(`${BASE_URL}/unscheduled`, visitData);
  const apiResponse = response.data as ApiResponse<UnscheduledVisit>;
  const result = apiResponse.data || response.data;
  
  console.log('[VISIT SERVICE] Visit created successfully:', result);
  return result;
};

/**
 * Get all visits for a patient
 * 
 * @param patientId - Patient ID
 * @returns List of visits ordered by date (most recent first)
 * 
 * @example
 * ```tsx
 * const visits = await fetchPatientVisits(123);
 * visits.forEach(visit => {
 *     console.log(`${visit.visitType} on ${visit.visitDate}`);
 * });
 * ```
 */
export const fetchPatientVisits = async (patientId: number): Promise<UnscheduledVisit[]> => {
  console.log('[VISIT SERVICE] Getting visits for patientId:', patientId);
  
  const response = await ApiService.get(`${BASE_URL}/patient/${patientId}`);
  const apiResponse = response.data as ApiResponse<UnscheduledVisit[]>;
  const result = apiResponse.data || response.data || [];
  
  console.log('[VISIT SERVICE] Found visits:', result.length);
  return result;
};

/**
 * Get all visits for a study
 * 
 * @param studyId - Study ID
 * @returns List of visits for the study
 * 
 * @example
 * ```tsx
 * const visits = await fetchStudyVisits(456);
 * console.log(`Study has ${visits.length} visits`);
 * ```
 */
export const fetchStudyVisits = async (studyId: number): Promise<UnscheduledVisit[]> => {
  console.log('[VISIT SERVICE] Getting visits for studyId:', studyId);
  
  const response = await ApiService.get(`${BASE_URL}/study/${studyId}`);
  const apiResponse = response.data as ApiResponse<UnscheduledVisit[]>;
  const result = apiResponse.data || response.data || [];
  
  console.log('[VISIT SERVICE] Found visits:', result.length);
  return result;
};

/**
 * Get visits by type
 * 
 * @param visitType - Visit type (SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT)
 * @returns List of visits of specified type
 * 
 * @example
 * ```tsx
 * const screeningVisits = await fetchVisitsByType('SCREENING');
 * console.log(`${screeningVisits.length} screening visits found`);
 * ```
 */
export const fetchVisitsByType = async (visitType: string): Promise<UnscheduledVisit[]> => {
  console.log('[VISIT SERVICE] Getting visits by type:', visitType);
  
  const response = await ApiService.get(`${BASE_URL}/type/${visitType}`);
  const apiResponse = response.data as ApiResponse<UnscheduledVisit[]>;
  const result = apiResponse.data || response.data || [];
  
  console.log('[VISIT SERVICE] Found visits:', result.length);
  return result;
};

/**
 * Get a specific visit by ID
 * 
 * @param visitId - Visit UUID
 * @returns Visit details or null if not found
 * 
 * @example
 * ```tsx
 * const visit = await fetchVisitById('123e4567-e89b-12d3-a456-426614174000');
 * if (visit) {
 *     console.log('Visit found:', visit.visitType);
 * }
 * ```
 */
export const fetchVisitById = async (visitId: string): Promise<UnscheduledVisit | null> => {
  try {
    console.log('[VISIT SERVICE] Getting visit by visitId:', visitId);
    
    const response = await ApiService.get(`${BASE_URL}/${visitId}`);
    const apiResponse = response.data as ApiResponse<UnscheduledVisit>;
    const result = apiResponse.data || response.data;
    
    console.log('[VISIT SERVICE] Visit found');
    return result;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn('[VISIT SERVICE] Visit not found:', visitId);
      return null;
    }
    console.error('[VISIT SERVICE] Error getting visit by ID:', error);
    throw error;
  }
};

/**
 * Get available unscheduled visit types from backend configuration
 * Fetches the list of enabled unscheduled visit types for the study
 * 
 * @param studyId - Study ID
 * @returns Array of visit definitions
 * 
 * @example
 * ```tsx
 * const visitTypes = await fetchUnscheduledVisitTypes(11);
 * // Returns: [
 * //   { id: 123, name: 'Early Termination Visit', visitCode: 'EARLY_TERM', ... },
 * //   { id: 124, name: 'Adverse Event Visit', visitCode: 'AE_VISIT', ... },
 * // ]
 * ```
 */
export const fetchUnscheduledVisitTypes = async (studyId: number): Promise<UnscheduledVisitType[]> => {
  console.log('Fetching unscheduled visit types for study:', studyId);
  
  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(
    `${API_BASE_URL}/clinops-ws/api/v1/visits/study/${studyId}/unscheduled-types`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch unscheduled visit types: ${response.statusText}`);
  }

  const visitTypes = await response.json();
  console.log('Fetched unscheduled visit types:', visitTypes);
  
  return visitTypes;
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to create an unscheduled visit
 * 
 * @example
 * ```tsx
 * const createVisitMutation = useCreateUnscheduledVisit();
 * await createVisitMutation.mutateAsync({
 *     patientId: 123,
 *     studyId: 456,
 *     siteId: 789,
 *     visitType: 'SCREENING',
 *     visitDate: '2025-10-15',
 *     createdBy: 'Dr. Smith'
 * });
 * ```
 */
export const useCreateUnscheduledVisit = (): UseMutationResult<UnscheduledVisit, Error, UnscheduledVisitCreateData, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUnscheduledVisit,
    onSuccess: (data, variables) => {
      // Invalidate patient visits
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId, 'visits'] });
      // Invalidate study visits
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visits'] });
      // Invalidate visits by type
      queryClient.invalidateQueries({ queryKey: ['visits', 'type', variables.visitType] });
    },
  });
};

/**
 * Hook to fetch visits for a patient
 * 
 * @example
 * ```tsx
 * const { data: visits, isLoading } = usePatientVisits(patientId);
 * ```
 */
export const usePatientVisits = (patientId: number | undefined): UseQueryResult<UnscheduledVisit[], Error> => {
  return useQuery({
    queryKey: ['patient', patientId, 'visits'],
    queryFn: () => fetchPatientVisits(patientId!),
    enabled: !!patientId,
  });
};

/**
 * Hook to fetch visits for a study
 * 
 * @example
 * ```tsx
 * const { data: visits } = useStudyVisits(studyId);
 * ```
 */
export const useStudyVisits = (studyId: number | undefined): UseQueryResult<UnscheduledVisit[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'unscheduled-visits'],
    queryFn: () => fetchStudyVisits(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to fetch visits by type
 * 
 * @example
 * ```tsx
 * const { data: screeningVisits } = useVisitsByType('SCREENING');
 * ```
 */
export const useVisitsByType = (visitType: string | undefined): UseQueryResult<UnscheduledVisit[], Error> => {
  return useQuery({
    queryKey: ['visits', 'type', visitType],
    queryFn: () => fetchVisitsByType(visitType!),
    enabled: !!visitType,
  });
};

/**
 * Hook to fetch a single visit by ID
 * 
 * @example
 * ```tsx
 * const { data: visit } = useVisitById(visitId);
 * ```
 */
export const useVisitById = (visitId: string | undefined): UseQueryResult<UnscheduledVisit | null, Error> => {
  return useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => fetchVisitById(visitId!),
    enabled: !!visitId,
  });
};

/**
 * Hook to fetch unscheduled visit types for a study
 * 
 * @example
 * ```tsx
 * const { data: visitTypes } = useUnscheduledVisitTypes(studyId);
 * ```
 */
export const useUnscheduledVisitTypes = (studyId: number | undefined): UseQueryResult<UnscheduledVisitType[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'unscheduled-visit-types'],
    queryFn: () => fetchUnscheduledVisitTypes(studyId!),
    enabled: !!studyId,
    staleTime: 10 * 60 * 1000, // 10 minutes (visit types don't change often)
  });
};

// ============================================================================
// Legacy Service Export (for backwards compatibility)
// ============================================================================

const VisitService = {
  createUnscheduledVisit,
  getPatientVisits: fetchPatientVisits,
  getStudyVisits: fetchStudyVisits,
  getVisitsByType: fetchVisitsByType,
  getVisitById: fetchVisitById,
  getUnscheduledVisitTypes: fetchUnscheduledVisitTypes,
  VISIT_TYPES,
  VISIT_STATUS,
  getVisitTypeForStatus,
  shouldPromptForVisit,
  getVisitTypeLabel,
  getVisitTypeColor
};

export default VisitService;

// Named exports for direct function access
export const getPatientVisits = fetchPatientVisits;
export const getStudyVisits = fetchStudyVisits;
export const getVisitById = fetchVisitById;
