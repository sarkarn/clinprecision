// src/services/StudyDatabaseBuildService.ts
import ApiService from '../infrastructure/ApiService';
import { API_BASE_URL } from '../../config';
import { BuildStatus } from '../../types/domain/DatabaseBuild.types';
import type {
  BuildRequest,
  ValidationOptions,
  CompletionData,
  StudyDatabaseBuild,
  ValidationResult,
  ServiceHealthResponse,
  IStudyDatabaseBuildService
} from '../../types/domain/DatabaseBuild.types';

const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;

/**
 * Service for managing Study Database Build operations
 * Provides methods for both command (write) and query (read) operations
 */
class StudyDatabaseBuildService implements IStudyDatabaseBuildService {
  
  // ==================== COMMAND OPERATIONS ====================
  
  /**
   * Build a study database
   * POST /api/v1/study-database-builds
   * @param buildRequest - Build configuration
   * @returns Created build details
   */
  async buildStudyDatabase(buildRequest: BuildRequest): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.post<StudyDatabaseBuild>(STUDY_DB_BUILD_API, buildRequest);
      return response.data;
    } catch (error) {
      console.error('Error building study database:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Validate a study database
   * POST /api/v1/study-database-builds/{buildRequestId}/validate
   * @param buildRequestId - Build request identifier
   * @param validationOptions - Validation configuration
   * @returns Validation result
   */
  async validateStudyDatabase(buildRequestId: string, validationOptions: ValidationOptions): Promise<ValidationResult> {
    try {
      const response = await ApiService.post<ValidationResult>(
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
   * @param buildRequestId - Build request identifier
   * @param cancellationReason - Reason for cancellation
   * @returns Cancellation result
   */
  async cancelStudyDatabaseBuild(buildRequestId: string, cancellationReason: string): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.post<StudyDatabaseBuild>(
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
   * @param buildRequestId - Build request identifier
   * @param completionData - Completion details and metrics
   * @returns Completion result
   */
  async completeStudyDatabaseBuild(buildRequestId: string, completionData: CompletionData): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.post<StudyDatabaseBuild>(
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
   * @param id - Build ID
   * @returns Build details
   */
  async getBuildById(id: number): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild>(`${STUDY_DB_BUILD_API}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build by UUID
   * GET /api/v1/study-database-builds/uuid/{aggregateUuid}
   * @param aggregateUuid - Aggregate UUID
   * @returns Build details
   */
  async getBuildByUuid(aggregateUuid: string): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild>(`${STUDY_DB_BUILD_API}/uuid/${aggregateUuid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by UUID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build by request ID
   * GET /api/v1/study-database-builds/request/{buildRequestId}
   * @param buildRequestId - Build request identifier
   * @returns Build details
   */
  async getBuildByRequestId(buildRequestId: string): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild>(`${STUDY_DB_BUILD_API}/request/${buildRequestId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting build by request ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get all builds for a study
   * GET /api/v1/study-database-builds/study/{studyId}
   * @param studyId - Study ID
   * @returns List of builds
   */
  async getBuildsByStudyId(studyId: number): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/study/${studyId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by study ID:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get latest build for a study
   * GET /api/v1/study-database-builds/study/{studyId}/latest
   * @param studyId - Study ID
   * @returns Latest build details
   */
  async getLatestBuildForStudy(studyId: number): Promise<StudyDatabaseBuild> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild>(`${STUDY_DB_BUILD_API}/study/${studyId}/latest`);
      return response.data;
    } catch (error) {
      console.error('Error getting latest build for study:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get builds by status
   * GET /api/v1/study-database-builds/status/{status}
   * @param status - Build status (IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
   * @returns List of builds
   */
  async getBuildsByStatus(status: BuildStatus): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by status:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get in-progress builds
   * GET /api/v1/study-database-builds/in-progress
   * @returns List of in-progress builds
   */
  async getInProgressBuilds(): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/in-progress`);
      return response.data;
    } catch (error) {
      console.error('Error getting in-progress builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get failed builds
   * GET /api/v1/study-database-builds/failed
   * @returns List of failed builds
   */
  async getFailedBuilds(): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/failed`);
      return response.data;
    } catch (error) {
      console.error('Error getting failed builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get cancelled builds
   * GET /api/v1/study-database-builds/cancelled
   * @returns List of cancelled builds
   */
  async getCancelledBuilds(): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/cancelled`);
      return response.data;
    } catch (error) {
      console.error('Error getting cancelled builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get recent builds
   * GET /api/v1/study-database-builds/recent?days=7
   * @param days - Number of days to look back (default: 7)
   * @returns List of recent builds
   */
  async getRecentBuilds(days: number = 7): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/recent?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recent builds:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get builds by user
   * GET /api/v1/study-database-builds/user/{userId}
   * @param userId - User ID
   * @returns List of builds requested by user
   */
  async getBuildsByUserId(userId: number): Promise<StudyDatabaseBuild[]> {
    try {
      const response = await ApiService.get<StudyDatabaseBuild[]>(`${STUDY_DB_BUILD_API}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting builds by user:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Check if study has active build
   * GET /api/v1/study-database-builds/study/{studyId}/has-active
   * @param studyId - Study ID
   * @returns True if study has active build
   */
  async hasActiveBuild(studyId: number): Promise<boolean> {
    try {
      const response = await ApiService.get<{ hasActiveBuild: boolean }>(`${STUDY_DB_BUILD_API}/study/${studyId}/has-active`);
      return response.data.hasActiveBuild;
    } catch (error) {
      console.error('Error checking for active build:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Get build count for study
   * GET /api/v1/study-database-builds/study/{studyId}/count
   * @param studyId - Study ID
   * @returns Number of builds for study
   */
  async getBuildCountForStudy(studyId: number): Promise<number> {
    try {
      const response = await ApiService.get<{ count: number }>(`${STUDY_DB_BUILD_API}/study/${studyId}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting build count for study:', error);
      throw this.handleError(error);
    }
  }
  
  /**
   * Health check endpoint
   * GET /api/v1/study-database-builds/health
   * @returns Service health status
   */
  async healthCheck(): Promise<ServiceHealthResponse> {
    try {
      const response = await ApiService.get<ServiceHealthResponse>(`${STUDY_DB_BUILD_API}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking service health:', error);
      throw this.handleError(error);
    }
  }
  
  // ==================== UTILITY METHODS ====================
  
  /**
   * Handle API errors with user-friendly messages
   * @param error - Error object
   * @returns Formatted error
   */
  handleError(error: any): Error {
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
   * @param seconds - Duration in seconds
   * @returns Formatted duration
   */
  formatDuration(seconds: number): string {
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
   * @param status - Build status
   * @returns Tailwind color class
   */
  getStatusColor(status: BuildStatus): string {
    const colorMap: Record<BuildStatus, string> = {
      [BuildStatus.IN_PROGRESS]: 'blue',
      [BuildStatus.COMPLETED]: 'green',
      [BuildStatus.FAILED]: 'red',
      [BuildStatus.CANCELLED]: 'gray'
    };
    return colorMap[status] || 'gray';
  }
  
  /**
   * Calculate build progress percentage
   * @param build - Build object
   * @returns Progress percentage (0-100)
   */
  calculateProgress(build: StudyDatabaseBuild): number {
    if (build.buildStatus === BuildStatus.COMPLETED) return 100;
    if (build.buildStatus === BuildStatus.FAILED || build.buildStatus === BuildStatus.CANCELLED) return 0;
    
    // Simple heuristic based on available metrics
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
