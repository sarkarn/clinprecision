/**
 * Form Data Service (TypeScript)
 * 
 * API client for form data submissions
 * Handles screening, enrollment, and visit form submissions
 * 
 * Backend Endpoint: /clinops-ws/api/v1/form-data
 * Controller: StudyFormDataController
 * Service Port: 8082 (clinprecision-clinops-service)
 * 
 * @see Backend: StudyFormDataController.java
 * @see Types: DataEntry.types.ts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '@packages/api/client/ApiService';
import type { FormDataRecord, FormDataSubmission, FormDataSubmissionResponse } from '@shared/types/form.types';
import { FormDataStatus } from '@shared/types/status.types';

const API_BASE = '/clinops-ws/api/v1/form-data';

// ==================== API Functions ====================

/**
 * Submit form data
 * 
 * Used for:
 * - Screening assessment forms
 * - Enrollment forms
 * - Visit data collection forms
 * - Unscheduled event forms
 */
export async function submitFormData(formSubmission: FormDataSubmission): Promise<FormDataSubmissionResponse> {
  // Validation
  const requiredFields: (keyof FormDataSubmission)[] = ['studyId', 'formId', 'formData'];
  for (const field of requiredFields) {
    if (!formSubmission[field]) {
      throw new Error(`Required field missing: ${String(field)}`);
    }
  }

  // Validate form data is not empty
  if (!formSubmission.formData || Object.keys(formSubmission.formData).length === 0) {
    throw new Error('Form data cannot be empty');
  }

  // Validate status
  const validStatuses = [FormDataStatus.DRAFT, FormDataStatus.SUBMITTED, FormDataStatus.LOCKED];
  const status = formSubmission.status || FormDataStatus.SUBMITTED;
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  console.log('[FORM_DATA_SERVICE] Submitting form data:', {
    studyId: formSubmission.studyId,
    formId: formSubmission.formId,
    subjectId: formSubmission.subjectId,
    status,
    fieldCount: Object.keys(formSubmission.formData).length
  });

  try {
    const response = await ApiService.post(API_BASE, {
      ...formSubmission,
      status
    });

    console.log('[FORM_DATA_SERVICE] Form submission successful:', {
      formDataId: response.data.formDataId,
      recordId: response.data.recordId,
      message: response.data.message
    });

    return response.data;
  } catch (error: any) {
    console.error('[FORM_DATA_SERVICE] Error submitting form data:', error);
    
    // Extract error message from response
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
}

/**
 * Get all form submissions for a subject
 */
export async function fetchSubjectForms(subjectId: number): Promise<FormDataRecord[]> {
  if (!subjectId) {
    throw new Error('Subject ID is required');
  }

  console.log('[FORM_DATA_SERVICE] Fetching forms for subject:', subjectId);

  const response = await ApiService.get(`${API_BASE}/subject/${subjectId}`);

  console.log('[FORM_DATA_SERVICE] Found forms for subject:', {
    subjectId,
    count: response.data.length
  });

  return response.data || [];
}

/**
 * Get all form submissions for a study
 */
export async function fetchStudyForms(studyId: number): Promise<FormDataRecord[]> {
  if (!studyId) {
    throw new Error('Study ID is required');
  }

  console.log('[FORM_DATA_SERVICE] Fetching forms for study:', studyId);

  const response = await ApiService.get(`${API_BASE}/study/${studyId}`);

  console.log('[FORM_DATA_SERVICE] Found forms for study:', {
    studyId,
    count: response.data.length
  });

  return response.data || [];
}

/**
 * Get specific form submission by ID
 */
export async function fetchFormDataById(formDataId: number): Promise<FormDataRecord> {
  if (!formDataId) {
    throw new Error('Form data ID is required');
  }

  console.log('[FORM_DATA_SERVICE] Fetching form data by ID:', formDataId);

  const response = await ApiService.get(`${API_BASE}/${formDataId}`);

  console.log('[FORM_DATA_SERVICE] Form data retrieved:', {
    id: response.data.id,
    studyId: response.data.studyId,
    formId: response.data.formId,
    status: response.data.status
  });

  return response.data;
}

/**
 * Get form submissions by study and form definition
 * Example: Get all screening assessments for a study
 */
export async function fetchFormDataByStudyAndForm(
  studyId: number,
  formId: number
): Promise<FormDataRecord[]> {
  if (!studyId || !formId) {
    throw new Error('Study ID and Form ID are required');
  }

  console.log('[FORM_DATA_SERVICE] Fetching form data:', { studyId, formId });

  const response = await ApiService.get(`${API_BASE}/study/${studyId}/form/${formId}`);

  console.log('[FORM_DATA_SERVICE] Found form submissions:', {
    studyId,
    formId,
    count: response.data.length
  });

  return response.data || [];
}

/**
 * Health check
 */
export async function checkFormDataServiceHealth(): Promise<string> {
  const response = await ApiService.get(`${API_BASE}/health`);
  return response.data;
}

// ==================== React Query Hooks ====================

/**
 * Hook: Fetch subject forms
 */
export function useSubjectForms(
  subjectId: number | undefined,
  options?: Omit<UseQueryOptions<FormDataRecord[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<FormDataRecord[], Error>({
    queryKey: ['form-data', 'subject', subjectId],
    queryFn: () => fetchSubjectForms(subjectId!),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch study forms
 */
export function useStudyForms(
  studyId: number | undefined,
  options?: Omit<UseQueryOptions<FormDataRecord[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<FormDataRecord[], Error>({
    queryKey: ['form-data', 'study', studyId],
    queryFn: () => fetchStudyForms(studyId!),
    enabled: !!studyId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch form data by ID
 */
export function useFormDataById(
  formDataId: number | undefined,
  options?: Omit<UseQueryOptions<FormDataRecord, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<FormDataRecord, Error>({
    queryKey: ['form-data', formDataId],
    queryFn: () => fetchFormDataById(formDataId!),
    enabled: !!formDataId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch form data by study and form
 */
export function useFormDataByStudyAndForm(
  studyId: number | undefined,
  formId: number | undefined,
  options?: Omit<UseQueryOptions<FormDataRecord[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<FormDataRecord[], Error>({
    queryKey: ['form-data', 'study', studyId, 'form', formId],
    queryFn: () => fetchFormDataByStudyAndForm(studyId!, formId!),
    enabled: !!(studyId && formId),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Submit form data mutation
 */
export function useSubmitFormData(
  options?: Omit<UseMutationOptions<FormDataSubmissionResponse, Error, FormDataSubmission>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<FormDataSubmissionResponse, Error, FormDataSubmission>({
    mutationFn: submitFormData,
    onSuccess: (response, variables) => {
      const { studyId, formId, subjectId, visitId } = variables;
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['form-data', 'study', studyId] });
      queryClient.invalidateQueries({ queryKey: ['form-data', 'study', studyId, 'form', formId] });
      
      if (subjectId) {
        queryClient.invalidateQueries({ queryKey: ['form-data', 'subject', subjectId] });
        queryClient.invalidateQueries({ queryKey: ['subjects', subjectId] });
      }
      
      if (visitId) {
        queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
        queryClient.invalidateQueries({ queryKey: ['form-data', visitId] });
      }
      
      // Set the newly created form data in cache if we have the ID
      if (response.formDataId) {
        queryClient.invalidateQueries({ queryKey: ['form-data', response.formDataId] });
      }
      
      console.log('[FORM_DATA_SERVICE] Form data submitted successfully, cache invalidated');
    },
    ...options
  });
}

/**
 * Hook: Update form data mutation (reuses submit with same ID)
 */
export function useUpdateFormData(
  options?: Omit<UseMutationOptions<FormDataSubmissionResponse, Error, FormDataSubmission & { formDataId: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<FormDataSubmissionResponse, Error, FormDataSubmission & { formDataId: number }>({
    mutationFn: ({ formDataId, ...formSubmission }) => submitFormData(formSubmission),
    onSuccess: (response, variables) => {
      const { studyId, formId, subjectId, visitId, formDataId } = variables;
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['form-data', formDataId] });
      queryClient.invalidateQueries({ queryKey: ['form-data', 'study', studyId] });
      queryClient.invalidateQueries({ queryKey: ['form-data', 'study', studyId, 'form', formId] });
      
      if (subjectId) {
        queryClient.invalidateQueries({ queryKey: ['form-data', 'subject', subjectId] });
      }
      
      if (visitId) {
        queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
        queryClient.invalidateQueries({ queryKey: ['form-data', visitId] });
      }
      
      console.log('[FORM_DATA_SERVICE] Form data updated successfully');
    },
    ...options
  });
}

// ==================== Utility Functions ====================

/**
 * Validate form submission data
 */
export function validateFormSubmission(formSubmission: Partial<FormDataSubmission>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!formSubmission.studyId) {
    errors.push('Study ID is required');
  }

  if (!formSubmission.formId) {
    errors.push('Form ID is required');
  }

  if (!formSubmission.formData || Object.keys(formSubmission.formData).length === 0) {
    errors.push('Form data cannot be empty');
  }

  if (formSubmission.status) {
    const validStatuses = [FormDataStatus.DRAFT, FormDataStatus.SUBMITTED, FormDataStatus.LOCKED];
    if (!validStatuses.includes(formSubmission.status)) {
      errors.push('Invalid status value');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format form data for display
 */
export function formatFormDataForDisplay(formData: FormDataRecord): {
  displayStatus: string;
  displayDate: string;
  isLocked: boolean;
  canEdit: boolean;
} {
  return {
    displayStatus: formData.status.charAt(0) + formData.status.slice(1).toLowerCase(),
    displayDate: formData.updatedAt 
      ? new Date(formData.updatedAt).toLocaleDateString() 
      : 'Not submitted',
    isLocked: formData.status === FormDataStatus.LOCKED,
    canEdit: formData.status === FormDataStatus.DRAFT || formData.status === FormDataStatus.SUBMITTED
  };
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy object export for backward compatibility
 * @deprecated Use named exports and hooks instead
 */
export const FormDataService = {
  submitFormData,
  getSubjectForms: fetchSubjectForms,
  getStudyForms: fetchStudyForms,
  getFormDataById: fetchFormDataById,
  getFormDataByStudyAndForm: fetchFormDataByStudyAndForm,
  healthCheck: checkFormDataServiceHealth,
  validateFormSubmission,
  formatFormDataForDisplay
};

export default FormDataService;
