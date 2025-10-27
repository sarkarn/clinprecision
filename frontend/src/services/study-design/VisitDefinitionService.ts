import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import type { ApiResponse } from '../../../clinprecision/src/types';

// ============================================================================
// Types
// ============================================================================

export interface VisitDefinition {
  id?: number;
  visitId?: string; // UUID
  studyId?: number;
  studyDesignUuid?: string;
  armId?: string | null;
  visitName: string;
  visitCode?: string;
  visitType?: string;
  dayOffset?: number;
  windowBefore?: number;
  windowAfter?: number;
  sequence?: number;
  isRequired?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitDefinitionCreateData {
  visitName: string;
  visitCode?: string;
  visitType?: string;
  armId?: string | null;
  dayOffset?: number;
  windowBefore?: number;
  windowAfter?: number;
  sequence?: number;
  isRequired?: boolean;
  description?: string;
}

export interface VisitDefinitionUpdateData extends Partial<VisitDefinitionCreateData> {
  // All fields from create are optional for updates
}

export interface VisitFormBinding {
  id?: number;
  bindingId?: string;
  visitDefinitionId?: number | string;
  visitId?: string;
  formDefinitionId?: number | string;
  formId?: string;
  studyId?: number | string;
  sequence?: number;
  isRequired?: boolean;
}

export interface VisitFormBindingCreateData {
  visitDefinitionId?: number | string;
  visitId?: string;
  formDefinitionId?: number | string;
  formId?: string;
  studyId: number | string;
  sequence?: number;
  isRequired?: boolean;
}

export interface VisitOrderData {
  visitOrder: string[];
}

// ============================================================================
// Core API Functions - Visit Definitions
// ============================================================================

/**
 * Get all visits for a study (auto-initializes StudyDesign if needed)
 * NEW URL: /api/v1/study-design/studies/{studyId}/visits
 */
export const fetchVisitsByStudy = async (studyId: number | string): Promise<VisitDefinition[]> => {
  const response = await ApiService.get(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits`);
  const apiResponse = response.data as ApiResponse<VisitDefinition[]>;
  return apiResponse.data || response.data || [];
};

/**
 * Get a visit by ID
 * NEW URL: /api/v1/study-design/designs/{studyDesignUuid}/visits/{visitId}
 */
export const fetchVisitById = async ({ visitId, studyDesignUuid }: { visitId: string; studyDesignUuid: string }): Promise<VisitDefinition> => {
  const response = await ApiService.get(`/clinops-ws/api/v1/study-design/designs/${studyDesignUuid}/visits/${visitId}`);
  const apiResponse = response.data as ApiResponse<VisitDefinition>;
  return apiResponse.data || response.data;
};

/**
 * Create a new visit for a study (auto-initializes StudyDesign if needed)
 * NEW URL: /api/v1/study-design/studies/{studyId}/visits
 */
export const createVisit = async ({ studyId, visitData }: { studyId: number | string; visitData: VisitDefinitionCreateData }): Promise<VisitDefinition> => {
  const response = await ApiService.post(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits`, visitData);
  const apiResponse = response.data as ApiResponse<VisitDefinition>;
  return apiResponse.data || response.data;
};

/**
 * Update an existing visit (auto-initializes StudyDesign if needed)
 * NEW URL: /api/v1/study-design/studies/{studyId}/visits/{visitId}
 */
export const updateVisit = async ({ studyId, visitId, visitData }: { studyId: number | string; visitId: string; visitData: VisitDefinitionUpdateData }): Promise<VisitDefinition> => {
  const response = await ApiService.put(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits/${visitId}`, visitData);
  const apiResponse = response.data as ApiResponse<VisitDefinition>;
  return apiResponse.data || response.data;
};

/**
 * Delete a visit by ID (auto-initializes StudyDesign if needed)
 * NEW URL: /api/v1/study-design/studies/{studyId}/visits/{visitId}
 */
export const deleteVisit = async ({ studyId, visitId }: { studyId: number | string; visitId: string }): Promise<{ success: boolean }> => {
  await ApiService.delete(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits/${visitId}`);
  return { success: true };
};

// ============================================================================
// Visit Arm Association Functions
// ============================================================================

/**
 * Get all visits for a specific arm in a study
 */
export const fetchVisitsByArm = async ({ studyId, armId }: { studyId: number | string; armId: string }): Promise<VisitDefinition[]> => {
  const response = await ApiService.get(`/api/studies/${studyId}/visits?armId=${armId}`);
  const apiResponse = response.data as ApiResponse<VisitDefinition[]>;
  return apiResponse.data || response.data || [];
};

/**
 * Add a visit to an arm in a study
 */
export const addVisitToArm = async ({ studyId, armId, visitId, visitData = {} }: { studyId: number | string; armId: string; visitId: string; visitData?: VisitDefinitionUpdateData }): Promise<VisitDefinition> => {
  const updatedVisitData: VisitDefinitionUpdateData = { ...visitData, armId };
  const response = await ApiService.put(`/api/studies/${studyId}/visits/${visitId}`, updatedVisitData);
  const apiResponse = response.data as ApiResponse<VisitDefinition>;
  return apiResponse.data || response.data;
};

/**
 * Remove a visit from an arm
 */
export const removeVisitFromArm = async ({ studyId, visitId, visitData = {} }: { studyId: number | string; visitId: string; visitData?: VisitDefinitionUpdateData }): Promise<VisitDefinition> => {
  const updatedVisitData: VisitDefinitionUpdateData = { ...visitData, armId: null };
  const response = await ApiService.put(`/api/studies/${studyId}/visits/${visitId}`, updatedVisitData);
  const apiResponse = response.data as ApiResponse<VisitDefinition>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Visit Ordering Functions
// ============================================================================

/**
 * Order visits within a study
 */
export const orderVisits = async ({ studyId, visitOrder }: { studyId: number | string; visitOrder: string[] }): Promise<{ success: boolean }> => {
  await ApiService.put(`/api/studies/${studyId}/visits/order`, { visitOrder });
  return { success: true };
};

// ============================================================================
// Visit Forms Functions
// ============================================================================

/**
 * Get all forms associated with a visit
 */
export const fetchVisitForms = async ({ studyId, visitId }: { studyId: number | string; visitId: string }): Promise<any[]> => {
  try {
    const response = await ApiService.get(`/api/studies/${studyId}/visits/${visitId}/forms`);
    const apiResponse = response.data as ApiResponse<any[]>;
    return apiResponse.data || response.data || [];
  } catch (error) {
    console.error(`Error fetching forms for visit ${visitId}:`, error);
    return [];
  }
};

// ============================================================================
// Form Binding Functions
// ============================================================================

/**
 * Get form bindings for all visits in a study
 */
export const fetchVisitFormBindings = async (studyId: number | string): Promise<VisitFormBinding[]> => {
  try {
    const response = await ApiService.get(`/api/studies/${studyId}/form-bindings`);
    const apiResponse = response.data as ApiResponse<VisitFormBinding[]>;
    return apiResponse.data || response.data || [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`Form bindings endpoint for study ${studyId} returned 404, returning empty array`);
      return [];
    }
    console.error(`Error fetching form bindings for study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Create or update form binding for a visit
 */
export const createFormBinding = async ({ visitId, formId, bindingData }: { visitId: string; formId: string; bindingData: VisitFormBindingCreateData }): Promise<VisitFormBinding> => {
  console.log('Service createFormBinding called with:', { visitId, formId, bindingData });
  const studyId = bindingData.studyId;
  console.log('Using endpoint: /api/studies/' + studyId + '/visits/' + visitId + '/forms/' + formId);
  
  const response = await ApiService.post(`/api/studies/${studyId}/visits/${visitId}/forms/${formId}`, {
    visitDefinitionId: visitId,
    formDefinitionId: formId,
    ...bindingData
  });
  const apiResponse = response.data as ApiResponse<VisitFormBinding>;
  return apiResponse.data || response.data;
};

/**
 * Update visit form binding
 * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
 */
export const updateVisitFormBinding = async ({ bindingId, updates }: { bindingId: string; updates: Partial<VisitFormBindingCreateData> }): Promise<VisitFormBinding> => {
  const response = await ApiService.put(`/api/v1/study-design/form-bindings/${bindingId}`, updates);
  const apiResponse = response.data as ApiResponse<VisitFormBinding>;
  return apiResponse.data || response.data;
};

/**
 * Remove form binding from a visit
 * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
 */
export const removeFormBinding = async (bindingId: string): Promise<{ success: boolean }> => {
  await ApiService.delete(`/api/v1/study-design/form-bindings/${bindingId}`);
  return { success: true };
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch visits for a study
 * 
 * @example
 * ```tsx
 * const { data: visits, isLoading } = useVisitsByStudy(studyId);
 * ```
 */
export const useVisitsByStudy = (studyId: number | string | undefined): UseQueryResult<VisitDefinition[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'visits'],
    queryFn: () => fetchVisitsByStudy(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to fetch a single visit by ID
 * 
 * @example
 * ```tsx
 * const { data: visit } = useVisit({ visitId, studyDesignUuid });
 * ```
 */
export const useVisit = ({ visitId, studyDesignUuid }: { visitId?: string; studyDesignUuid?: string }): UseQueryResult<VisitDefinition, Error> => {
  return useQuery({
    queryKey: ['visit', visitId, studyDesignUuid],
    queryFn: () => fetchVisitById({ visitId: visitId!, studyDesignUuid: studyDesignUuid! }),
    enabled: !!visitId && !!studyDesignUuid,
  });
};

/**
 * Hook to create a visit
 * 
 * @example
 * ```tsx
 * const createVisitMutation = useCreateVisit();
 * await createVisitMutation.mutateAsync({ studyId, visitData });
 * ```
 */
export const useCreateVisit = (): UseMutationResult<VisitDefinition, Error, { studyId: number | string; visitData: VisitDefinitionCreateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVisit,
    onSuccess: (data, variables) => {
      // Invalidate visits list
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visits'] });
      // Invalidate visit schedule
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-schedule'] });
    },
  });
};

/**
 * Hook to update a visit
 * 
 * @example
 * ```tsx
 * const updateVisitMutation = useUpdateVisit();
 * await updateVisitMutation.mutateAsync({ studyId, visitId, visitData });
 * ```
 */
export const useUpdateVisit = (): UseMutationResult<VisitDefinition, Error, { studyId: number | string; visitId: string; visitData: VisitDefinitionUpdateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVisit,
    onSuccess: (data, variables) => {
      // Update visit in cache
      queryClient.setQueryData(['visit', variables.visitId], data);
      // Invalidate visits list
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visits'] });
      // Invalidate visit schedule
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-schedule'] });
    },
  });
};

/**
 * Hook to delete a visit
 * 
 * @example
 * ```tsx
 * const deleteVisitMutation = useDeleteVisit();
 * await deleteVisitMutation.mutateAsync({ studyId, visitId });
 * ```
 */
export const useDeleteVisit = (): UseMutationResult<{ success: boolean }, Error, { studyId: number | string; visitId: string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVisit,
    onSuccess: (data, variables) => {
      // Remove visit from cache
      queryClient.removeQueries({ queryKey: ['visit', variables.visitId] });
      // Invalidate visits list
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visits'] });
      // Invalidate visit schedule
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-schedule'] });
    },
  });
};

/**
 * Hook to fetch visits by arm
 * 
 * @example
 * ```tsx
 * const { data: armVisits } = useVisitsByArm({ studyId, armId });
 * ```
 */
export const useVisitsByArm = ({ studyId, armId }: { studyId?: number | string; armId?: string }): UseQueryResult<VisitDefinition[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'arm', armId, 'visits'],
    queryFn: () => fetchVisitsByArm({ studyId: studyId!, armId: armId! }),
    enabled: !!studyId && !!armId,
  });
};

/**
 * Hook to fetch visit form bindings
 * 
 * @example
 * ```tsx
 * const { data: bindings } = useVisitFormBindings(studyId);
 * ```
 */
export const useVisitFormBindings = (studyId: number | string | undefined): UseQueryResult<VisitFormBinding[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'visit-form-bindings'],
    queryFn: () => fetchVisitFormBindings(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to create form binding
 * 
 * @example
 * ```tsx
 * const createBindingMutation = useCreateFormBinding();
 * await createBindingMutation.mutateAsync({ visitId, formId, bindingData });
 * ```
 */
export const useCreateFormBinding = (): UseMutationResult<VisitFormBinding, Error, { visitId: string; formId: string; bindingData: VisitFormBindingCreateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFormBinding,
    onSuccess: (data, variables) => {
      // Invalidate form bindings
      queryClient.invalidateQueries({ queryKey: ['study', variables.bindingData.studyId, 'visit-form-bindings'] });
      // Invalidate form bindings for study design
      queryClient.invalidateQueries({ queryKey: ['study', variables.bindingData.studyId, 'form-bindings'] });
    },
  });
};

/**
 * Hook to update form binding
 * 
 * @example
 * ```tsx
 * const updateBindingMutation = useUpdateFormBinding();
 * await updateBindingMutation.mutateAsync({ bindingId, updates });
 * ```
 */
export const useUpdateFormBinding = (): UseMutationResult<VisitFormBinding, Error, { bindingId: string; updates: Partial<VisitFormBindingCreateData>; studyId?: number | string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bindingId, updates }) => updateVisitFormBinding({ bindingId, updates }),
    onSuccess: (data, variables) => {
      // Invalidate form bindings if studyId provided
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-form-bindings'] });
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'form-bindings'] });
      }
    },
  });
};

/**
 * Hook to remove form binding
 * 
 * @example
 * ```tsx
 * const removeBindingMutation = useRemoveFormBinding();
 * await removeBindingMutation.mutateAsync({ bindingId, studyId });
 * ```
 */
export const useRemoveFormBinding = (): UseMutationResult<{ success: boolean }, Error, { bindingId: string; studyId?: number | string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bindingId }) => removeFormBinding(bindingId),
    onSuccess: (data, variables) => {
      // Invalidate form bindings if studyId provided
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-form-bindings'] });
        queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'form-bindings'] });
      }
    },
  });
};

// ============================================================================
// Legacy Service Export (for backwards compatibility)
// ============================================================================

const VisitDefinitionService = {
  // Core visit operations
  getVisitsByStudy: fetchVisitsByStudy,
  getStudyVisits: fetchVisitsByStudy, // Legacy alias
  getVisitById: (visitId: string, studyDesignUuid: string) => fetchVisitById({ visitId, studyDesignUuid }),
  createVisit: (studyId: number | string, visitData: VisitDefinitionCreateData) => createVisit({ studyId, visitData }),
  createVisitForStudy: (studyId: number | string, visitData: VisitDefinitionCreateData) => createVisit({ studyId, visitData }), // Legacy alias
  updateVisit: (studyId: number | string, visitId: string, visitData: VisitDefinitionUpdateData) => updateVisit({ studyId, visitId, visitData }),
  updateVisitForStudy: (studyId: number | string, visitId: string, visitData: VisitDefinitionUpdateData) => updateVisit({ studyId, visitId, visitData }), // Legacy alias
  deleteVisit: (studyId: number | string, visitId: string) => deleteVisit({ studyId, visitId }),
  deleteVisitFromStudy: (studyId: number | string, visitId: string) => deleteVisit({ studyId, visitId }), // Legacy alias
  
  // Arm operations
  getVisitsByArm: (studyId: number | string, armId: string) => fetchVisitsByArm({ studyId, armId }),
  addVisitToArm: (studyId: number | string, armId: string, visitId: string, visitData?: VisitDefinitionUpdateData) => addVisitToArm({ studyId, armId, visitId, visitData }),
  removeVisitFromArm: (studyId: number | string, visitId: string, visitData?: VisitDefinitionUpdateData) => removeVisitFromArm({ studyId, visitId, visitData }),
  
  // Ordering
  orderVisits: (studyId: number | string, visitOrder: string[]) => orderVisits({ studyId, visitOrder }),
  
  // Forms
  getVisitForms: (studyId: number | string, visitId: string) => fetchVisitForms({ studyId, visitId }),
  
  // Form bindings
  getVisitFormBindings: fetchVisitFormBindings,
  createFormBinding: (visitId: string, formId: string, bindingData: VisitFormBindingCreateData) => createFormBinding({ visitId, formId, bindingData }),
  createVisitFormBinding: (bindingData: VisitFormBindingCreateData) => {
    const visitId = (bindingData.visitDefinitionId || bindingData.visitId) as string;
    const formId = (bindingData.formDefinitionId || bindingData.formId) as string;
    return createFormBinding({ visitId, formId, bindingData });
  },
  updateVisitFormBinding: (bindingId: string, updates: Partial<VisitFormBindingCreateData>) => updateVisitFormBinding({ bindingId, updates }),
  removeFormBinding,
  deleteVisitFormBinding: removeFormBinding,
};

export default VisitDefinitionService;
