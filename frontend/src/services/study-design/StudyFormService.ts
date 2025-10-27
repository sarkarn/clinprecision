/**
 * Study Form Service (TypeScript)
 * 
 * Manages study-specific form operations including form definitions, templates,
 * and form lifecycle management (lock, approve, retire). Integrates with
 * form_definitions and form_versions tables.
 * 
 * React Query Hooks:
 * - useFormsByStudy: Get all forms for a study
 * - useStudyForm: Get a specific form by ID
 * - useFormsByStudyAndStatus: Get forms filtered by status
 * - useFormsByStudyAndType: Get forms filtered by type
 * - useStudyFormCount: Get count of forms for a study
 * - useAvailableTemplates: Get available form templates
 * - useSearchFormsByName: Search forms by name
 * - useSearchFormsByTag: Search forms by tag
 * - useCreateStudyForm: Create a new form (mutation)
 * - useCreateFormFromTemplate: Create form from template (mutation)
 * - useUpdateStudyForm: Update a form (mutation)
 * - useDeleteStudyForm: Delete a form (mutation)
 * - useLockStudyForm: Lock a form (mutation)
 * - useUnlockStudyForm: Unlock a form (mutation)
 * - useApproveStudyForm: Approve a form (mutation)
 * - useRetireStudyForm: Retire a form (mutation)
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import { FormStatus } from '../../types/domain/DataEntry.types';
import type {
  StudyFormDefinition,
  FormTemplate,
  CreateStudyFormRequest,
  UpdateStudyFormRequest,
  CreateFormFromTemplateRequest,
  FormSearchParams
} from '../../types/domain/DataEntry.types';

// ========== API Base URL Constants ==========
// NEW DDD-aligned URLs (Module 1.3 Phase 2)
const FORM_DEFINITIONS_PATH = '/clinops-ws/api/v1/study-design/form-definitions';
const FORM_TEMPLATES_PATH = '/clinops-ws/api/v1/study-design/form-templates';

// OLD URLs (deprecated - sunset: April 19, 2026)
// const FORM_DEFINITIONS_PATH = '/clinops-ws/api/form-definitions';
// const FORM_TEMPLATES_PATH = '/clinops-ws/api/form-templates';

// ========== Query Key Factory ==========
export const studyFormKeys = {
  all: ['study-forms'] as const,
  study: (studyId: number) => ['study-forms', 'study', studyId] as const,
  studyForms: (studyId: number) => ['study-forms', 'study', studyId, 'list'] as const,
  form: (formId: number) => ['study-forms', 'form', formId] as const,
  byStatus: (studyId: number, status: string) => ['study-forms', 'study', studyId, 'status', status] as const,
  byType: (studyId: number, formType: string) => ['study-forms', 'study', studyId, 'type', formType] as const,
  count: (studyId: number) => ['study-forms', 'study', studyId, 'count'] as const,
  templates: ['study-forms', 'templates'] as const,
  searchByName: (studyId: number, searchTerm: string) => ['study-forms', 'study', studyId, 'search', 'name', searchTerm] as const,
  searchByTag: (studyId: number, tag: string) => ['study-forms', 'study', studyId, 'search', 'tag', tag] as const,
};

// ========== API Functions ==========

/**
 * Get all forms for a specific study
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}
 */
export async function fetchFormsByStudy(studyId: number): Promise<StudyFormDefinition[]> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching forms for study ${studyId}:`, error);
    throw error;
  }
}

/**
 * Get a specific study form by ID
 * GET /clinops-ws/api/v1/study-design/form-definitions/{formId}
 */
export async function fetchStudyFormById(formId: number): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/${formId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching study form with ID ${formId}:`, error);
    throw error;
  }
}

/**
 * Get forms by study and status
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}/status/{status}
 */
export async function fetchFormsByStudyAndStatus(studyId: number, status: string): Promise<StudyFormDefinition[]> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching forms for study ${studyId} with status ${status}:`, error);
    return [];
  }
}

/**
 * Get forms by study and type
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}/type/{formType}
 */
export async function fetchFormsByStudyAndType(studyId: number, formType: string): Promise<StudyFormDefinition[]> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/type/${formType}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching forms for study ${studyId} with type ${formType}:`, error);
    return [];
  }
}

