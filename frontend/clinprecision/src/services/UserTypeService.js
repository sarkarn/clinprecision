// src/services/UserTypeService.js
import ApiService from './ApiService';

export const UserTypeService = {
  /**
   * Get all user types
   * @returns {Promise} - Promise with user types data
   */
  getAllUserTypes: async () => {
    try {
      const response = await ApiService.get('/users-ws/usertypes');
      return response.data;
    } catch (error) {
      console.error("Error fetching user types:", error);
      throw error;
    }
  },

  /**
   * Get a specific user type by ID
   * @param {string} id - User type ID
   * @returns {Promise} - Promise with user type data
   */
  getUserTypeById: async (id) => {
    try {
      const response = await ApiService.get(`/users-ws/usertypes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user type
   * @param {Object} userTypeData - User type data
   * @returns {Promise} - Promise with created user type data
   */
  createUserType: async (userTypeData) => {
    try {
      const response = await ApiService.post('/users-ws/usertypes', userTypeData);
      return response.data;
    } catch (error) {
      console.error("Error creating user type:", error);
      throw error;
    }
  },

  /**
   * Update an existing user type
   * @param {string} id - User type ID
   * @param {Object} userTypeData - Updated user type data
   * @returns {Promise} - Promise with updated user type data
   */
  updateUserType: async (id, userTypeData) => {
    try {
      const response = await ApiService.put(`/users-ws/usertypes/${id}`, userTypeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user type
   * @param {string} id - User type ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteUserType: async (id) => {
    try {
      const response = await ApiService.delete(`/users-ws/usertypes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user type ${id}:`, error);
      throw error;
    }
  }
};

export default UserTypeService;
