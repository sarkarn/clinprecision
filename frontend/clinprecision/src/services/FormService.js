import ApiService from './ApiService';

// NEW DDD-aligned URLs (Module 1.3 Phase 2)
const API_PATH = '/clinops-ws/api/v1/study-design/form-templates'; // Global form library/templates
const FORM_DEFINITIONS_PATH = '/clinops-ws/api/v1/study-design/form-definitions'; // Study-specific forms

// OLD URLs (deprecated - sunset: April 19, 2026)
// const API_PATH = '/clinops-ws/api/form-templates';
// const FORM_DEFINITIONS_PATH = '/clinops-ws/api/form-definitions';

/**
 * Service for handling Form operations
 */
class FormService {
  /**
   * Get all forms (global form library/templates)
   * @returns {Promise<Array>} Promise that resolves to an array of forms
   */
  async getForms() {
    try {
      const response = await ApiService.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      // Return mock data when backend is unavailable
      return this.getMockForms();
    }
  }

  /**
   * Get a form by ID
   * @param {string} formId - The ID of the form to retrieve
   * @returns {Promise<Object>} Promise that resolves to the form data
   */
  async getFormById(formId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching form with ID ${formId}:`, error);
      // Return mock data when backend is unavailable
      const mockForms = this.getMockForms();
      const form = mockForms.find(f => f.id === formId);
      if (form) {
        return form;
      }
      throw new Error(`Form with ID ${formId} not found`);
    }
  }

  /**
   * Create a new form
   * @param {Object} formData - The form data to create
   * @returns {Promise<Object>} Promise that resolves to the created form
   */
  async createForm(formData) {
    try {
      console.log('*** FormService.createForm() ENTRY POINT ***');
      console.log('This should call FormTemplateController, NOT FormDefinitionController');
      console.log('FormService.createForm() called with data:', formData);
      
      // Add fields property if not present (required by database)
      const enhancedFormData = {
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
        return response.data;
      } catch (error) {
        // If we get a server error, create a mock form with a temporary ID
        if (error.response && (error.response.status === 500 || error.response.status === 404)) {
          console.warn('Error creating form, creating mock form instead:', error);
          return {
            id: `temp-form-${Date.now()}`,
            ...formData,
            createdAt: new Date().toISOString()
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  }

  /**
   * Update an existing form
   * @param {string} formId - The ID of the form to update
   * @param {Object} formData - The updated form data
   * @returns {Promise<Object>} Promise that resolves to the updated form
   */
  async updateForm(formId, formData) {
    try {
      // Check if this is a temporary ID (starts with 'temp-')
      if (formId && formId.toString().startsWith('temp-')) {
        console.log(`Skipping update for temporary form ${formId}, would update it on the server if endpoint existed`);
        return formData; // Just return the data as-is for temporary forms
      }
      
      // Add fields property if not present (required by database)
      const enhancedFormData = {
        ...formData,
        // Default empty fields JSON if not provided
        fields: formData.fields || '[]'
      };
      
      try {
        const response = await ApiService.put(`${API_PATH}/${formId}`, enhancedFormData);
        return response.data;
      } catch (error) {
        // If we get a server error, return the original data
        if (error.response && (error.response.status === 500 || error.response.status === 404)) {
          console.warn(`Error updating form ${formId}, returning original data:`, error);
          return formData;
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error updating form with ID ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a form by ID
   * @param {string} formId - The ID of the form to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteForm(formId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting form with ID ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get all versions of a form
   * @param {string} formId - The ID of the form to get versions for
   * @returns {Promise<Array>} Promise that resolves to an array of form versions
   */
  async getFormVersions(formId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for form with ID ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific version of a form
   * @param {string} formId - The ID of the form
   * @param {string} versionId - The ID of the version to retrieve
   * @returns {Promise<Object>} Promise that resolves to the form version data
   */
  async getFormVersion(formId, versionId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions/${versionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching version ${versionId} of form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new version of a form
   * @param {string} formId - The ID of the form to create a new version for
   * @param {Object} versionData - The data for the new version
   * @returns {Promise<Object>} Promise that resolves to the created form version
   */
  async createFormVersion(formId, versionData) {
    try {
      const response = await ApiService.post(`${API_PATH}/${formId}/versions`, versionData);
      return response.data;
    } catch (error) {
      console.error(`Error creating new version for form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get forms associated with a study
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of forms for the study
   */
  async getFormsByStudy(studyId) {
    try {
      const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Associate a form with a visit in a study
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @param {string} formId - The ID of the form to associate
   * @returns {Promise<Object>} Promise that resolves to the association confirmation
   */
  async associateFormWithVisit(studyId, visitId, formId, formData = {}) {
    try {
      // Check if either ID is temporary
      if ((formId && formId.toString().startsWith('temp-')) || 
          (visitId && visitId.toString().startsWith('temp-'))) {
        console.log(`Skipping association for temporary IDs - form: ${formId}, visit: ${visitId}`);
        return { success: true }; // Mock success for temporary IDs
      }
      
      // Create a visit form association using the /api/visit-forms endpoint
      const visitFormData = {
        visitDefinitionId: visitId,
        formId: formId,
        studyId: studyId,
        ...formData
      };
      
      try {
        const response = await ApiService.post(`/clinops-ws/api/visit-forms`, visitFormData);
        return response.data;
      } catch (error) {
        // If we get a server error (404/500), return a mock success
        if (error.response && (error.response.status === 404 || error.response.status === 500)) {
          console.warn(`Error associating form ${formId} with visit ${visitId}, returning mock success:`, error);
          return { success: true, mock: true };
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error associating form ${formId} with visit ${visitId} in study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a form association from a visit in a study
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @param {string} formId - The ID of the form to remove
   * @returns {Promise<Object>} Promise that resolves to the disassociation confirmation
   */
  async removeFormFromVisit(studyId, visitId, formId) {
    try {
      // Check if either ID is temporary
      if ((formId && formId.toString().startsWith('temp-')) || 
          (visitId && visitId.toString().startsWith('temp-'))) {
        console.log(`Skipping removal for temporary IDs - form: ${formId}, visit: ${visitId}`);
        return { success: true }; // Mock success for temporary IDs
      }
      
      try {
        // First, we need to get the visitFormId from the visit-forms endpoint
        const visitFormsResponse = await ApiService.get(`/clinops-ws/api/visit-forms/visit/${visitId}`);
        const visitForms = visitFormsResponse.data;
        
        if (!Array.isArray(visitForms) || visitForms.length === 0) {
          console.warn(`No visit forms found for visit ${visitId}`);
          return { success: true }; // Nothing to delete
        }
        
        const visitForm = visitForms.find(vf => String(vf.formId) === String(formId));
        
        if (!visitForm) {
          console.warn(`Form ${formId} not found for visit ${visitId}`);
          return { success: true }; // Nothing to delete
        }
        
        // Delete the visit-form association using its ID
        const response = await ApiService.delete(`/clinops-ws/api/visit-forms/${visitForm.id}`);
        return response.data;
      } catch (error) {
        // If we get a server error (404/500), return a mock success
        if (error.response && (error.response.status === 404 || error.response.status === 500)) {
          console.warn(`Error removing form ${formId} from visit ${visitId}, returning mock success:`, error);
          return { success: true, mock: true };
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error removing form ${formId} from visit ${visitId} in study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Mock data for development when backend is unavailable
   */
  getMockForms() {
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
  }
}

export default new FormService();
