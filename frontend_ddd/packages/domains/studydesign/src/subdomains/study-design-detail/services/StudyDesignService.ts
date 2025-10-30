import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from './ApiService';
import type { ApiResponse, Study } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface StudyDesignInitRequest {
  studyAggregateUuid: string;
  studyName: string;
  createdBy?: string;
  legacyStudyId?: number | null;
}

export interface StudyDesignInitResponse {
  studyDesignId: string;
  studyAggregateUuid: string;
  studyName: string;
  createdAt: string;
}

export interface StudyArm {
  id?: number;
  armId?: string;
  studyId?: number;
  armName: string;
  armDescription?: string;
  armCode?: string;
  sequence?: number;
  isControl?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyArmCreateData {
  armName: string;
  armDescription?: string;
  armCode?: string;
  sequence?: number;
  isControl?: boolean;
}

export interface StudyArmUpdateData extends Partial<StudyArmCreateData> {
  // All fields from create are optional for updates
}

export interface VisitDefinition {
  id?: number;
  visitId?: string;
  studyId?: number;
  visitName: string;
  visitCode?: string;
  visitType?: string;
  dayOffset?: number;
  windowBefore?: number;
  windowAfter?: number;
  sequence?: number;
  isRequired?: boolean;
  description?: string;
}

export interface VisitScheduleData {
  visits: VisitDefinition[];
  studyId?: number;
}

export interface FormBinding {
  id?: number;
  bindingId?: string;
  studyId?: number;
  visitId?: string;
  formId?: string;
  formName?: string;
  visitName?: string;
  sequence?: number;
  isRequired?: boolean;
}

export interface FormBindingsData {
  bindings: FormBinding[];
  studyId?: number;
}

export interface StudyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PublishStudyData {
  reason?: string;
  publishedBy?: string;
}

export interface ChangeStatusData {
  newStatus: string;
  reason?: string;
}

export interface StudyRevision {
  id?: number;
  revisionId?: string;
  studyId?: number;
  versionNumber?: string;
  changeDescription?: string;
  createdBy?: string;
  createdAt?: string;
  status?: string;
}

export interface RevisionCreateData {
  changeDescription: string;
  reason: string;
}

export interface DesignProgress {
  studyId?: number;
  basicInfoComplete?: boolean;
  armsComplete?: boolean;
  visitsComplete?: boolean;
  formsComplete?: boolean;
  completionPercentage?: number;
  currentPhase?: string;
  lastModifiedAt?: string;
}

export interface DesignProgressUpdate {
  phase?: string;
  isComplete?: boolean;
  percentageComplete?: number;
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Initialize StudyDesignAggregate for a study
 * Required for DDD/Event Sourcing operations (arms, visits, forms)
 */
export const initializeStudyDesign = async (data: StudyDesignInitRequest): Promise<StudyDesignInitResponse> => {
  const payload = {
    studyAggregateUuid: data.studyAggregateUuid,
    studyName: data.studyName,
    createdBy: data.createdBy || 'system',
    ...(data.legacyStudyId && { legacyStudyId: data.legacyStudyId })
  };

  const response = await ApiService.post('/clinops-ws/api/v1/study-design/designs', payload);
  const apiResponse = response.data as ApiResponse<StudyDesignInitResponse>;
  return apiResponse.data || response.data;
};

/**
 * Get a study by ID
 */
export const fetchStudyById = async (studyId: number | string): Promise<Study> => {
  const response = await ApiService.get(`/api/studies/${studyId}`);
  const apiResponse = response.data as ApiResponse<Study>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Study Arms API Functions
// ============================================================================

/**
 * Fetch all study arms for a study
 */
export const fetchStudyArms = async (studyId: number | string): Promise<StudyArm[]> => {
  const response = await ApiService.get(`/api/v1/study-design/studies/${studyId}/arms`);
  const apiResponse = response.data as ApiResponse<StudyArm[]>;
  return apiResponse.data || response.data || [];
};

/**
 * Create a new study arm
 */
export const createStudyArm = async ({ studyId, armData }: { studyId: number | string; armData: StudyArmCreateData }): Promise<StudyArm> => {
  const response = await ApiService.post(`/api/v1/study-design/studies/${studyId}/arms`, armData);
  const apiResponse = response.data as ApiResponse<StudyArm>;
  return apiResponse.data || response.data;
};

/**
 * Update an existing study arm
 */
export const updateStudyArm = async ({ armId, updates }: { armId: number | string; updates: StudyArmUpdateData }): Promise<StudyArm> => {
  const response = await ApiService.put(`/api/v1/study-design/arms/${armId}`, updates);
  const apiResponse = response.data as ApiResponse<StudyArm>;
  return apiResponse.data || response.data;
};

/**
 * Delete a study arm
 */
export const deleteStudyArm = async (armId: number | string): Promise<{ success: boolean }> => {
  await ApiService.delete(`/api/v1/study-design/arms/${armId}`);
  return { success: true };
};

/**
 * Bulk save study arms (legacy - prefer individual operations)
 */
export const saveStudyArms = async ({ studyId, armsData }: { studyId: number | string; armsData: StudyArm[] }): Promise<StudyArm[]> => {
  const response = await ApiService.put(`/api/v1/study-design/studies/${studyId}/arms`, armsData);
  const apiResponse = response.data as ApiResponse<StudyArm[]>;
  return apiResponse.data || response.data || [];
};

// ============================================================================
// Visit Schedule API Functions
// ============================================================================

/**
 * Fetch visit schedule for a study
 */
export const fetchVisitSchedule = async (studyId: number | string): Promise<VisitScheduleData> => {
  const response = await ApiService.get(`/api/v1/study-design/designs/studies/${studyId}/visits`);
  const apiResponse = response.data as ApiResponse<VisitScheduleData>;
  return apiResponse.data || response.data;
};

/**
 * Save visit schedule for a study
 */
export const saveVisitSchedule = async ({ studyId, visitData }: { studyId: number | string; visitData: VisitScheduleData }): Promise<VisitScheduleData> => {
  const response = await ApiService.put(`/api/v1/study-design/designs/studies/${studyId}/visits`, visitData);
  const apiResponse = response.data as ApiResponse<VisitScheduleData>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Form Bindings API Functions
// ============================================================================

/**
 * Fetch form bindings for a study
 */
export const fetchFormBindings = async (studyId: number | string): Promise<FormBindingsData> => {
  const response = await ApiService.get(`/api/v1/study-design/designs/studies/${studyId}/form-bindings`);
  const apiResponse = response.data as ApiResponse<FormBindingsData>;
  return apiResponse.data || response.data;
};

/**
 * Save form bindings for a study
 */
export const saveFormBindings = async ({ studyId, bindingData }: { studyId: number | string; bindingData: FormBindingsData }): Promise<FormBindingsData> => {
  const response = await ApiService.put(`/api/v1/study-design/designs/studies/${studyId}/form-bindings`, bindingData);
  const apiResponse = response.data as ApiResponse<FormBindingsData>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Study Publishing API Functions
// ============================================================================

/**
 * Validate study for publishing
 */
export const validateStudyForPublishing = async (studyId: number | string): Promise<StudyValidationResult> => {
  const response = await ApiService.post(`/api/studies/${studyId}/validate`);
  const apiResponse = response.data as ApiResponse<StudyValidationResult>;
  return apiResponse.data || response.data;
};

/**
 * Publish study
 */
export const publishStudy = async (studyId: number | string): Promise<Study> => {
  try {
    const response = await ApiService.patch(`/api/studies/${studyId}/publish`);
    const apiResponse = response.data as ApiResponse<Study>;
    return apiResponse.data || response.data;
  } catch (error: any) {
    // Extract meaningful error message from backend response
    let errorMessage = 'Failed to publish study';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const enhancedError: any = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    
    throw enhancedError;
  }
};

/**
 * Change study status
 */
export const changeStudyStatus = async ({ studyId, newStatus, reason }: { studyId: number | string; newStatus: string; reason?: string }): Promise<Study> => {
  try {
    const response = await ApiService.patch(`/api/studies/${studyId}/status`, { newStatus });
    const apiResponse = response.data as ApiResponse<Study>;
    return apiResponse.data || response.data;
  } catch (error: any) {
    console.error('Error changing study status:', error);
    
    // Extract meaningful error message from backend response
    let errorMessage = `Failed to change study status to ${newStatus}`;
    
    // Priority 1: Check for user-friendly error in custom header
    if (error.response?.headers?.['x-error-message']) {
      errorMessage = error.response.headers['x-error-message'];
    }
    // Priority 2: Check response body
    else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const enhancedError: any = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    
    throw enhancedError;
  }
};

// ============================================================================
// Protocol Revisions API Functions
// ============================================================================

/**
 * Fetch all revisions for a study
 */
export const fetchStudyRevisions = async (studyId: number | string): Promise<StudyRevision[]> => {
  const response = await ApiService.get(`/api/studies/${studyId}/revisions`);
  const apiResponse = response.data as ApiResponse<StudyRevision[]>;
  return apiResponse.data || response.data || [];
};

/**
 * Create a new revision
 */
export const createRevision = async ({ studyId, revisionData }: { studyId: number | string; revisionData: RevisionCreateData }): Promise<StudyRevision> => {
  const response = await ApiService.post(`/api/studies/${studyId}/revisions`, revisionData);
  const apiResponse = response.data as ApiResponse<StudyRevision>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Design Progress API Functions
// ============================================================================

/**
 * Fetch design progress for a study
 */
export const fetchDesignProgress = async (studyId: number | string): Promise<DesignProgress> => {
  const response = await ApiService.get(`/api/studies/${studyId}/design-progress`);
  const apiResponse = response.data as ApiResponse<DesignProgress>;
  return apiResponse.data || response.data;
};

/**
 * Update design progress
 */
export const updateDesignProgress = async ({ studyId, progressData }: { studyId: number | string; progressData: DesignProgressUpdate }): Promise<DesignProgress> => {
  const response = await ApiService.put(`/api/studies/${studyId}/design-progress`, progressData);
  const apiResponse = response.data as ApiResponse<DesignProgress>;
  return apiResponse.data || response.data;
};

/**
 * Initialize design progress
 */
export const initializeDesignProgress = async (studyId: number | string): Promise<DesignProgress> => {
  const response = await ApiService.post(`/api/studies/${studyId}/design-progress/initialize`);
  const apiResponse = response.data as ApiResponse<DesignProgress>;
  return apiResponse.data || response.data;
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch study arms with caching
 * 
 * @example
 * ```tsx
 * const { data: arms, isLoading } = useStudyArms(studyId);
 * ```
 */
export const useStudyArms = (studyId: number | string | undefined): UseQueryResult<StudyArm[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'arms'],
    queryFn: () => fetchStudyArms(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to create a study arm
 * 
 * @example
 * ```tsx
 * const createArmMutation = useCreateStudyArm();
 * await createArmMutation.mutateAsync({ studyId, armData });
 * ```
 */
export const useCreateStudyArm = (): UseMutationResult<StudyArm, Error, { studyId: number | string; armData: StudyArmCreateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudyArm,
    onSuccess: (data, variables) => {
      // Invalidate arms list
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'arms'] });
      // Invalidate design progress
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'design-progress'] });
    },
  });
};

