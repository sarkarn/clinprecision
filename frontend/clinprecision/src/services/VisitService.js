import ApiService from './ApiService';
import { API_BASE_URL } from '../config';

/**
 * Visit Service - API client for unscheduled visit management
 * 
 * PURPOSE:
 * Provides frontend access to visit creation and query endpoints.
 * Handles communication with VisitController REST API.
 * 
 * USAGE:
 * 1. After status change, prompt user to create visit
 * 2. Call createUnscheduledVisit() with visit details
 * 3. Receive visitId in response
 * 4. (Optional) Use visitId for form collection
 * 
 * INTEGRATION:
 * - Called from StatusChangeModal (after status change)
 * - Called from UnscheduledVisitModal (visit creation)
 * - Called from SubjectDetails (display visit history)
 */

const BASE_URL = '/clinops-ws/api/v1/visits';

/**
 * Create an unscheduled visit
 * 
 * @param {Object} visitData - Visit creation data
 * @param {number} visitData.patientId - Patient ID
 * @param {number} visitData.studyId - Study ID
 * @param {number} visitData.siteId - Site ID
 * @param {string} visitData.visitType - Visit type (SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT)
 * @param {string} visitData.visitDate - Visit date (YYYY-MM-DD format)
 * @param {string} visitData.createdBy - User creating the visit
 * @param {string} [visitData.notes] - Optional notes
 * @returns {Promise<Object>} Visit response with visitId
 * 
 * @example
 * const visit = await VisitService.createUnscheduledVisit({
 *     patientId: 123,
 *     studyId: 456,
 *     siteId: 789,
 *     visitType: 'SCREENING',
 *     visitDate: '2025-10-15',
 *     createdBy: 'Dr. Smith',
 *     notes: 'Initial screening assessment'
 * });
 * console.log('Visit created:', visit.visitId);
 */
export const createUnscheduledVisit = async (visitData) => {
    try {
        console.log('[VISIT SERVICE] Creating unscheduled visit:', visitData);
        
        const response = await ApiService.post(`${BASE_URL}/unscheduled`, visitData);
        
        console.log('[VISIT SERVICE] Visit created successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('[VISIT SERVICE] Error creating unscheduled visit:', error);
        throw error;
    }
};

/**
 * Get all visits for a patient
 * 
 * @param {number} patientId - Patient ID
 * @returns {Promise<Array>} List of visits ordered by date (most recent first)
 * 
 * @example
 * const visits = await VisitService.getPatientVisits(123);
 * visits.forEach(visit => {
 *     console.log(`${visit.visitType} on ${visit.visitDate}`);
 * });
 */
export const getPatientVisits = async (patientId) => {
    try {
        console.log('[VISIT SERVICE] Getting visits for patientId:', patientId);
        
        const response = await ApiService.get(`${BASE_URL}/patient/${patientId}`);
        
        console.log('[VISIT SERVICE] Found visits:', response.data.length);
        return response.data;
        
    } catch (error) {
        console.error('[VISIT SERVICE] Error getting patient visits:', error);
        throw error;
    }
};

/**
 * Get all visits for a study
 * 
 * @param {number} studyId - Study ID
 * @returns {Promise<Array>} List of visits for the study
 * 
 * @example
 * const visits = await VisitService.getStudyVisits(456);
 * console.log(`Study has ${visits.length} visits`);
 */
export const getStudyVisits = async (studyId) => {
    try {
        console.log('[VISIT SERVICE] Getting visits for studyId:', studyId);
        
        const response = await ApiService.get(`${BASE_URL}/study/${studyId}`);
        
        console.log('[VISIT SERVICE] Found visits:', response.data.length);
        return response.data;
        
    } catch (error) {
        console.error('[VISIT SERVICE] Error getting study visits:', error);
        throw error;
    }
};

/**
 * Get visits by type
 * 
 * @param {string} visitType - Visit type (SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT)
 * @returns {Promise<Array>} List of visits of specified type
 * 
 * @example
 * const screeningVisits = await VisitService.getVisitsByType('SCREENING');
 * console.log(`${screeningVisits.length} screening visits found`);
 */
export const getVisitsByType = async (visitType) => {
    try {
        console.log('[VISIT SERVICE] Getting visits by type:', visitType);
        
        const response = await ApiService.get(`${BASE_URL}/type/${visitType}`);
        
        console.log('[VISIT SERVICE] Found visits:', response.data.length);
        return response.data;
        
    } catch (error) {
        console.error('[VISIT SERVICE] Error getting visits by type:', error);
        throw error;
    }
};

/**
 * Get a specific visit by ID
 * 
 * @param {string} visitId - Visit UUID
 * @returns {Promise<Object|null>} Visit details or null if not found
 * 
 * @example
 * const visit = await VisitService.getVisitById('123e4567-e89b-12d3-a456-426614174000');
 * if (visit) {
 *     console.log('Visit found:', visit.visitType);
 * }
 */
export const getVisitById = async (visitId) => {
    try {
        console.log('[VISIT SERVICE] Getting visit by visitId:', visitId);
        
        const response = await ApiService.get(`${BASE_URL}/${visitId}`);
        
        console.log('[VISIT SERVICE] Visit found');
        return response.data;
        
    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('[VISIT SERVICE] Visit not found:', visitId);
            return null;
        }
        console.error('[VISIT SERVICE] Error getting visit by ID:', error);
        throw error;
    }
};

