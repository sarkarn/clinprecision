/**
 * Visit Form Service (TypeScript)
 * 
 * Manages visit-form associations through VisitFormController endpoints.
 * Handles form binding, visit-form matrix, and association management.
 * 
 * React Query Hooks:
 * - useFormsByVisit: Get all forms for a visit
 * - useRequiredFormsByVisit: Get required forms for a visit
 * - useOptionalFormsByVisit: Get optional forms for a visit
 * - useVisitsByForm: Get all visits using a specific form
 * - useVisitFormMatrix: Get visit-form matrix for a study
 * - useFormBindings: Get form bindings for a study
 * - useConditionalForms: Get conditional forms for a study
 * - useCreateVisitFormAssociation: Create visit-form association
 * - useUpdateVisitFormAssociation: Update visit-form association
 * - useDeleteVisitFormAssociation: Delete visit-form association
 * - useCreateFormBinding: Create form binding
 * - useUpdateFormBinding: Update form binding
 * - useDeleteFormBinding: Delete form binding
 * - useReorderFormsInVisit: Reorder forms within a visit
 * - useCreateBulkVisitFormAssociations: Bulk create associations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import type {
  VisitFormAssociation,
  VisitFormMatrixEntry,
  FormBindingData,
  VisitWithForms,
  FormWithVisits,
  StudyVisitFormMatrix
} from '../../types/domain/DataEntry.types';

// ========== API Base URL Constants ==========
const VISIT_FORMS_BASE = '/api/visit-forms';
const VISITS_BASE = '/api/visits';
const FORMS_BASE = '/api/forms';
const STUDIES_BASE = '/api/studies';
const FORM_BINDINGS_BASE = '/api/v1/study-design/form-bindings';

// ========== Query Key Factory ==========
export const visitFormKeys = {
  all: ['visit-forms'] as const,
  visitForms: (visitId: number) => ['visit-forms', 'visit', visitId] as const,
  requiredForms: (visitId: number) => ['visit-forms', 'visit', visitId, 'required'] as const,
  optionalForms: (visitId: number) => ['visit-forms', 'visit', visitId, 'optional'] as const,
  formVisits: (formId: number) => ['visit-forms', 'form', formId, 'visits'] as const,
  studyMatrix: (studyId: number) => ['visit-forms', 'study', studyId, 'matrix'] as const,
  studyBindings: (studyId: number) => ['visit-forms', 'study', studyId, 'bindings'] as const,
  conditionalForms: (studyId: number) => ['visit-forms', 'study', studyId, 'conditional'] as const,
};

// ========== API Functions ==========

/**
 * Get all forms associated with a visit
 * GET /api/visits/{visitId}/forms
 */
