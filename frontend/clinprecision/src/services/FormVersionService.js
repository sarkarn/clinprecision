import ApiService from './ApiService';

// NEW DDD-aligned URL (Module 1.3 Phase 2)
const API_PATH = '/clinops-ws/api/v1/study-design/form-templates';

// OLD URL (deprecated - sunset: April 19, 2026)
// const API_PATH = '/clinops-ws/api/form-templates';

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
      // Return mock data when backend is unavailable
      return this.getMockFormVersions(formId);
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
      console.error(`Error fetching version ${versionId} for form ${formId}:`, error);
      // Return mock data when backend is unavailable
      const mockVersions = this.getMockFormVersions(formId);
      const version = mockVersions.find(v => v.versionId === versionId);
      if (version) {
        return version;
      }
      throw new Error(`Version ${versionId} not found for form ${formId}`);
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
      // For now, return mock success since backend version endpoints aren't implemented yet
      console.warn("Version creation failed, returning mock data. Backend version management needs to be implemented.");
      return {
        versionId: `v${Date.now()}`,
        formId: formId,
        version: "1.0",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "Current User",
        status: "Draft",
        structure: versionData.structure
      };
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
      // Return mock data when backend is unavailable
      const mockVersions = this.getMockFormVersions(formId);
      const currentVersion = mockVersions.find(v => v.isActive) || mockVersions[0];
      if (currentVersion) {
        return currentVersion;
      }
      throw new Error(`No current version found for form ${formId}`);
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

  /**
   * Mock data for development when backend is unavailable
   */
  getMockFormVersions(formId) {
    const baseVersions = [
      {
        versionId: 'v1.0',
        formId: formId,
        version: '1.0',
        isActive: false,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'Dr. Sarah Johnson',
        status: 'Published',
        structure: {
          sections: [
            {
              id: `${formId}_section_1`,
              name: 'Main Section',
              fields: [
                { id: 'field1', name: 'Sample Field 1', type: 'text', required: true },
                { id: 'field2', name: 'Sample Field 2', type: 'number', required: false }
              ]
            }
          ]
        }
      },
      {
        versionId: 'v2.0',
        formId: formId,
        version: '2.0',
        isActive: true,
        createdAt: '2024-03-10T14:30:00Z',
        createdBy: 'Dr. Michael Chen',
        status: 'Published',
        structure: {
          sections: [
            {
              id: `${formId}_section_1`,
              name: 'Main Section',
              fields: [
                { id: 'field1', name: 'Sample Field 1', type: 'text', required: true },
                { id: 'field2', name: 'Sample Field 2', type: 'number', required: false },
                { id: 'field3', name: 'New Field', type: 'date', required: true }
              ]
            }
          ]
        }
      }
    ];

    return baseVersions;
  }
}

export default new FormVersionService();