/**
 * Hook to update a study arm
 * 
 * @example
 * ```tsx
 * const updateArmMutation = useUpdateStudyArm();
 * await updateArmMutation.mutateAsync({ armId, updates });
 * ```
 */
export const useUpdateStudyArm = (): UseMutationResult<StudyArm, Error, { armId: number | string; updates: StudyArmUpdateData; studyId?: number | string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ armId, updates }) => updateStudyArm({ armId, updates }),
    onSuccess: (data, variables) => {
      // Invalidate arms list if studyId provided
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'arms'] });
      }
    },
  });
};

/**
 * Hook to delete a study arm
 * 
 * @example
 * ```tsx
 * const deleteArmMutation = useDeleteStudyArm();
 * await deleteArmMutation.mutateAsync({ armId, studyId });
 * ```
 */
export const useDeleteStudyArm = (): UseMutationResult<{ success: boolean }, Error, { armId: number | string; studyId?: number | string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ armId }) => deleteStudyArm(armId),
    onSuccess: (data, variables) => {
      // Invalidate arms list if studyId provided
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'arms'] });
      }
    },
  });
};

/**
 * Hook to fetch visit schedule with caching
 * 
 * @example
 * ```tsx
 * const { data: visitSchedule } = useVisitSchedule(studyId);
 * ```
 */