export async function fetchFormsByVisit(visitId: number): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.get(`${VISITS_BASE}/${visitId}/forms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms for visit:', error);
    throw error;
  }
}

/**
 * Get required forms for a visit
 * GET /api/visits/{visitId}/forms/required
 */
export async function fetchRequiredFormsByVisit(visitId: number): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.get(`${VISITS_BASE}/${visitId}/forms/required`);
    return response.data;
  } catch (error) {
    console.error('Error fetching required forms for visit:', error);
    throw error;
  }
}

/**
 * Get optional forms for a visit
 * GET /api/visits/{visitId}/forms/optional
 */
export async function fetchOptionalFormsByVisit(visitId: number): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.get(`${VISITS_BASE}/${visitId}/forms/optional`);
    return response.data;
  } catch (error) {
    console.error('Error fetching optional forms for visit:', error);
    throw error;
  }
}

/**
 * Get all visits that use a specific form
 * GET /api/forms/{formId}/visits
 */
export async function fetchVisitsByForm(formId: number): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.get(`${FORMS_BASE}/${formId}/visits`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visits for form:', error);
    throw error;
  }
}

/**
 * Get visit-form matrix for a study (all associations)
 * GET /api/studies/{studyId}/visit-forms
 */
export async function fetchVisitFormMatrix(studyId: number): Promise<VisitFormMatrixEntry[]> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/visit-forms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visit-form matrix for study:', error);
    throw error;
  }
}

/**
 * Get form bindings for a study (alias for visit-form matrix)
 * GET /api/studies/{studyId}/form-bindings
 */
export async function fetchFormBindings(studyId: number): Promise<VisitFormMatrixEntry[]> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/form-bindings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form bindings for study:', error);
    throw error;
  }
}

/**
 * Get conditional forms for a study
 * GET /api/studies/{studyId}/visit-forms/conditional
 */
export async function fetchConditionalForms(studyId: number): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.get(`${STUDIES_BASE}/${studyId}/visit-forms/conditional`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conditional forms for study:', error);
    throw error;
  }
}

/**
 * Create a new visit-form association
 * POST /api/visit-forms
 */
export async function createVisitFormAssociation(visitFormData: Partial<VisitFormAssociation>): Promise<VisitFormAssociation> {
  try {
    const response = await ApiService.post(VISIT_FORMS_BASE, visitFormData);
    return response.data;
  } catch (error) {
    console.error('Error creating visit-form association:', error);
    throw error;
  }
}

/**
 * Update an existing visit-form association
 * PUT /api/visit-forms/{associationId}
 */
export async function updateVisitFormAssociation(
  associationId: number,
  visitFormData: Partial<VisitFormAssociation>
): Promise<VisitFormAssociation> {
  try {
    const response = await ApiService.put(`${VISIT_FORMS_BASE}/${associationId}`, visitFormData);
    return response.data;
  } catch (error) {
    console.error('Error updating visit-form association:', error);
    throw error;
  }
}

/**
 * Delete a visit-form association by ID
 * DELETE /api/visit-forms/{associationId}
 */
export async function deleteVisitFormAssociation(associationId: number): Promise<void> {
  try {
    await ApiService.delete(`${VISIT_FORMS_BASE}/${associationId}`);
  } catch (error) {
    console.error('Error deleting visit-form association:', error);
    throw error;
  }
}

/**
 * Delete a visit-form association by visit and form IDs
 * DELETE /api/visits/{visitId}/forms/{formId}
 */
export async function deleteVisitFormAssociationByIds(visitId: number, formId: number): Promise<void> {
  try {
    await ApiService.delete(`${VISITS_BASE}/${visitId}/forms/${formId}`);
  } catch (error) {
    console.error('Error deleting visit-form association by IDs:', error);
    throw error;
  }
}

/**
 * Create a new form binding for a visit
 * POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}
 */
export async function createFormBinding(
  studyId: number,
  visitId: number,
  formId: number,
  bindingData: FormBindingData = {}
): Promise<VisitFormAssociation> {
  try {
    const payload = {
      visitDefinitionId: visitId,
      formDefinitionId: formId,
      isRequired: bindingData.isRequired !== false, // default to true
      isConditional: bindingData.isConditional || false,
      conditionalLogic: bindingData.conditionalLogic || null,
      displayOrder: bindingData.displayOrder || 1,
      instructions: bindingData.instructions || null,
      ...bindingData
    };
    
    const response = await ApiService.post(
      `${STUDIES_BASE}/${studyId}/visits/${visitId}/forms/${formId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error creating form binding:', error);
    throw error;
  }
}

/**
 * Remove a form binding from a visit
 * DELETE /api/studies/{studyId}/visits/{visitId}/forms/{formId}
 */
export async function removeFormBinding(studyId: number, visitId: number, formId: number): Promise<void> {
  try {
    await ApiService.delete(`${STUDIES_BASE}/${studyId}/visits/${visitId}/forms/${formId}`);
  } catch (error) {
    console.error('Error removing form binding:', error);
    throw error;
  }
}

/**
 * Update a form binding by ID
 * PUT /api/v1/study-design/form-bindings/{bindingId}
 */
