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

    /**
     * Update a study version
     */
    static async updateVersion(versionId, updateData) {
        try {
            const response = await ApiService.put(`/api/study-versions/${versionId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating version:', error);
            throw error;
        }
    }

    /**
     * Update version status
     */
    static async updateVersionStatus(versionId, status, reason = null) {
        try {
            const payload = { status };
            if (reason) {
                payload.reason = reason;
            }
            const response = await ApiService.put(`/api/study-versions/${versionId}/status`, payload);
            return response.data;
        } catch (error) {
            console.error('Error updating version status:', error);
            throw error;
        }
    }

    /**
     * Delete a study version
     */
    static async deleteVersion(versionId) {
        try {
            const response = await ApiService.delete(`/api/study-versions/${versionId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting version:', error);
            throw error;
        }
    }

    /**
     * Get a specific study version
     */
    static async getVersion(versionId) {
        try {
            const response = await ApiService.get(`/api/study-versions/${versionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version:', error);
            throw error;
        }
    }
}

export default StudyVersioningService;
