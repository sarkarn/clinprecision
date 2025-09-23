import ApiService from './ApiService';

const API_PATH = '/api/visit-definitions';  // Updated to match backend API definitions

/**
 * Service for handling Visit operations
 * Updated to match backend API: /api/visit-definitions
 */
class VisitService {
  /**
   * Get all visits for a study
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of visits
   */
  async getVisitsByStudy(studyId) {
    try {
      const response = await ApiService.get(`${API_PATH}/study/${studyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Get a visit by ID
   * @param {string} visitId - The ID of the visit to retrieve
   * @returns {Promise<Object>} Promise that resolves to the visit data
   */
  async getVisitById(visitId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new visit for a study
   * @param {Object} visitData - The visit data to create (must include studyId)
   * @returns {Promise<Object>} Promise that resolves to the created visit
   */
  async createVisit(visitData) {
    try {
      const response = await ApiService.post(`${API_PATH}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error creating visit:`, error);
      throw error;
    }
  }

  /**
   * Update an existing visit
   * @param {string} visitId - The ID of the visit to update
   * @param {Object} visitData - The updated visit data
   * @returns {Promise<Object>} Promise that resolves to the updated visit
   */
  async updateVisit(visitId, visitData) {
    try {
      const response = await ApiService.put(`${API_PATH}/${visitId}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error updating visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a visit by ID
   * @param {string} visitId - The ID of the visit to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteVisit(visitId) {
    try {
      const response = await ApiService.delete(`${API_PATH}/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Get all forms associated with a visit (may need backend support)
   * @param {string} visitId - The ID of the visit
   * @returns {Promise<Array>} Promise that resolves to an array of forms for the visit
   */
  async getVisitForms(visitId) {
    try {
      // Note: This may need backend endpoint /api/visit-definitions/{id}/forms
      const response = await ApiService.get(`${API_PATH}/${visitId}/forms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for visit ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Order visits within a study (may need backend support)
   * @param {string} studyId - The ID of the study
   * @param {Array} visitOrder - Array of visit IDs in the desired order
   * @returns {Promise<Object>} Promise that resolves to the ordering confirmation
   */
  async orderVisits(studyId, visitOrder) {
    try {
      // Note: This may need backend endpoint /api/visit-definitions/study/{studyId}/order
      const response = await ApiService.put(`${API_PATH}/study/${studyId}/order`, { visitOrder });
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
      // Use query parameter to filter visits by arm
      const response = await ApiService.get(`${API_PATH}/study/${studyId}?armId=${armId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for arm ${armId} in study ${studyId}:`, error);
      throw error;
    }
  }

  // Arm association methods (updated for new API structure)
  /**
   * Add a visit to an arm in a study
   * @param {string} armId - The ID of the arm
   * @param {string} visitId - The ID of the visit to add
   * @returns {Promise<Object>} Promise that resolves to the association confirmation
   */
  async addVisitToArm(armId, visitId) {
    try {
      // Update the visit to associate it with the arm
      const visitData = { armId: armId };
      const response = await ApiService.put(`${API_PATH}/${visitId}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error adding visit ${visitId} to arm ${armId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a visit from an arm
   * @param {string} visitId - The ID of the visit to remove from arm
   * @returns {Promise<Object>} Promise that resolves to the disassociation confirmation
   */
  async removeVisitFromArm(visitId) {
    try {
      // Update the visit to remove arm association (set armId to null)
      const visitData = { armId: null };
      const response = await ApiService.put(`${API_PATH}/${visitId}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error removing visit ${visitId} from arm:`, error);
      throw error;
    }
  }

  // Form binding methods (these may need separate API endpoints)
  /**
   * Get form bindings for all visits in a study
   * Note: This may need a separate API endpoint for form bindings
   * @param {string} studyId - The ID of the study
   * @returns {Promise<Array>} Promise that resolves to an array of visit-form bindings
   */
  async getVisitFormBindings(studyId) {
    try {
      // This might need to be handled by a separate FormBindingService
      const response = await ApiService.get(`/api/studies/${studyId}/form-bindings`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`Form bindings endpoint for study ${studyId} returned 404, returning empty array`);
        return [];
      }
      console.error(`Error fetching form bindings for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update form binding for a visit
   * Note: This may need a separate API endpoint for form bindings
   * @param {string} visitId - The ID of the visit
   * @param {string} formId - The ID of the form
   * @param {Object} bindingData - The binding configuration data
   * @returns {Promise<Object>} Promise that resolves to the created/updated binding
   */
  async createFormBinding(visitId, formId, bindingData) {
    try {
      // This might need to be handled by a separate FormBindingService
      const response = await ApiService.post(`/api/form-bindings`, {
        visitId,
        formId,
        ...bindingData
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating form binding for visit ${visitId}, form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Remove form binding from a visit
   * @param {string} bindingId - The ID of the binding to remove
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async removeFormBinding(bindingId) {
    try {
      const response = await ApiService.delete(`/api/form-bindings/${bindingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing form binding ${bindingId}:`, error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  /**
   * @deprecated This method name is confusing, use the main getVisitsByStudy method
   */
  async getStudyVisits(studyId) {
    return this.getVisitsByStudy(studyId);
  }

  /**
   * @deprecated Use createVisit(visitData) with studyId in visitData instead
   */
  async createVisitForStudy(studyId, visitData) {
    return this.createVisit({ ...visitData, studyId });
  }

  /**
   * @deprecated Use updateVisit(visitId, visitData) instead
   */
  async updateVisitForStudy(studyId, visitId, visitData) {
    return this.updateVisit(visitId, visitData);
  }

  /**
   * @deprecated Use deleteVisit(visitId) instead
   */
  async deleteVisitFromStudy(studyId, visitId) {
    return this.deleteVisit(visitId);
  }
}

export default new VisitService();
