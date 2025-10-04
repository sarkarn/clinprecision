// src/services/UserStudyRoleService.js
import ApiService from './ApiService';

export const UserStudyRoleService = {
  /**
   * Get all user study role assignments
   * @returns {Promise} - Promise with all assignments data
   */
  getAllUserStudyRoles: async () => {
    try {
      const response = await ApiService.get('/users-ws/api/user-study-roles');
      return response.data;
    } catch (error) {
      console.error("Error fetching all user study roles:", error);
      throw error;
    }
  },

  /**
   * Create a new user study role assignment
   * @param {Object} userStudyRoleData - User study role data
   * @returns {Promise} - Promise with created assignment data
   */
  createUserStudyRole: async (userStudyRoleData) => {
    try {
      const response = await ApiService.post('/users-ws/api/user-study-roles', userStudyRoleData);
      return response.data;
    } catch (error) {
      console.error("Error creating user study role:", error);
      throw error;
    }
  },

  /**
   * Update an existing user study role assignment
   * @param {string} id - Assignment ID
   * @param {Object} userStudyRoleData - Updated assignment data
   * @returns {Promise} - Promise with updated assignment data
   */
  updateUserStudyRole: async (id, userStudyRoleData) => {
    try {
      const response = await ApiService.put(`/users-ws/api/user-study-roles/${id}`, userStudyRoleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user study role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user study role assignment
   * @param {string} id - Assignment ID
   * @returns {Promise} - Promise with deletion status
   */
  deleteUserStudyRole: async (id) => {
    try {
      const response = await ApiService.delete(`/users-ws/api/user-study-roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user study role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get a user study role assignment by ID
   * @param {string} id - Assignment ID
   * @returns {Promise} - Promise with assignment data
   */
  getUserStudyRoleById: async (id) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user study role ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all role assignments for a specific user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user's role assignments
   */
  getUserRoleAssignments: async (userId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role assignments for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get all role assignments for a specific study
   * @param {string} studyId - Study ID
   * @returns {Promise} - Promise with study's role assignments
   */
  getStudyRoleAssignments: async (studyId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role assignments for study ${studyId}:`, error);
      throw error;
    }
  },

  /**
   * Get active role assignments for a specific study
   * @param {string} studyId - Study ID
   * @returns {Promise} - Promise with active study role assignments
   */
  getActiveStudyRoleAssignments: async (studyId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching active role assignments for study ${studyId}:`, error);
      throw error;
    }
  },

  /**
   * Get role assignments for a specific user in a specific study
   * @param {string} userId - User ID
   * @param {string} studyId - Study ID
   * @returns {Promise} - Promise with user's role assignments in the study
   */
  getUserStudyRoleAssignments: async (userId, studyId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role assignments for user ${userId} in study ${studyId}:`, error);
      throw error;
    }
  },

  /**
   * Get all active roles for a specific user across all studies
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user's active roles
   */
  getUserActiveRoles: async (userId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/active`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching active roles for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get study team members (all active role assignments for a study)
   * @param {string} studyId - Study ID
   * @returns {Promise} - Promise with study team members
   */
  getStudyTeamMembers: async (studyId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/studies/${studyId}/team`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team members for study ${studyId}:`, error);
      throw error;
    }
  },

  /**
   * Get highest priority role for a user (legacy endpoint)
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with highest priority role
   */
  getHighestPriorityRole: async (userId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/highest-priority`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching highest priority role for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Create multiple user study role assignments in bulk
   * @param {Array} userStudyRoles - Array of user study role assignment data
   * @returns {Promise} - Promise with created assignments
   */
  createMultipleUserStudyRoles: async (userStudyRoles) => {
    try {
      const response = await ApiService.post('/users-ws/api/user-study-roles/bulk', userStudyRoles);
      return response.data;
    } catch (error) {
      console.error("Error creating multiple user study roles:", error);
      throw error;
    }
  },

  /**
   * Deactivate multiple user study role assignments
   * @param {Array} ids - Array of assignment IDs to deactivate
   * @param {string} endDate - End date for deactivation
   * @returns {Promise} - Promise with deactivation status
   */
  deactivateUserStudyRoles: async (ids, endDate) => {
    try {
      const response = await ApiService.put('/users-ws/api/user-study-roles/bulk/deactivate', {
        ids,
        endDate
      });
      return response.data;
    } catch (error) {
      console.error("Error deactivating user study roles:", error);
      throw error;
    }
  },

  /**
   * Check if user has active role in study
   * @param {string} userId - User ID
   * @param {string} studyId - Study ID
   * @returns {Promise} - Promise with boolean result
   */
  hasActiveRoleInStudy: async (userId, studyId) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}/has-active-role`);
      return response.data;
    } catch (error) {
      console.error(`Error checking active role for user ${userId} in study ${studyId}:`, error);
      throw error;
    }
  },

  /**
   * Check if user has specific role in study
   * @param {string} userId - User ID
   * @param {string} studyId - Study ID
   * @param {string} roleName - Role name to check
   * @returns {Promise} - Promise with boolean result
   */
  hasRoleInStudy: async (userId, studyId, roleName) => {
    try {
      const response = await ApiService.get(`/users-ws/api/user-study-roles/users/${userId}/studies/${studyId}/roles/${roleName}/has-role`);
      return response.data;
    } catch (error) {
      console.error(`Error checking role ${roleName} for user ${userId} in study ${studyId}:`, error);
      throw error;
    }
  }
};