export const useVisitSchedule = (studyId: number | string | undefined): UseQueryResult<VisitScheduleData, Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'visit-schedule'],
    queryFn: () => fetchVisitSchedule(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to save visit schedule
 * 
 * @example
 * ```tsx
 * const saveVisitsMutation = useSaveVisitSchedule();
 * await saveVisitsMutation.mutateAsync({ studyId, visitData });
 * ```
 */
export const useSaveVisitSchedule = (): UseMutationResult<VisitScheduleData, Error, { studyId: number | string; visitData: VisitScheduleData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveVisitSchedule,
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(['study', variables.studyId, 'visit-schedule'], data);
      // Invalidate design progress
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'design-progress'] });
    },
  });
};

/**
 * Hook to fetch form bindings with caching
 * 
 * @example
 * ```tsx
 * const { data: formBindings } = useFormBindings(studyId);
 * ```
 */
export const useFormBindings = (studyId: number | string | undefined): UseQueryResult<FormBindingsData, Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'form-bindings'],
    queryFn: () => fetchFormBindings(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to save form bindings
 * 
 * @example
 * ```tsx
 * const saveBindingsMutation = useSaveFormBindings();
 * await saveBindingsMutation.mutateAsync({ studyId, bindingData });
 * ```
 */
export const useSaveFormBindings = (): UseMutationResult<FormBindingsData, Error, { studyId: number | string; bindingData: FormBindingsData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveFormBindings,
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(['study', variables.studyId, 'form-bindings'], data);
      // Invalidate design progress
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'design-progress'] });
    },
  });
};

