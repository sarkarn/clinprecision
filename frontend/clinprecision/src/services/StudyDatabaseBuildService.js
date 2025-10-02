import ApiService from './ApiService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;

/**
 * Service for managing Study Database Build operations
 * Provides methods for both command (write) and query (read) operations
 */
class StudyDatabaseBuildService {
  
  // ==================== COMMAND OPERATIONS ====================
  
  /**
   * Build a study database
   * POST /api/v1/study-database-builds
   * @param {Object} buildRequest - Build configuration
   * @returns {Promise<Object>} Created build details
   */
  async buildStudyDatabase(buildRequest) {
    try {
      const response = await ApiService.post(STUDY_DB_BUILD_API, buildRequest);
      return response.data;
    } catch (error) {
      console.error('Error building study database:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Validate a study database
   * POST /api/v1/study-database-builds/{buildRequestId}/validate
   * @param {string} buildRequestId - Build request identifier
   * @param {Object} validationOptions - Validation configuration
   * @returns {Promise<Object>} Validation result
   */
  async validateStudyDatabase(buildRequestId, validationOptions) {
    try {
      const response = await ApiService.post(
        `${STUDY_DB_BUILD_API}/${buildRequestId}/validate`,
        validationOptions
      );
      return response.data;
    } catch (error) {
      console.error('Error validating study database:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Cancel a study database build
   * POST /api/v1/study-database-builds/{buildRequestId}/cancel
   * @param {string} buildRequestId - Build request identifier
   * @param {string} cancellationReason - Reason for cancellation
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelStudyDatabaseBuild(buildRequestId, cancellationReason) {
    try {
      const response = await ApiService.post(
        `${STUDY_DB_BUILD_API}/${buildRequestId}/cancel`,
        { buildRequestId, cancellationReason }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling study database build:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Complete a study database build
   * POST /api/v1/study-database-builds/{buildRequestId}/complete
   * @param {string} buildRequestId - Build request identifier
   * @param {Object} completionData - Completion details and metrics
   * @returns {Promise<Object>} Completion result
   */
  async completeStudyDatabaseBuild(buildRequestId, completionData) {
    try {
      const response = await ApiService.post(
        `${STUDY_DB_BUILD_API}/${buildRequestId}/complete`,
        completionData
      );
      return response.data;
    } catch (error) {
      console.error('Error completing study database build:', error);
      throw this.handleError(error);
    }
  }
  
  // ==================== QUERY OPERATIONS ====================
  
  /**
   * Get build by ID
   * GET /api/v1/study-database-builds/{id}
   * @param {number} id - Build ID
   * @returns {Promise<Object>} Build details
   */
  async getBuildById(id) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build by UUID
   * GET /api/v1/study-database-builds/uuid/{aggregateUuid}
   * @param {string} aggregateUuid - Aggregate UUID
   * @returns {Promise<Object>} Build details
   */
  async getBuildByUuid(aggregateUuid) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/uuid/${aggregateUuid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by UUID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build by request ID
   * GET /api/v1/study-database-builds/request/{buildRequestId}
   * @param {string} buildRequestId - Build request identifier
   * @returns {Promise<Object>} Build details
   */
  async getBuildByRequestId(buildRequestId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/request/${buildRequestId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by request ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all builds for a study
   * GET /api/v1/study-database-builds/study/{studyId}
   * @param {number} studyId - Study ID
   * @returns {Promise<Array>} List of builds
   */
  async getBuildsByStudyId(studyId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/study/${studyId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by study ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get latest build for a study
   * GET /api/v1/study-database-builds/study/{studyId}/latest
   * @param {number} studyId - Study ID
   * @returns {Promise<Object>} Latest build details
   */
  async getLatestBuildForStudy(studyId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/study/${studyId}/latest`);
      return response.data;
    } catch (error) {
      console.error('Error getting latest build for study:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get builds by status
   * GET /api/v1/study-database-builds/status/{status}
   * @param {string} status - Build status (IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
   * @returns {Promise<Array>} List of builds
   */
  async getBuildsByStatus(status) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by status:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get in-progress builds
   * GET /api/v1/study-database-builds/in-progress
   * @returns {Promise<Array>} List of in-progress builds
   */
  async getInProgressBuilds() {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/in-progress`);
      return response.data;
    } catch (error) {
      console.error('Error getting in-progress builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get failed builds
   * GET /api/v1/study-database-builds/failed
   * @returns {Promise<Array>} List of failed builds
   */
  async getFailedBuilds() {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/failed`);
      return response.data;
    } catch (error) {
      console.error('Error getting failed builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get cancelled builds
   * GET /api/v1/study-database-builds/cancelled
   * @returns {Promise<Array>} List of cancelled builds
   */
  async getCancelledBuilds() {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/cancelled`);
      return response.data;
    } catch (error) {
      console.error('Error getting cancelled builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get recent builds
   * GET /api/v1/study-database-builds/recent?days=7
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise<Array>} List of recent builds
   */
  async getRecentBuilds(days = 7) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/recent?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recent builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get builds by user
   * GET /api/v1/study-database-builds/user/{userId}
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of builds requested by user
   */
  async getBuildsByUserId(userId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by user:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Check if study has active build
   * GET /api/v1/study-database-builds/study/{studyId}/has-active
   * @param {number} studyId - Study ID
   * @returns {Promise<boolean>} True if study has active build
   */
  async hasActiveBuild(studyId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/study/${studyId}/has-active`);
      return response.data.hasActiveBuild;
    } catch (error) {
      console.error('Error checking for active build:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build count for study
   * GET /api/v1/study-database-builds/study/{studyId}/count
   * @param {number} studyId - Study ID
   * @returns {Promise<number>} Number of builds for study
   */
  async getBuildCountForStudy(studyId) {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/study/${studyId}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting build count for study:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Health check endpoint
   * GET /api/v1/study-database-builds/health
   * @returns {Promise<Object>} Service health status
   */
  async healthCheck() {
    try {
      const response = await ApiService.get(`${STUDY_DB_BUILD_API}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking service health:', error);
      throw this.handleError(error);
    }
  }
  
  // ==================== UTILITY METHODS ====================
  
  /**
   * Handle API errors with user-friendly messages
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.statusText || 'An error occurred';
      const status = error.response.status;
      
      return new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
  
  /**
   * Format build duration from seconds to human-readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds || seconds < 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  
  /**
   * Get status badge color based on build status
   * @param {string} status - Build status
   * @returns {string} Tailwind color class
   */
  getStatusColor(status) {
    const colorMap = {
      'IN_PROGRESS': 'blue',
      'COMPLETED': 'green',
      'FAILED': 'red',
      'CANCELLED': 'gray'
    };
    return colorMap[status] || 'gray';
  }
  
  /**
   * Calculate build progress percentage
   * @param {Object} build - Build object
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(build) {
    if (build.buildStatus === 'COMPLETED') return 100;
    if (build.buildStatus === 'FAILED' || build.buildStatus === 'CANCELLED') return 0;
    
    // Simple heuristic based on available metrics
    const totalSteps = 100;
    const formsWeight = 30;
    const tablesWeight = 30;
    const rulesWeight = 40;
    
    const formsProgress = (build.formsConfigured || 0) > 0 ? formsWeight : 0;
    const tablesProgress = (build.tablesCreated || 0) > 0 ? tablesWeight : 0;
    const rulesProgress = (build.validationRulesSetup || 0) > 0 ? rulesWeight : 0;
    
    return Math.min(formsProgress + tablesProgress + rulesProgress, 95); // Max 95% for in-progress
  }
}

export default new StudyDatabaseBuildService();
