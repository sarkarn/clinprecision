import ApiService from './ApiService';

const API_PATH = '/studydesign-ws/api/forms';

/**
 * Service for handling Form Version operations
 */
class FormVersionService {
  /**
   * Get all versions of a form
   * @param {string} formId - The ID of the form
   * @returns {Promise<Array>} Promise that resolves to an array of form versions
   */
  async getFormVersions(formId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for form ${formId}:`, error);
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
   * @param {string} formId - The ID of the form
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
   * Compare two versions of a form
   * @param {string} formId - The ID of the form
   * @param {string} versionId1 - The ID of the first version to compare
   * @param {string} versionId2 - The ID of the second version to compare
   * @returns {Promise<Object>} Promise that resolves to the version comparison data
   */
  async compareFormVersions(formId, versionId1, versionId2) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions/compare`, {
        params: { version1: versionId1, version2: versionId2 }
      });
      return response.data;
    } catch (error) {
      console.error(`Error comparing versions ${versionId1} and ${versionId2} of form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get the current active version of a form
   * @param {string} formId - The ID of the form
   * @returns {Promise<Object>} Promise that resolves to the current active form version
   */
  async getCurrentFormVersion(formId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions/current`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching current version of form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Set a specific version as the active version of a form
   * @param {string} formId - The ID of the form
   * @param {string} versionId - The ID of the version to set as active
   * @returns {Promise<Object>} Promise that resolves to the activation confirmation
   */
  async setActiveFormVersion(formId, versionId) {
    try {
      const response = await ApiService.put(`${API_PATH}/${formId}/versions/${versionId}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error setting version ${versionId} as active for form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Get the audit trail for a form version
   * @param {string} formId - The ID of the form
   * @param {string} versionId - The ID of the version
   * @returns {Promise<Array>} Promise that resolves to the audit trail data
   */
  async getFormVersionAuditTrail(formId, versionId) {
    try {
      const response = await ApiService.get(`${API_PATH}/${formId}/versions/${versionId}/audit`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching audit trail for version ${versionId} of form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Lock a form version to prevent editing
   * @param {string} formId - The ID of the form
   * @param {string} versionId - The ID of the version to lock
   * @returns {Promise<Object>} Promise that resolves to the lock confirmation
   */
  async lockFormVersion(formId, versionId) {
    try {
      const response = await ApiService.post(`${API_PATH}/${formId}/versions/${versionId}/lock`);
      return response.data;
    } catch (error) {
      console.error(`Error locking version ${versionId} of form ${formId}:`, error);
      throw error;
    }
  }

  /**
   * Unlock a form version to allow editing
   * @param {string} formId - The ID of the form
   * @param {string} versionId - The ID of the version to unlock
   * @returns {Promise<Object>} Promise that resolves to the unlock confirmation
   */
  async unlockFormVersion(formId, versionId) {
    try {
      const response = await ApiService.post(`${API_PATH}/${formId}/versions/${versionId}/unlock`);
      return response.data;
    } catch (error) {
      console.error(`Error unlocking version ${versionId} of form ${formId}:`, error);
      throw error;
    }
  }
}

export default new FormVersionService();
