import ApiService from './ApiService';

const FORM_DEFINITIONS_PATH = '/clinops-ws/api/form-definitions';
const FORM_TEMPLATES_PATH = '/clinops-ws/api/form-templates'; // Updated to clinops-ws since templates moved to Clinical Operations Service

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
      throw error;
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
      throw error;
    }
  }

  /**
   * Create a new study form from scratch
   * @param {Object} formData - The form data to create
   * @returns {Promise<Object>} Promise that resolves to the created form
   */
  async createStudyForm(formData) {
    try {
      console.log('*** StudyFormService.createStudyForm() ENTRY POINT ***');
      console.log('StudyFormService.createStudyForm() called with data:', formData);
      console.log('This should call FormDefinitionController, NOT FormTemplateController');
      
      const enhancedFormData = {
        ...formData,
        // Map frontend field names to backend DTO field names
        formType: formData.type || formData.formType || 'General',  // Map 'type' to 'formType'
        structure: formData.formDefinition || formData.structure || '{}',  // Map 'formDefinition' to 'structure'
        // Ensure required fields for form_definitions table
        fields: formData.fields || '[]',
        version: formData.version || '1.0',
        isLatestVersion: true,
        status: formData.status || 'DRAFT',
        // Ensure templateId is either null or a valid Long
        templateId: (formData.templateId && !isNaN(formData.templateId)) ? parseInt(formData.templateId) : null
      };

      console.log('Enhanced form data being sent to API:', enhancedFormData);
      console.log('*** API endpoint:', FORM_DEFINITIONS_PATH);
      console.log('*** Full URL will be: API_BASE_URL + FORM_DEFINITIONS_PATH');
      console.log('*** Expected: http://localhost:8083/clinops-ws/api/form-definitions');
      console.log('*** This should route to FormDefinitionController.createFormDefinition()');
      
      const response = await ApiService.post(FORM_DEFINITIONS_PATH, enhancedFormData);
      console.log('*** StudyFormService API response received:', response.data);
      console.log('*** StudyFormService.createStudyForm() COMPLETED SUCCESSFULLY ***');
      return response.data;
    } catch (error) {
      console.error('Error creating study form:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
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
        throw fallbackError;
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
      throw error;
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
      throw error;
    }
  }
}

export default new StudyFormService();
