import ApiService from './ApiService';

/**
 * Service for handling Visit operations
 * Uses DDD/CQRS architecture: /api/v1/study-design/designs/{studyDesignUuid}/visits
 * 
 * NEW URL STRUCTURE: /api/v1/study-design/*
 * OLD URL STRUCTURE: /api/clinops/study-design/* (deprecated)
 * 
 * This service communicates with the Study Design aggregate (event-sourced)
 * using the proper DDD paths instead of legacy bridge endpoints.
 */
class VisitService {
  /**
   * Get all visits for a study (auto-initializes StudyDesign if needed)
   * NEW URL: /api/v1/study-design/studies/{studyId}/visits
   * OLD URL: /api/clinops/study-design/studies/{studyId}/visits (deprecated)
   * 
   * @param {string} studyId - The study ID (legacy ID or UUID)
   * @returns {Promise<Array>} Promise that resolves to an array of visits
   */
  async getVisitsByStudy(studyId) {
    try {
      const response = await ApiService.get(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for study ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Get a visit by ID
   * NEW URL: /api/v1/study-design/designs/{studyDesignUuid}/visits/{visitId}
   * OLD URL: /api/clinops/study-design/{studyDesignUuid}/visits/{visitId} (deprecated)
   * 
   * @param {string} visitId - The UUID of the visit to retrieve
   * @param {string} studyDesignUuid - The UUID of the study design aggregate
   * @returns {Promise<Object>} Promise that resolves to the visit data
   */
  async getVisitById(visitId, studyDesignUuid) {
    try {
      const response = await ApiService.get(`/clinops-ws/api/v1/study-design/designs/${studyDesignUuid}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new visit for a study (auto-initializes StudyDesign if needed)
   * NEW URL: /api/v1/study-design/studies/{studyId}/visits
   * OLD URL: /api/clinops/study-design/studies/{studyId}/visits (deprecated)
   * 
   * @param {string} studyId - The study ID (legacy ID or UUID)
   * @param {string|null} armId - The UUID of the arm (optional, can be null)
   * @param {Object} visitData - The visit data to create
   * @returns {Promise<Object>} Promise that resolves to the created visit
   */
  async createVisit(studyId, armId = null, visitData = null) {
    try {
      // Handle flexible parameter usage - if armId is an object, it means it's actually visitData
      let actualVisitData, actualArmId;
      if (typeof armId === 'object' && armId !== null) {
        actualVisitData = armId; // armId is actually visitData
        actualArmId = null; // no arm specified
      } else {
        actualVisitData = visitData;
        actualArmId = armId;
      }
      
      // Add armId to visitData if specified
      if (actualArmId) {
        actualVisitData = { ...actualVisitData, armId: actualArmId };
      }
      
      const response = await ApiService.post(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits`, actualVisitData);
      return response.data;
    } catch (error) {
      console.error(`Error creating visit:`, error);
      throw error;
    }
  }

  /**
   * Update an existing visit (auto-initializes StudyDesign if needed)
   * NEW URL: /api/v1/study-design/studies/{studyId}/visits/{visitId}
   * OLD URL: /api/clinops/study-design/studies/{studyId}/visits/{visitId} (deprecated)
   * 
   * @param {string} studyId - The study ID (legacy ID or UUID)
   * @param {string} visitId - The UUID of the visit to update
   * @param {Object} visitData - The updated visit data
   * @returns {Promise<Object>} Promise that resolves to the updated visit
   */
  async updateVisit(studyId, visitId, visitData) {
    try {
      const response = await ApiService.put(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits/${visitId}`, visitData);
      return response.data;
    } catch (error) {
      console.error(`Error updating visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a visit by ID (auto-initializes StudyDesign if needed)
   * NEW URL: /api/v1/study-design/studies/{studyId}/visits/{visitId}
   * OLD URL: /api/clinops/study-design/studies/{studyId}/visits/{visitId} (deprecated)
   * 
   * @param {string} studyId - The study ID (legacy ID or UUID)
   * @param {string} visitId - The UUID of the visit to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteVisit(studyId, visitId) {
    try {
      const response = await ApiService.delete(`/clinops-ws/api/v1/study-design/studies/${studyId}/visits/${visitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting visit with ID ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Get all forms associated with a visit (may need backend support)
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit
   * @returns {Promise<Array>} Promise that resolves to an array of forms for the visit
   */
  async getVisitForms(studyId, visitId) {
    try {
      // Note: This may need backend endpoint /api/studies/{studyId}/visits/{visitId}/forms
      const response = await ApiService.get(`/api/studies/${studyId}/visits/${visitId}/forms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching forms for visit ${visitId}:`, error);
      throw error;
    }
  }

  /**
   * Order visits within a study - updated to match backend endpoint
   * @param {string} studyId - The ID of the study
   * @param {Array} visitOrder - Array of visit IDs in the desired order
   * @returns {Promise<Object>} Promise that resolves to the ordering confirmation
   */
  async orderVisits(studyId, visitOrder) {
    try {
      const response = await ApiService.put(`/api/studies/${studyId}/visits/order`, { visitOrder });
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
      const response = await ApiService.get(`/api/studies/${studyId}/visits?armId=${armId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visits for arm ${armId} in study ${studyId}:`, error);
      throw error;
    }
  }

  // Arm association methods (updated for new API structure)
  /**
   * Add a visit to an arm in a study
   * @param {string} studyId - The ID of the study
   * @param {string} armId - The ID of the arm
   * @param {string} visitId - The ID of the visit to add
   * @param {Object} visitData - The updated visit data including armId
   * @returns {Promise<Object>} Promise that resolves to the association confirmation
   */
  async addVisitToArm(studyId, armId, visitId, visitData = {}) {
    try {
      // Update the visit to associate it with the arm
      const updatedVisitData = { ...visitData, armId: armId };
      const response = await ApiService.put(`/api/studies/${studyId}/visits/${visitId}`, updatedVisitData);
      return response.data;
    } catch (error) {
      console.error(`Error adding visit ${visitId} to arm ${armId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a visit from an arm
   * @param {string} studyId - The ID of the study
   * @param {string} visitId - The ID of the visit to remove from arm
   * @param {Object} visitData - The updated visit data
   * @returns {Promise<Object>} Promise that resolves to the disassociation confirmation
   */
  async removeVisitFromArm(studyId, visitId, visitData = {}) {
    try {
      // Update the visit to remove arm association (set armId to null)
      const updatedVisitData = { ...visitData, armId: null };
      const response = await ApiService.put(`/api/studies/${studyId}/visits/${visitId}`, updatedVisitData);
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
      // Use the specific endpoint for creating form bindings with path parameters
      const studyId = bindingData.studyId;
      const response = await ApiService.post(`/api/studies/${studyId}/visits/${visitId}/forms/${formId}`, {
        visitDefinitionId: visitId,
        formDefinitionId: formId,
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
   * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
   * OLD URL: /api/form-bindings/{bindingId} (deprecated)
   * 
   * @param {string} bindingId - The ID of the binding to remove
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async removeFormBinding(bindingId) {
    try {
      const response = await ApiService.delete(`/api/v1/study-design/form-bindings/${bindingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing form binding ${bindingId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update form binding for a visit (VisitFormBinding methods for component compatibility)
   * @param {Object} bindingData - The binding data to create
   * @returns {Promise<Object>} Promise that resolves to the created binding
   */
  async createVisitFormBinding(bindingData) {
    // Extract visitId and formId from the binding data to ensure compatibility
    const visitId = bindingData.visitDefinitionId || bindingData.visitId;
    const formId = bindingData.formDefinitionId || bindingData.formId;
    
    console.log('Service createVisitFormBinding called with:', { bindingData, visitId, formId });
    console.log('Using endpoint: /api/studies/' + bindingData.studyId + '/visits/' + visitId + '/forms/' + formId);
    
    return this.createFormBinding(visitId, formId, bindingData);
  }

  /**
   * Update visit form binding
   * NEW URL: /api/v1/study-design/form-bindings/{bindingId}
   * OLD URL: /api/form-bindings/{bindingId} (deprecated)
   * 
   * @param {string} bindingId - The ID of the binding to update
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} Promise that resolves to the updated binding
   */
  async updateVisitFormBinding(bindingId, updates) {
    try {
      const response = await ApiService.put(`/api/v1/study-design/form-bindings/${bindingId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating visit form binding ${bindingId}:`, error);
      throw error;
    }
  }

  /**
   * Delete visit form binding
   * @param {string} bindingId - The ID of the binding to delete
   * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
   */
  async deleteVisitFormBinding(bindingId) {
    return this.removeFormBinding(bindingId);
  }

  // Legacy methods for backward compatibility
  /**
   * @deprecated This method name is confusing, use the main getVisitsByStudy method
   */
  async getStudyVisits(studyId) {
    return this.getVisitsByStudy(studyId);
  }

  /**
   * @deprecated Use createVisit(studyId, visitData) instead
   */
  async createVisitForStudy(studyId, visitData) {
    return this.createVisit(studyId, visitData);
  }

  /**
   * @deprecated Use updateVisit(studyId, visitId, visitData) instead
   */
  async updateVisitForStudy(studyId, visitId, visitData) {
    return this.updateVisit(studyId, visitId, visitData);
  }

  /**
   * @deprecated Use deleteVisit(studyId, visitId) instead
   */
  async deleteVisitFromStudy(studyId, visitId) {
    return this.deleteVisit(studyId, visitId);
  }
}

export default new VisitService();
