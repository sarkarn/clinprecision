/**
 * Data Entry Service (TypeScript)
 * 
 * Handles form data entry operations including:
 * - Form definition retrieval
 * - Form data CRUD operations
 * - Visit details and form associations
 * - Visit status management
 * 
 * Provides React Query hooks for data entry workflows
 * 
 * @see Backend: FormDefinitionController, FormDataController, VisitController
 * @see Types: DataEntry.types.ts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '../ApiService';
import {
  FormDefinition,
  FormDataRecord,
  FormDataSubmission,
  FormDataSubmissionResponse,
  FormCompletionStats,
  VisitDetails,
  VisitStatusUpdate,
  FormDataStatus,
  FormEntryData
} from '../../types/domain/DataEntry.types';

const FORM_DEFINITION_BASE = '/clinops-ws/api/v1/study-design/form-definitions';
const FORM_DATA_BASE = '/clinops-ws/api/v1/form-data';
const VISITS_BASE = '/clinops-ws/api/v1/visits';

// ==================== Form Definition Operations ====================

/**
 * Get form definition (fields, metadata, etc.)
 */
export async function fetchFormDefinition(formId: string | number): Promise<FormDefinition> {
  console.log('[DATA_ENTRY_SERVICE] Fetching form definition for formId:', formId);
  
  try {
    const response = await ApiService.get(`${FORM_DEFINITION_BASE}/${formId}`);
    console.log('[DATA_ENTRY_SERVICE] Received form definition from API:', response.data);
    
    const formDef = response.data;
    
    // Parse fields from JSON string if needed
    let fields = [];
    if (formDef.fields) {
      try {
        fields = typeof formDef.fields === 'string' 
          ? JSON.parse(formDef.fields) 
          : formDef.fields;
      } catch (parseError) {
        console.error('[DATA_ENTRY_SERVICE] Error parsing fields JSON:', parseError);
        fields = [];
      }
    }
    
    return {
      id: formDef.id,
      name: formDef.name,
      description: formDef.description,
      fields: fields
    };
  } catch (error) {
    console.error('[DATA_ENTRY_SERVICE] Error fetching form definition:', error);
    throw error;
  }
}

// ==================== Form Data Operations ====================

/**
 * Get existing form data for a visit+form combination
 */
export async function fetchFormData(
  visitId: string | number,
  formId: string | number
): Promise<Record<string, any>> {
  console.log('[DATA_ENTRY_SERVICE] Fetching form data - visitId:', visitId, 'formId:', formId);
  
  try {
    const response = await ApiService.get(`${FORM_DATA_BASE}/visit/${visitId}/form/${formId}`);
    console.log('[DATA_ENTRY_SERVICE] Received form data from API:', response.data);
    
    return response.data.formData || {};
  } catch (error: any) {
    // 404 is expected if form hasn't been filled out yet
    if (error.response && error.response.status === 404) {
      console.log('[DATA_ENTRY_SERVICE] No existing form data (form not started yet)');
      return {};
    }
    
    console.error('[DATA_ENTRY_SERVICE] Error fetching form data:', error);
    throw error;
  }
}

/**
 * Save form data
 */
export async function saveFormData(
  subjectId: string | number,
  visitId: string | number,
  formId: string | number,
  data: FormEntryData,
  completionStats?: FormCompletionStats | null
): Promise<FormDataSubmissionResponse> {
  console.log('[DATA_ENTRY_SERVICE] Saving form data - subjectId:', subjectId, 'visitId:', visitId, 'formId:', formId);
  console.log('[DATA_ENTRY_SERVICE] Form data to save:', data);
  console.log('[DATA_ENTRY_SERVICE] Completion stats:', completionStats);
  
  try {
    // Map frontend status to backend status
    const backendStatus = mapToBackendStatus(data.status);
    
    // Prepare request body
    const requestBody: FormDataSubmission = {
      studyId: 1, // TODO: Get from context or route params
      formId: typeof formId === 'string' ? parseInt(formId) : formId,
      subjectId: typeof subjectId === 'string' ? parseInt(subjectId) : subjectId,
      visitId: typeof visitId === 'string' ? parseInt(visitId) : visitId,
      siteId: null,
      formData: data,
      status: backendStatus,
      relatedRecordId: null
    };
    
    // Include field completion tracking if provided
    if (completionStats) {
      requestBody.totalFields = completionStats.total;
      requestBody.completedFields = completionStats.completed;
      requestBody.requiredFields = completionStats.requiredTotal;
      requestBody.completedRequiredFields = completionStats.requiredCompleted;
    }
    
    console.log('[DATA_ENTRY_SERVICE] Sending to backend:', requestBody);
    
    const response = await ApiService.post(FORM_DATA_BASE, requestBody);
    
    console.log('[DATA_ENTRY_SERVICE] Form data saved successfully:', response.data);
    
    return {
      success: true,
      formDataId: response.data.formDataId,
      recordId: response.data.recordId
    };
  } catch (error) {
    console.error('[DATA_ENTRY_SERVICE] Error saving form data:', error);
    throw error;
  }
}

