// src/services/ProtocolDeviationService.js
import ApiService from './ApiService';

/**
 * Protocol Deviation Service
 * Frontend integration for protocol deviation tracking REST API
 * 
 * Provides methods for:
 * - Recording protocol deviations (manual and auto-flagged)
 * - Tracking deviation status lifecycle (OPEN → UNDER_REVIEW → RESOLVED → CLOSED)
 * - Managing deviation comments and audit trails
 * - Querying deviations by patient, study, severity, and reporting status
 * 
 * API Base Path: /clinops-ws/api/v1/deviations
 * 
 * Deviation Types: VISIT_WINDOW, INCLUSION_EXCLUSION, PROTOCOL_PROCEDURE, 
 *                  MEDICATION, INFORMED_CONSENT, DATA_MANAGEMENT, STUDY_CONDUCT, 
 *                  SAFETY, OTHER
 * 
 * Severity Levels: MINOR, MAJOR, CRITICAL
 * 
 * @see Backend: ProtocolDeviationController.java
 * @see Documentation: PROTOCOL_DEVIATION_BACKEND_COMPLETE.md
 */
export const ProtocolDeviationService = {
  
  // ==================== Write Operations ====================

  /**
   * Create a new protocol deviation
   * 
   * @param {object} deviationData - Deviation details
   * @param {number} deviationData.patientId - Patient database ID (required)
   * @param {number} deviationData.studySiteId - Study-site relationship ID (required)
   * @param {number} deviationData.visitId - Visit ID if deviation tied to visit (optional)
   * @param {string} deviationData.deviationType - Type of deviation (required)
   * @param {string} deviationData.severity - MINOR, MAJOR, or CRITICAL (required)
   * @param {string} deviationData.title - Brief title (required)
   * @param {string} deviationData.description - Detailed description (required)
   * @param {string} deviationData.protocolSection - Protocol reference (optional)
   * @param {string} deviationData.expectedProcedure - What should have happened (optional)
   * @param {string} deviationData.actualProcedure - What actually happened (optional)
   * @param {string} deviationData.rootCause - Root cause analysis (optional)
   * @param {string} deviationData.immediateAction - Immediate corrective action (optional)
   * @param {string} deviationData.correctiveAction - Long-term corrective action (optional)
   * @param {boolean} deviationData.requiresReporting - Requires sponsor/IRB reporting (optional, defaults to false)
   * @param {string} deviationData.reportedBy - User who reported (required)
   * @returns {Promise<Object>} - ProtocolDeviationResponse
   */
  createDeviation: async (deviationData) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Creating deviation:', deviationData);
      
      // Validate required fields
      if (!deviationData.patientId) {
        throw new Error('Patient ID is required');
      }
      if (!deviationData.studySiteId) {
        throw new Error('Study Site ID is required');
      }
      if (!deviationData.deviationType) {
        throw new Error('Deviation type is required');
      }
      if (!deviationData.severity) {
        throw new Error('Severity is required');
      }
      if (!deviationData.title || deviationData.title.trim().length === 0) {
        throw new Error('Title is required');
      }
      if (!deviationData.description || deviationData.description.trim().length === 0) {
        throw new Error('Description is required');
      }
      if (!deviationData.reportedBy || deviationData.reportedBy.trim().length === 0) {
        throw new Error('Reported by is required');
      }

      const response = await ApiService.post(
        '/clinops-ws/api/v1/deviations',
        deviationData
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Deviation created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error creating deviation:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Update deviation status
   * 
   * @param {number} deviationId - Deviation ID
   * @param {object} statusData - Status update data
   * @param {string} statusData.newStatus - OPEN, UNDER_REVIEW, RESOLVED, or CLOSED
   * @param {string} statusData.updatedBy - User making the update
   * @param {string} statusData.notes - Notes about status change (optional)
   * @returns {Promise<Object>} - Updated ProtocolDeviationResponse
   */
  updateDeviationStatus: async (deviationId, statusData) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Updating deviation status:', { deviationId, statusData });
      
      if (!statusData.newStatus) {
        throw new Error('New status is required');
      }
      if (!statusData.updatedBy) {
        throw new Error('Updated by is required');
      }

      const response = await ApiService.put(
        `/clinops-ws/api/v1/deviations/${deviationId}/status`,
        statusData
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error updating status:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Add a comment to a deviation
   * 
   * @param {number} deviationId - Deviation ID
   * @param {object} commentData - Comment data
   * @param {string} commentData.comment - Comment text (required)
   * @param {string} commentData.commentedBy - User adding comment (required)
   * @returns {Promise<Object>} - DeviationCommentResponse
   */
  addComment: async (deviationId, commentData) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Adding comment:', { deviationId, commentData });
      
      if (!commentData.comment || commentData.comment.trim().length === 0) {
        throw new Error('Comment text is required');
      }
      if (!commentData.commentedBy) {
        throw new Error('Commented by is required');
      }

      const response = await ApiService.post(
        `/clinops-ws/api/v1/deviations/${deviationId}/comments`,
        commentData
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Comment added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error adding comment:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Mark deviation as reported to sponsor
   * 
   * @param {number} deviationId - Deviation ID
   * @param {string} updatedBy - User marking as reported
   * @returns {Promise<Object>} - Updated ProtocolDeviationResponse
   */
  markReportedToSponsor: async (deviationId, updatedBy) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Marking reported to sponsor:', deviationId);
      
      const response = await ApiService.put(
        `/clinops-ws/api/v1/deviations/${deviationId}/reported-to-sponsor`,
        { updatedBy }
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Marked reported to sponsor:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error marking reported to sponsor:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Mark deviation as reported to IRB
   * 
   * @param {number} deviationId - Deviation ID
   * @param {string} updatedBy - User marking as reported
   * @returns {Promise<Object>} - Updated ProtocolDeviationResponse
   */
  markReportedToIrb: async (deviationId, updatedBy) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Marking reported to IRB:', deviationId);
      
      const response = await ApiService.put(
        `/clinops-ws/api/v1/deviations/${deviationId}/reported-to-irb`,
        { updatedBy }
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Marked reported to IRB:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error marking reported to IRB:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // ==================== Read Operations ====================

  /**
   * Get deviation by ID
   * 
   * @param {number} deviationId - Deviation ID
   * @returns {Promise<Object>} - ProtocolDeviationResponse
   */
  getDeviationById: async (deviationId) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviation:', deviationId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/deviations/${deviationId}`
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Deviation fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching deviation:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get comments for a deviation
   * 
   * @param {number} deviationId - Deviation ID
   * @returns {Promise<Array>} - Array of DeviationCommentResponse
   */
  getDeviationComments: async (deviationId) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching comments for deviation:', deviationId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/deviations/${deviationId}/comments`
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Comments fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching comments:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get all deviations for a patient
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Array>} - Array of ProtocolDeviationResponse
   */
  getPatientDeviations: async (patientId) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviations for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/deviations/patients/${patientId}`
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Patient deviations fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching patient deviations:', error);
      
      // Return empty array on error to prevent UI crashes
      if (error.response?.status === 404) {
        return [];
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get active (unresolved) deviations for a patient
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Array>} - Array of ProtocolDeviationResponse
   */
  getActiveDeviations: async (patientId) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching active deviations for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/deviations/patients/${patientId}/active`
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Active deviations fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching active deviations:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get all deviations for a study (with optional filters)
   * 
   * @param {object|number} params - Study ID or params object with filters
   * @param {number} params.studyId - Study database ID
   * @param {string} params.severity - Filter by severity (MINOR, MAJOR, CRITICAL)
   * @param {string} params.type - Filter by deviation type
   * @param {string} params.status - Filter by deviation status
   * @param {string} params.startDate - Filter by deviation date (from)
   * @param {string} params.endDate - Filter by deviation date (to)
   * @param {boolean} params.requiresReporting - Filter by reporting requirement
   * @returns {Promise<Array>} - Array of ProtocolDeviationResponse
   */
  getStudyDeviations: async (params) => {
    try {
      // Support both direct studyId and params object
      const studyId = typeof params === 'number' ? params : params.studyId;
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching deviations for study:', studyId, 'with params:', params);
      
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (typeof params === 'object') {
        if (params.severity) queryParams.append('severity', params.severity);
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.requiresReporting) queryParams.append('requiresReporting', 'true');
      }
      
      const queryString = queryParams.toString();
      const url = `/clinops-ws/api/v1/deviations/studies/${studyId}${queryString ? '?' + queryString : ''}`;
      
      const response = await ApiService.get(url);
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Study deviations fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching study deviations:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get critical deviations for a study
   * 
   * @param {number} studyId - Study database ID
   * @returns {Promise<Array>} - Array of ProtocolDeviationResponse
   */
  getCriticalDeviations: async (studyId) => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching critical deviations for study:', studyId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/deviations/studies/${studyId}/critical`
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Critical deviations fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching critical deviations:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Get all unreported deviations (requires sponsor or IRB reporting)
   * 
   * @returns {Promise<Array>} - Array of ProtocolDeviationResponse
   */
  getUnreportedDeviations: async () => {
    try {
      console.log('[PROTOCOL_DEVIATION_SERVICE] Fetching unreported deviations');
      
      const response = await ApiService.get(
        '/clinops-ws/api/v1/deviations/unreported'
      );
      
      console.log('[PROTOCOL_DEVIATION_SERVICE] Unreported deviations fetched:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('[PROTOCOL_DEVIATION_SERVICE] Error fetching unreported deviations:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // ==================== Utility Methods ====================

  /**
   * Get human-readable label for deviation type
   * 
   * @param {string} type - Deviation type enum value
   * @returns {string} - Human-readable label
   */
  getDeviationTypeLabel: (type) => {
    const labels = {
      'VISIT_WINDOW': 'Visit Window Violation',
      'INCLUSION_EXCLUSION': 'Inclusion/Exclusion Criteria',
      'PROTOCOL_PROCEDURE': 'Protocol Procedure',
      'MEDICATION': 'Medication Deviation',
      'INFORMED_CONSENT': 'Informed Consent',
      'DATA_MANAGEMENT': 'Data Management',
      'STUDY_CONDUCT': 'Study Conduct',
      'SAFETY': 'Safety Issue',
      'OTHER': 'Other'
    };
    return labels[type] || type;
  },

  /**
   * Get severity badge CSS classes
   * 
   * @param {string} severity - MINOR, MAJOR, or CRITICAL
   * @returns {string} - Tailwind CSS classes
   */
  getSeverityBadgeClass: (severity) => {
    const classes = {
      'MINOR': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'MAJOR': 'bg-orange-100 text-orange-800 border border-orange-300',
      'CRITICAL': 'bg-red-100 text-red-800 border border-red-400 font-bold'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Get status badge CSS classes
   * 
   * @param {string} status - OPEN, UNDER_REVIEW, RESOLVED, or CLOSED
   * @returns {string} - Tailwind CSS classes
   */
  getStatusBadgeClass: (status) => {
    const classes = {
      'OPEN': 'bg-red-100 text-red-800',
      'UNDER_REVIEW': 'bg-blue-100 text-blue-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-600'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Get deviation types for dropdown
   * 
   * @returns {Array} - Array of {value, label} objects
   */
  getDeviationTypes: () => {
    return [
      { value: 'VISIT_WINDOW', label: 'Visit Window Violation' },
      { value: 'INCLUSION_EXCLUSION', label: 'Inclusion/Exclusion Criteria' },
      { value: 'PROTOCOL_PROCEDURE', label: 'Protocol Procedure' },
      { value: 'MEDICATION', label: 'Medication Deviation' },
      { value: 'INFORMED_CONSENT', label: 'Informed Consent' },
      { value: 'DATA_MANAGEMENT', label: 'Data Management' },
      { value: 'STUDY_CONDUCT', label: 'Study Conduct' },
      { value: 'SAFETY', label: 'Safety Issue' },
      { value: 'OTHER', label: 'Other' }
    ];
  },

  /**
   * Get severity levels for dropdown
   * 
   * @returns {Array} - Array of {value, label} objects
   */
  getSeverityLevels: () => {
    return [
      { value: 'MINOR', label: 'Minor' },
      { value: 'MAJOR', label: 'Major' },
      { value: 'CRITICAL', label: 'Critical' }
    ];
  },

  /**
   * Get status options for dropdown
   * 
   * @returns {Array} - Array of {value, label} objects
   */
  getStatusOptions: () => {
    return [
      { value: 'OPEN', label: 'Open' },
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'RESOLVED', label: 'Resolved' },
      { value: 'CLOSED', label: 'Closed' }
    ];
  }
};

export default ProtocolDeviationService;
