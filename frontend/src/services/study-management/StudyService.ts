import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import type { Study, ApiResponse } from '../../../clinprecision/src/types';

// API paths following DDD alignment (October 2025)
const API_BASE = '/clinops-ws/api/v1/study-design';
const API_PATH = `${API_BASE}/studies`;
const METADATA_API_PATH = `${API_BASE}/metadata`;
const ANALYTICS_API_PATH = `${API_BASE}/analytics`;

// ============================================================================
// Core API Functions (Pure data fetching - no React hooks)
// ============================================================================

/**
 * Fetch all studies from the backend
 */
export const fetchStudies = async (): Promise<Study[]> => {
  console.log('Fetching studies from:', API_PATH);
  try {
    const response = await ApiService.get(API_PATH);
    
    // Backend returns array directly (not wrapped in ApiResponse)
    if (Array.isArray(response.data)) {
      console.log('✅ Successfully fetched', response.data.length, 'studies');
      return response.data as Study[];
    }
    
    // Fallback: Check if wrapped in ApiResponse format { success: boolean, data: Study[] }
    const apiResponse = response.data as ApiResponse<Study[]>;
    if (apiResponse?.success && Array.isArray(apiResponse.data)) {
      console.log('✅ Successfully fetched', apiResponse.data.length, 'studies from apiResponse.data');
      return apiResponse.data;
    }
    
    console.warn('⚠️ Unexpected response format from studies endpoint:', response.data);
    console.warn('⚠️ Returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Error fetching studies:', error);
    throw error;
  }
};

/**
 * Fetch a single study by ID
 */