// ==================== Visit Operations ====================

/**
 * Get visit details including all associated forms
 */
export async function fetchVisitDetails(
  subjectId: string | number,
  visitId: string | number
): Promise<VisitDetails> {
  console.log('[DATA_ENTRY_SERVICE] Fetching visit details - subjectId:', subjectId, 'visitId:', visitId);
  
  try {
    const formsResponse = await ApiService.get(`${VISITS_BASE}/${visitId}/forms`);
    console.log('[DATA_ENTRY_SERVICE] Received forms from API:', formsResponse.data);
    
    // Map backend DTO to frontend format
    const forms = formsResponse.data.map((form: any) => ({
      id: form.formId.toString(),
      formId: form.formId,
      name: form.formName,
      status: form.completionStatus || FormDataStatus.NOT_STARTED,
      lastUpdated: form.lastUpdated
    }));
    
    // Build visit details object
    const visitDetails: VisitDetails = {
      id: visitId,
      subjectId: subjectId,
      visitName: 'Visit',
      description: '',
      visitDate: new Date().toISOString().split('T')[0],
      status: 'incomplete',
      timepoint: 0,
      forms: forms
    };
    
    // Calculate visit status based on form completion
    const formStatuses = visitDetails.forms.map(form => form.status);
    if (visitDetails.forms.length === 0) {
      visitDetails.status = FormDataStatus.NOT_STARTED;
    } else if (formStatuses.every(status => status === FormDataStatus.COMPLETE)) {
      visitDetails.status = FormDataStatus.COMPLETE;
    } else if (formStatuses.some(status => status === FormDataStatus.COMPLETE || status === FormDataStatus.INCOMPLETE)) {
      visitDetails.status = FormDataStatus.INCOMPLETE;
    } else {
      visitDetails.status = FormDataStatus.NOT_STARTED;
    }
    
    console.log('[DATA_ENTRY_SERVICE] Final visit details:', visitDetails);
    return visitDetails;
  } catch (error) {
    console.error('[DATA_ENTRY_SERVICE] Error fetching visit forms:', error);
    
    // Return empty visit on error
    return {
      id: visitId,
      subjectId: subjectId,
      visitName: 'Visit',
      description: '',
      visitDate: new Date().toISOString().split('T')[0],
      status: FormDataStatus.NOT_STARTED,
      timepoint: 0,
      forms: []
    };
  }
}

/**
 * Start a visit (change status from not_started to in_progress)
 */
export async function startVisit(
  visitId: string | number,
  userId: string
): Promise<{ success: boolean; newStatus?: string; error?: string }> {
  console.log('[DATA_ENTRY_SERVICE] Starting visit - visitId:', visitId, 'userId:', userId);
  
  try {
    const updateData: VisitStatusUpdate = {
      newStatus: 'IN_PROGRESS',
      updatedBy: userId,
      notes: 'Visit started by CRC'
    };
    
    const response = await ApiService.put(`${VISITS_BASE}/${visitId}/status`, updateData);
    
    console.log('[DATA_ENTRY_SERVICE] Visit started successfully:', response.data);
    return { success: true, newStatus: response.data.newStatus };
  } catch (error: any) {
    console.error('[DATA_ENTRY_SERVICE] Error starting visit:', error);
    return { success: false, error: error.message };
  }
}

// ==================== React Query Hooks ====================

/**
 * Hook: Fetch form definition
 */
