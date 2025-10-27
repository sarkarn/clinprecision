import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from '../infrastructure/ApiService';
import type { ApiResponse } from '../../../clinprecision/src/types';

// ============================================================================
// Constants
// ============================================================================

// NEW DDD-aligned URLs (Module 1.3 Phase 2)
const API_PATH = '/clinops-ws/api/v1/study-design/form-templates'; // Global form library/templates
const FORM_DEFINITIONS_PATH = '/clinops-ws/api/v1/study-design/form-definitions'; // Study-specific forms
const VISIT_FORMS_PATH = '/clinops-ws/api/visit-forms';

// ============================================================================
// Types
// ============================================================================

export type FormFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED';

export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  validation?: Record<string, any>;
}

export interface FormSection {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  order?: number;
}

export interface FormStructure {
  sections: FormSection[];
}

export interface FormTemplate {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  version?: string;
  status?: FormStatus;
  fields?: string; // JSON string (legacy)
  formDefinition?: string; // JSON string (legacy)
  structure?: FormStructure;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface FormCreateData {
  name: string;
  description?: string;
  type?: string;
  fields?: string;
  formDefinition?: string;
  structure?: FormStructure;
}

export interface FormUpdateData extends Partial<FormCreateData> {
  version?: string;
  status?: FormStatus;
}

export interface FormVersion {
  id: string;
  formId: string;
  versionNumber: string;
  versionDescription?: string;
  createdAt: string;
  createdBy: string;
  formData: FormTemplate;
}

export interface FormVersionCreateData {
  versionDescription?: string;
  formData: FormTemplate;
}

export interface VisitFormAssociation {
  id?: number;
  visitDefinitionId: number | string;
  formId: number | string;
  studyId: number | string;
  sequence?: number;
  isRequired?: boolean;
}

export interface FormAssociationData {
  sequence?: number;
  isRequired?: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const getMockForms = (): FormTemplate[] => {
  return [
    {
      id: 'FORM-001',
      name: 'Patient Demographics Form',
      description: 'Standard demographic information collection',
      type: 'Demographics',
      version: '2.1',
      status: 'PUBLISHED',
      updatedAt: '2024-03-10T10:30:00Z',
      createdAt: '2024-01-15T09:00:00Z',
      createdBy: 'Dr. Sarah Johnson',
      structure: {
        sections: [
          {
            id: 'demo_section_1',
            name: 'Basic Information',
            fields: [
              { id: 'first_name', name: 'First Name', type: 'text', required: true },
              { id: 'last_name', name: 'Last Name', type: 'text', required: true },
              { id: 'date_of_birth', name: 'Date of Birth', type: 'date', required: true },
              { id: 'gender', name: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true }
            ]
          }
        ]
      }
    },
    {
      id: 'FORM-002',
      name: 'Adverse Event Report',
      description: 'Comprehensive adverse event documentation',
      type: 'Safety',
      version: '1.5',
      status: 'PUBLISHED',
      updatedAt: '2024-03-08T14:20:00Z',
      createdAt: '2024-02-01T11:00:00Z',
      createdBy: 'Dr. Michael Chen',
      structure: {
        sections: [
          {
            id: 'ae_section_1',
            name: 'Event Details',
            fields: [
              { id: 'event_term', name: 'Event Term', type: 'text', required: true },
              { id: 'onset_date', name: 'Onset Date', type: 'date', required: true },
              { id: 'severity', name: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'], required: true },
              { id: 'relationship', name: 'Relationship to Study Drug', type: 'select', options: ['Related', 'Possibly Related', 'Unrelated'], required: true }
            ]
          }
        ]
      }
    },
    {
      id: 'FORM-003',
      name: 'Laboratory Results Entry',
      description: 'Lab values and test results',
      type: 'Laboratory',
      version: '3.0',
      status: 'DRAFT',
      updatedAt: '2024-03-12T09:15:00Z',
      createdAt: '2024-03-01T10:30:00Z',
      createdBy: 'Dr. Emily Rodriguez',
      structure: {
        sections: [
          {
            id: 'lab_section_1',
            name: 'Hematology',
            fields: [
              { id: 'hemoglobin', name: 'Hemoglobin (g/dL)', type: 'number', required: true },
              { id: 'hematocrit', name: 'Hematocrit (%)', type: 'number', required: true },
              { id: 'wbc_count', name: 'WBC Count (10³/μL)', type: 'number', required: true },
              { id: 'platelet_count', name: 'Platelet Count (10³/μL)', type: 'number', required: true }
            ]
          }
        ]
      }
    },
    {
      id: 'FORM-004',
      name: 'Medication History',
      description: 'Prior and concomitant medication tracking',
      type: 'Medication',
      version: '2.3',
      status: 'PUBLISHED',
      updatedAt: '2024-03-05T16:45:00Z',
      createdAt: '2024-01-20T08:15:00Z',
      createdBy: 'Dr. Robert Kim',
      structure: {
        sections: [
          {
            id: 'med_section_1',
            name: 'Medication Details',
            fields: [
              { id: 'medication_name', name: 'Medication Name', type: 'text', required: true },
              { id: 'dosage', name: 'Dosage', type: 'text', required: true },
              { id: 'frequency', name: 'Frequency', type: 'text', required: true },
              { id: 'start_date', name: 'Start Date', type: 'date', required: true },
              { id: 'end_date', name: 'End Date', type: 'date', required: false }
            ]
          }
        ]
      }
    }
  ];
};

// ============================================================================
// Helper Functions
// ============================================================================

const isTemporaryId = (id: string | number | undefined): boolean => {
  if (!id) return false;
  return id.toString().startsWith('temp-');
};

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Get all forms (global form library/templates)
 */
export const fetchForms = async (): Promise<FormTemplate[]> => {
  try {
    const response = await ApiService.get(API_PATH);
    const apiResponse = response.data as ApiResponse<FormTemplate[]>;
    return apiResponse.data || response.data || [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    // Return mock data when backend is unavailable
    return getMockForms();
  }
};

/**
 * Get a form by ID
 */
export const fetchFormById = async (formId: string): Promise<FormTemplate> => {
  try {
    const response = await ApiService.get(`${API_PATH}/${formId}`);
    const apiResponse = response.data as ApiResponse<FormTemplate>;
    return apiResponse.data || response.data;
  } catch (error) {
    console.error(`Error fetching form with ID ${formId}:`, error);
    // Return mock data when backend is unavailable
    const mockForms = getMockForms();
    const form = mockForms.find(f => f.id === formId);
    if (form) {
      return form;
    }
    throw new Error(`Form with ID ${formId} not found`);
  }
};

/**
 * Create a new form
 */
export const createForm = async (formData: FormCreateData): Promise<FormTemplate> => {
  console.log('*** FormService.createForm() ENTRY POINT ***');
  console.log('This should call FormTemplateController, NOT FormDefinitionController');
  console.log('FormService.createForm() called with data:', formData);
  
  // Add fields property if not present (required by database)
  const enhancedFormData: FormCreateData = {
    ...formData,
    // Default empty fields JSON if not provided
    fields: formData.fields || '[]',
    // Ensure formDefinition is a valid JSON string
    formDefinition: formData.formDefinition || '{}',
  };
  
  console.log('*** API endpoint:', API_PATH);
  console.log('*** Full URL will be: API_BASE_URL + API_PATH');
  console.log('*** Expected: http://localhost:8082/clinops-ws/api/form-templates');
  console.log('*** This should route to FormTemplateController.createFormTemplate()');
  
  try {
    const response = await ApiService.post(API_PATH, enhancedFormData);
    console.log('*** FormService API response received:', response.data);
    console.log('*** FormService.createForm() COMPLETED SUCCESSFULLY ***');
    
    const apiResponse = response.data as ApiResponse<FormTemplate>;
    return apiResponse.data || response.data;
  } catch (error: any) {
    // If we get a server error, create a mock form with a temporary ID
    if (error.response && (error.response.status === 500 || error.response.status === 404)) {
      console.warn('Error creating form, creating mock form instead:', error);
      return {
        id: `temp-form-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
    }
    console.error('Error creating form:', error);
    throw error;
  }
};

/**
 * Update an existing form
 */
export const updateForm = async ({ formId, formData }: { formId: string; formData: FormUpdateData }): Promise<FormTemplate> => {
  // Check if this is a temporary ID (starts with 'temp-')
  if (isTemporaryId(formId)) {
    console.log(`Skipping update for temporary form ${formId}, would update it on the server if endpoint existed`);
    return { id: formId, ...formData } as FormTemplate; // Just return the data as-is for temporary forms
  }
  
  // Add fields property if not present (required by database)
  const enhancedFormData: FormUpdateData = {
    ...formData,
    // Default empty fields JSON if not provided
    fields: formData.fields || '[]'
  };
  
  try {
    const response = await ApiService.put(`${API_PATH}/${formId}`, enhancedFormData);
    const apiResponse = response.data as ApiResponse<FormTemplate>;
    return apiResponse.data || response.data;
  } catch (error: any) {
    // If we get a server error, return the original data
    if (error.response && (error.response.status === 500 || error.response.status === 404)) {
      console.warn(`Error updating form ${formId}, returning original data:`, error);
      return { id: formId, ...formData } as FormTemplate;
    }
    console.error(`Error updating form with ID ${formId}:`, error);
    throw error;
  }
};

/**
 * Delete a form by ID
 */
export const deleteForm = async (formId: string): Promise<{ success: boolean }> => {
  await ApiService.delete(`${API_PATH}/${formId}`);
  return { success: true };
};

// ============================================================================
// Form Versions API Functions
// ============================================================================

/**
 * Get all versions of a form
 */
export const fetchFormVersions = async (formId: string): Promise<FormVersion[]> => {
  const response = await ApiService.get(`${API_PATH}/${formId}/versions`);
  const apiResponse = response.data as ApiResponse<FormVersion[]>;
  return apiResponse.data || response.data || [];
};

/**
 * Get a specific version of a form
 */
export const fetchFormVersion = async ({ formId, versionId }: { formId: string; versionId: string }): Promise<FormVersion> => {
  const response = await ApiService.get(`${API_PATH}/${formId}/versions/${versionId}`);
  const apiResponse = response.data as ApiResponse<FormVersion>;
  return apiResponse.data || response.data;
};

/**
 * Create a new version of a form
 */
export const createFormVersion = async ({ formId, versionData }: { formId: string; versionData: FormVersionCreateData }): Promise<FormVersion> => {
  const response = await ApiService.post(`${API_PATH}/${formId}/versions`, versionData);
  const apiResponse = response.data as ApiResponse<FormVersion>;
  return apiResponse.data || response.data;
};

// ============================================================================
// Study Forms API Functions
// ============================================================================

/**
 * Get forms associated with a study
 */
export const fetchFormsByStudy = async (studyId: number | string): Promise<FormTemplate[]> => {
  const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}`);
  const apiResponse = response.data as ApiResponse<FormTemplate[]>;
  return apiResponse.data || response.data || [];
};

// ============================================================================
// Visit-Form Association API Functions
// ============================================================================

/**
 * Associate a form with a visit in a study
 */
export const associateFormWithVisit = async ({
  studyId,
  visitId,
  formId,
  formData = {}
}: {
  studyId: number | string;
  visitId: number | string;
  formId: number | string;
  formData?: FormAssociationData;
}): Promise<{ success: boolean; mock?: boolean }> => {
  // Check if either ID is temporary
  if (isTemporaryId(formId) || isTemporaryId(visitId)) {
    console.log(`Skipping association for temporary IDs - form: ${formId}, visit: ${visitId}`);
    return { success: true }; // Mock success for temporary IDs
  }
  
  // Create a visit form association using the /api/visit-forms endpoint
  const visitFormData: VisitFormAssociation = {
    visitDefinitionId: visitId,
    formId: formId,
    studyId: studyId,
    ...formData
  };
  
  try {
    const response = await ApiService.post(VISIT_FORMS_PATH, visitFormData);
    return response.data || { success: true };
  } catch (error: any) {
    // If we get a server error (404/500), return a mock success
    if (error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.warn(`Error associating form ${formId} with visit ${visitId}, returning mock success:`, error);
      return { success: true, mock: true };
    }
    throw error;
  }
};

/**
 * Remove a form association from a visit in a study
 */
export const removeFormFromVisit = async ({
  studyId,
  visitId,
  formId
}: {
  studyId: number | string;
  visitId: number | string;
  formId: number | string;
}): Promise<{ success: boolean; mock?: boolean }> => {
  // Check if either ID is temporary
  if (isTemporaryId(formId) || isTemporaryId(visitId)) {
    console.log(`Skipping removal for temporary IDs - form: ${formId}, visit: ${visitId}`);
    return { success: true }; // Mock success for temporary IDs
  }
  
  try {
    // First, we need to get the visitFormId from the visit-forms endpoint
    const visitFormsResponse = await ApiService.get(`${VISIT_FORMS_PATH}/visit/${visitId}`);
    const visitForms = visitFormsResponse.data;
    
    if (!Array.isArray(visitForms) || visitForms.length === 0) {
      console.warn(`No visit forms found for visit ${visitId}`);
      return { success: true }; // Nothing to delete
    }
    
    const visitForm = visitForms.find((vf: any) => String(vf.formId) === String(formId));
    
    if (!visitForm) {
      console.warn(`Form ${formId} not found for visit ${visitId}`);
      return { success: true }; // Nothing to delete
    }
    
    // Delete the visit-form association using its ID
    await ApiService.delete(`${VISIT_FORMS_PATH}/${visitForm.id}`);
    return { success: true };
  } catch (error: any) {
    // If we get a server error (404/500), return a mock success
    if (error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.warn(`Error removing form ${formId} from visit ${visitId}, returning mock success:`, error);
      return { success: true, mock: true };
    }
    throw error;
  }
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all forms with caching
 * 
 * @example
 * ```tsx
 * const { data: forms, isLoading } = useForms();
 * ```
 */
export const useForms = (): UseQueryResult<FormTemplate[], Error> => {
  return useQuery({
    queryKey: ['forms'],
    queryFn: fetchForms,
  });
};

/**
 * Hook to fetch a single form by ID
 * 
 * @example
 * ```tsx
 * const { data: form } = useForm('FORM-001');
 * ```
 */
export const useForm = (formId: string | undefined): UseQueryResult<FormTemplate, Error> => {
  return useQuery({
    queryKey: ['form', formId],
    queryFn: () => fetchFormById(formId!),
    enabled: !!formId,
  });
};

/**
 * Hook to create a new form
 * 
 * @example
 * ```tsx
 * const createFormMutation = useCreateForm();
 * await createFormMutation.mutateAsync(formData);
 * ```
 */
export const useCreateForm = (): UseMutationResult<FormTemplate, Error, FormCreateData, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

/**
 * Hook to update a form
 * 
 * @example
 * ```tsx
 * const updateFormMutation = useUpdateForm();
 * await updateFormMutation.mutateAsync({ formId, formData });
 * ```
 */
export const useUpdateForm = (): UseMutationResult<FormTemplate, Error, { formId: string; formData: FormUpdateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateForm,
    onSuccess: (data, variables) => {
      // Update form in cache
      queryClient.setQueryData(['form', variables.formId], data);
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

/**
 * Hook to delete a form
 * 
 * @example
 * ```tsx
 * const deleteFormMutation = useDeleteForm();
 * await deleteFormMutation.mutateAsync(formId);
 * ```
 */
export const useDeleteForm = (): UseMutationResult<{ success: boolean }, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteForm,
    onSuccess: (data, formId) => {
      // Remove form from cache
      queryClient.removeQueries({ queryKey: ['form', formId] });
      // Invalidate forms list
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

/**
 * Hook to fetch form versions
 * 
 * @example
 * ```tsx
 * const { data: versions } = useFormVersions('FORM-001');
 * ```
 */
export const useFormVersions = (formId: string | undefined): UseQueryResult<FormVersion[], Error> => {
  return useQuery({
    queryKey: ['form', formId, 'versions'],
    queryFn: () => fetchFormVersions(formId!),
    enabled: !!formId,
  });
};

/**
 * Hook to fetch a specific form version
 * 
 * @example
 * ```tsx
 * const { data: version } = useFormVersion({ formId: 'FORM-001', versionId: 'v1.0' });
 * ```
 */
export const useFormVersion = ({ formId, versionId }: { formId?: string; versionId?: string }): UseQueryResult<FormVersion, Error> => {
  return useQuery({
    queryKey: ['form', formId, 'version', versionId],
    queryFn: () => fetchFormVersion({ formId: formId!, versionId: versionId! }),
    enabled: !!formId && !!versionId,
  });
};

/**
 * Hook to create a new form version
 * 
 * @example
 * ```tsx
 * const createVersionMutation = useCreateFormVersion();
 * await createVersionMutation.mutateAsync({ formId, versionData });
 * ```
 */
export const useCreateFormVersion = (): UseMutationResult<FormVersion, Error, { formId: string; versionData: FormVersionCreateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFormVersion,
    onSuccess: (data, variables) => {
      // Invalidate versions list
      queryClient.invalidateQueries({ queryKey: ['form', variables.formId, 'versions'] });
    },
  });
};

/**
 * Hook to fetch forms by study
 * 
 * @example
 * ```tsx
 * const { data: studyForms } = useFormsByStudy(studyId);
 * ```
 */
export const useFormsByStudy = (studyId: number | string | undefined): UseQueryResult<FormTemplate[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'forms'],
    queryFn: () => fetchFormsByStudy(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to associate a form with a visit
 * 
 * @example
 * ```tsx
 * const associateMutation = useAssociateFormWithVisit();
 * await associateMutation.mutateAsync({ studyId, visitId, formId });
 * ```
 */
export const useAssociateFormWithVisit = (): UseMutationResult<
  { success: boolean; mock?: boolean },
  Error,
  { studyId: number | string; visitId: number | string; formId: number | string; formData?: FormAssociationData },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: associateFormWithVisit,
    onSuccess: (data, variables) => {
      // Invalidate study forms
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'forms'] });
      // Invalidate visit schedule
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-schedule'] });
      // Invalidate form bindings
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'form-bindings'] });
    },
  });
};