/**
 * Search forms by name within a study
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}/search/name?q={searchTerm}
 */
export async function searchFormsByName(studyId: number, searchTerm: string): Promise<StudyFormDefinition[]> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/search/name`, {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching forms by name in study ${studyId}:`, error);
    return [];
  }
}

/**
 * Search forms by tags within a study
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}/search/tags?q={tag}
 */
export async function searchFormsByTag(studyId: number, tag: string): Promise<StudyFormDefinition[]> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/search/tags`, {
      params: { q: tag }
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching forms by tag in study ${studyId}:`, error);
    return [];
  }
}

/**
 * Get count of forms for a study
 * GET /clinops-ws/api/v1/study-design/form-definitions/study/{studyId}/count
 */
export async function fetchStudyFormCount(studyId: number): Promise<number> {
  try {
    const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/count`);
    return response.data;
  } catch (error) {
    console.error(`Error getting form count for study ${studyId}:`, error);
    return 0;
  }
}

/**
 * Get available form templates
 * GET /clinops-ws/api/v1/study-design/form-templates
 */
export async function fetchAvailableTemplates(): Promise<FormTemplate[]> {
  try {
    const response = await ApiService.get(FORM_TEMPLATES_PATH);
    return response.data;
  } catch (error) {
    console.error('Error fetching form templates:', error);
    throw error;
  }
}

/**
 * Create a new study form from scratch
 * POST /clinops-ws/api/v1/study-design/form-definitions
 */
export async function createStudyForm(formData: CreateStudyFormRequest): Promise<StudyFormDefinition> {
  try {
    console.log('*** StudyFormService.createStudyForm() ENTRY POINT ***');
    console.log('StudyFormService.createStudyForm() called with data:', formData);
    console.log('This should call FormDefinitionController, NOT FormTemplateController');

    const enhancedFormData = {
      ...formData,
      // Map frontend field names to backend DTO field names
      formType: formData.type || formData.formType || 'General',
      structure: formData.formDefinition || formData.structure || '{}',
      // Ensure required fields for form_definitions table
      fields: formData.fields || '[]',
      version: formData.version || '1.0',
      isLatestVersion: true,
      status: formData.status || FormStatus.DRAFT,
      // Ensure templateId is either null or a valid number
      templateId: (formData.templateId && !isNaN(formData.templateId)) ? formData.templateId : null
    };

    console.log('Enhanced form data being sent to API:', enhancedFormData);
    console.log('*** API endpoint:', FORM_DEFINITIONS_PATH);
    console.log('*** Full URL will be: API_BASE_URL + FORM_DEFINITIONS_PATH');
    console.log('*** Expected: http://localhost:8083/clinops-ws/api/v1/study-design/form-definitions');
    console.log('*** This should route to FormDefinitionController.createFormDefinition()');

    const response = await ApiService.post(FORM_DEFINITIONS_PATH, enhancedFormData);
    console.log('*** StudyFormService API response received:', response.data);
    console.log('*** StudyFormService.createStudyForm() COMPLETED SUCCESSFULLY ***');
    return response.data;
  } catch (error) {
    console.error('Error creating study form:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      data: (error as any).response?.data
    });
    throw error;
  }
}

/**
 * Create a new study form from a template
 * POST /clinops-ws/api/v1/study-design/form-definitions/from-template
 */
export async function createFormFromTemplate(
  studyId: number,
  templateId: number,
  formName: string,
  customizations: Partial<CreateStudyFormRequest> = {}
): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.post(`${FORM_DEFINITIONS_PATH}/from-template`, null, {
      params: {
        studyId,
        templateId,
        formName
      }
    });

    // Apply any customizations if the form was created successfully
    if (customizations && Object.keys(customizations).length > 0) {
      return await updateStudyForm(response.data.id, customizations as UpdateStudyFormRequest);
    }

    return response.data;
  } catch (error) {
    console.error('Error creating study form from template:', error);
    // Fallback: Get template and create form manually
    try {
      const templateResponse = await ApiService.get(`${FORM_TEMPLATES_PATH}/${templateId}`);
      const template: FormTemplate = templateResponse.data;

      const formData: CreateStudyFormRequest = {
        studyId,
        name: formName,
        description: `Study form based on ${template.name}`,
        formType: template.type || 'Custom',
        fields: template.fields || '[]',
        structure: template.structure || '{}',
        templateId,
        templateVersion: template.version,
        ...customizations
      };

      return await createStudyForm(formData);
    } catch (fallbackError) {
      console.error('Error in fallback template creation:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Update an existing study form
 * PUT /clinops-ws/api/v1/study-design/form-definitions/{formId}
 */
export async function updateStudyForm(
  formId: number,
  formData: UpdateStudyFormRequest
): Promise<StudyFormDefinition> {
  try {
    const enhancedFormData = {
      ...formData,
      fields: formData.fields || '[]',
      structure: formData.structure || '{}'
    };

    const response = await ApiService.put(`${FORM_DEFINITIONS_PATH}/${formId}`, enhancedFormData);
    return response.data;
  } catch (error) {
    console.error(`Error updating study form ${formId}:`, error);
    throw error;
  }
}

/**
 * Delete a study form
 * DELETE /clinops-ws/api/v1/study-design/form-definitions/{formId}
 */
export async function deleteStudyForm(formId: number): Promise<void> {
  try {
    await ApiService.delete(`${FORM_DEFINITIONS_PATH}/${formId}`);
  } catch (error) {
    console.error(`Error deleting study form ${formId}:`, error);
    throw error;
  }
}

/**
 * Lock a study form (prevent further editing)
 * PATCH /clinops-ws/api/v1/study-design/form-definitions/{formId}/lock
 */
export async function lockStudyForm(formId: number): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.patch(`${FORM_DEFINITIONS_PATH}/${formId}/lock`);
    return response.data;
  } catch (error) {
    console.error(`Error locking study form ${formId}:`, error);
    throw error;
  }
}

/**
 * Unlock a study form (allow editing)
 * PATCH /clinops-ws/api/v1/study-design/form-definitions/{formId}/unlock
 */
export async function unlockStudyForm(formId: number): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.patch(`${FORM_DEFINITIONS_PATH}/${formId}/unlock`);
    return response.data;
  } catch (error) {
    console.error(`Error unlocking study form ${formId}:`, error);
    throw error;
  }
}

/**
 * Approve a study form
 * PATCH /clinops-ws/api/v1/study-design/form-definitions/{formId}/approve
 */
export async function approveStudyForm(formId: number): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.patch(`${FORM_DEFINITIONS_PATH}/${formId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving study form ${formId}:`, error);
    throw error;
  }
}

/**
 * Retire a study form
 * PATCH /clinops-ws/api/v1/study-design/form-definitions/{formId}/retire
 */
export async function retireStudyForm(formId: number): Promise<StudyFormDefinition> {
  try {
    const response = await ApiService.patch(`${FORM_DEFINITIONS_PATH}/${formId}/retire`);
    return response.data;
  } catch (error) {
    console.error(`Error retiring study form ${formId}:`, error);
    throw error;
  }
}

// ========== React Query Hooks ==========

/**
 * Hook to fetch all forms for a study
 */
export function useFormsByStudy(
  studyId: number,
  options?: Omit<UseQueryOptions<StudyFormDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition[], Error>({
    queryKey: studyFormKeys.studyForms(studyId),
    queryFn: () => fetchFormsByStudy(studyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch a specific study form by ID
 */
export function useStudyForm(
  formId: number,
  options?: Omit<UseQueryOptions<StudyFormDefinition, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition, Error>({
    queryKey: studyFormKeys.form(formId),
    queryFn: () => fetchStudyFormById(formId),
    staleTime: 5 * 60 * 1000,
    enabled: !!formId,
    ...options,
  });
}

/**
 * Hook to fetch forms by study and status
 */
export function useFormsByStudyAndStatus(
  studyId: number,
  status: string,
  options?: Omit<UseQueryOptions<StudyFormDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition[], Error>({
    queryKey: studyFormKeys.byStatus(studyId, status),
    queryFn: () => fetchFormsByStudyAndStatus(studyId, status),
    staleTime: 5 * 60 * 1000,
    enabled: !!studyId && !!status,
    ...options,
  });
}

/**
 * Hook to fetch forms by study and type
 */
export function useFormsByStudyAndType(
  studyId: number,
  formType: string,
  options?: Omit<UseQueryOptions<StudyFormDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition[], Error>({
    queryKey: studyFormKeys.byType(studyId, formType),
    queryFn: () => fetchFormsByStudyAndType(studyId, formType),
    staleTime: 5 * 60 * 1000,
    enabled: !!studyId && !!formType,
    ...options,
  });
}

/**
 * Hook to get count of forms for a study
 */
export function useStudyFormCount(
  studyId: number,
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<number, Error>({
    queryKey: studyFormKeys.count(studyId),
    queryFn: () => fetchStudyFormCount(studyId),
    staleTime: 5 * 60 * 1000,
    enabled: !!studyId,
    ...options,
  });
}

/**
 * Hook to fetch available form templates
 */
export function useAvailableTemplates(
  options?: Omit<UseQueryOptions<FormTemplate[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<FormTemplate[], Error>({
    queryKey: studyFormKeys.templates,
    queryFn: fetchAvailableTemplates,
    staleTime: 30 * 60 * 1000, // 30 minutes - templates change infrequently
    ...options,
  });
}

/**
 * Hook to search forms by name
 */
export function useSearchFormsByName(
  studyId: number,
  searchTerm: string,
  options?: Omit<UseQueryOptions<StudyFormDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition[], Error>({
    queryKey: studyFormKeys.searchByName(studyId, searchTerm),
    queryFn: () => searchFormsByName(studyId, searchTerm),
    staleTime: 2 * 60 * 1000,
    enabled: !!studyId && !!searchTerm && searchTerm.length >= 2,
    ...options,
  });
}

/**
 * Hook to search forms by tag
 */
export function useSearchFormsByTag(
  studyId: number,
  tag: string,
  options?: Omit<UseQueryOptions<StudyFormDefinition[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StudyFormDefinition[], Error>({
    queryKey: studyFormKeys.searchByTag(studyId, tag),
    queryFn: () => searchFormsByTag(studyId, tag),
    staleTime: 2 * 60 * 1000,
    enabled: !!studyId && !!tag,
    ...options,
  });
}

/**
 * Hook to create a new study form
 */
export function useCreateStudyForm(
  options?: UseMutationOptions<StudyFormDefinition, Error, CreateStudyFormRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<StudyFormDefinition, Error, CreateStudyFormRequest>({
    mutationFn: createStudyForm,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(data.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.count(data.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.study(data.studyId) });
      
      if (data.status) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.byStatus(data.studyId, data.status) });
      }
      if (data.formType) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.byType(data.studyId, data.formType) });
      }
    },
    ...options,
  });
}

/**
 * Hook to create a form from a template
 */
export function useCreateFormFromTemplate(
  options?: UseMutationOptions<
    StudyFormDefinition,
    Error,
    { studyId: number; templateId: number; formName: string; customizations?: Partial<CreateStudyFormRequest> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    StudyFormDefinition,
    Error,
    { studyId: number; templateId: number; formName: string; customizations?: Partial<CreateStudyFormRequest> }
  >({
    mutationFn: ({ studyId, templateId, formName, customizations }) =>
      createFormFromTemplate(studyId, templateId, formName, customizations),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(data.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.count(data.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.study(data.studyId) });
    },
    ...options,
  });
}

/**
 * Hook to update a study form
 */
export function useUpdateStudyForm(
  options?: UseMutationOptions<
    StudyFormDefinition,
    Error,
    { formId: number; formData: UpdateStudyFormRequest; studyId?: number }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    StudyFormDefinition,
    Error,
    { formId: number; formData: UpdateStudyFormRequest; studyId?: number }
  >({
    mutationFn: ({ formId, formData }) => updateStudyForm(formId, formData),
    onSuccess: (data, variables) => {
      // Invalidate specific form query
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      
      // Invalidate study-level queries
      const studyId = variables.studyId || data.studyId;
      if (studyId) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(studyId) });
        queryClient.invalidateQueries({ queryKey: studyFormKeys.study(studyId) });
      }
    },
    ...options,
  });
}

/**
 * Hook to delete a study form
 */
export function useDeleteStudyForm(
  options?: UseMutationOptions<void, Error, { formId: number; studyId: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { formId: number; studyId: number }>({
    mutationFn: ({ formId }) => deleteStudyForm(formId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.count(variables.studyId) });
      queryClient.invalidateQueries({ queryKey: studyFormKeys.study(variables.studyId) });
    },
    ...options,
  });
}

/**
 * Hook to lock a study form
 */
export function useLockStudyForm(
  options?: UseMutationOptions<StudyFormDefinition, Error, { formId: number; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<StudyFormDefinition, Error, { formId: number; studyId?: number }>({
    mutationFn: ({ formId }) => lockStudyForm(formId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      const studyId = variables.studyId || data.studyId;
      if (studyId) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(studyId) });
      }
    },
    ...options,
  });
}

/**
 * Hook to unlock a study form
 */
export function useUnlockStudyForm(
  options?: UseMutationOptions<StudyFormDefinition, Error, { formId: number; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<StudyFormDefinition, Error, { formId: number; studyId?: number }>({
    mutationFn: ({ formId }) => unlockStudyForm(formId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      const studyId = variables.studyId || data.studyId;
      if (studyId) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(studyId) });
      }
    },
    ...options,
  });
}

/**
 * Hook to approve a study form
 */
export function useApproveStudyForm(
  options?: UseMutationOptions<StudyFormDefinition, Error, { formId: number; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<StudyFormDefinition, Error, { formId: number; studyId?: number }>({
    mutationFn: ({ formId }) => approveStudyForm(formId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      const studyId = variables.studyId || data.studyId;
      if (studyId) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(studyId) });
        queryClient.invalidateQueries({ queryKey: studyFormKeys.byStatus(studyId, FormStatus.APPROVED) });
      }
    },
    ...options,
  });
}

/**
 * Hook to retire a study form
 */
export function useRetireStudyForm(
  options?: UseMutationOptions<StudyFormDefinition, Error, { formId: number; studyId?: number }>
) {
  const queryClient = useQueryClient();

  return useMutation<StudyFormDefinition, Error, { formId: number; studyId?: number }>({
    mutationFn: ({ formId }) => retireStudyForm(formId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyFormKeys.form(variables.formId) });
      const studyId = variables.studyId || data.studyId;
      if (studyId) {
        queryClient.invalidateQueries({ queryKey: studyFormKeys.studyForms(studyId) });
        queryClient.invalidateQueries({ queryKey: studyFormKeys.byStatus(studyId, FormStatus.RETIRED) });
      }
    },
    ...options,
  });
}

// ========== Legacy Compatibility Exports ==========

/**
 * Legacy class-based API (for backward compatibility)
 * @deprecated Use React Query hooks or exported functions instead
 */
const StudyFormService = {
  // Query functions
  getFormsByStudy: fetchFormsByStudy,
  getStudyFormById: fetchStudyFormById,
  getFormsByStudyAndStatus: fetchFormsByStudyAndStatus,
  getFormsByStudyAndType: fetchFormsByStudyAndType,
  searchFormsByName,
  searchFormsByTag,
  getStudyFormCount: fetchStudyFormCount,
  getAvailableTemplates: fetchAvailableTemplates,

  // Mutation functions
  createStudyForm,
  createStudyFormFromTemplate: createFormFromTemplate,
  updateStudyForm,
  deleteStudyForm,
  lockStudyForm,
  unlockStudyForm,
  approveStudyForm,
  retireStudyForm,
};

export default StudyFormService;
