// src/services/OrganizationService.js
import ApiService from './ApiService';

export const OrganizationService = {
  /**
   * Get all organizations
   * @returns {Promise} - Promise with organizations data
   */
  getAllOrganizations: async () => {
    try {
      const response = await ApiService.get('/organization-ws/api/organizations');
      return response.data;
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }
  },

  /**
   * Get a specific organization by ID
   * @param {string} id - Organization ID
   * @returns {Promise} - Promise with organization data
   */
  getOrganizationById: async (id) => {
    try {
      const response = await ApiService.get(`/organization-ws/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization data
   * @returns {Promise} - Promise with created organization data
   */
  createOrganization: async (organizationData) => {
    try {
      const response = await ApiService.post('/organization-ws/api/organizations', organizationData);
      return response.data;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  /**
   * Update an existing organization
   * @param {string} id - Organization ID
   * @param {Object} organizationData - Updated organization data
   * @returns {Promise} - Promise with updated organization data
   */
  updateOrganization: async (id, organizationData) => {
    try {
      const response = await ApiService.put(`/organization-ws/api/organizations/${id}`, organizationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an organization
   * @param {string} id - Organization ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteOrganization: async (id) => {
    try {
      const response = await ApiService.delete(`/organization-ws/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a contact to an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} contactData - Contact data
   * @returns {Promise} - Promise with created contact data
   */
  addOrganizationContact: async (organizationId, contactData) => {
    try {
      const response = await ApiService.post(`/organization-ws/api/organizations/${organizationId}/contacts`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Error adding contact to organization ${organizationId}:`, error);
      throw error;
    }
  },

  /**
   * Update an organization contact
   * @param {string} organizationId - Organization ID
   * @param {string} contactId - Contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise} - Promise with updated contact data
   */
  updateOrganizationContact: async (organizationId, contactId, contactData) => {
    try {
      const response = await ApiService.put(`/organization-ws/api/organizations/${organizationId}/contacts/${contactId}`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${contactId} for organization ${organizationId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an organization contact
   * @param {string} organizationId - Organization ID
   * @param {string} contactId - Contact ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteOrganizationContact: async (organizationId, contactId) => {
    try {
      const response = await ApiService.delete(`/organization-ws/api/organizations/${organizationId}/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contact ${contactId} from organization ${organizationId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all contacts for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise} - Promise with organization contacts data
   */
  getOrganizationContacts: async (organizationId) => {
    try {
      const response = await ApiService.get(`/organization-ws/api/organizations/${organizationId}/contacts`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contacts for organization ${organizationId}:`, error);
      throw error;
    }
  }
};

export default OrganizationService;