export const fetchStudyById = async (studyId: number | string): Promise<Study> => {
  console.log(`Fetching study ${studyId} from:`, `${API_PATH}/${studyId}`);
  try {
    const response = await ApiService.get(`${API_PATH}/${studyId}`);
    
    // Log the actual response to debug
    console.log(`Raw response for study ${studyId}:`, response.data);
    
    // Check if data is returned directly (not wrapped in ApiResponse)
    if (response.data && typeof response.data === 'object' && response.data.id) {
      console.log('✅ Study data received (direct format)');
      return response.data as Study;
    }
    
    // Check if wrapped in ApiResponse format
    const apiResponse = response.data as ApiResponse<Study>;
    if (apiResponse?.success && apiResponse.data) {
      console.log('✅ Study data received (wrapped format)');
      return apiResponse.data;
    }
    
    throw new Error(`Study ${studyId} not found`);
  } catch (error) {
    console.error(`Error fetching study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Create a new study (register)
 */
export const createStudy = async (studyData: Partial<Study>): Promise<Study> => {
  console.log('Registering new study:', studyData);
  try {
    const response = await ApiService.post(API_PATH, studyData);
    const apiResponse = response.data as ApiResponse<Study>;
    
    if (apiResponse.success && apiResponse.data) {
      console.log('Study registered successfully:', apiResponse.data);
      return apiResponse.data;
    }
    
    throw new Error('Failed to register study');
  } catch (error) {
    console.error('Error registering study:', error);
    throw error;
  }
};

/**
 * Update an existing study
 */
export const updateStudy = async ({ 
  studyId, 
  studyData 
}: { 
  studyId: number | string; 
  studyData: Partial<Study> 
}): Promise<Study> => {
  console.log(`Updating study ${studyId}:`, studyData);
  try {
    const response = await ApiService.put(
      `${API_PATH}/${studyId}`,
      studyData
    );
    const apiResponse = response.data as ApiResponse<Study>;
    
    if (apiResponse.success && apiResponse.data) {
      console.log('Study updated successfully:', apiResponse.data);
      return apiResponse.data;
    }
    
    throw new Error(`Failed to update study ${studyId}`);
  } catch (error) {
    console.error(`Error updating study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Delete a study
 */
export const deleteStudy = async (studyId: number | string): Promise<void> => {
  console.log(`Deleting study ${studyId}`);
  try {
    await ApiService.delete(`${API_PATH}/${studyId}`);
    console.log(`Study ${studyId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Fetch dashboard metrics
 */
export interface DashboardMetrics {
  activeStudies: number;
  draftProtocols: number;
  completedStudies: number;
  totalAmendments: number;
  studiesByStatus: Record<string, number>;
  studiesByPhase: Record<string, number>;
  lastUpdated: string;
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  console.log('Fetching dashboard metrics from:', `${ANALYTICS_API_PATH}/dashboard-metrics`);
  try {
    const response = await ApiService.get(`${ANALYTICS_API_PATH}/dashboard-metrics`);
    
    // Check if data is returned directly (not wrapped)
    if (response.data && typeof response.data === 'object' && !response.data.success) {
      console.log('✅ Dashboard metrics received (direct format)');
      return response.data as DashboardMetrics;
    }
    
    // Check if wrapped in ApiResponse format
    const apiResponse = response.data as ApiResponse<DashboardMetrics>;
    if (apiResponse?.success && apiResponse.data) {
      console.log('✅ Dashboard metrics received (wrapped format)');
      return apiResponse.data;
    }
    
    console.warn('⚠️ No dashboard metrics data, using fallback');
    // Return fallback metrics if API fails
    return {
      activeStudies: 0,
      draftProtocols: 0,
      completedStudies: 0,
      totalAmendments: 0,
      studiesByStatus: {},
      studiesByPhase: {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    throw error;
  }
};;

/**
 * Fetch study lookup data (phases, statuses, etc.)
 */
export interface StudyLookupData {
  phases: Array<{ value: string; label: string; category?: string }>;
  statuses: Array<{ value: string; label: string }>;
  regulatoryStatuses: Array<{ value: string; label: string }>;
  studyTypes: Array<{ value: string; label: string }>;
}

/**
 * Fetch combined lookup data from individual metadata endpoints
 * Fetches study phases, statuses, and regulatory statuses
 */
export const fetchStudyLookupData = async (): Promise<StudyLookupData> => {
  console.log('Fetching study lookup data from individual metadata endpoints');
  try {
    // Fetch all metadata in parallel
    const [phasesResponse, statusesResponse, regulatoryStatusesResponse] = await Promise.all([
      ApiService.get(`${METADATA_API_PATH}/study-phases`),
      ApiService.get(`${METADATA_API_PATH}/study-statuses`),
      ApiService.get(`${METADATA_API_PATH}/regulatory-statuses`)
    ]);
    
    // Combine results into lookup data object
    const lookupData: StudyLookupData = {
      phases: Array.isArray(phasesResponse.data) ? phasesResponse.data : [],
      statuses: Array.isArray(statusesResponse.data) ? statusesResponse.data : [],
      regulatoryStatuses: Array.isArray(regulatoryStatusesResponse.data) ? regulatoryStatusesResponse.data : [],
      studyTypes: [] // TODO: Add study types endpoint when available
    };
    
    console.log('Successfully fetched lookup data:', lookupData);
    return lookupData;
  } catch (error) {
    console.error('Error fetching lookup data:', error);
    throw error;
  }
};

// ============================================================================
// React Query Hooks (Use these in components)
// ============================================================================

/**
 * Hook to fetch all studies with caching
 * 
 * @example
 * ```tsx
 * const { data: studies, isLoading, error } = useStudies();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <StudyList studies={studies} />;
 * ```
 */
export const useStudies = (): UseQueryResult<Study[], Error> => {
  return useQuery<Study[], Error>({
    queryKey: ['studies'],
    queryFn: fetchStudies,
    // staleTime and cacheTime configured globally in queryClient
  });
};

/**
 * Hook to fetch a single study by ID with caching
 * 
 * @param studyId - The ID of the study to fetch
 * 
 * @example
 * ```tsx
 * const { data: study, isLoading } = useStudy(studyId);
 * ```
 */
export const useStudy = (studyId: number | string | undefined): UseQueryResult<Study, Error> => {
  return useQuery<Study, Error>({
    queryKey: ['study', studyId],
    queryFn: () => fetchStudyById(studyId!),
    enabled: !!studyId, // Only fetch if studyId is provided
  });
};

/**
 * Hook to create a new study with optimistic updates
 * 
 * @example
 * ```tsx
 * const createStudyMutation = useCreateStudy();
 * 
 * const handleSubmit = async (formData) => {
 *   try {
 *     const newStudy = await createStudyMutation.mutateAsync(formData);
 *     navigate(`/study-design/study/${newStudy.id}`);
 *   } catch (error) {
 *     alert('Failed to create study');
 *   }
 * };
 * ```
 */
export const useCreateStudy = (): UseMutationResult<Study, Error, Partial<Study>> => {
  const queryClient = useQueryClient();
  
  return useMutation<Study, Error, Partial<Study>>({
    mutationFn: createStudy,
    onSuccess: (newStudy) => {
      // Invalidate and refetch studies list
      queryClient.invalidateQueries({ queryKey: ['studies'] });
      
      // Optionally set the new study in cache
      queryClient.setQueryData(['study', newStudy.id], newStudy);
      
      console.log('Study created successfully, cache invalidated');
    },
    onError: (error) => {
      console.error('Failed to create study:', error);
    },
  });
};

/**
 * Hook to update an existing study
 * 
 * @example
 * ```tsx
 * const updateStudyMutation = useUpdateStudy();
 * 
 * const handleSave = async () => {
 *   await updateStudyMutation.mutateAsync({ studyId, studyData });
 * };
 * ```
 */
export const useUpdateStudy = (): UseMutationResult<
  Study, 
  Error, 
  { studyId: number | string; studyData: Partial<Study> }
> => {
  const queryClient = useQueryClient();
  
  return useMutation<Study, Error, { studyId: number | string; studyData: Partial<Study> }>({
    mutationFn: updateStudy,
    onSuccess: (updatedStudy, variables) => {
      // Update the specific study in cache
      queryClient.setQueryData(['study', variables.studyId], updatedStudy);
      
      // Invalidate studies list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['studies'] });
      
      console.log(`Study ${variables.studyId} updated successfully`);
    },
    onError: (error, variables) => {
      console.error(`Failed to update study ${variables.studyId}:`, error);
    },
  });
};

/**
 * Hook to delete a study
 * 
 * @example
 * ```tsx
 * const deleteStudyMutation = useDeleteStudy();
 * 
 * const handleDelete = async (studyId) => {
 *   if (confirm('Are you sure?')) {
 *     await deleteStudyMutation.mutateAsync(studyId);
 *     navigate('/study-design/studies');
 *   }
 * };
 * ```
 */
export const useDeleteStudy = (): UseMutationResult<void, Error, number | string> => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number | string>({
    mutationFn: deleteStudy,
    onSuccess: (_data, studyId) => {
      // Remove the study from cache
      queryClient.removeQueries({ queryKey: ['study', studyId] });
      
      // Invalidate studies list
      queryClient.invalidateQueries({ queryKey: ['studies'] });
      
      console.log(`Study ${studyId} deleted successfully`);
    },
    onError: (error, studyId) => {
      console.error(`Failed to delete study ${studyId}:`, error);
    },
  });
};

/**
 * Hook to fetch dashboard metrics with caching
 * 
 * @example
 * ```tsx
 * const { data: metrics, isLoading, refetch } = useDashboardMetrics();
 * ```
 */
export const useDashboardMetrics = (): UseQueryResult<DashboardMetrics, Error> & { 
  refetch: () => void 
} => {
  const queryResult = useQuery<DashboardMetrics, Error>({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
  
  return {
    ...queryResult,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook to fetch study lookup data with caching
 * 
 * @example
 * ```tsx
 * const { data: lookupData } = useStudyLookupData();
 * const phases = lookupData?.phases || [];
 * ```
 */
export const useStudyLookupData = (): UseQueryResult<StudyLookupData, Error> => {
  return useQuery<StudyLookupData, Error>({
    queryKey: ['studyLookupData'],
    queryFn: fetchStudyLookupData,
    staleTime: 10 * 60 * 1000, // 10 minutes (lookup data changes rarely)
  });
};

// ============================================================================
// Legacy Export (for backwards compatibility during migration)
// ============================================================================

/**
 * Legacy service object export
 * @deprecated Use individual hooks instead (useStudies, useStudy, etc.)
 */
const StudyService = {
  getStudies: fetchStudies,
  getStudyById: fetchStudyById,
  registerStudy: createStudy,
  updateStudy: (studyId: number | string, studyData: Partial<Study>) => 
    updateStudy({ studyId, studyData }),
  deleteStudy,
  getDashboardMetrics: fetchDashboardMetrics,
  getStudyLookupData: fetchStudyLookupData,
};

export default StudyService;

// Named exports for direct function access
export const getStudies = fetchStudies;
export const getStudyById = fetchStudyById;
export const registerStudy = createStudy;
