// src/services/FormTemplateService.js
import ApiService from './ApiService';

export const FormTemplateService = {
  /**
   * Get all form templates
   * @returns {Promise} - Promise with form templates data
   */
  getAllFormTemplates: async () => {
    try {
      const response = await ApiService.get('/admin-ws/form-templates');
      return response.data;
    } catch (error) {
      console.error("Error fetching form templates:", error);
      throw error;
    }
  },

  /**
   * Get form templates by category
   * @param {string} category - Template category
   * @returns {Promise} - Promise with filtered form templates data
   */
  getFormTemplatesByCategory: async (category) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching form templates for category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Get form templates by status
   * @param {string} status - Template status (ACTIVE, INACTIVE, DRAFT, ARCHIVED)
   * @returns {Promise} - Promise with filtered form templates data
   */
  getFormTemplatesByStatus: async (status) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching form templates with status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Search form templates by name
   * @param {string} name - Search term for template name
   * @returns {Promise} - Promise with filtered form templates data
   */
  searchFormTemplatesByName: async (name) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/search/name?q=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching form templates by name "${name}":`, error);
      throw error;
    }
  },

  /**
   * Search form templates by tags
   * @param {string} tag - Search term for tags
   * @returns {Promise} - Promise with filtered form templates data
   */
  searchFormTemplatesByTag: async (tag) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/search/tags?q=${encodeURIComponent(tag)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching form templates by tag "${tag}":`, error);
      throw error;
    }
  },

  /**
   * Get a specific form template by ID
   * @param {number} id - Form template ID
   * @returns {Promise} - Promise with form template data
   */
  getFormTemplateById: async (id) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new form template
   * @param {Object} templateData - Form template data
   * @returns {Promise} - Promise with created form template data
   */
  createFormTemplate: async (templateData) => {
    try {
      const response = await ApiService.post('/admin-ws/form-templates', templateData);
      return response.data;
    } catch (error) {
      console.error("Error creating form template:", error);
      throw error;
    }
  },

  /**
   * Update an existing form template
   * @param {number} id - Form template ID
   * @param {Object} templateData - Updated form template data
   * @returns {Promise} - Promise with updated form template data
   */
  updateFormTemplate: async (id, templateData) => {
    try {
      const response = await ApiService.put(`/admin-ws/form-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a form template
   * @param {number} id - Form template ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteFormTemplate: async (id) => {
    try {
      const response = await ApiService.delete(`/admin-ws/form-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Activate a form template
   * @param {number} id - Form template ID
   * @returns {Promise} - Promise with updated form template data
   */
  activateFormTemplate: async (id) => {
    try {
      const response = await ApiService.patch(`/admin-ws/form-templates/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error activating form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deactivate a form template
   * @param {number} id - Form template ID
   * @returns {Promise} - Promise with updated form template data
   */
  deactivateFormTemplate: async (id) => {
    try {
      const response = await ApiService.patch(`/admin-ws/form-templates/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Error deactivating form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive a form template
   * @param {number} id - Form template ID
   * @returns {Promise} - Promise with updated form template data
   */
  archiveFormTemplate: async (id) => {
    try {
      const response = await ApiService.patch(`/admin-ws/form-templates/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error(`Error archiving form template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new version of form template
   * @param {number} id - Original form template ID
   * @param {string} versionNotes - Notes about the new version
   * @returns {Promise} - Promise with new version template data
   */
  createNewVersion: async (id, versionNotes) => {
    try {
      const response = await ApiService.post(`/admin-ws/form-templates/${id}/new-version`, {
        versionNotes
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating new version for template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get usage count for a form template
   * @param {number} id - Form template ID
   * @returns {Promise} - Promise with usage count
   */
  getTemplateUsageCount: async (id) => {
    try {
      const response = await ApiService.get(`/admin-ws/form-templates/${id}/usage-count`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching usage count for template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get available categories for form templates
   * @returns {Promise} - Promise with categories list
   */
  getAvailableCategories: async () => {
    try {
      const response = await ApiService.get('/admin-ws/form-templates/categories');
      return response.data;
    } catch (error) {
      console.error("Error fetching available categories:", error);
      throw error;
    }
  },

  /**
   * Get template statistics
   * @returns {Promise} - Promise with statistics data
   */
  getTemplateStatistics: async () => {
    try {
      const response = await ApiService.get('/admin-ws/form-templates/statistics');
      return response.data;
    } catch (error) {
      console.error("Error fetching template statistics:", error);
      throw error;
    }
  }
};

export default FormTemplateService;