export async function updateFormBinding(
  bindingId: number,
  updates: Partial<FormBindingData>
): Promise<VisitFormAssociation> {
  try {
    const response = await ApiService.put(`${FORM_BINDINGS_BASE}/${bindingId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating form binding:', error);
    throw error;
  }
}

/**
 * Delete a form binding by ID
 * DELETE /api/v1/study-design/form-bindings/{bindingId}
 */
export async function deleteFormBinding(bindingId: number): Promise<void> {
  try {
    await ApiService.delete(`${FORM_BINDINGS_BASE}/${bindingId}`);
  } catch (error) {
    console.error('Error deleting form binding:', error);
    throw error;
  }
}

/**
 * Reorder forms within a visit
 * PUT /api/visits/{visitId}/forms/reorder
 */
export async function reorderFormsInVisit(visitId: number, formIds: number[]): Promise<void> {
  try {
    await ApiService.put(`${VISITS_BASE}/${visitId}/forms/reorder`, formIds);
  } catch (error) {
    console.error('Error reordering forms in visit:', error);
    throw error;
  }
}

/**
 * Bulk create visit-form associations
 * POST /api/visit-forms/bulk
 */
export async function createBulkVisitFormAssociations(
  visitFormAssociations: Partial<VisitFormAssociation>[]
): Promise<VisitFormAssociation[]> {
  try {
    const response = await ApiService.post(`${VISIT_FORMS_BASE}/bulk`, visitFormAssociations);
    return response.data;
  } catch (error) {
    console.error('Error creating bulk visit-form associations:', error);
    throw error;
  }
}

// ========== React Query Hooks ==========

/**
 * Hook to fetch all forms associated with a visit
 */
export function useFormsByVisit(
  visitId: number,
  options?: Omit<UseQueryOptions<VisitFormAssociation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormAssociation[], Error>({
    queryKey: visitFormKeys.visitForms(visitId),
    queryFn: () => fetchFormsByVisit(visitId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!visitId,
    ...options,
  });
}

/**
 * Hook to fetch required forms for a visit
 */
export function useRequiredFormsByVisit(
  visitId: number,
  options?: Omit<UseQueryOptions<VisitFormAssociation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormAssociation[], Error>({
    queryKey: visitFormKeys.requiredForms(visitId),
    queryFn: () => fetchRequiredFormsByVisit(visitId),
    staleTime: 5 * 60 * 1000,
    enabled: !!visitId,
    ...options,
  });
}

/**
 * Hook to fetch optional forms for a visit
 */
export function useOptionalFormsByVisit(
  visitId: number,
  options?: Omit<UseQueryOptions<VisitFormAssociation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormAssociation[], Error>({
    queryKey: visitFormKeys.optionalForms(visitId),
    queryFn: () => fetchOptionalFormsByVisit(visitId),
    staleTime: 5 * 60 * 1000,
    enabled: !!visitId,
    ...options,
  });
}

/**
 * Hook to fetch all visits that use a specific form
 */
export function useVisitsByForm(
  formId: number,
  options?: Omit<UseQueryOptions<VisitFormAssociation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormAssociation[], Error>({
    queryKey: visitFormKeys.formVisits(formId),
    queryFn: () => fetchVisitsByForm(formId),
    staleTime: 5 * 60 * 1000,
    enabled: !!formId,
    ...options,
  });
}

/**
 * Hook to fetch visit-form matrix for a study
 */
export function useVisitFormMatrix(
  studyId: number,
  options?: Omit<UseQueryOptions<VisitFormMatrixEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormMatrixEntry[], Error>({
    queryKey: visitFormKeys.studyMatrix(studyId),
    queryFn: () => fetchVisitFormMatrix(studyId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch form bindings for a study
 */
export function useFormBindings(
  studyId: number,
  options?: Omit<UseQueryOptions<VisitFormMatrixEntry[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormMatrixEntry[], Error>({
    queryKey: visitFormKeys.studyBindings(studyId),
    queryFn: () => fetchFormBindings(studyId),
    staleTime: 10 * 60 * 1000,
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch conditional forms for a study
 */
export function useConditionalForms(
  studyId: number,
  options?: Omit<UseQueryOptions<VisitFormAssociation[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<VisitFormAssociation[], Error>({
    queryKey: visitFormKeys.conditionalForms(studyId),
    queryFn: () => fetchConditionalForms(studyId),
    staleTime: 10 * 60 * 1000,
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to create a new visit-form association
 */
export function useCreateVisitFormAssociation(
  options?: UseMutationOptions<VisitFormAssociation, Error, Partial<VisitFormAssociation>>
) {
  const queryClient = useQueryClient();

  return useMutation<VisitFormAssociation, Error, Partial<VisitFormAssociation>>({
    mutationFn: createVisitFormAssociation,
    onSuccess: (data) => {
      // Invalidate relevant queries
      if (data.visitDefinitionId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(data.visitDefinitionId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(data.visitDefinitionId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(data.visitDefinitionId) });
      }
      if (data.formDefinitionId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(data.formDefinitionId) });
      }
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(data.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(data.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to update an existing visit-form association
 */
export function useUpdateVisitFormAssociation(
  options?: UseMutationOptions<VisitFormAssociation, Error, { associationId: number; data: Partial<VisitFormAssociation> }>
) {
  const queryClient = useQueryClient();

  return useMutation<VisitFormAssociation, Error, { associationId: number; data: Partial<VisitFormAssociation> }>({
    mutationFn: ({ associationId, data }) => updateVisitFormAssociation(associationId, data),
    onSuccess: (data) => {
      if (data.visitDefinitionId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(data.visitDefinitionId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(data.visitDefinitionId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(data.visitDefinitionId) });
      }
      if (data.formDefinitionId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(data.formDefinitionId) });
      }
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(data.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(data.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a visit-form association
 */
export function useDeleteVisitFormAssociation(
  options?: UseMutationOptions<void, Error, { associationId: number; visitId?: number; formId?: number; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { associationId: number; visitId?: number; formId?: number; studyId?: number }>({
    mutationFn: ({ associationId }) => deleteVisitFormAssociation(associationId),
    onSuccess: (_, variables) => {
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(variables.visitId) });
      }
      if (variables.formId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(variables.formId) });
      }
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to create a form binding
 */
export function useCreateFormBinding(
  options?: UseMutationOptions<
    VisitFormAssociation,
    Error,
    { studyId: number; visitId: number; formId: number; bindingData?: FormBindingData }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    VisitFormAssociation,
    Error,
    { studyId: number; visitId: number; formId: number; bindingData?: FormBindingData }
  >({
    mutationFn: ({ studyId, visitId, formId, bindingData }) => 
      createFormBinding(studyId, visitId, formId, bindingData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(variables.formId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to update a form binding
 */
export function useUpdateFormBinding(
  options?: UseMutationOptions<
    VisitFormAssociation,
    Error,
    { bindingId: number; updates: Partial<FormBindingData>; studyId?: number; visitId?: number; formId?: number }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    VisitFormAssociation,
    Error,
    { bindingId: number; updates: Partial<FormBindingData>; studyId?: number; visitId?: number; formId?: number }
  >({
    mutationFn: ({ bindingId, updates }) => updateFormBinding(bindingId, updates),
    onSuccess: (data, variables) => {
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(variables.visitId) });
      }
      if (variables.formId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(variables.formId) });
      }
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to delete a form binding
 */
export function useDeleteFormBinding(
  options?: UseMutationOptions<void, Error, { bindingId: number; studyId?: number; visitId?: number; formId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { bindingId: number; studyId?: number; visitId?: number; formId?: number }>({
    mutationFn: ({ bindingId }) => deleteFormBinding(bindingId),
    onSuccess: (_, variables) => {
      if (variables.visitId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(variables.visitId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(variables.visitId) });
      }
      if (variables.formId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.formVisits(variables.formId) });
      }
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to reorder forms within a visit
 */
export function useReorderFormsInVisit(
  options?: UseMutationOptions<void, Error, { visitId: number; formIds: number[]; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { visitId: number; formIds: number[]; studyId?: number }>({
    mutationFn: ({ visitId, formIds }) => reorderFormsInVisit(visitId, formIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: visitFormKeys.visitForms(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.requiredForms(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: visitFormKeys.optionalForms(variables.visitId) });
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      }
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
    },
    ...options,
  });
}

/**
 * Hook to bulk create visit-form associations
 */
export function useCreateBulkVisitFormAssociations(
  options?: UseMutationOptions<
    VisitFormAssociation[],
    Error,
    { associations: Partial<VisitFormAssociation>[]; studyId?: number }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    VisitFormAssociation[],
    Error,
    { associations: Partial<VisitFormAssociation>[]; studyId?: number }
  >({
    mutationFn: ({ associations }) => createBulkVisitFormAssociations(associations),
    onSuccess: (_, variables) => {
      // Invalidate all visit-form queries since bulk operations affect multiple entities
      queryClient.invalidateQueries({ queryKey: visitFormKeys.all });
      if (variables.studyId) {
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyMatrix(variables.studyId) });
        queryClient.invalidateQueries({ queryKey: visitFormKeys.studyBindings(variables.studyId) });
      }
    },
    ...options,
  });
}

// ========== Utility Functions ==========

/**
 * Add multiple forms to a visit
 * Convenience function for bulk form binding
 */
export async function addFormsToVisit(
  studyId: number,
  visitId: number,
  formIds: number[],
  bindingOptions: FormBindingData = {}
): Promise<VisitFormAssociation[]> {
  try {
    const promises = formIds.map(formId =>
      createFormBinding(studyId, visitId, formId, bindingOptions)
    );
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error adding forms to visit:', error);
    throw error;
  }
}

/**
 * Remove multiple forms from a visit
 * Convenience function for bulk form removal
 */
export async function removeFormsFromVisit(
  studyId: number,
  visitId: number,
  formIds: number[]
): Promise<void> {
  try {
    const promises = formIds.map(formId =>
      removeFormBinding(studyId, visitId, formId)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error removing forms from visit:', error);
    throw error;
  }
}

/**
 * Replace all forms for a visit
 * Removes existing forms and adds new ones
 */
export async function replaceVisitForms(
  studyId: number,
  visitId: number,
  newFormIds: number[],
  bindingOptions: FormBindingData = {}
): Promise<VisitFormAssociation[]> {
  try {
    // First get current forms
    const currentForms = await fetchFormsByVisit(visitId);

    // Remove all current forms
    if (currentForms && currentForms.length > 0) {
      const currentFormIds = currentForms.map(form => form.formDefinitionId);
      await removeFormsFromVisit(studyId, visitId, currentFormIds);
    }

    // Add new forms
    if (newFormIds && newFormIds.length > 0) {
      return await addFormsToVisit(studyId, visitId, newFormIds, bindingOptions);
    }

    return [];
  } catch (error) {
    console.error('Error replacing visit forms:', error);
    throw error;
  }
}

// ========== Legacy Compatibility Exports ==========

/**
 * Legacy class-based API (for backward compatibility)
 * @deprecated Use React Query hooks or exported functions instead
 */
const VisitFormService = {
  // Query functions
  getFormsByVisitId: fetchFormsByVisit,
  getRequiredFormsByVisitId: fetchRequiredFormsByVisit,
  getOptionalFormsByVisitId: fetchOptionalFormsByVisit,
  getVisitsByFormId: fetchVisitsByForm,
  getVisitFormMatrixByStudyId: fetchVisitFormMatrix,
  getFormBindingsByStudyId: fetchFormBindings,
  getConditionalFormsByStudyId: fetchConditionalForms,

  // Mutation functions
  createVisitFormAssociation,
  updateVisitFormAssociation,
  deleteVisitFormAssociation,
  deleteVisitFormAssociationByIds,
  createFormBinding,
  removeFormBinding,
  updateFormBinding,
  deleteFormBinding,
  reorderFormsInVisit,
  createBulkVisitFormAssociations,

  // Utility functions
  addFormsToVisit,
  removeFormsFromVisit,
  replaceVisitForms,
};

export default VisitFormService;
