import ApiService from './ApiService';

const FORM_DEFINITIONS_PATH = '/study-design-ws/api/form-definitions';
const FORM_TEMPLATES_PATH = '/study-design-ws/api/form-templates'; // For template library access

/**
 * Service for handling Study-specific Form operations
 * Integrates with form_definitions and form_versions tables
 */
class StudyFormService {
  /**
   * Get all forms for a specific study
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of study forms
   */
  async getFormsByStudy(studyId) {
    try {
      const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for study ${studyId}:`, error);
      // Return mock data for development
      return this.getMockStudyForms(studyId);
    }
  }

  /**
   * Get a specific study form by ID
   * @param {string} formId - The ID of the form to retrieve
   * @returns {Promise<Object>} Promise that resolves to the form data
   */
  async getStudyFormById(formId) {
    try {
      const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching study form with ID ${formId}:`, error);
      // Return mock data for development
      const mockForms = this.getMockStudyForms();
      const form = mockForms.find(f => f.id === formId);
      if (form) {
        return form;
      }
      throw new Error(`Study form with ID ${formId} not found`);
    }
  }

  /**
   * Create a new study form from scratch
   * @param {Object} formData - The form data to create
   * @returns {Promise<Object>} Promise that resolves to the created form
   */
  async createStudyForm(formData) {
    try {
      const enhancedFormData = {
        ...formData,
        // Ensure required fields for form_definitions table
        fields: formData.fields || '[]',
        structure: formData.structure || '{}',
        version: formData.version || '1.0',
        isLatestVersion: true,
        status: formData.status || 'DRAFT'
      };

      const response = await ApiService.post(FORM_DEFINITIONS_PATH, enhancedFormData);
      return response.data;
    } catch (error) {
      console.error('Error creating study form:', error);
      // Return mock data for development
      return {
        id: `study-form-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        version: '1.0',
        status: 'DRAFT'
      };
    }
  }

  /**
   * Create a new study form from a template
   * @param {string} studyId - The ID of the study
   * @param {string} templateId - The ID of the template to use
   * @param {string} formName - The name for the new form
   * @param {Object} customizations - Optional customizations to apply
   * @returns {Promise<Object>} Promise that resolves to the created form
   */
  async createStudyFormFromTemplate(studyId, templateId, formName, customizations = {}) {
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
        return await this.updateStudyForm(response.data.id, {
          ...response.data,
          ...customizations
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating study form from template:', error);
      // Fallback: Get template and create form manually
      try {
        const templateResponse = await ApiService.get(`${FORM_TEMPLATES_PATH}/${templateId}`);
        const template = templateResponse.data;
        
        const formData = {
          studyId: parseInt(studyId),
          name: formName,
          description: `Study form based on ${template.name}`,
          formType: template.type || 'Custom',
          fields: template.fields || '[]',
          structure: template.structure || '{}',
          templateId: parseInt(templateId),
          templateVersion: template.version,
          ...customizations
        };
        
        return await this.createStudyForm(formData);
      } catch (fallbackError) {
        console.error('Error in fallback template creation:', fallbackError);
        // Return mock data
        return {
          id: `study-form-${Date.now()}`,
          studyId: parseInt(studyId),
          name: formName,
          description: `Study form based on template ${templateId}`,
          templateId: parseInt(templateId),
          version: '1.0',
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          ...customizations
        };
      }
    }
  }

  /**
   * Update an existing study form
   * @param {string} formId - The ID of the form to update
   * @param {Object} formData - The updated form data
   * @returns {Promise<Object>} Promise that resolves to the updated form
   */
  async updateStudyForm(formId, formData) {
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
      // Return the data as-is for development
      return { ...formData, id: formId, updatedAt: new Date().toISOString() };
    }
  }

  /**
   * Delete a study form
   * @param {string} formId - The ID of the form to delete
   * @returns {Promise<void>} Promise that resolves when form is deleted
   */
  async deleteStudyForm(formId) {
    try {
      await ApiService.delete(`${FORM_DEFINITIONS_PATH}/${formId}`);
    } catch (error) {
      console.error(`Error deleting study form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get forms by study and status
   * @param {string} studyId - The ID of the study
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} Promise that resolves to an array of forms
   */
  async getFormsByStudyAndStatus(studyId, status) {
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
   * @param {string} studyId - The ID of the study
   * @param {string} formType - The form type to filter by
   * @returns {Promise<Array>} Promise that resolves to an array of forms
   */
  async getFormsByStudyAndType(studyId, formType) {
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
   * @param {string} studyId - The ID of the study
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} Promise that resolves to an array of matching forms
   */
  async searchFormsByName(studyId, searchTerm) {
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
   * @param {string} studyId - The ID of the study
   * @param {string} tag - The tag to search for
   * @returns {Promise<Array>} Promise that resolves to an array of matching forms
   */
  async searchFormsByTag(studyId, tag) {
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
   * Lock a study form (prevent further editing)
   * @param {string} formId - The ID of the form to lock
   * @returns {Promise<Object>} Promise that resolves to the locked form
   */
  async lockStudyForm(formId) {
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
   * @param {string} formId - The ID of the form to unlock
   * @returns {Promise<Object>} Promise that resolves to the unlocked form
   */
  async unlockStudyForm(formId) {
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
   * @param {string} formId - The ID of the form to approve
   * @returns {Promise<Object>} Promise that resolves to the approved form
   */
  async approveStudyForm(formId) {
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
   * @param {string} formId - The ID of the form to retire
   * @returns {Promise<Object>} Promise that resolves to the retired form
   */
  async retireStudyForm(formId) {
    try {
      const response = await ApiService.patch(`${FORM_DEFINITIONS_PATH}/${formId}/retire`);
      return response.data;
    } catch (error) {
      console.error(`Error retiring study form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get count of forms for a study
   * @param {string} studyId - The ID of the study
   * @returns {Promise<number>} Promise that resolves to the count
   */
  async getStudyFormCount(studyId) {
    try {
      const response = await ApiService.get(`${FORM_DEFINITIONS_PATH}/study/${studyId}/count`);
      return response.data;
    } catch (error) {
      console.error(`Error getting form count for study ${studyId}:`, error);
      return 0;
    }
  }

  /**
   * Get available form templates for creating study forms
   * @returns {Promise<Array>} Promise that resolves to an array of templates
   */
  async getAvailableTemplates() {
    try {
      const response = await ApiService.get(FORM_TEMPLATES_PATH);
      return response.data;
    } catch (error) {
      console.error('Error fetching form templates:', error);
      // Return mock templates for development
      return this.getMockTemplates();
    }
  }

  /**
   * Mock data for development when backend is unavailable
   */
  getMockStudyForms(studyId = '3') {
    return [
      {
        id: 'SD-FORM-001',
        studyId: parseInt(studyId),
        name: 'Hypertension Study - Screening Form',
        description: 'Initial patient screening for hypertension study',
        formType: 'Screening',
        version: '1.0',
        isLatestVersion: true,
        status: 'PUBLISHED',
        isLocked: true,
        templateId: 'TEMPLATE-001',
        templateVersion: '2.1',
        createdAt: '2024-03-01T09:00:00Z',
        updatedAt: '2024-03-05T14:30:00Z',
        fields: JSON.stringify([
          { id: 'subject_id', name: 'Subject ID', type: 'text', required: true },
          { id: 'screening_date', name: 'Screening Date', type: 'date', required: true },
          { id: 'bp_systolic', name: 'Systolic BP (mmHg)', type: 'number', required: true },
          { id: 'bp_diastolic', name: 'Diastolic BP (mmHg)', type: 'number', required: true }
        ]),
        structure: JSON.stringify({
          sections: [
            {
              id: 'screening_section',
              name: 'Screening Information',
              description: 'Basic screening data collection',
              fields: ['subject_id', 'screening_date', 'bp_systolic', 'bp_diastolic']
            }
          ]
        }),
        tags: 'screening,hypertension,baseline'
      },
      {
        id: 'SD-FORM-002',
        studyId: parseInt(studyId),
        name: 'Hypertension Study - Demographics',
        description: 'Patient demographic information for hypertension study',
        formType: 'Demographics',
        version: '1.2',
        isLatestVersion: true,
        status: 'PUBLISHED',
        isLocked: false,
        templateId: 'TEMPLATE-002',
        templateVersion: '3.0',
        createdAt: '2024-03-02T10:15:00Z',
        updatedAt: '2024-03-10T16:20:00Z',
        fields: JSON.stringify([
          { id: 'first_name', name: 'First Name', type: 'text', required: true },
          { id: 'last_name', name: 'Last Name', type: 'text', required: true },
          { id: 'date_of_birth', name: 'Date of Birth', type: 'date', required: true },
          { id: 'gender', name: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
          { id: 'ethnicity', name: 'Ethnicity', type: 'select', options: ['Hispanic', 'Non-Hispanic'], required: true }
        ]),
        structure: JSON.stringify({
          sections: [
            {
              id: 'demo_basic',
              name: 'Basic Demographics',
              description: 'Core demographic information',
              fields: ['first_name', 'last_name', 'date_of_birth', 'gender', 'ethnicity']
            }
          ]
        }),
        tags: 'demographics,patient_info'
      },
      {
        id: 'SD-FORM-003',
        studyId: parseInt(studyId),
        name: 'Hypertension Study - Adverse Events',
        description: 'Adverse event reporting for hypertension study',
        formType: 'Safety',
        version: '2.0',
        isLatestVersion: true,
        status: 'DRAFT',
        isLocked: false,
        templateId: 'TEMPLATE-003',
        templateVersion: '1.5',
        createdAt: '2024-03-03T11:30:00Z',
        updatedAt: '2024-03-12T13:45:00Z',
        fields: JSON.stringify([
          { id: 'ae_term', name: 'Adverse Event Term', type: 'text', required: true },
          { id: 'onset_date', name: 'Onset Date', type: 'date', required: true },
          { id: 'severity', name: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'], required: true },
          { id: 'relationship', name: 'Relationship to Study Drug', type: 'select', options: ['Related', 'Possibly Related', 'Probably Related', 'Unrelated'], required: true },
          { id: 'outcome', name: 'Outcome', type: 'select', options: ['Resolved', 'Ongoing', 'Fatal'], required: true }
        ]),
        structure: JSON.stringify({
          sections: [
            {
              id: 'ae_details',
              name: 'Adverse Event Details',
              description: 'Detailed adverse event information',
              fields: ['ae_term', 'onset_date', 'severity', 'relationship', 'outcome']
            }
          ]
        }),
        tags: 'safety,adverse_events,monitoring'
      }
    ];
  }

  /**
   * Mock template data for development
   */
  getMockTemplates() {
    return [
      {
        id: 'TEMPLATE-001',
        name: 'Standard Screening Template',
        description: 'Template for patient screening forms',
        type: 'Screening',
        version: '2.1',
        status: 'PUBLISHED'
      },
      {
        id: 'TEMPLATE-002',
        name: 'Demographics Template',
        description: 'Standard demographic data collection',
        type: 'Demographics',
        version: '3.0',
        status: 'PUBLISHED'
      },
      {
        id: 'TEMPLATE-003',
        name: 'Adverse Event Template',
        description: 'Comprehensive adverse event reporting',
        type: 'Safety',
        version: '1.5',
        status: 'PUBLISHED'
      }
    ];
  }
}

export default new StudyFormService();