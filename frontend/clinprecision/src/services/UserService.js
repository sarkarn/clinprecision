// src/services/UserService.js
import ApiService from './ApiService';

export const UserService = {
  /**
   * Get all users
   * @returns {Promise} - Promise with users data
   */
  getAllUsers: async () => {
    try {
      const response = await ApiService.get('/admin-ws/users');
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get a specific user by ID
   * @param {string} id - User ID
   * @returns {Promise} - Promise with user data
   */
  getUserById: async (id) => {
    try {
      const response = await ApiService.get(`/admin-ws/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with created user data
   */
  createUser: async (userData) => {
    try {
      const response = await ApiService.post('/admin-ws/users', userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} - Promise with updated user data
   */
  updateUser: async (id, userData) => {
    try {
      const response = await ApiService.put(`/admin-ws/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string} id - User ID to delete
   * @returns {Promise} - Promise with deletion status
   */
  deleteUser: async (id) => {
    try {
      const response = await ApiService.delete(`/admin-ws/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Assign user type to a user
   * @param {string} userId - User ID
   * @param {string} userTypeId - User Type ID
   * @returns {Promise} - Promise with assignment status
   */
  assignUserType: async (userId, userTypeId) => {
    try {
      const response = await ApiService.post(`/admin-ws/users/${userId}/types/${userTypeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error assigning user type to user:`, error);
      throw error;
    }
  },

  /**
   * Remove user type from a user
   * @param {string} userId - User ID
   * @param {string} userTypeId - User Type ID
   * @returns {Promise} - Promise with removal status
   */
  removeUserType: async (userId, userTypeId) => {
    try {
      const response = await ApiService.delete(`/admin-ws/users/${userId}/types/${userTypeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing user type from user:`, error);
      throw error;
    }
  },

  /**
   * Get all user types assigned to a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user types data
   */
  getUserTypes: async (userId) => {
    try {
      const response = await ApiService.get(`/admin-ws/users/${userId}/types`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user types for user ${userId}:`, error);
      throw error;
    }
  }
};