/**
 * Hook to publish a study
 * 
 * @example
 * ```tsx
 * const publishMutation = usePublishStudy();
 * await publishMutation.mutateAsync(studyId);
 * ```
 */
export const usePublishStudy = (): UseMutationResult<Study, Error, number | string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishStudy,
    onSuccess: (data, studyId) => {
      // Update study in cache
      queryClient.setQueryData(['study', studyId], data);
      // Invalidate studies list
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
};

/**
 * Hook to change study status
 * 
 * @example
 * ```tsx
 * const changeStatusMutation = useChangeStudyStatus();
 * await changeStatusMutation.mutateAsync({ studyId, newStatus: 'ACTIVE' });
 * ```
 */
export const useChangeStudyStatus = (): UseMutationResult<Study, Error, { studyId: number | string; newStatus: string; reason?: string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeStudyStatus,
    onSuccess: (data, variables) => {
      // Update study in cache
      queryClient.setQueryData(['study', variables.studyId], data);
      // Invalidate studies list
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
};

/**
 * Hook to fetch design progress with caching
 * 
 * @example
 * ```tsx
 * const { data: progress } = useDesignProgress(studyId);
 * ```
 */
export const useDesignProgress = (studyId: number | string | undefined): UseQueryResult<DesignProgress, Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'design-progress'],
    queryFn: () => fetchDesignProgress(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to update design progress
 * 
 * @example
 * ```tsx
 * const updateProgressMutation = useUpdateDesignProgress();
 * await updateProgressMutation.mutateAsync({ studyId, progressData });
 * ```
 */
export const useUpdateDesignProgress = (): UseMutationResult<DesignProgress, Error, { studyId: number | string; progressData: DesignProgressUpdate }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDesignProgress,
    onSuccess: (data, variables) => {
      // Update cache with new data
      queryClient.setQueryData(['study', variables.studyId, 'design-progress'], data);
    },
  });
};

/**
 * Hook to fetch study revisions with caching
 * 
 * @example
 * ```tsx
 * const { data: revisions } = useStudyRevisions(studyId);
 * ```
 */
export const useStudyRevisions = (studyId: number | string | undefined): UseQueryResult<StudyRevision[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'revisions'],
    queryFn: () => fetchStudyRevisions(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to create a new revision
 * 
 * @example
 * ```tsx
 * const createRevisionMutation = useCreateRevision();
 * await createRevisionMutation.mutateAsync({ studyId, revisionData });
 * ```
 */
export const useCreateRevision = (): UseMutationResult<StudyRevision, Error, { studyId: number | string; revisionData: RevisionCreateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRevision,
    onSuccess: (data, variables) => {
      // Invalidate revisions list
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'revisions'] });
    },
  });
};

// ============================================================================
// Legacy Service Export (for backwards compatibility)
// ============================================================================

const StudyDesignService = {
  initializeStudyDesign,
  getStudyById: fetchStudyById,
  getStudyArms: fetchStudyArms,
  createStudyArm: (studyId: number | string, armData: StudyArmCreateData) => createStudyArm({ studyId, armData }),
  updateStudyArm: (armId: number | string, updates: StudyArmUpdateData) => updateStudyArm({ armId, updates }),
  deleteStudyArm,
  saveStudyArms: (studyId: number | string, armsData: StudyArm[]) => saveStudyArms({ studyId, armsData }),
  getVisitSchedule: fetchVisitSchedule,
  saveVisitSchedule: (studyId: number | string, visitData: VisitScheduleData) => saveVisitSchedule({ studyId, visitData }),
  getFormBindings: fetchFormBindings,
  saveFormBindings: (studyId: number | string, bindingData: FormBindingsData) => saveFormBindings({ studyId, bindingData }),
  validateStudyForPublishing,
  publishStudy,
  changeStudyStatus: (studyId: number | string, newStatus: string) => changeStudyStatus({ studyId, newStatus }),
  getStudyRevisions: fetchStudyRevisions,
  createRevision: (studyId: number | string, revisionData: RevisionCreateData) => createRevision({ studyId, revisionData }),
  getDesignProgress: fetchDesignProgress,
  updateDesignProgress: (studyId: number | string, progressData: DesignProgressUpdate) => updateDesignProgress({ studyId, progressData }),
  initializeDesignProgress,
};

export default StudyDesignService;
