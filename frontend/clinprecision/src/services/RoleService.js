import ApiService from './ApiService';

export const RoleService = {
  /**
   * Get all roles
   * @returns {Promise} - Promise with roles data
   */
  getAllRoles: async () => {
    try {
      const response = await ApiService.get('/admin-ws/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Get system roles only
   * @returns {Promise} - Promise with system roles data
   */
  getSystemRoles: async () => {
    try {
      const response = await ApiService.get('/admin-ws/roles/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system roles:', error);
      throw error;
    }
  },

  /**
   * Get non-system roles only  
   * @returns {Promise} - Promise with non-system roles data
   */
  getNonSystemRoles: async () => {
    try {
      const response = await ApiService.get('/admin-ws/roles/non-system');
      return response.data;
    } catch (error) {
      console.error('Error fetching non-system roles:', error);
      throw error;
    }
  },
};

export default RoleService;