export function useFormDefinition(
  formId: string | number | undefined,
  options?: Omit<UseQueryOptions<FormDefinition, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<FormDefinition, Error>({
    queryKey: ['form-definitions', formId],
    queryFn: () => fetchFormDefinition(formId!),
    enabled: !!formId,
    staleTime: 30 * 60 * 1000, // 30 minutes - form definitions rarely change
    ...options
  });
}

/**
 * Hook: Fetch form data
 */
export function useFormData(
  visitId: string | number | undefined,
  formId: string | number | undefined,
  options?: Omit<UseQueryOptions<Record<string, any>, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<Record<string, any>, Error>({
    queryKey: ['form-data', visitId, formId],
    queryFn: () => fetchFormData(visitId!, formId!),
    enabled: !!(visitId && formId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
}

/**
 * Hook: Fetch visit details
 */
export function useVisitDetails(
  subjectId: string | number | undefined,
  visitId: string | number | undefined,
  options?: Omit<UseQueryOptions<VisitDetails, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<VisitDetails, Error>({
    queryKey: ['visits', visitId, 'details'],
    queryFn: () => fetchVisitDetails(subjectId!, visitId!),
    enabled: !!(subjectId && visitId),
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Save form data mutation
 */
export function useSaveFormData(
  options?: Omit<UseMutationOptions<
    FormDataSubmissionResponse,
    Error,
    {
      subjectId: string | number;
      visitId: string | number;
      formId: string | number;
      data: FormEntryData;
      completionStats?: FormCompletionStats | null;
    }
  >, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<
    FormDataSubmissionResponse,
    Error,
    {
      subjectId: string | number;
      visitId: string | number;
      formId: string | number;
      data: FormEntryData;
      completionStats?: FormCompletionStats | null;
    }
  >({
    mutationFn: ({ subjectId, visitId, formId, data, completionStats }) =>
      saveFormData(subjectId, visitId, formId, data, completionStats),
    onSuccess: (_, variables) => {
      const { visitId, formId, subjectId } = variables;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['form-data', visitId, formId] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['subjects', subjectId] });
      
      console.log('[DATA_ENTRY_SERVICE] Form data saved successfully, cache invalidated');
    },
    ...options
  });
}

/**
 * Hook: Start visit mutation
 */
export function useStartVisit(
  options?: Omit<UseMutationOptions<
    { success: boolean; newStatus?: string; error?: string },
    Error,
    { visitId: string | number; userId: string }
  >, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; newStatus?: string; error?: string },
    Error,
    { visitId: string | number; userId: string }
  >({
    mutationFn: ({ visitId, userId }) => startVisit(visitId, userId),
    onSuccess: (_, variables) => {
      const { visitId } = variables;
      
      // Invalidate visit queries
      queryClient.invalidateQueries({ queryKey: ['visits', visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'details'] });
      
      console.log('[DATA_ENTRY_SERVICE] Visit started successfully');
    },
    ...options
  });
}

// ==================== Utility Functions ====================

/**
 * Map frontend status to backend status format
 */
function mapToBackendStatus(frontendStatus: 'incomplete' | 'complete'): FormDataStatus {
  if (frontendStatus === 'complete') {
    return FormDataStatus.SUBMITTED;
  }
  return FormDataStatus.DRAFT;
}

/**
 * Calculate form completion statistics
 */
export function calculateCompletionStats(
  formData: Record<string, any>,
  requiredFields: string[]
): FormCompletionStats {
  const allKeys = Object.keys(formData);
  const completedKeys = allKeys.filter(key => {
    const value = formData[key];
    return value !== null && value !== undefined && value !== '';
  });
  
  const completedRequired = requiredFields.filter(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '';
  });
  
  const total = allKeys.length;
  const completed = completedKeys.length;
  const requiredTotal = requiredFields.length;
  const requiredCompleted = completedRequired.length;
  
  return {
    total,
    completed,
    requiredTotal,
    requiredCompleted,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    isComplete: requiredTotal > 0 ? requiredCompleted === requiredTotal : completed === total
  };
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy object export for backward compatibility
 * @deprecated Use named exports and hooks instead
 */
export const DataEntryService = {
  getFormDefinition: fetchFormDefinition,
  getFormData: fetchFormData,
  saveFormData,
  getVisitDetails: fetchVisitDetails,
  startVisit
};

export default DataEntryService;