/**
 * Get available unscheduled visit types from backend configuration
 * Fetches the list of enabled unscheduled visit types for the study
 * 
 * @param {number} studyId - Study ID
 * @returns {Promise<Array>} Array of visit definitions
 * 
 * @example
 * const visitTypes = await VisitService.getUnscheduledVisitTypes(11);
 * // Returns: [
 * //   { id: 123, name: 'Early Termination Visit', visitCode: 'EARLY_TERM', ... },
 * //   { id: 124, name: 'Adverse Event Visit', visitCode: 'AE_VISIT', ... },
 * // ]
 */
const getUnscheduledVisitTypes = async (studyId) => {
    try {
        console.log('Fetching unscheduled visit types for study:', studyId);
        
        const response = await fetch(
            `${API_BASE_URL}/clinops-ws/api/v1/visits/study/${studyId}/unscheduled-types`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch unscheduled visit types: ${response.statusText}`);
        }

        const visitTypes = await response.json();
        console.log('Fetched unscheduled visit types:', visitTypes);
        
        return visitTypes;
    } catch (error) {
        console.error('Error fetching unscheduled visit types:', error);
        throw error;
    }
};

/**
 * Visit type constants
 */
export const VISIT_TYPES = {
    SCREENING: 'SCREENING',
    ENROLLMENT: 'ENROLLMENT',
    DISCONTINUATION: 'DISCONTINUATION',
    ADVERSE_EVENT: 'ADVERSE_EVENT'
};

/**
 * Visit status constants
 */
export const VISIT_STATUS = {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

/**
 * Map patient status to visit type
 * Used for determining which visit type to create after status change
 * 
 * @param {string} newStatus - Patient status enum value
 * @returns {string|null} Visit type or null if no visit needed
 * 
 * @example
 * const visitType = getVisitTypeForStatus('SCREENING');
 * console.log(visitType); // 'SCREENING'
 */
export const getVisitTypeForStatus = (newStatus) => {
    const statusToVisitMap = {
        'SCREENING': VISIT_TYPES.SCREENING,
        'ENROLLED': VISIT_TYPES.ENROLLMENT,
        'WITHDRAWN': VISIT_TYPES.DISCONTINUATION
    };
    
    return statusToVisitMap[newStatus] || null;
};

/**
 * Check if status change should prompt for visit creation
 * 
 * @param {string} newStatus - Patient status enum value
 * @returns {boolean} True if visit should be prompted
 * 
 * @example
 * if (shouldPromptForVisit('SCREENING')) {
 *     showVisitPrompt();
 * }
 */
export const shouldPromptForVisit = (newStatus) => {
    return getVisitTypeForStatus(newStatus) !== null;
};

/**
 * Get user-friendly visit type label
 * 
 * @param {string} visitType - Visit type enum value
 * @returns {string} Display label
 * 
 * @example
 * const label = getVisitTypeLabel('SCREENING');
 * console.log(label); // 'Screening Visit'
 */
export const getVisitTypeLabel = (visitType) => {
    const labels = {
        'SCREENING': 'Screening Visit',
        'ENROLLMENT': 'Enrollment Visit',
        'DISCONTINUATION': 'Discontinuation Visit',
        'ADVERSE_EVENT': 'Adverse Event Visit'
    };
    
    return labels[visitType] || visitType;
};

/**
 * Get visit type color for UI badges
 * 
 * @param {string} visitType - Visit type enum value
 * @returns {string} Tailwind CSS color classes
 * 
 * @example
 * const colorClass = getVisitTypeColor('SCREENING');
 * console.log(colorClass); // 'bg-yellow-100 text-yellow-800'
 */
export const getVisitTypeColor = (visitType) => {
    const colors = {
        'SCREENING': 'bg-yellow-100 text-yellow-800',
        'ENROLLMENT': 'bg-green-100 text-green-800',
        'DISCONTINUATION': 'bg-red-100 text-red-800',
        'ADVERSE_EVENT': 'bg-orange-100 text-orange-800'
    };
    
    return colors[visitType] || 'bg-gray-100 text-gray-800';
};

const VisitService = {
    createUnscheduledVisit,
    getPatientVisits,
    getStudyVisits,
    getVisitsByType,
    getVisitById,
    getUnscheduledVisitTypes,
    VISIT_TYPES,
    VISIT_STATUS,
    getVisitTypeForStatus,
    shouldPromptForVisit,
    getVisitTypeLabel,
    getVisitTypeColor
};

export default VisitService;
