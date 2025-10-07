/**
 * Modern StudyService - Phase 3 Frontend Integration
 * 
 * BEFORE: Hardcoded arrays for dropdowns, multiple API endpoints
 * AFTER: Centralized CodeList integration, no hardcoded reference data
 * 
 * This service now focuses purely on study business logic,
 * while all reference data is handled by CodeList hooks and components
 */
import ApiService from './ApiService';
import { API_BASE_URL } from '../config';

export const CODE_LIST_ENDPOINTS = {
  REGULATORY_STATUS: `${API_BASE_URL}/clinops-ws/api/studies/lookup/regulatory-statuses`,
  STUDY_PHASE: `${API_BASE_URL}/clinops-ws/api/studies/lookup/phases`,
  STUDY_STATUS: `${API_BASE_URL}/clinops-ws/api/studies/lookup/statuses`,
  AMENDMENT_TYPE: `${API_BASE_URL}/api/v2/reference-data/amendment-types`,
  VISIT_TYPE: `${API_BASE_URL}/api/v2/reference-data/visit-types`
};

const API_PATH = '/clinops-ws/api/studies';

/**
 * Get all studies with optional filtering
 * @param {Object} filters Optional filters for studies
 * @returns {Promise<Array>} Promise that resolves to an array of studies
 */
export const getStudies = async (filters = {}) => {
  try {
    console.log('Fetching studies with filters:', filters);
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${API_PATH}?${queryString}` : API_PATH;
    
    const response = await ApiService.get(url);
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Found', response.data.length, 'studies');
      return response.data;
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching studies:', error);
    throw error;
  }
};

/**
 * Get study by ID
 * @param {number} id Study ID
 * @returns {Promise<Object>} Promise that resolves to study object
 */
export const getStudyById = async (id) => {
  try {
    console.log('Fetching study by ID:', id);
    const response = await ApiService.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study by ID:', error);
    throw error;
  }
};

/**
 * Create a new study
 * @param {Object} studyData Study data
 * @returns {Promise<Object>} Promise that resolves to created study
 */
export const createStudy = async (studyData) => {
  try {
    console.log('Creating new study:', studyData);
    const response = await ApiService.post(API_PATH, studyData);
    return response.data;
  } catch (error) {
    console.error('Error creating study:', error);
    throw error;
  }
};

/**
 * Update an existing study
 * @param {number} id Study ID
 * @param {Object} studyData Updated study data
 * @returns {Promise<Object>} Promise that resolves to updated study
 */
export const updateStudy = async (id, studyData) => {
  try {
    console.log('Updating study:', id, studyData);
    const response = await ApiService.put(`${API_PATH}/${id}`, studyData);
    return response.data;
  } catch (error) {
    console.error('Error updating study:', error);
    throw error;
  }
};

/**
 * Delete a study
 * @param {number} id Study ID
 * @returns {Promise} Promise that resolves when study is deleted
 */
export const deleteStudy = async (id) => {
  try {
    console.log('Deleting study:', id);
    await ApiService.delete(`${API_PATH}/${id}`);
  } catch (error) {
    console.error('Error deleting study:', error);
    throw error;
  }
};

/**
 * Change study status
 * @param {number} id Study ID
 * @param {string} status New status
 * @param {string} reason Optional reason for status change
 * @returns {Promise<Object>} Promise that resolves to updated study
 */
export const changeStudyStatus = async (id, status, reason = null) => {
  try {
    console.log('Changing study status:', id, status, reason);
    const payload = { status };
    if (reason) payload.reason = reason;
    
    const response = await ApiService.put(`${API_PATH}/${id}/status`, payload);
    return response.data;
  } catch (error) {
    console.error('Error changing study status:', error);
    throw error;
  }
};

/**
 * Get study amendments
 * @param {number} studyId Study ID
 * @returns {Promise<Array>} Promise that resolves to array of amendments
 */
export const getStudyAmendments = async (studyId) => {
  try {
    console.log('Fetching amendments for study:', studyId);
    const response = await ApiService.get(`${API_PATH}/${studyId}/amendments`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching study amendments:', error);
    throw error;
  }
};

/**
 * Create study amendment
 * @param {number} studyId Study ID
 * @param {Object} amendmentData Amendment data
 * @returns {Promise<Object>} Promise that resolves to created amendment
 */
export const createStudyAmendment = async (studyId, amendmentData) => {
  try {
    console.log('Creating amendment for study:', studyId, amendmentData);
    const response = await ApiService.post(`${API_PATH}/${studyId}/amendments`, amendmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating study amendment:', error);
    throw error;
  }
};

/**
 * Get study dashboard data
 * @param {number} studyId Study ID (optional, for specific study dashboard)
 * @returns {Promise<Object>} Promise that resolves to dashboard data
 */
export const getStudyDashboardData = async (studyId = null) => {
  try {
    const endpoint = studyId ? `${API_PATH}/${studyId}/dashboard` : `${API_PATH}/dashboard`;
    console.log('Fetching dashboard data from:', endpoint);
    
    const response = await ApiService.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Get study validation status
 * @param {number} studyId Study ID
 * @returns {Promise<Object>} Promise that resolves to validation status
 */
export const getStudyValidation = async (studyId) => {
  try {
    console.log('Fetching validation status for study:', studyId);
    const response = await ApiService.get(`${API_PATH}/${studyId}/validation`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study validation:', error);
    throw error;
  }
};

/**
 * Export study data
 * @param {number} studyId Study ID
 * @param {string} format Export format (pdf, csv, json)
 * @returns {Promise<Blob>} Promise that resolves to exported data blob
 */
export const exportStudy = async (studyId, format = 'pdf') => {
  try {
    console.log('Exporting study:', studyId, 'in format:', format);
    const response = await ApiService.get(`${API_PATH}/${studyId}/export/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting study:', error);
    throw error;
  }
};

