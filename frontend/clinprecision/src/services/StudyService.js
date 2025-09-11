import ApiService from './ApiService';

const API_PATH = '/study-design-ws/api/studies';

/**
 * Get all studies from backend
 * @returns {Promise<Array>} Promise that resolves to an array of studies
 */
export const getStudies = async () => {
  try {
    const response = await ApiService.get(API_PATH);
    return response.data;
  } catch (error) {
    console.error('Error fetching studies:', error);
    
    // Return mock data when backend is unavailable
    return getMockStudies();
  }
};

/**
 * Get a study by ID from backend
 * @param {string} id - The ID of the study to retrieve
 * @returns {Promise<Object>} Promise that resolves to the study data
 */
export const getStudyById = async (id) => {
  try {
    const response = await ApiService.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching study with ID ${id}:`, error);
    
    // Return mock data when backend is unavailable
    const mockStudies = getMockStudies();
    const study = mockStudies.find(s => s.id === id);
    if (study) {
      return study;
    }
    throw new Error(`Study with ID ${id} not found`);
  }
};

/**
 * Register a new study with backend integration
 * @param {Object} studyData - The study data to create
 * @returns {Promise<Object>} Promise that resolves to the created study
 */
export const registerStudy = async (studyData) => {
  try {
    const response = await ApiService.post(API_PATH, studyData);
    return response.data;
  } catch (error) {
    console.error('Error registering study:', error);
    throw error;
  }
};

/**
 * Update an existing study
 * @param {string} id - The ID of the study to update
 * @param {Object} studyData - The updated study data
 * @returns {Promise<Object>} Promise that resolves to the updated study
 */
export const updateStudy = async (id, studyData) => {
  try {
    const response = await ApiService.put(`${API_PATH}/${id}`, studyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating study with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a study using a safer approach that avoids Hibernate cascade issues
 * @param {string} id - The ID of the study to update
 * @param {Object} studyData - The basic study data (without arms)
 * @returns {Promise<Object>} Promise that resolves to the updated study
 */
export const updateStudySafely = async (id, studyData) => {
  try {
    // 1. Get the existing study to preserve any server-side data
    const currentStudy = await getStudyById(id);
    
    // 2. Prepare minimal study update that won't affect arms
    const studyToUpdate = { 
      id: id,
      name: studyData.name || currentStudy.name,
      description: studyData.description || currentStudy.description,
      sponsor: studyData.sponsor || currentStudy.sponsor,
      protocolNumber: studyData.protocolNumber || currentStudy.protocolNumber,
      phase: studyData.phase || currentStudy.phase,
      status: studyData.status || currentStudy.status,
      startDate: studyData.startDate || currentStudy.startDate,
      endDate: studyData.endDate || currentStudy.endDate,
      metadata: studyData.metadata || currentStudy.metadata
    };
    
    // 3. Add custom headers to signal this is a "details only" update
    try {
      // First try the custom header approach
      const response = await ApiService.put(
        `${API_PATH}/${id}`, 
        studyToUpdate,
        { 
          headers: { 
            'X-Update-Details-Only': 'true',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Study updated with 'X-Update-Details-Only' header approach");
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 500) {
        console.warn("Update with custom header failed, trying basic properties approach");
        
        // Last resort - try a direct update with key fields only but no ID
        // This is to avoid Hibernate loading the full entity graph
        const basicStudyData = {
          name: studyData.name,
          description: studyData.description,
          sponsor: studyData.sponsor,
          phase: studyData.phase,
          status: studyData.status,
          startDate: studyData.startDate,
          endDate: studyData.endDate
        };
        
        const basicResponse = await ApiService.put(`${API_PATH}/${id}`, basicStudyData);
        console.log("Study updated with basic properties approach");
        return basicResponse.data;
      }
      
      throw err; // Re-throw if it's not a 500
    }
  } catch (error) {
    console.error(`Error safely updating study with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update only the basic details of a study using PATCH method to bypass Hibernate cascade issues
 * @param {string} id - The ID of the study to update
 * @param {Object} studyData - Only the basic study properties to update (no relationships)
 * @returns {Promise<Object>} Promise that resolves to the updated study 
 */
export const updateStudyDetailsOnly = async (id, studyData) => {
  try {
    // Create a new endpoint path specifically for this operation
    const patchEndpoint = `${API_PATH}/${id}/details`;
    
    // Extract only the basic properties we want to update
    const detailsToUpdate = {
      name: studyData.name,
      description: studyData.description,
      sponsor: studyData.sponsor,
      protocolNumber: studyData.protocolNumber,
      phase: studyData.phase,
      status: studyData.status,
      startDate: studyData.startDate,
      endDate: studyData.endDate,
      investigator: studyData.investigator,
      // Add any other scalar properties, but NO collections or relationships
    };
    
    // Filter out undefined values
    const filteredDetails = Object.fromEntries(
      Object.entries(detailsToUpdate).filter(([_, v]) => v !== undefined)
    );
    
    try {
      // Use POST method with a method override header
      const response = await ApiService.post(
        patchEndpoint, 
        filteredDetails,
        {
          headers: {
            'X-HTTP-Method-Override': 'PATCH', // Signal to backend this is a PATCH operation
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (err) {
      // If we get a 404, the endpoint doesn't exist yet (backend not deployed)
      // So we'll fall back to updateStudySafely
      if (err.response && err.response.status === 404) {
        console.warn("Details endpoint not found (404), falling back to safe update method");
        return await updateStudySafely(id, studyData);
      }
      throw err; // Re-throw if it's not a 404
    }
  } catch (error) {
    console.error(`Error updating study details for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a study by ID
 * @param {string} id - The ID of the study to delete
 * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
 */
export const deleteStudy = async (id) => {
  try {
    const response = await ApiService.delete(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting study with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get study arms by study ID
 * @param {string} studyId - The ID of the study
 * @returns {Promise<Array>} Promise that resolves to an array of arms
 */
export const getStudyArms = async (studyId) => {
  try {
    try {
      const response = await ApiService.get(`${API_PATH}/${studyId}/arms`);
      return response.data;
    } catch (error) {
      // If we get a 404, it means the arms endpoint doesn't exist
      // or the study has no arms yet
      if (error.response && error.response.status === 404) {
        console.warn(`Arms endpoint for study ${studyId} returned 404, returning empty array`);
        return [];
      }
      throw error; // Re-throw if it's not a 404
    }
  } catch (error) {
    console.error(`Error fetching arms for study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Create a new arm for a study
 * @param {string} studyId - The ID of the study
 * @param {Object} armData - The arm data to create
 * @returns {Promise<Object>} Promise that resolves to the created arm
 */
export const createStudyArm = async (studyId, armData) => {
  try {
    try {
      const response = await ApiService.post(`${API_PATH}/${studyId}/arms`, armData);
      return response.data;
    } catch (error) {
      // If the arms endpoint doesn't exist (404), we'll create a mock response
      // This allows frontend development to continue even if the backend isn't fully implemented
      if (error.response && error.response.status === 404) {
        console.warn(`Arms endpoint for study ${studyId} returned 404, creating mock arm response`);
        // Create a mock response with a generated ID
        const mockArm = {
          ...armData,
          id: `temp-${Date.now()}`, // Temporary ID that can be recognized later
          studyId: studyId,
          createdAt: new Date().toISOString()
        };
        return mockArm;
      }
      throw error; // Re-throw if it's not a 404
    }
  } catch (error) {
    console.error(`Error creating arm for study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Update an existing arm in a study
 * @param {string} studyId - The ID of the study
 * @param {string} armId - The ID of the arm to update
 * @param {Object} armData - The updated arm data
 * @returns {Promise<Object>} Promise that resolves to the updated arm
 */
export const updateStudyArm = async (studyId, armId, armData) => {
  try {
    // Check if this is a temporary ID (starts with 'temp-')
    if (armId && armId.toString().startsWith('temp-')) {
      console.log(`Skipping update for temporary arm ${armId}, would create it on the server if endpoint existed`);
      return armData; // Just return the data as-is for temporary arms
    }
    
    try {
      const response = await ApiService.put(`${API_PATH}/${studyId}/arms/${armId}`, armData);
      return response.data;
    } catch (error) {
      // If the arms endpoint doesn't exist (404), we'll create a mock response
      if (error.response && error.response.status === 404) {
        console.warn(`Arms endpoint for study ${studyId} returned 404, returning original data`);
        return armData; // Just return the original data
      }
      throw error; // Re-throw if it's not a 404
    }
  } catch (error) {
    console.error(`Error updating arm ${armId} in study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Delete an arm from a study
 * @param {string} studyId - The ID of the study
 * @param {string} armId - The ID of the arm to delete
 * @returns {Promise<Object>} Promise that resolves to the deletion confirmation
 */
export const deleteStudyArm = async (studyId, armId) => {
  try {
    // Check if this is a temporary ID (starts with 'temp-')
    if (armId && armId.toString().startsWith('temp-')) {
      console.log(`Skipping delete for temporary arm ${armId}, nothing to delete on server`);
      return { success: true }; // Mock success response for temporary arms
    }
    
    try {
      const response = await ApiService.delete(`${API_PATH}/${studyId}/arms/${armId}`);
      return response.data;
    } catch (error) {
      // If the arms endpoint doesn't exist (404), we'll create a mock response
      if (error.response && error.response.status === 404) {
        console.warn(`Arms endpoint for study ${studyId} returned 404, returning mock delete success`);
        return { success: true }; // Mock success response
      }
      throw error; // Re-throw if it's not a 404
    }
  } catch (error) {
    console.error(`Error deleting arm ${armId} from study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Get versions of a study
 * @param {string} studyId - The ID of the study
 * @returns {Promise<Array>} Promise that resolves to an array of study versions
 */
export const getStudyVersions = async (studyId) => {
  try {
    const response = await ApiService.get(`${API_PATH}/${studyId}/versions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching versions for study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Create a new version of a study
 * @param {string} studyId - The ID of the study
 * @param {Object} versionData - Data for the new version
 * @returns {Promise<Object>} Promise that resolves to the created version
 */
export const createStudyVersion = async (studyId, versionData = {}) => {
  try {
    const response = await ApiService.post(`${API_PATH}/${studyId}/versions`, versionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating new version for study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Get a specific version of a study
 * @param {string} studyId - The ID of the study
 * @param {string} versionId - The ID of the version
 * @returns {Promise<Object>} Promise that resolves to the study version
 */
export const getStudyVersion = async (studyId, versionId) => {
  try {
    const response = await ApiService.get(`${API_PATH}/${studyId}/versions/${versionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching version ${versionId} of study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Lock a study for editing
 * @param {string} studyId - The ID of the study to lock
 * @returns {Promise<Object>} Promise that resolves to the lock confirmation
 */
export const lockStudy = async (studyId) => {
  try {
    const response = await ApiService.post(`${API_PATH}/${studyId}/lock`);
    return response.data;
  } catch (error) {
    console.error(`Error locking study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Unlock a study for editing
 * @param {string} studyId - The ID of the study to unlock
 * @returns {Promise<Object>} Promise that resolves to the unlock confirmation
 */
export const unlockStudy = async (studyId) => {
  try {
    const response = await ApiService.post(`${API_PATH}/${studyId}/unlock`);
    return response.data;
  } catch (error) {
    console.error(`Error unlocking study ${studyId}:`, error);
    throw error;
  }
};

/**
 * Mock data for development when backend is unavailable
 */
const getMockStudies = () => {
  return [
    {
      id: 'STUDY-001',
      name: 'Phase II Oncology Study - Drug XYZ',
      protocolNumber: 'PRO-XYZ-001',
      studyPhase: 'Phase II',
      indication: 'Advanced Solid Tumors',
      sponsor: 'Pharmaceutical Company A',
      status: 'ACTIVE',
      createdBy: 'Dr. Jane Smith',
      createdAt: '2025-01-15T10:00:00Z',
      modifiedAt: '2025-02-01T14:30:00Z',
      startDate: '2025-03-01',
      estimatedEndDate: '2026-12-31',
      targetEnrollment: 100,
      currentEnrollment: 45,
      sites: 12,
      countries: ['USA', 'Canada', 'UK'],
      primaryObjective: 'To evaluate the efficacy and safety of Drug XYZ in patients with advanced solid tumors',
      studyType: 'INTERVENTIONAL',
      designProgress: {
        basicInfo: { completed: true, valid: true },
        arms: { completed: true, valid: true },
        visits: { completed: true, valid: true },
        forms: { completed: false, valid: false },
        publishing: { completed: false, valid: false }
      }
    },
    {
      id: 'STUDY-002',
      name: 'Phase I Cardiovascular Safety Study',
      protocolNumber: 'PRO-CVD-002',
      studyPhase: 'Phase I',
      indication: 'Cardiovascular Disease',
      sponsor: 'Biotech Company B',
      status: 'DRAFT',
      createdBy: 'Dr. Michael Johnson',
      createdAt: '2025-02-10T09:00:00Z',
      modifiedAt: '2025-02-15T16:45:00Z',
      startDate: '2025-06-01',
      estimatedEndDate: '2025-12-31',
      targetEnrollment: 50,
      currentEnrollment: 0,
      sites: 5,
      countries: ['USA'],
      primaryObjective: 'To assess the safety and tolerability of cardiovascular intervention',
      studyType: 'INTERVENTIONAL',
      designProgress: {
        basicInfo: { completed: true, valid: true },
        arms: { completed: false, valid: false },
        visits: { completed: false, valid: false },
        forms: { completed: false, valid: false },
        publishing: { completed: false, valid: false }
      }
    },
    {
      id: 'STUDY-003',
      name: 'Phase III Diabetes Management Study',
      protocolNumber: 'PRO-DM-003',
      studyPhase: 'Phase III',
      indication: 'Type 2 Diabetes',
      sponsor: 'Global Pharma Corp',
      status: 'RECRUITING',
      createdBy: 'Dr. Sarah Wilson',
      createdAt: '2024-12-01T08:00:00Z',
      modifiedAt: '2025-01-20T11:15:00Z',
      startDate: '2025-01-15',
      estimatedEndDate: '2027-06-30',
      targetEnrollment: 500,
      currentEnrollment: 125,
      sites: 25,
      countries: ['USA', 'Canada', 'UK', 'Germany', 'France'],
      primaryObjective: 'To compare the efficacy of new diabetes medication vs standard of care',
      studyType: 'INTERVENTIONAL',
      designProgress: {
        basicInfo: { completed: true, valid: true },
        arms: { completed: true, valid: true },
        visits: { completed: true, valid: true },
        forms: { completed: true, valid: true },
        publishing: { completed: true, valid: true }
      }
    },
    {
      id: 'STUDY-004',
      name: 'Observational Alzheimer\'s Study',
      protocolNumber: 'PRO-ALZ-004',
      studyPhase: 'N/A',
      indication: 'Alzheimer\'s Disease',
      sponsor: 'Research Institute',
      status: 'ACTIVE',
      createdBy: 'Dr. Robert Chen',
      createdAt: '2024-11-01T07:30:00Z',
      modifiedAt: '2025-01-05T13:20:00Z',
      startDate: '2024-12-01',
      estimatedEndDate: '2028-12-01',
      targetEnrollment: 1000,
      currentEnrollment: 234,
      sites: 18,
      countries: ['USA', 'UK', 'Australia'],
      primaryObjective: 'To study the natural progression of Alzheimer\'s disease biomarkers',
      studyType: 'OBSERVATIONAL',
      designProgress: {
        basicInfo: { completed: true, valid: true },
        arms: { completed: false, valid: false },
        visits: { completed: true, valid: true },
        forms: { completed: true, valid: true },
        publishing: { completed: true, valid: true }
      }
    }
  ];
};

// Export all functions as a service object
const StudyService = {
  getStudies,
  getStudyById,
  registerStudy,
  updateStudy,
  updateStudySafely,
  updateStudyDetailsOnly,
  deleteStudy,
  getStudyArms,
  createStudyArm,
  updateStudyArm,
  deleteStudyArm,
  getStudyVersions,
  createStudyVersion,
  getStudyVersion,
  lockStudy,
  unlockStudy,
  getMockStudies
};

export default StudyService;