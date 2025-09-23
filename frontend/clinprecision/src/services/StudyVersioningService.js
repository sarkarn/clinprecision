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
            const response = await ApiService.get(`/studies/${studyId}/versions`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study versions:', error);
            throw error;
        }
    }
    
    /**
     * Get a specific version by ID
     */
    static async getVersionById(studyId, versionId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/versions/${versionId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version:', error);
            throw error;
        }
    }
    
    /**
     * Get the active version for a study
     */
    static async getActiveVersion(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/versions/active`);
            return response.data;
        } catch (error) {
            console.error('Error fetching active version:', error);
            throw error;
        }
    }
    
    /**
     * Get the latest version for a study
     */
    static async getLatestVersion(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/versions/latest`);
            return response.data;
        } catch (error) {
            console.error('Error fetching latest version:', error);
            throw error;
        }
    }
    
    /**
     * Create a new study version
     */
    static async createVersion(studyId, versionData) {
        try {
            const requestData = {
                amendmentType: versionData.amendmentType,
                reason: versionData.reason || versionData.amendmentReason,
                description: versionData.description,
                effectiveDate: versionData.effectiveDate,
                notifyStakeholders: versionData.notifyStakeholders ?? true,
                requiresRegulatory: versionData.requiresRegulatory ?? false,
                notes: versionData.notes || versionData.additionalNotes,
                changesSummary: versionData.changesSummary,
                impactAssessment: versionData.impactAssessment,
                protocolChanges: JSON.stringify(versionData.protocolChanges || []),
                icfChanges: JSON.stringify(versionData.icfChanges || []),
                regulatorySubmissions: JSON.stringify(versionData.regulatorySubmissions || []),
                metadata: JSON.stringify(versionData.metadata || {})
            };
            
            const response = await ApiService.post(`/studies/${studyId}/versions`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error creating version:', error);
            throw error;
        }
    }
    
    /**
     * Update a study version
     */
    static async updateVersion(studyId, versionId, updateData) {
        try {
            const requestData = {
                status: updateData.status,
                amendmentReason: updateData.amendmentReason,
                description: updateData.description,
                effectiveDate: updateData.effectiveDate,
                additionalNotes: updateData.additionalNotes,
                changesSummary: updateData.changesSummary,
                impactAssessment: updateData.impactAssessment,
                protocolChanges: updateData.protocolChanges ? JSON.stringify(updateData.protocolChanges) : undefined,
                icfChanges: updateData.icfChanges ? JSON.stringify(updateData.icfChanges) : undefined,
                regulatorySubmissions: updateData.regulatorySubmissions ? JSON.stringify(updateData.regulatorySubmissions) : undefined,
                reviewComments: updateData.reviewComments,
                approvedBy: updateData.approvedBy,
                metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined
            };
            
            // Remove undefined values
            Object.keys(requestData).forEach(key => {
                if (requestData[key] === undefined) {
                    delete requestData[key];
                }
            });
            
            const response = await ApiService.put(`/studies/${studyId}/versions/${versionId}`, requestData);
            return response.data;
        } catch (error) {
            console.error('Error updating version:', error);
            throw error;
        }
    }
    
    /**
     * Delete a study version
     */
    static async deleteVersion(studyId, versionId) {
        try {
            await ApiService.delete(`/studies/${studyId}/versions/${versionId}`);
        } catch (error) {
            console.error('Error deleting version:', error);
            throw error;
        }
    }
    
    /**
     * Approve a version
     */
    static async approveVersion(studyId, versionId) {
        try {
            const response = await ApiService.post(`/studies/${studyId}/versions/${versionId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving version:', error);
            throw error;
        }
    }
    
    /**
     * Activate a version
     */
    static async activateVersion(studyId, versionId) {
        try {
            const response = await ApiService.post(`/studies/${studyId}/versions/${versionId}/activate`);
            return response.data;
        } catch (error) {
            console.error('Error activating version:', error);
            throw error;
        }
    }
    
    /**
     * Get version history for a study
     */
    static async getVersionHistory(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/versions/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version history:', error);
            throw error;
        }
    }
    
    /**
     * Get all amendments for a study (across all versions)
     */
    static async getStudyAmendments(studyId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/amendments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching study amendments:', error);
            throw error;
        }
    }
    
    /**
     * Get amendments for a specific version
     */
    static async getVersionAmendments(studyId, versionId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/versions/${versionId}/amendments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching version amendments:', error);
            throw error;
        }
    }
    
    /**
     * Get a specific amendment by ID
     */
    static async getAmendmentById(studyId, amendmentId) {
        try {
            const response = await ApiService.get(`/studies/${studyId}/amendments/${amendmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching amendment:', error);
            throw error;
        }
    }
    
    /**
     * Utility method to transform backend response to frontend format
     */
    static transformVersionForFrontend(backendVersion) {
        if (!backendVersion) return null;
        
        return {
            id: backendVersion.id,
            studyId: backendVersion.studyId,
            version: backendVersion.versionNumber || backendVersion.version,
            status: backendVersion.status,
            amendmentType: backendVersion.amendmentType,
            amendmentReason: backendVersion.amendmentReason || backendVersion.reason,
            reason: backendVersion.amendmentReason || backendVersion.reason,
            description: backendVersion.description,
            changesSummary: backendVersion.changesSummary,
            impactAssessment: backendVersion.impactAssessment,
            previousVersionId: backendVersion.previousVersionId,
            createdBy: backendVersion.createdBy,
            createdDate: backendVersion.createdDate,
            approvedBy: backendVersion.approvedBy,
            approvedDate: backendVersion.approvedDate,
            effectiveDate: backendVersion.effectiveDate,
            requiresRegulatoryApproval: backendVersion.requiresRegulatoryApproval,
            notifyStakeholders: backendVersion.notifyStakeholders,
            additionalNotes: backendVersion.additionalNotes || backendVersion.notes,
            notes: backendVersion.additionalNotes || backendVersion.notes,
            protocolChanges: this.parseJsonField(backendVersion.protocolChanges),
            icfChanges: this.parseJsonField(backendVersion.icfChanges),
            regulatorySubmissions: this.parseJsonField(backendVersion.regulatorySubmissions),
            reviewComments: this.parseJsonField(backendVersion.reviewComments),
            metadata: this.parseJsonField(backendVersion.metadata),
            updatedAt: backendVersion.updatedAt,
            amendments: backendVersion.amendments || []
        };
    }
    
    /**
     * Utility method to parse JSON fields safely
     */
    static parseJsonField(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') {
            return jsonString;
        }
        
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('Failed to parse JSON field:', jsonString, error);
            return jsonString;
        }
    }
    
    /**
     * Utility method to get amendment type options for frontend
     */
    static getAmendmentTypeOptions() {
        return [
            {
                value: 'MAJOR',
                label: 'Major Amendment',
                description: 'Protocol changes affecting safety/efficacy'
            },
            {
                value: 'MINOR',
                label: 'Minor Amendment',
                description: 'Administrative changes'
            },
            {
                value: 'SAFETY',
                label: 'Safety Amendment',
                description: 'Safety-related changes'
            },
            {
                value: 'ADMINISTRATIVE',
                label: 'Administrative Amendment',
                description: 'Non-substantial changes'
            }
        ];
    }
    
    /**
     * Utility method to get version status options for frontend
     */
    static getVersionStatusOptions() {
        return [
            {
                value: 'DRAFT',
                label: 'Draft',
                description: 'In development'
            },
            {
                value: 'UNDER_REVIEW',
                label: 'Under Review',
                description: 'Under internal review'
            },
            {
                value: 'SUBMITTED',
                label: 'Submitted',
                description: 'Submitted to regulatory'
            },
            {
                value: 'APPROVED',
                label: 'Approved',
                description: 'Approved by regulatory'
            },
            {
                value: 'ACTIVE',
                label: 'Active',
                description: 'Currently active version'
            },
            {
                value: 'SUPERSEDED',
                label: 'Superseded',
                description: 'Replaced by newer version'
            },
            {
                value: 'WITHDRAWN',
                label: 'Withdrawn',
                description: 'Withdrawn/cancelled'
            }
        ];
    }
}

export default StudyVersioningService;