// src/services/FormDataService.js
import ApiService from './ApiService';

/**
 * FormDataService - API client for form data submissions
 * 
 * Handles:
 * - Form submission (screening, enrollment, visit forms)
 * - Form data retrieval
 * - Subject form history
 * 
 * Backend Endpoint: /clinops-ws/api/v1/form-data
 * Controller: StudyFormDataController
 * Service Port: 8082 (clinprecision-clinops-service)
 */
export const FormDataService = {
  /**
   * Submit form data
   * 
   * Used for:
   * - Screening assessment forms
   * - Enrollment forms
   * - Visit data collection forms
   * - Unscheduled event forms
   * 
   * @param {Object} formSubmission - Form submission data
   * @param {number} formSubmission.studyId - Study ID (required)
   * @param {number} formSubmission.formId - Form definition ID (required)
   * @param {number} formSubmission.subjectId - Subject ID (null for screening forms)
   * @param {number} formSubmission.visitId - Visit ID (null for non-visit forms)
   * @param {number} formSubmission.siteId - Site ID (optional)
   * @param {Object} formSubmission.formData - Form field data as key-value pairs (required)
   * @param {string} formSubmission.status - Form status: DRAFT, SUBMITTED, LOCKED (default: SUBMITTED)
   * @param {string} formSubmission.relatedRecordId - UUID of related record (optional)
   * 
   * @returns {Promise<Object>} Response with formDataId and recordId
   * 
   * @example
   * const screeningData = {
   *   studyId: 1,
   *   formId: 5,
   *   subjectId: null, // null for screening (pre-enrollment)
   *   visitId: null,
   *   siteId: 10,
   *   formData: {
   *     eligibility_age: true,
   *     eligibility_diagnosis: true,
   *     eligibility_exclusions: false,
   *     eligibility_consent: true,
   *     screening_date: '2025-10-12',
   *     assessor_name: 'Dr. Sarah Chen',
   *     notes: 'Subject meets all criteria'
   *   },
   *   status: 'SUBMITTED',
   *   relatedRecordId: 'uuid-of-status-change'
   * };
   * 
   * const response = await FormDataService.submitFormData(screeningData);
   * console.log('Form submitted:', response.formDataId);
   */
  submitFormData: async (formSubmission) => {
    try {
      // Validation
      const requiredFields = ['studyId', 'formId', 'formData'];
      for (const field of requiredFields) {
        if (!formSubmission[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      // Validate form data is not empty
      if (!formSubmission.formData || Object.keys(formSubmission.formData).length === 0) {
        throw new Error('Form data cannot be empty');
      }

      // Validate status
      const validStatuses = ['DRAFT', 'SUBMITTED', 'LOCKED'];
      const status = formSubmission.status || 'SUBMITTED';
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

      // Submit to backend
      const response = await ApiService.post('/clinops-ws/api/v1/form-data', {
        ...formSubmission,
        status
      });

      console.log('[FORM_DATA_SERVICE] Form submission successful:', {
        formDataId: response.data.formDataId,
        recordId: response.data.recordId,
        message: response.data.message
      });

      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Error submitting form data:', error);
      
      // Extract error message from response
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },

  /**
   * Get all form submissions for a subject
   * 
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Array>} Array of form submissions
   * 
   * @example
   * const forms = await FormDataService.getSubjectForms(1001);
   * console.log(`Subject has ${forms.length} form submissions`);
   */
  getSubjectForms: async (subjectId) => {
    try {
      if (!subjectId) {
        throw new Error('Subject ID is required');
      }

      console.log('[FORM_DATA_SERVICE] Fetching forms for subject:', subjectId);

      const response = await ApiService.get(`/clinops-ws/api/v1/form-data/subject/${subjectId}`);

      console.log('[FORM_DATA_SERVICE] Found forms for subject:', {
        subjectId,
        count: response.data.length
      });

      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Error fetching subject forms:', error);
      throw error;
    }
  },

  /**
   * Get all form submissions for a study
   * 
   * @param {number} studyId - Study ID
   * @returns {Promise<Array>} Array of form submissions
   */
  getStudyForms: async (studyId) => {
    try {
      if (!studyId) {
        throw new Error('Study ID is required');
      }

      console.log('[FORM_DATA_SERVICE] Fetching forms for study:', studyId);

      const response = await ApiService.get(`/clinops-ws/api/v1/form-data/study/${studyId}`);

      console.log('[FORM_DATA_SERVICE] Found forms for study:', {
        studyId,
        count: response.data.length
      });

      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Error fetching study forms:', error);
      throw error;
    }
  },

  /**
   * Get specific form submission by ID
   * 
   * @param {number} formDataId - Form data record ID
   * @returns {Promise<Object>} Form submission
   */
  getFormDataById: async (formDataId) => {
    try {
      if (!formDataId) {
        throw new Error('Form data ID is required');
      }

      console.log('[FORM_DATA_SERVICE] Fetching form data by ID:', formDataId);

      const response = await ApiService.get(`/clinops-ws/api/v1/form-data/${formDataId}`);

      console.log('[FORM_DATA_SERVICE] Form data retrieved:', {
        id: response.data.id,
        studyId: response.data.studyId,
        formId: response.data.formId,
        status: response.data.status
      });

      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Error fetching form data:', error);
      throw error;
    }
  },

  /**
   * Get form submissions by study and form definition
   * 
   * Example: Get all screening assessments for a study
   * 
   * @param {number} studyId - Study ID
   * @param {number} formId - Form definition ID
   * @returns {Promise<Array>} Array of form submissions
   */
  getFormDataByStudyAndForm: async (studyId, formId) => {
    try {
      if (!studyId || !formId) {
        throw new Error('Study ID and Form ID are required');
      }

      console.log('[FORM_DATA_SERVICE] Fetching form data:', { studyId, formId });

      const response = await ApiService.get(
        `/clinops-ws/api/v1/form-data/study/${studyId}/form/${formId}`
      );

      console.log('[FORM_DATA_SERVICE] Found form submissions:', {
        studyId,
        formId,
        count: response.data.length
      });

      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Error fetching form data by study and form:', error);
      throw error;
    }
  },

  /**
   * Health check
   * 
   * @returns {Promise<string>} Health status
   */
  healthCheck: async () => {
    try {
      const response = await ApiService.get('/clinops-ws/api/v1/form-data/health');
      return response.data;
    } catch (error) {
      console.error('[FORM_DATA_SERVICE] Health check failed:', error);
      throw error;
    }
  }
};

export default FormDataService;