/**
 * Hook to remove a form from a visit
 * 
 * @example
 * ```tsx
 * const removeMutation = useRemoveFormFromVisit();
 * await removeMutation.mutateAsync({ studyId, visitId, formId });
 * ```
 */
export const useRemoveFormFromVisit = (): UseMutationResult<
  { success: boolean; mock?: boolean },
  Error,
  { studyId: number | string; visitId: number | string; formId: number | string },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFormFromVisit,
    onSuccess: (data, variables) => {
      // Invalidate study forms
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'forms'] });
      // Invalidate visit schedule
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'visit-schedule'] });
      // Invalidate form bindings
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'form-bindings'] });
    },
  });
};

// ============================================================================
// Legacy Service Export (for backwards compatibility)
// ============================================================================

const FormService = {
  getForms: fetchForms,
  getFormById: fetchFormById,
  createForm,
  updateForm: (formId: string, formData: FormUpdateData) => updateForm({ formId, formData }),
  deleteForm,
  getFormVersions: fetchFormVersions,
  getFormVersion: (formId: string, versionId: string) => fetchFormVersion({ formId, versionId }),
  createFormVersion: (formId: string, versionData: FormVersionCreateData) => createFormVersion({ formId, versionData }),
  getFormsByStudy: fetchFormsByStudy,
  associateFormWithVisit: (studyId: number | string, visitId: number | string, formId: number | string, formData?: FormAssociationData) =>
    associateFormWithVisit({ studyId, visitId, formId, formData }),
  removeFormFromVisit: (studyId: number | string, visitId: number | string, formId: number | string) =>
    removeFormFromVisit({ studyId, visitId, formId }),
  getMockForms,
};

export default FormService;
