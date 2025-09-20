// src/services/StudyDocumentService.js
import ApiService from './ApiService';

/**
 * Service for handling Study Document operations
 * Connects to StudyDocumentController backend endpoints
 */
class StudyDocumentService {
    
    /**
     * Get all documents for a study
     * @param {number} studyId - The study ID
     * @returns {Promise<Object>} Promise that resolves to the response with documents and statistics
     */
    async getStudyDocuments(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/documents`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching documents for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Get current documents for a study (for overview page)
     * @param {number} studyId - The study ID
     * @returns {Promise<Object>} Promise that resolves to the response with current documents
     */
    async getCurrentStudyDocuments(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/documents/current`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching current documents for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Get a specific document by ID
     * @param {number} studyId - The study ID
     * @param {number} documentId - The document ID
     * @returns {Promise<Object>} Promise that resolves to the document data
     */
    async getDocument(studyId, documentId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/documents/${documentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching document ${documentId} for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Upload a new document
     * @param {number} studyId - The study ID
     * @param {File} file - The file to upload
     * @param {string} documentType - The type of document
     * @param {string} description - Optional description
     * @param {number} uploadedBy - User ID (defaults to 1)
     * @returns {Promise<Object>} Promise that resolves to the upload response
     */
    async uploadDocument(studyId, file, documentType, description = '', uploadedBy = 1) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('description', description);
            formData.append('uploadedBy', uploadedBy);

            const response = await ApiService.post(
                `/api/studies/${studyId}/documents`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error uploading document for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Download a document
     * @param {number} studyId - The study ID
     * @param {number} documentId - The document ID
     * @returns {Promise<Blob>} Promise that resolves to the file blob
     */
    async downloadDocument(studyId, documentId) {
        try {
            const response = await ApiService.get(
                `/api/studies/${studyId}/documents/${documentId}/download`,
                {
                    responseType: 'blob',
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error downloading document ${documentId} for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Delete a document
     * @param {number} studyId - The study ID
     * @param {number} documentId - The document ID
     * @param {number} deletedBy - User ID (defaults to 1)
     * @returns {Promise<Object>} Promise that resolves to the delete response
     */
    async deleteDocument(studyId, documentId, deletedBy = 1) {
        try {
            const response = await ApiService.delete(
                `/api/studies/${studyId}/documents/${documentId}?deletedBy=${deletedBy}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error deleting document ${documentId} for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Update document metadata
     * @param {number} studyId - The study ID
     * @param {number} documentId - The document ID
     * @param {Object} updateData - The update data
     * @param {number} updatedBy - User ID (defaults to 1)
     * @returns {Promise<Object>} Promise that resolves to the updated document
     */
    async updateDocument(studyId, documentId, updateData, updatedBy = 1) {
        try {
            const response = await ApiService.put(
                `/api/studies/${studyId}/documents/${documentId}?updatedBy=${updatedBy}`,
                updateData
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating document ${documentId} for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Get document statistics for a study
     * @param {number} studyId - The study ID
     * @returns {Promise<Object>} Promise that resolves to the statistics
     */
    async getDocumentStatistics(studyId) {
        try {
            const response = await ApiService.get(`/api/studies/${studyId}/documents/statistics`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching document statistics for study ${studyId}:`, error);
            throw error;
        }
    }

    /**
     * Helper method to trigger file download in browser
     * @param {Blob} blob - The file blob
     * @param {string} filename - The filename
     */
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get available document types
     * @returns {Array} Array of document type options
     */
    getDocumentTypes() {
        return [
            { value: 'PROTOCOL', label: 'Protocol' },
            { value: 'ICF', label: 'Informed Consent Form' },
            { value: 'IRB', label: 'IRB Approval Documents' },
            { value: 'REGULATORY', label: 'Regulatory Document' },
            { value: 'CLINICAL', label: 'Clinical Document' },
            { value: 'STATISTICAL', label: 'Statistical Document' },
            { value: 'SAFETY', label: 'Safety Document' },
            { value: 'MONITORING', label: 'Monitoring Report' },
            { value: 'OTHER', label: 'Other' }
        ];
    }
}

export default new StudyDocumentService();