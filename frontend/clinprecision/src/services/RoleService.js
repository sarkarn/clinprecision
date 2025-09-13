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
};

export default RoleService;
