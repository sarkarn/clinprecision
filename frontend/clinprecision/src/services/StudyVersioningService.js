import ApiService from './ApiService';

/**
 * Study Versioning & Amendments Service
 * Handles all API operations for study versions and amendments
 */
class StudyVersioningService {
    
    /**
     * Get all versions for a study
     */
    static async getStudyVersions(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/versions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study versions:', error);
            throw error;
        }
    }
    
    /**
     * Get version history for a study
     */
    static async getVersionHistory(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/versions/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version history:', error);
            throw error;
        }
    }
    
    /**
     * Create a new study version
     */
    static async createVersion(studyId, versionData) {
        try {
            const response = await ApiService.post(`/api/studies/${studyId}/versions`, versionData);
            return response.data;
        } catch (error) {
            console.error('Error creating version:', error);
            throw error;
        }
    }
}

export default StudyVersioningService;
