import ApiService from './ApiService';

/**
 * Study Versioning & Amendments Service (Protocol Versions)
 * Handles all API operations for protocol versions and amendments
 * 
 * API Endpoints (DDD-aligned):
 * - New: /api/v1/study-design/protocol-versions/*
 * - Legacy: /api/protocol-versions/* (deprecated, sunset: April 19, 2026)
 * - Bridge: /api/study-versions/* (deprecated, sunset: April 19, 2026)
 * 
 * @since October 2025 - Migrated to DDD-aligned URL structure
 */
class StudyVersioningService {
    
    // Base API paths
    static API_BASE = '/api/v1/study-design/protocol-versions';
    
    /**
     * Get all versions for a study
     * Endpoint: GET /api/v1/study-design/protocol-versions/study/{studyUuid}
     */
    static async getStudyVersions(studyId) {
        try {
            const response = await ApiService.get(`${this.API_BASE}/study/${studyId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study versions:', error);
            throw error;
        }
    }
    
    /**
     * Get version history for a study (all versions)
     * Endpoint: GET /api/v1/study-design/protocol-versions/study/{studyUuid}
     */
    static async getVersionHistory(studyId) {
        try {
            const response = await ApiService.get(`${this.API_BASE}/study/${studyId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version history:', error);
            throw error;
        }
    }
    
    /**
     * Create a new protocol version
     * Endpoint: POST /api/v1/study-design/protocol-versions
     */
    static async createVersion(studyId, versionData) {
        try {
            // Include studyId in the request body
            const payload = {
                ...versionData,
                studyId: studyId
            };
            const response = await ApiService.post(`${this.API_BASE}`, payload);
            return response.data;
        } catch (error) {
            console.error('Error creating version:', error);
            throw error;
        }
    }

    /**
     * Update a protocol version
     * Endpoint: PUT /api/v1/study-design/protocol-versions/{id}
     */
    static async updateVersion(versionId, updateData) {
        try {
            const response = await ApiService.put(`${this.API_BASE}/${versionId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating version:', error);
            throw error;
        }
    }

    /**
     * Update version status
     * Endpoint: PUT /api/v1/study-design/protocol-versions/{id}/status
     */
    static async updateVersionStatus(versionId, status, reason = null) {
        try {
            const payload = { status };
            if (reason) {
                payload.reason = reason;
            }
            const response = await ApiService.put(`${this.API_BASE}/${versionId}/status`, payload);
            return response.data;
        } catch (error) {
            console.error('Error updating version status:', error);
            throw error;
        }
    }

    /**
     * Delete a protocol version
     * Endpoint: DELETE /api/v1/study-design/protocol-versions/{id}
     */
    static async deleteVersion(versionId) {
        try {
            const response = await ApiService.delete(`${this.API_BASE}/${versionId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting version:', error);
            throw error;
        }
    }

    /**
     * Get a specific protocol version
     * Endpoint: GET /api/v1/study-design/protocol-versions/{id}
     */
    static async getVersion(versionId) {
        try {
            const response = await ApiService.get(`${this.API_BASE}/${versionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version:', error);
            throw error;
        }
    }
}

export default StudyVersioningService;
