import ApiService from './ApiService';

const API_PATH = '/study-design-ws/api/forms';

/**
 * Service for handling Form operations
 */
class FormService {
  /**
   * Get all forms
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
      // Add fields property if not present (required by database)
      const enhancedFormData = {
        ...formData,
        // Default empty fields JSON if not provided
        fields: formData.fields || '[]',
        // Ensure formDefinition is a valid JSON string
        formDefinition: formData.formDefinition || '{}',
      };
      
      try {
        const response = await ApiService.post(API_PATH, enhancedFormData);
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
      const response = await ApiService.get(`${API_PATH}/study/${studyId}`);
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
        const response = await ApiService.post(`/study-design-ws/api/visit-forms`, visitFormData);
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
        const visitFormsResponse = await ApiService.get(`/study-design-ws/api/visit-forms/visit/${visitId}`);
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
        const response = await ApiService.delete(`/study-design-ws/api/visit-forms/${visitForm.id}`);
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
        status: 'Published',
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
        status: 'Published',
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
        status: 'Draft',
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
        status: 'Published',
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

  /**
   * Get available form templates
   * @returns {Promise<Array>} Promise that resolves to an array of form templates
   */
  async getFormTemplates() {
    try {
      const response = await ApiService.get(`${API_PATH}/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form templates:', error);
      // Return mock templates when backend is unavailable
      return this.getMockFormTemplates();
    }
  }

  /**
   * Create a form from a template
   * @param {string} templateId - The ID of the template to use
   * @param {Object} formData - Additional form data (name, description, etc.)
   * @returns {Promise<Object>} Promise that resolves to the created form
   */
  async createFormFromTemplate(templateId, formData) {
    try {
      const template = await this.getFormTemplateById(templateId);
      const formDataWithTemplate = {
        ...formData,
        structure: template.structure,
        fields: JSON.stringify(template.structure.sections || []),
        formDefinition: JSON.stringify(template.structure || {}),
        templateId: templateId,
        type: template.type
      };
      
      return await this.createForm(formDataWithTemplate);
    } catch (error) {
      console.error('Error creating form from template:', error);
      throw error;
    }
  }

  /**
   * Get a form template by ID
   * @param {string} templateId - The ID of the template to retrieve
   * @returns {Promise<Object>} Promise that resolves to the template data
   */
  async getFormTemplateById(templateId) {
    try {
      const response = await ApiService.get(`${API_PATH}/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template with ID ${templateId}:`, error);
      // Return mock template when backend is unavailable
      const mockTemplates = this.getMockFormTemplates();
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        return template;
      }
      throw new Error(`Template with ID ${templateId} not found`);
    }
  }

  /**
   * Get mock form templates for development/fallback
   * @returns {Array} Array of mock form templates
   */
  getMockFormTemplates() {
    return [
      {
        id: 'TEMPLATE-001',
        name: 'Demographics Template',
        description: 'Standard patient demographics collection form',
        type: 'Demographics',
        category: 'Patient Information',
        icon: '👤',
        complexity: 'Basic',
        estimatedTime: '5-10 minutes',
        structure: {
          sections: [
            {
              id: 'demographics_basic',
              name: 'Basic Information',
              description: 'Essential patient demographic information',
              isTableLayout: false,
              fields: [
                {
                  id: 'subject_id',
                  name: 'subject_id',
                  label: 'Subject ID',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Unique identifier for the study subject',
                    sdvFlag: 'Required',
                    cdashMapping: 'USUBJID',
                    sdtmVariable: 'DM.USUBJID'
                  }
                },
                {
                  id: 'first_name',
                  name: 'first_name',
                  label: 'First Name',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Subject\'s first name',
                    sdvFlag: 'Optional',
                    cdashMapping: 'FNAME'
                  }
                },
                {
                  id: 'last_name',
                  name: 'last_name',
                  label: 'Last Name',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Subject\'s last name',
                    sdvFlag: 'Optional',
                    cdashMapping: 'LNAME'
                  }
                },
                {
                  id: 'date_of_birth',
                  name: 'date_of_birth',
                  label: 'Date of Birth',
                  type: 'date',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Subject\'s date of birth (YYYY-MM-DD)',
                    sdvFlag: 'Required',
                    cdashMapping: 'BRTHDTC',
                    sdtmVariable: 'DM.BRTHDTC'
                  }
                },
                {
                  id: 'gender',
                  name: 'gender',
                  label: 'Sex',
                  type: 'select',
                  required: true,
                  options: ['Male', 'Female'],
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Biological sex at birth',
                    sdvFlag: 'Required',
                    cdashMapping: 'SEX',
                    sdtmVariable: 'DM.SEX'
                  }
                },
                {
                  id: 'race',
                  name: 'race',
                  label: 'Race',
                  type: 'select',
                  required: true,
                  options: ['White', 'Black or African American', 'Asian', 'American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'Other'],
                  metadata: {
                    fieldWidth: 'col-span-12',
                    helpText: 'Subject\'s racial background',
                    sdvFlag: 'Required',
                    cdashMapping: 'RACE',
                    sdtmVariable: 'DM.RACE'
                  }
                }
              ]
            }
          ]
        }
      },
      {
        id: 'TEMPLATE-002',
        name: 'Adverse Event Template',
        description: 'Comprehensive adverse event reporting form',
        type: 'Safety',
        category: 'Safety & Monitoring',
        icon: '⚠️',
        complexity: 'Advanced',
        estimatedTime: '15-20 minutes',
        structure: {
          sections: [
            {
              id: 'ae_details',
              name: 'Adverse Event Details',
              description: 'Primary adverse event information',
              isTableLayout: false,
              fields: [
                {
                  id: 'ae_term',
                  name: 'ae_term',
                  label: 'Adverse Event Term',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-12',
                    helpText: 'Preferred term for the adverse event',
                    sdvFlag: 'Required',
                    medicalReview: 'Required',
                    cdashMapping: 'AETERM',
                    sdtmVariable: 'AE.AETERM',
                    medraMapping: 'Required - PT Level'
                  }
                },
                {
                  id: 'ae_start_date',
                  name: 'ae_start_date',
                  label: 'Start Date',
                  type: 'date',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Date when adverse event started',
                    sdvFlag: 'Required',
                    cdashMapping: 'AESTDTC',
                    sdtmVariable: 'AE.AESTDTC'
                  }
                },
                {
                  id: 'ae_end_date',
                  name: 'ae_end_date',
                  label: 'End Date',
                  type: 'date',
                  required: false,
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Date when adverse event resolved (if applicable)',
                    sdvFlag: 'Optional',
                    cdashMapping: 'AEENDTC',
                    sdtmVariable: 'AE.AEENDTC'
                  }
                },
                {
                  id: 'ae_severity',
                  name: 'ae_severity',
                  label: 'Severity',
                  type: 'select',
                  required: true,
                  options: ['Mild', 'Moderate', 'Severe'],
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Clinical severity of the adverse event',
                    sdvFlag: 'Required',
                    medicalReview: 'Required',
                    cdashMapping: 'AESEV',
                    sdtmVariable: 'AE.AESEV'
                  }
                },
                {
                  id: 'ae_relationship',
                  name: 'ae_relationship',
                  label: 'Relationship to Study Drug',
                  type: 'select',
                  required: true,
                  options: ['Related', 'Possibly Related', 'Probably Related', 'Not Related'],
                  metadata: {
                    fieldWidth: 'col-span-6',
                    helpText: 'Investigator assessment of relationship to study treatment',
                    sdvFlag: 'Required',
                    medicalReview: 'Required',
                    cdashMapping: 'AEREL',
                    sdtmVariable: 'AE.AEREL'
                  }
                }
              ]
            }
          ]
        }
      },
      {
        id: 'TEMPLATE-003',
        name: 'Vital Signs Template',
        description: 'Standard vital signs measurements',
        type: 'Efficacy',
        category: 'Clinical Assessments',
        icon: '🩺',
        complexity: 'Intermediate',
        estimatedTime: '10-15 minutes',
        structure: {
          sections: [
            {
              id: 'vital_signs',
              name: 'Vital Signs Measurements',
              description: 'Standard vital signs collection',
              isTableLayout: true,
              fields: [
                {
                  id: 'vs_date',
                  name: 'vs_date',
                  label: 'Date',
                  type: 'date',
                  required: true,
                  metadata: {
                    helpText: 'Date of vital signs assessment',
                    sdvFlag: 'Required',
                    cdashMapping: 'VSDTC',
                    sdtmVariable: 'VS.VSDTC'
                  }
                },
                {
                  id: 'vs_time',
                  name: 'vs_time',
                  label: 'Time',
                  type: 'time',
                  required: true,
                  metadata: {
                    helpText: 'Time of vital signs assessment',
                    sdvFlag: 'Optional',
                    cdashMapping: 'VSTIM',
                    sdtmVariable: 'VS.VSTIM'
                  }
                },
                {
                  id: 'systolic_bp',
                  name: 'systolic_bp',
                  label: 'Systolic BP (mmHg)',
                  type: 'number',
                  required: true,
                  metadata: {
                    helpText: 'Systolic blood pressure in mmHg',
                    sdvFlag: 'Required',
                    cdashMapping: 'VSORRES',
                    sdtmVariable: 'VS.VSORRES',
                    unit: 'mmHg'
                  }
                },
                {
                  id: 'diastolic_bp',
                  name: 'diastolic_bp',
                  label: 'Diastolic BP (mmHg)',
                  type: 'number',
                  required: true,
                  metadata: {
                    helpText: 'Diastolic blood pressure in mmHg',
                    sdvFlag: 'Required',
                    cdashMapping: 'VSORRES',
                    sdtmVariable: 'VS.VSORRES',
                    unit: 'mmHg'
                  }
                },
                {
                  id: 'heart_rate',
                  name: 'heart_rate',
                  label: 'Heart Rate (bpm)',
                  type: 'number',
                  required: true,
                  metadata: {
                    helpText: 'Heart rate in beats per minute',
                    sdvFlag: 'Required',
                    cdashMapping: 'VSORRES',
                    sdtmVariable: 'VS.VSORRES',
                    unit: 'beats/min'
                  }
                }
              ]
            }
          ]
        }
      },
      {
        id: 'TEMPLATE-004',
        name: 'Laboratory Results Template',
        description: 'Clinical laboratory values collection',
        type: 'Laboratory',
        category: 'Laboratory & Diagnostics',
        icon: '🧪',
        complexity: 'Advanced',
        estimatedTime: '20-30 minutes',
        structure: {
          sections: [
            {
              id: 'lab_chemistry',
              name: 'Clinical Chemistry',
              description: 'Standard chemistry panel results',
              isTableLayout: true,
              fields: [
                {
                  id: 'lab_date',
                  name: 'lab_date',
                  label: 'Collection Date',
                  type: 'date',
                  required: true,
                  metadata: {
                    helpText: 'Date of laboratory sample collection',
                    sdvFlag: 'Required',
                    cdashMapping: 'LBDTC',
                    sdtmVariable: 'LB.LBDTC'
                  }
                },
                {
                  id: 'glucose',
                  name: 'glucose',
                  label: 'Glucose (mg/dL)',
                  type: 'number',
                  required: false,
                  metadata: {
                    helpText: 'Serum glucose level',
                    sdvFlag: 'Optional',
                    cdashMapping: 'LBORRES',
                    sdtmVariable: 'LB.LBORRES',
                    unit: 'mg/dL',
                    normalRange: '70-100'
                  }
                },
                {
                  id: 'creatinine',
                  name: 'creatinine',
                  label: 'Creatinine (mg/dL)',
                  type: 'number',
                  required: false,
                  metadata: {
                    helpText: 'Serum creatinine level',
                    sdvFlag: 'Required',
                    cdashMapping: 'LBORRES',
                    sdtmVariable: 'LB.LBORRES',
                    unit: 'mg/dL',
                    normalRange: '0.7-1.3'
                  }
                },
                {
                  id: 'alt',
                  name: 'alt',
                  label: 'ALT (U/L)',
                  type: 'number',
                  required: false,
                  metadata: {
                    helpText: 'Alanine aminotransferase level',
                    sdvFlag: 'Required',
                    cdashMapping: 'LBORRES',
                    sdtmVariable: 'LB.LBORRES',
                    unit: 'U/L',
                    normalRange: '7-56'
                  }
                }
              ]
            }
          ]
        }
      },
      {
        id: 'TEMPLATE-005',
        name: 'Concomitant Medications Template',
        description: 'Concurrent medication tracking form',
        type: 'Medication',
        category: 'Medication Management',
        icon: '💊',
        complexity: 'Intermediate',
        estimatedTime: '10-15 minutes',
        structure: {
          sections: [
            {
              id: 'conmed_details',
              name: 'Concomitant Medication Details',
              description: 'Details of concurrent medications',
              isTableLayout: false,
              fields: [
                {
                  id: 'med_name',
                  name: 'med_name',
                  label: 'Medication Name',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-12',
                    helpText: 'Generic or brand name of the medication',
                    sdvFlag: 'Required',
                    cdashMapping: 'CMTRT',
                    sdtmVariable: 'CM.CMTRT',
                    whodruggMapping: 'Required - Drug Name'
                  }
                },
                {
                  id: 'med_dose',
                  name: 'med_dose',
                  label: 'Dose',
                  type: 'text',
                  required: true,
                  metadata: {
                    fieldWidth: 'col-span-4',
                    helpText: 'Dose amount and unit',
                    sdvFlag: 'Required',
                    cdashMapping: 'CMDOSE',
                    sdtmVariable: 'CM.CMDOSE'
                  }
                },
                {
                  id: 'med_frequency',
                  name: 'med_frequency',
                  label: 'Frequency',
                  type: 'select',
                  required: true,
                  options: ['Once Daily', 'Twice Daily', 'Three Times Daily', 'Four Times Daily', 'As Needed', 'Other'],
                  metadata: {
                    fieldWidth: 'col-span-4',
                    helpText: 'Dosing frequency',
                    sdvFlag: 'Required',
                    cdashMapping: 'CMDOSFRQ',
                    sdtmVariable: 'CM.CMDOSFRQ'
                  }
                },
                {
                  id: 'med_route',
                  name: 'med_route',
                  label: 'Route',
                  type: 'select',
                  required: true,
                  options: ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Other'],
                  metadata: {
                    fieldWidth: 'col-span-4',
                    helpText: 'Route of administration',
                    sdvFlag: 'Required',
                    cdashMapping: 'CMROUTE',
                    sdtmVariable: 'CM.CMROUTE'
                  }
                }
              ]
            }
          ]
        }
      }
    ];
  }
}

export default new FormService();
