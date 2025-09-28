// src/services/SiteService.js
import ApiService from './ApiService';

export const SiteService = {
  /**
   * Get all sites
   * @returns {Promise} - Promise with sites data
   */
  getAllSites: async () => {
    try {
      const response = await ApiService.get('/admin-ws/sites');
      return response.data;
    } catch (error) {
      console.error("Error fetching sites:", error);
      throw error;
    }
  },

  /**
   * Get a specific site by ID
   * @param {string} id - Site ID
   * @returns {Promise} - Promise with site data
   */
  getSiteById: async (id) => {
    try {
      const response = await ApiService.get(`/admin-ws/sites/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching site ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get sites by organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise} - Promise with sites data
   */
  getSitesByOrganization: async (organizationId) => {
    try {
      const response = await ApiService.get(`/admin-ws/sites/organization/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sites for organization ${organizationId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new clinical trial site
   * @param {Object} siteData - Site creation data
   * @param {string} siteData.name - Site name
   * @param {string} siteData.siteNumber - Unique site number
   * @param {number} siteData.organizationId - Organization ID
   * @param {string} siteData.addressLine1 - Primary address
   * @param {string} siteData.addressLine2 - Secondary address (optional)
   * @param {string} siteData.city - City
   * @param {string} siteData.state - State/Province
   * @param {string} siteData.postalCode - Postal code
   * @param {string} siteData.country - Country
   * @param {string} siteData.phone - Phone number
   * @param {string} siteData.email - Email address
   * @param {string} siteData.reason - Reason for creating site (for audit)
   * @returns {Promise} - Promise with created site data
   */
  createSite: async (siteData) => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'siteNumber', 'organizationId', 'reason'];
      for (const field of requiredFields) {
        if (!siteData[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      const response = await ApiService.post('/admin-ws/sites', siteData);
      return response.data;
    } catch (error) {
      console.error("Error creating site:", error);
      throw error;
    }
  },

  /**
   * Activate a clinical trial site for a study
   * @param {string} siteId - Site ID to activate
   * @param {Object} activationData - Activation data
   * @param {number} activationData.studyId - Study ID
   * @param {string} activationData.reason - Reason for activation (for audit)
   * @returns {Promise} - Promise with activated site data
   */
  activateSite: async (siteId, activationData) => {
    try {
      // Validate required fields
      if (!activationData.studyId || !activationData.reason) {
        throw new Error('Study ID and reason are required for site activation');
      }

      const response = await ApiService.post(`/admin-ws/sites/${siteId}/activate`, activationData);
      return response.data;
    } catch (error) {
      console.error(`Error activating site ${siteId}:`, error);
      throw error;
    }
  },

  /**
   * Assign a user to a clinical trial site
   * @param {string} siteId - Site ID
   * @param {Object} assignmentData - Assignment data
   * @param {number} assignmentData.userId - User ID to assign
   * @param {number} assignmentData.roleId - Role ID for the assignment
   * @param {string} assignmentData.reason - Reason for assignment (for audit)
   * @returns {Promise} - Promise with updated site data
   */
  assignUserToSite: async (siteId, assignmentData) => {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'roleId', 'reason'];
      for (const field of requiredFields) {
        if (!assignmentData[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      const response = await ApiService.post(`/admin-ws/sites/${siteId}/users`, assignmentData);
      return response.data;
    } catch (error) {
      console.error(`Error assigning user to site ${siteId}:`, error);
      throw error;
    }
  },

  /**
   * Get site statistics and status information
   * @returns {Promise} - Promise with site statistics
   */
  getSiteStatistics: async () => {
    try {
      const sites = await SiteService.getAllSites();
      
      // Calculate statistics
      const stats = {
        totalSites: sites.length,
        activeSites: sites.filter(site => site.status === 'active').length,
        pendingSites: sites.filter(site => site.status === 'pending').length,
        inactiveSites: sites.filter(site => site.status === 'inactive').length,
        suspendedSites: sites.filter(site => site.status === 'suspended').length,
        sitesByOrganization: {}
      };

      // Group sites by organization
      sites.forEach(site => {
        const orgName = site.organizationName || 'Unknown';
        if (!stats.sitesByOrganization[orgName]) {
          stats.sitesByOrganization[orgName] = 0;
        }
        stats.sitesByOrganization[orgName]++;
      });

      return stats;
    } catch (error) {
      console.error("Error calculating site statistics:", error);
      throw error;
    }
  },

  /**
   * Search sites by various criteria
   * @param {Object} searchCriteria - Search criteria
   * @param {string} searchCriteria.name - Site name (partial match)
   * @param {string} searchCriteria.siteNumber - Site number
   * @param {string} searchCriteria.status - Site status
   * @param {string} searchCriteria.organizationId - Organization ID
   * @param {string} searchCriteria.country - Country
   * @param {string} searchCriteria.state - State/Province
   * @returns {Promise} - Promise with filtered sites
   */
  searchSites: async (searchCriteria) => {
    try {
      // Get all sites first (could be optimized with server-side search later)
      const allSites = await SiteService.getAllSites();
      
      // Apply client-side filtering
      let filteredSites = allSites;

      if (searchCriteria.name) {
        filteredSites = filteredSites.filter(site => 
          site.name.toLowerCase().includes(searchCriteria.name.toLowerCase())
        );
      }

      if (searchCriteria.siteNumber) {
        filteredSites = filteredSites.filter(site => 
          site.siteNumber === searchCriteria.siteNumber
        );
      }

      if (searchCriteria.status) {
        filteredSites = filteredSites.filter(site => 
          site.status === searchCriteria.status
        );
      }

      if (searchCriteria.organizationId) {
        filteredSites = filteredSites.filter(site => 
          site.organizationId === parseInt(searchCriteria.organizationId)
        );
      }

      if (searchCriteria.country) {
        filteredSites = filteredSites.filter(site => 
          site.country && site.country.toLowerCase().includes(searchCriteria.country.toLowerCase())
        );
      }

      if (searchCriteria.state) {
        filteredSites = filteredSites.filter(site => 
          site.state && site.state.toLowerCase().includes(searchCriteria.state.toLowerCase())
        );
      }

      return filteredSites;
    } catch (error) {
      console.error("Error searching sites:", error);
      throw error;
    }
  },

  /**
   * Validate site data before submission
   * @param {Object} siteData - Site data to validate
   * @returns {Object} - Validation result with errors array
   */
  validateSiteData: (siteData) => {
    const errors = [];

    // Required fields validation
    if (!siteData.name || siteData.name.trim().length === 0) {
      errors.push('Site name is required');
    }

    if (!siteData.siteNumber || siteData.siteNumber.trim().length === 0) {
      errors.push('Site number is required');
    }

    if (!siteData.organizationId) {
      errors.push('Organization is required');
    }

    if (!siteData.reason || siteData.reason.trim().length === 0) {
      errors.push('Reason for site creation is required for audit compliance');
    }

    // Format validations
    if (siteData.email && !isValidEmail(siteData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (siteData.phone && !isValidPhone(siteData.phone)) {
      errors.push('Please enter a valid phone number');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export default SiteService;