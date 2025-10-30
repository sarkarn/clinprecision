/**
 * Visit Form Management Helpers
 * 
 * Utilities for creating unscheduled visits and managing form assignments.
 * 
 * @module visitFormHelpers
 * @created October 22, 2025
 */

import ApiService from '../services/ApiService';

// Type definitions
interface VisitData {
  patientId: number;
  studyId: number;
  siteId: number;
  visitType: string;
  visitDate: string; // ISO format: YYYY-MM-DD
  createdBy: number;
  notes?: string;
}

interface FormConfig {
  id: number;
  isRequired?: boolean;
  isConditional?: boolean;
  conditionalLogic?: string | null;
  displayOrder?: number;
  instructions?: string;
  timing?: string;
  name?: string;
}

interface FormAssignmentOptions {
  isRequired?: boolean;
  isConditional?: boolean;
  conditionalLogic?: string;
  displayOrder?: number;
  instructions?: string;
  timing?: string;
}

/**
 * Create an unscheduled visit and assign forms in a single operation
 * 
 * @param visitData - Visit creation parameters
 * @param formIds - Array of form IDs or form config objects
 * @returns Complete visit details with forms
 * 
 * @example
 * // Simple usage with form IDs
 * const visit = await createUnscheduledVisitWithForms(
 *   {
 *     patientId: 123,
 *     studyId: 456,
 *     siteId: 789,
 *     visitType: 'SCREENING',
 *     visitDate: '2025-10-22',
 *     createdBy: 1,
 *     notes: 'Initial screening'
 *   },
 *   [101, 102, 103]  // Demographics, Vitals, Labs
 * );
 * 
 * @example
 * // Advanced usage with form configuration
 * const visit = await createUnscheduledVisitWithForms(
 *   { ...visitData },
 *   [
 *     { id: 101, isRequired: true, displayOrder: 1 },
 *     { id: 102, isRequired: true, displayOrder: 2, timing: 'DURING_VISIT' },
 *     { id: 103, isRequired: false, displayOrder: 3, timing: 'POST_VISIT' }
 *   ]
 * );
 */
export const createUnscheduledVisitWithForms = async (
  visitData: VisitData,
  formIds: (number | FormConfig)[] = []
): Promise<any> => {
  try {
    console.log('Creating unscheduled visit...', visitData);
    
    // Step 1: Create the visit
    const visitResponse = await ApiService.post('/clinops-ws/api/v1/visits/unscheduled', visitData);
    const visitUuid = visitResponse.data.visitId;
    
    console.log('Visit created:', visitUuid);
    
    // Step 2: Assign forms if provided
    if (formIds && formIds.length > 0) {
      console.log(`Assigning ${formIds.length} forms to visit...`);
      
      const formAssignments = await Promise.all(
        formIds.map((formConfig, index) => {
          // Handle both simple IDs and config objects
          const formId = typeof formConfig === 'number' ? formConfig : formConfig.id;
          const formSettings = typeof formConfig === 'object' ? formConfig : {} as FormConfig;
          
          return ApiService.post(
            `/clinops-ws/api/studies/${visitData.studyId}/visits/${visitUuid}/forms/${formId}`,
            {
              isRequired: formSettings.isRequired !== undefined ? formSettings.isRequired : true,
              isConditional: formSettings.isConditional || false,
              conditionalLogic: formSettings.conditionalLogic || null,
              displayOrder: formSettings.displayOrder !== undefined ? formSettings.displayOrder : index + 1,
              instructions: formSettings.instructions || '',
              timing: formSettings.timing || 'ANY_TIME'
            }
          );
        })
      );
      
      console.log(`${formAssignments.length} forms assigned successfully`);
    }
    
    // Step 3: Fetch complete visit details with forms
    const fullVisitResponse = await ApiService.get(
      `/clinops-ws/api/v1/subjects/${visitData.patientId}/visits/${visitUuid}`
    );
    
    console.log('Visit created with forms:', fullVisitResponse.data);
    return fullVisitResponse.data;
    
  } catch (error) {
    console.error('Error creating unscheduled visit with forms:', error);
    throw error;
  }
};

/**
 * Add a single form to an existing visit
 * 
 * @param visitInstanceId - Visit instance ID (Long primary key, not UUID)
 * @param formId - Form definition ID
 * @param options - Form configuration
 * @returns Assignment response
 * 
 * @example
 * await addFormToVisit(123, 101, {
 *   isRequired: true,
 *   displayOrder: 1,
 *   instructions: 'Complete during visit'
 * });
 */
