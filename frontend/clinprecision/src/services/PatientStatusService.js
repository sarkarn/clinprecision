// src/services/PatientStatusService.js
import ApiService from './ApiService';

/**
 * Patient Status Service
 * Frontend integration for patient status management REST API
 * 
 * Provides methods for:
 * - Changing patient status (write operations)
 * - Querying status history and analytics (read operations)
 * - Status validation and transition management
 * 
 * API Base Path: /clinops-ws/api/v1/patients
 * 
 * @see Backend: PatientStatusController.java
 * @see Documentation: PATIENT_STATUS_API_QUICK_REFERENCE.md
 */
export const PatientStatusService = {
  
  // ==================== Write Operations ====================

  /**
   * Change patient status
   * Validates transition and creates status history record
   * 
   * @param {number} patientId - Patient database ID
   * @param {object} statusData - Status change data
   * @param {string} statusData.newStatus - Target status (REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN)
   * @param {string} statusData.reason - Business justification (required)
   * @param {string} statusData.changedBy - User identifier (required)
   * @param {string} statusData.notes - Additional context (optional)
   * @param {number} statusData.enrollmentId - Specific enrollment context (optional)
   * @returns {Promise<Object>} - PatientStatusHistoryResponse
   */
  changePatientStatus: async (patientId, statusData) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Changing patient status:', { patientId, statusData });
      
      // Validate required fields
      if (!statusData.newStatus) {
        throw new Error('New status is required');
      }
      if (!statusData.reason || statusData.reason.trim().length === 0) {
        throw new Error('Reason for status change is required');
      }
      if (!statusData.changedBy || statusData.changedBy.trim().length === 0) {
        throw new Error('Changed by is required');
      }

      const response = await ApiService.post(
        `/clinops-ws/api/v1/patients/${patientId}/status`,
        statusData
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Status changed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error changing patient status:', error);
      
      // Extract error message from API response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // ==================== Read Operations - Patient Specific ====================

  /**
   * Get complete status history for a patient
   * Returns all status changes ordered chronologically (newest first)
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Array>} - Array of PatientStatusHistoryResponse objects
   */
  getPatientStatusHistory: async (patientId) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status history for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/${patientId}/status/history`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching status history:', error);
      throw error;
    }
  },

  /**
   * Get current patient status
   * Returns most recent status change with full context
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Object>} - PatientStatusHistoryResponse for current status
   */
  getCurrentPatientStatus: async (patientId) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching current status for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/${patientId}/status/current`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Current status:', response.data.newStatus);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching current status:', error);
      throw error;
    }
  },

  /**
   * Get comprehensive status summary for a patient
   * Returns current status + complete history + analytics
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Object>} - PatientStatusSummaryResponse
   */
  getPatientStatusSummary: async (patientId) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status summary for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/${patientId}/status/summary`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Status summary retrieved:', {
        currentStatus: response.data.currentStatus,
        totalChanges: response.data.totalStatusChanges,
        daysInCurrentStatus: response.data.daysInCurrentStatus
      });
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching status summary:', error);
      throw error;
    }
  },

  /**
   * Get patient status change count
   * Returns total number of status changes for a patient
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<number>} - Status change count
   */
  getPatientStatusChangeCount: async (patientId) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status change count for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/${patientId}/status/count`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Status change count:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching status change count:', error);
      throw error;
    }
  },

  /**
   * Get valid status transitions for a patient
   * Returns list of statuses the patient can transition to from current status
   * Used to populate status dropdown in change form
   * 
   * @param {number} patientId - Patient database ID
   * @returns {Promise<Array>} - Array of valid status strings
   */
  getValidStatusTransitions: async (patientId) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching valid transitions for patient:', patientId);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/${patientId}/status/valid-transitions`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Valid transitions:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching valid transitions:', error);
      throw error;
    }
  },

  // ==================== Read Operations - Analytics ====================

  /**
   * Get status transition summary (analytics)
   * Returns aggregated statistics on status transitions across all patients
   * Used for dashboards, conversion rate analysis, bottleneck identification
   * 
   * @returns {Promise<Array>} - Array of StatusTransitionSummaryResponse objects
   */
  getStatusTransitionSummary: async () => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status transition summary');
      
      const response = await ApiService.get(
        '/clinops-ws/api/v1/patients/status/transitions/summary'
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'distinct transitions');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching transition summary:', error);
      throw error;
    }
  },

  /**
   * Find patients currently in a specific status
   * 
   * @param {string} status - Status to filter by (REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN)
   * @returns {Promise<Array>} - Array of PatientStatusHistoryResponse objects
   */
  findPatientsInStatus: async (status) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Finding patients in status:', status);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/status/${status}/patients`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'patients in status', status);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error finding patients in status:', error);
      throw error;
    }
  },

  /**
   * Find patients stuck in a status (bottleneck detection)
   * Returns patient IDs who have been in the specified status longer than threshold
   * 
   * @param {string} status - Status to check
   * @param {number} days - Threshold in days (default: 14)
   * @returns {Promise<Array>} - Array of patient IDs
   */
  findPatientsStuckInStatus: async (status, days = 14) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Finding patients stuck in status:', status, 'for >', days, 'days');
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/status/${status}/stuck?days=${days}`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'stuck patients');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error finding stuck patients:', error);
      throw error;
    }
  },

  /**
   * Get status changes by date range
   * Used for compliance reports, quarterly/annual audits, activity tracking
   * 
   * @param {string} startDate - Start date (ISO format: yyyy-MM-ddTHH:mm:ss)
   * @param {string} endDate - End date (ISO format: yyyy-MM-ddTHH:mm:ss)
   * @returns {Promise<Array>} - Array of PatientStatusHistoryResponse objects
   */
  getStatusChangesByDateRange: async (startDate, endDate) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status changes between', startDate, 'and', endDate);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/status/changes?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes in date range');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching changes by date range:', error);
      throw error;
    }
  },

  /**
   * Get status changes by user (audit trail)
   * Used for user activity reports, training assessment, compliance audits
   * 
   * @param {string} user - User identifier (email or user ID)
   * @returns {Promise<Array>} - Array of PatientStatusHistoryResponse objects
   */
  getStatusChangesByUser: async (user) => {
    try {
      console.log('[PATIENT_STATUS_SERVICE] Fetching status changes by user:', user);
      
      const response = await ApiService.get(
        `/clinops-ws/api/v1/patients/status/changes/by-user?user=${encodeURIComponent(user)}`
      );
      
      console.log('[PATIENT_STATUS_SERVICE] Found', response.data.length, 'status changes by user', user);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Error fetching changes by user:', error);
      throw error;
    }
  },

  // ==================== Utility Methods ====================

  /**
   * Check service health
   * @returns {Promise<string>} - Health status message
   */
  checkHealth: async () => {
    try {
      const response = await ApiService.get('/clinops-ws/api/v1/patients/status/health');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_STATUS_SERVICE] Health check failed:', error);
      throw error;
    }
  },

  /**
   * Format status for display
   * Converts uppercase status to title case
   * 
   * @param {string|object} status - Status in uppercase (e.g., "REGISTERED") or status object
   * @returns {string} - Formatted status (e.g., "Registered")
   */
  formatStatus: (status) => {
    if (!status) return 'Unknown';
    
    // Handle both string and object formats
    const statusStr = typeof status === 'string' ? status : (status.status || status.displayName || '');
    
    if (!statusStr) return 'Unknown';
    
    return statusStr.charAt(0) + statusStr.slice(1).toLowerCase();
  },

  /**
   * Get status badge variant for UI
   * Maps status to badge color variant
   * 
   * @param {string} status - Status value
   * @returns {string} - Badge variant (success, warning, info, neutral, danger)
   */
  getStatusBadgeVariant: (status) => {
    const statusVariantMap = {
      'REGISTERED': 'info',      // Blue
      'SCREENING': 'warning',    // Yellow
      'ENROLLED': 'success',     // Green
      'ACTIVE': 'violet',        // Violet/Purple
      'COMPLETED': 'neutral',    // Gray
      'WITHDRAWN': 'danger'      // Red
    };
    return statusVariantMap[status] || 'neutral';
  },

  /**
   * Validate status change data
   * Client-side validation before API call
   * 
   * @param {Object} statusData - Status change data
   * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
   */
  validateStatusChangeData: (statusData) => {
    const errors = [];

    if (!statusData.newStatus || statusData.newStatus.trim().length === 0) {
      errors.push('New status is required');
    }

    if (!statusData.reason || statusData.reason.trim().length === 0) {
      errors.push('Reason for status change is required');
    } else if (statusData.reason.trim().length < 10) {
      errors.push('Reason must be at least 10 characters long');
    }

    if (!statusData.changedBy || statusData.changedBy.trim().length === 0) {
      errors.push('Changed by is required');
    }

    // Validate status is one of the valid values
    const validStatuses = ['REGISTERED', 'SCREENING', 'ENROLLED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN'];
    if (statusData.newStatus && !validStatuses.includes(statusData.newStatus.toUpperCase())) {
      errors.push('Invalid status value');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Get status lifecycle order
   * Returns statuses in their typical progression order
   * 
   * @returns {Array} - Array of status objects with order info
   */
  getStatusLifecycle: () => {
    return [
      { status: 'REGISTERED', displayName: 'Registered', order: 1, description: 'Initial registration' },
      { status: 'SCREENING', displayName: 'Screening', order: 2, description: 'Undergoing screening' },
      { status: 'ENROLLED', displayName: 'Enrolled', order: 3, description: 'Enrolled in study' },
      { status: 'ACTIVE', displayName: 'Active', order: 4, description: 'Active treatment' },
      { status: 'COMPLETED', displayName: 'Completed', order: 5, description: 'Study completed' },
      { status: 'WITHDRAWN', displayName: 'Withdrawn', order: 6, description: 'Withdrawn from study' }
    ];
  },

  /**
   * Calculate days between status changes
   * Helper for analytics
   * 
   * @param {Array} statusHistory - Array of status history objects with changedAt
   * @returns {Array} - Array of durations in days
   */
  calculateDaysBetweenChanges: (statusHistory) => {
    if (!statusHistory || statusHistory.length < 2) {
      return [];
    }

    const durations = [];
    for (let i = 0; i < statusHistory.length - 1; i++) {
      const current = new Date(statusHistory[i].changedAt);
      const previous = new Date(statusHistory[i + 1].changedAt);
      const days = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
      durations.push(days);
    }

    return durations;
  },

  /**
   * Get average days between status changes
   * 
   * @param {Array} statusHistory - Array of status history objects
   * @returns {number|null} - Average days or null if insufficient data
   */
  getAverageDaysBetweenChanges: (statusHistory) => {
    const durations = PatientStatusService.calculateDaysBetweenChanges(statusHistory);
    if (durations.length === 0) return null;
    
    const sum = durations.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / durations.length) * 10) / 10; // Round to 1 decimal
  }
};

export default PatientStatusService;