/**
 * Search studies
 * @param {string} query Search query
 * @param {Object} options Search options
 * @returns {Promise<Array>} Promise that resolves to search results
 */
export const searchStudies = async (query, options = {}) => {
  try {
    console.log('Searching studies:', query, options);
    
    const params = {
      q: query,
      ...options
    };
    
    const queryParams = new URLSearchParams(params);
    const response = await ApiService.get(`${API_PATH}/search?${queryParams}`);
    
    return response.data || [];
  } catch (error) {
    console.error('Error searching studies:', error);
    throw error;
  }
};

/**
 * REMOVED: All hardcoded reference data functions
 * 
 * The following functions have been eliminated in Phase 3:
 * - getStudyStatuses() ❌ -> Use useStudyStatuses() hook
 * - getRegulatoryStatuses() ❌ -> Use useRegulatoryStatuses() hook  
 * - getStudyPhases() ❌ -> Use useStudyPhases() hook
 * - getStudyPhasesByCategory() ❌ -> Use useCodeList with filters
 * - getStudyLookupData() ❌ -> Use individual hooks as needed
 * 
 * Benefits:
 * ✅ No more hardcoded arrays
 * ✅ Centralized data management via Admin Service
 * ✅ Automatic caching and error handling
 * ✅ Consistent data format across components
 * ✅ Real-time updates when reference data changes
 */

/**
 * Modern helper to get reference data API base URL
 * Used by CodeList hooks for API calls
 */
export const getCodeListApiUrl = (category) => {
  if (category && CODE_LIST_ENDPOINTS[category]) {
    return CODE_LIST_ENDPOINTS[category];
  }

  // Fallback to legacy reference data base when specific mapping not defined
  return `${API_BASE_URL}/api/v2/reference-data`;
};

/**
 * Legacy compatibility function for components not yet migrated
 * @deprecated Use individual CodeList hooks instead
 * @returns {Object} Empty object - forces components to use new hooks
 */
export const getStudyLookupData = async () => {
  console.warn(`
    ⚠️  getStudyLookupData() is deprecated in Phase 3 Frontend Integration
    
    Replace with individual hooks:
    - useStudyStatuses() for study statuses
    - useRegulatoryStatuses() for regulatory statuses  
    - useStudyPhases() for study phases
    - useAmendmentTypes() for amendment types
    - useVisitTypes() for visit types
    
    Benefits: Better caching, error handling, and performance
  `);
  
  return {
    statuses: [],
    regulatoryStatuses: [],
    phases: [],
    message: 'Use individual CodeList hooks instead'
  };
};

export default {
  getStudies,
  getStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  changeStudyStatus,
  getStudyAmendments,
  createStudyAmendment,
  getStudyDashboardData,
  getStudyValidation,
  exportStudy,
  searchStudies,
  getCodeListApiUrl,
  CODE_LIST_ENDPOINTS,
  // Legacy compatibility
  getStudyLookupData
};