export const addFormToVisit = async (
  visitInstanceId: number,
  formId: number,
  options: FormAssignmentOptions = {}
): Promise<any> => {
  try {
    const response = await ApiService.post(
      `/clinops-ws/api/v1/visits/${visitInstanceId}/forms/${formId}`,
      {
        isRequired: options.isRequired !== undefined ? options.isRequired : true,
        displayOrder: options.displayOrder,
        instructions: options.instructions || ''
      }
    );
    
    console.log(`Form ${formId} assigned to visit instance ${visitInstanceId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding form to visit:', error);
    throw error;
  }
};

/**
 * Add multiple forms to an existing visit
 * 
 * @param visitInstanceId - Visit instance ID (Long primary key)
 * @param formIds - Array of form IDs or config objects
 * @returns Array of assignment responses
 * 
 * @example
 * await addMultipleFormsToVisit(123, [
 *   { id: 101, isRequired: true },
 *   { id: 102, isRequired: true },
 *   { id: 103, isRequired: false }
 * ]);
 */
export const addMultipleFormsToVisit = async (
  visitInstanceId: number,
  formIds: (number | FormConfig)[]
): Promise<any[]> => {
  try {
    const assignments = await Promise.all(
      formIds.map((formConfig, index) => {
        const formId = typeof formConfig === 'number' ? formConfig : formConfig.id;
        const options = typeof formConfig === 'object' ? formConfig : {} as FormAssignmentOptions;
        
        // Auto-calculate display order if not provided
        if (!options.displayOrder) {
          options.displayOrder = index + 1;
        }
        
        return addFormToVisit(visitInstanceId, formId, options);
      })
    );
    
    console.log(`${assignments.length} forms assigned to visit instance ${visitInstanceId}`);
    return assignments;
  } catch (error) {
    console.error('Error adding multiple forms to visit:', error);
    throw error;
  }
};

/**
 * Predefined form sets for common visit types
 * 
 * NOTE: Update these form IDs to match your actual form_definitions
 */
export const STANDARD_FORM_SETS: Record<string, FormConfig[]> = {
  SCREENING: [
    { id: 101, name: 'Demographics', isRequired: true },
    { id: 102, name: 'Medical History', isRequired: true },
    { id: 103, name: 'Vital Signs', isRequired: true },
    { id: 104, name: 'Inclusion/Exclusion Criteria', isRequired: true },
    { id: 105, name: 'Informed Consent', isRequired: true }
  ],
  
  ENROLLMENT: [
    { id: 106, name: 'Randomization', isRequired: true },
    { id: 107, name: 'Treatment Assignment', isRequired: true },
    { id: 108, name: 'Baseline Assessments', isRequired: true }
  ],
  
  ADVERSE_EVENT: [
    { id: 109, name: 'Adverse Event Report', isRequired: true },
    { id: 110, name: 'Concomitant Medications', isRequired: true },
    { id: 103, name: 'Vital Signs', isRequired: true },
    { id: 111, name: 'Safety Labs', isRequired: false }
  ],
  
  DISCONTINUATION: [
    { id: 112, name: 'Discontinuation Reason', isRequired: true },
    { id: 113, name: 'Final Assessments', isRequired: true },
    { id: 114, name: 'Study Drug Return', isRequired: true }
  ]
};

/**
 * Create a screening visit with standard forms
 * 
 * @param visitData - Visit creation parameters (without visitType)
 * @returns Complete visit details
 * 
 * @example
 * const visit = await createScreeningVisit({
 *   patientId: 123,
 *   studyId: 456,
 *   siteId: 789,
 *   visitDate: '2025-10-22',
 *   createdBy: 1,
 *   notes: 'Initial screening'
 * });
 */
export const createScreeningVisit = async (visitData: Omit<VisitData, 'visitType'>): Promise<any> => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'SCREENING' },
    STANDARD_FORM_SETS.SCREENING.map(f => f.id)
  );
};

/**
 * Create an enrollment visit with standard forms
 * 
 * @param visitData - Visit creation parameters (without visitType)
 * @returns Complete visit details
 */
export const createEnrollmentVisit = async (visitData: Omit<VisitData, 'visitType'>): Promise<any> => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'ENROLLMENT' },
    STANDARD_FORM_SETS.ENROLLMENT.map(f => f.id)
  );
};

/**
 * Create an adverse event visit with standard forms
 * 
 * @param visitData - Visit creation parameters (without visitType)
 * @returns Complete visit details
 */
export const createAdverseEventVisit = async (visitData: Omit<VisitData, 'visitType'>): Promise<any> => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'ADVERSE_EVENT' },
    STANDARD_FORM_SETS.ADVERSE_EVENT.map(f => f.id)
  );
};

/**
 * Create a discontinuation visit with standard forms
 * 
 * @param visitData - Visit creation parameters (without visitType)
 * @returns Complete visit details
 */
export const createDiscontinuationVisit = async (visitData: Omit<VisitData, 'visitType'>): Promise<any> => {
  return createUnscheduledVisitWithForms(
    { ...visitData, visitType: 'DISCONTINUATION' },
    STANDARD_FORM_SETS.DISCONTINUATION.map(f => f.id)
  );
};

/**
 * Get form configuration for a specific visit type
 * 
 * @param visitType - Visit type (SCREENING, ENROLLMENT, etc.)
 * @returns Array of form configurations
 */
export const getStandardFormsForVisitType = (visitType: string): FormConfig[] => {
  return STANDARD_FORM_SETS[visitType] || [];
};

/**
 * Validate visit data before creation
 * 
 * @param visitData - Visit creation parameters
 * @throws If validation fails
 */
export const validateVisitData = (visitData: VisitData): void => {
  const required = ['patientId', 'studyId', 'siteId', 'visitType', 'visitDate', 'createdBy'];
  const missing = required.filter(field => !visitData[field as keyof VisitData]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  const validTypes = ['SCREENING', 'ENROLLMENT', 'ADVERSE_EVENT', 'DISCONTINUATION'];
  if (!validTypes.includes(visitData.visitType)) {
    throw new Error(`Invalid visit type: ${visitData.visitType}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate date format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(visitData.visitDate)) {
    throw new Error('Visit date must be in YYYY-MM-DD format');
  }
};

export default {
  createUnscheduledVisitWithForms,
  addFormToVisit,
  addMultipleFormsToVisit,
  createScreeningVisit,
  createEnrollmentVisit,
  createAdverseEventVisit,
  createDiscontinuationVisit,
  getStandardFormsForVisitType,
  validateVisitData,
  STANDARD_FORM_SETS
};
