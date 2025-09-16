import ApiService from './ApiService';

const API_PATH = '/api/studies';  // Changed from '/study-design-ws/api/studies' to match StudyDesignService pattern

/**
 * Service for handling Visit operations
 */
class VisitService {
  /**
   * Get all  async deleteFormBinding(bindingId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/form-bindings/${bindingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting form binding ${bindingId}:`, error);
      throw error;
    }
  }dy
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of visits
   */
  async getVisitsByStudy(studyId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${studyId}/visits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Get a visit by ID
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit to retrieve
   * @returns {Promise<Object>} Promise that resolves to the visit data
   */
  async getVisitById(studyId, visitId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${studyId}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new visit for a study
   * @param {string} studyId - The ID of the study
   * @param {string} armId - The ID of the arm
   * @param {Object} visitData - The visit data to create
   * @returns {Promise<Object>} Promise that resolves to the created visit
   */
  async createVisit(studyId, armId, visitData) {
    try {
      const response = await ApiService.post(`${API_PATH}/${studyId}/arms/${armId}/visits`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error creating visit for study ${studyId}, arm ${armId}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing visit
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit to update
   * @param {Object} visitData - The updated visit data
   * @returns {Promise<Object>} Promise that resolves to the updated visit
   */
  async updateVisit(studyId, visitId, visitData) {
    try {
      const response = await ApiService.put(`${API_PATH}/${studyId}/visits/${visitId}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error updating visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a visit by ID
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteVisit(studyId, visitId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/${studyId}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Get all forms associated with a visit
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @returns {Promise<Array>} Promise that resolves to an array of forms for the visit
   */
  async getVisitForms(studyId, visitId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${studyId}/visits/${visitId}/forms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for visit ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Order visits within a study
   * @param {string} studyId - The ID of the study
   * @param {Array} visitOrder - Array of visit IDs in the desired order
   * @returns {Promise<Object>} Promise that resolves to the ordering confirmation
   */
  async orderVisits(studyId, visitOrder) {
    try {
      const response = await ApiService.put(`${API_PATH}/${studyId}/visits/order`, { visitOrder });
      return response.data;
    } catch (error) {
      console.error(`Error ordering visits for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Get all visits for a specific arm in a study
   * @param {string} studyId - The ID of the study
   * @param {string} armId - The ID of the arm
   * @returns {Promise<Array>} Promise that resolves to an array of visits for the arm
   */
  async getVisitsByArm(studyId, armId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${studyId}/arms/${armId}/visits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for arm ${armId} in study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Add a visit to an arm in a study
   * @param {string} studyId - The ID of the study
   * @param {string} armId - The ID of the arm
   * @param {string} visitId - The ID of the visit to add
   * @returns {Promise<Object>} Promise that resolves to the association confirmation
   */
  async addVisitToArm(studyId, armId, visitId) {
    try {
      const response = await ApiService.post(`${API_PATH}/${studyId}/arms/${armId}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding visit ${visitId} to arm ${armId} in study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a visit from an arm in a study
   * @param {string} studyId - The ID of the study
   * @param {string} armId - The ID of the arm
   * @param {string} visitId - The ID of the visit to remove
   * @returns {Promise<Object>} Promise that resolves to the disassociation confirmation
   */
  async removeVisitFromArm(studyId, armId, visitId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/${studyId}/arms/${armId}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing visit ${visitId} from arm ${armId} in study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Get form bindings for all visits in a study
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of visit-form bindings
   */
  async getVisitFormBindings(studyId) {
    try {
      try {
        const response = await ApiService.get(`${API_PATH}/${studyId}/form-bindings`);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn(`Form bindings endpoint for study ${studyId} returned 404, returning empty array`);
          return [];
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error fetching form bindings for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update form binding for a visit
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @param {string} formId - The ID of the form
   * @param {Object} bindingData - The binding configuration data
   * @returns {Promise<Object>} Promise that resolves to the created/updated binding
   */
  async createFormBinding(studyId, visitId, formId, bindingData) {
    try {
      const response = await ApiService.post(`${API_PATH}/${studyId}/visits/${visitId}/forms/${formId}`, bindingData);
      return response.data;
    } catch (error) {
      console.error(`Error creating form binding for study ${studyId}, visit ${visitId}, form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Remove form binding from a visit
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @param {string} formId - The ID of the form
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async removeFormBinding(studyId, visitId, formId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/${studyId}/visits/${visitId}/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing form binding for study ${studyId}, visit ${visitId}, form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Create a visit-form binding
   * @param {Object} bindingData - The binding data containing studyId, visitId, formId, etc.
   * @returns {Promise<Object>} Promise that resolves to the created binding
   */
  async createVisitFormBinding(bindingData) {
    const { studyId, visitId, formId, visitDefinitionId, formDefinitionId } = bindingData;
    // Support both field name formats
    const actualVisitId = visitDefinitionId || visitId;
    const actualFormId = formDefinitionId || formId;
    return this.createFormBinding(studyId, actualVisitId, actualFormId, bindingData);
  }

  /**
   * Delete a visit-form binding by ID
   * @param {string} bindingId - The ID of the binding to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteVisitFormBinding(bindingId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/form-bindings/${bindingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting form binding ${bindingId}:`, error);
      throw error;
    }
  }

  /**
   * Update a visit-form binding
   * @param {string} bindingId - The ID of the binding to update
   * @param {Object} updates - The updates to apply to the binding
   * @returns {Promise<Object>} Promise that resolves to the updated binding
   */
  async updateVisitFormBinding(bindingId, updates) {
    try {
      const response = await ApiService.put(`${API_PATH}/form-bindings/${bindingId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating form binding ${bindingId}:`, error);
      throw error;
    }
  }
}

export default new VisitService();
