import ApiService from './ApiService';

/**
 * Study Design Service
 * Handles API calls for study design workflow components
 */
class StudyDesignService {

    /**
     * Initialize StudyDesignAggregate for a study
     * This is required for DDD/Event Sourcing operations (arms, visits, forms)
     * 
     * NEW URL: /api/v1/study-design/designs
     * OLD URL: /api/clinops/study-design (deprecated)
     * 
     * @param {string} studyAggregateUuid - The study's aggregate UUID
     * @param {string} studyName - The study name
     * @param {string} createdBy - User who created the study
     * @returns {Promise<{studyDesignId: string}>}
     */
    async initializeStudyDesign(studyAggregateUuid, studyName, createdBy = 'system', legacyStudyId = null) {
        try {
            const payload = {
                studyAggregateUuid,
                studyName,
                createdBy
            };

            if (legacyStudyId) {
                payload.legacyStudyId = legacyStudyId;
            }

            const response = await ApiService.post('/clinops-ws/api/v1/study-design/designs', payload);
            return response.data;
        } catch (error) {
            console.error('Error initializing study design:', error);
            throw error;
        }
    }

    // General Study Information
    async getStudyById(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study by ID:', error);
            throw error;
        }
    }

    // Study Arms Management
    async getStudyArms(studyId) {
        try {
            // NEW: Use Study Query Controller bridge pattern
            // GET /api/v1/study-design/studies/{studyId}/arms
            const response = await ApiService.get(`/api/v1/study-design/studies/${studyId}/arms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study arms:', error);
            throw error;
        }
    }

    async createStudyArm(studyId, armData) {
        try {
            // NEW: Use Study Command Controller with absolute path
            // POST /api/v1/study-design/studies/{studyId}/arms
            const response = await ApiService.post(`/api/v1/study-design/studies/${studyId}/arms`, armData);
            return response.data;
        } catch (error) {
            console.error('Error creating study arm:', error);
            throw error;
        }
    }

    /**
     * Update an existing study arm
     * NEW URL: /api/v1/study-design/arms/{armId}
     * OLD URL: /api/arms/{armId} (deprecated)
     */
    async updateStudyArm(armId, updates) {
        try {
            const response = await ApiService.put(`/api/v1/study-design/arms/${armId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating study arm:', error);
            throw error;
        }
    }

    /**
     * Delete a study arm
     * NEW URL: /api/v1/study-design/arms/{armId}
     * OLD URL: /api/arms/{armId} (deprecated)
     */
    async deleteStudyArm(armId) {
        try {
            await ApiService.delete(`/api/v1/study-design/arms/${armId}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting study arm:', error);
            throw error;
        }
    }

    async saveStudyArms(studyId, armsData) {
        try {
            // NOTE: This endpoint may not exist - bulk arm updates should use individual PUT /api/v1/study-design/arms/{armId}
            // Keeping for backward compatibility in case it's needed
            const response = await ApiService.put(`/api/v1/study-design/studies/${studyId}/arms`, armsData);
            return response.data;
        } catch (error) {
            console.error('Error saving study arms:', error);
            throw error;
        }
    }

    // Visit Schedule Management
    async getVisitSchedule(studyId) {
        try {
            // Use StudyDesignCommandController bridge endpoint with auto-initialization
            const response = await ApiService.get(`/api/v1/study-design/designs/studies/${studyId}/visits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching visit schedule:', error);
            throw error;
        }
    }

    async saveVisitSchedule(studyId, visitData) {
        try {
            // Use StudyDesignCommandController bridge endpoint
            const response = await ApiService.put(`/api/v1/study-design/designs/studies/${studyId}/visits`, visitData);
            return response.data;
        } catch (error) {
            console.error('Error saving visit schedule:', error);
            throw error;
        }
    }

    // Form Binding Management
    async getFormBindings(studyId) {
        try {
            // Use StudyDesignCommandController bridge endpoint
            const response = await ApiService.get(`/api/v1/study-design/designs/studies/${studyId}/form-bindings`);
            return response.data;
        } catch (error) {
            console.error('Error fetching form bindings:', error);
            throw error;
        }
    }

    async saveFormBindings(studyId, bindingData) {
        try {
            // Use StudyDesignCommandController bridge endpoint
            const response = await ApiService.put(`/api/v1/study-design/designs/studies/${studyId}/form-bindings`, bindingData);
            return response.data;
        } catch (error) {
            console.error('Error saving form bindings:', error);
            throw error;
        }
    }

    // Study Publishing
    async validateStudyForPublishing(studyId) {
        try {
            const response = await ApiService.post(`/api/studies/${studyId}/validate`);
            return response.data;
        } catch (error) {
            console.error('Error validating study:', error);
            throw error;
        }
    }

    async publishStudy(studyId, publishData) {
        try {
            // Backend endpoint only expects the studyId path parameter, no request body
            const response = await ApiService.patch(`/api/studies/${studyId}/publish`);
            return response.data;
        } catch (error) {
            console.error('Error publishing study:', error);
            
            // Extract meaningful error message from backend response
            let errorMessage = 'Failed to publish study';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Create new error with backend message and preserve original error
            const enhancedError = new Error(errorMessage);
            enhancedError.originalError = error;
            enhancedError.status = error.response?.status;
            
            throw enhancedError;
        }
    }

    async changeStudyStatus(studyId, newStatus) {
        try {
            const response = await ApiService.patch(`/api/studies/${studyId}/status`, { 
                newStatus: newStatus 
            });
            return response.data;
        } catch (error) {
            console.error('Error changing study status:', error);
            console.log('Response headers:', error.response?.headers);
            console.log('Response data:', error.response?.data);
            
            // Extract meaningful error message from backend response
            let errorMessage = `Failed to change study status to ${newStatus}`;
            
            // Priority 1: Check for user-friendly error in custom header
            if (error.response?.headers?.['x-error-message']) {
                console.log('Found user-friendly message in header:', error.response.headers['x-error-message']);
                errorMessage = error.response.headers['x-error-message'];
            }
            // Priority 2: Check response body
            else if (error.response?.data?.message) {
                console.log('Found message in response body:', error.response.data.message);
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                console.log('Found error in response body:', error.response.data.error);
                errorMessage = error.response.data.error;
            } else if (error.message) {
                console.log('Using generic error message:', error.message);
                errorMessage = error.message;
            }
            
            console.log('Final error message:', errorMessage);
            
            // Create new error with backend message and preserve original error
            const enhancedError = new Error(errorMessage);
            enhancedError.originalError = error;
            enhancedError.status = error.response?.status;
            
            throw enhancedError;
        }
    }

    // Protocol Revisions
    async getStudyRevisions(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/revisions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revisions:', error);
            throw error;
        }
    }

    async createRevision(studyId, revisionData) {
        try {
            const response = await ApiService.post(`/api/studies/${studyId}/revisions`, revisionData);
            return response.data;
        } catch (error) {
            console.error('Error creating revision:', error);
            throw error;
        }
    }

    // Design Progress Tracking
    async getDesignProgress(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/design-progress`);
            return response.data;
        } catch (error) {
            console.error('Error fetching design progress:', error);
            throw error;
        }
    }

    async updateDesignProgress(studyId, progressData) {
        try {
            const response = await ApiService.put(`/api/studies/${studyId}/design-progress`, progressData);
            return response.data;
        } catch (error) {
            console.error('Error updating design progress:', error);
            throw error;
        }
    }

    async initializeDesignProgress(studyId) {
        try {
            const response = await ApiService.post(`/api/studies/${studyId}/design-progress/initialize`);
            return response.data;
        } catch (error) {
            console.error('Error initializing design progress:', error);
            throw error;
        }
    }
}

export default new StudyDesignService();
