import ApiService from './ApiService';

const API_PATH = '/study-design-ws/api/studies';
const LOOKUP_API_PATH = '/study-design-ws/api/studies/lookup';

// Mock data for testing when backend is not available
const MOCK_STUDIES = [
  {
    id: 1,
    name: "COVID-19 Vaccine Trial",
    description: "A randomized controlled trial to evaluate the efficacy of a novel COVID-19 vaccine.",
    sponsor: "Pfizer Inc.",
    protocolNumber: "BPI-COVID-001",
    phase: "Phase 3",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    indication: "COVID-19 Prevention",
    studyType: "INTERVENTIONAL",
    principalInvestigator: "Dr. Sarah Johnson",
    sites: 45,
    plannedSubjects: 30000,
    enrolledSubjects: 28500,
    targetEnrollment: 30000,
    primaryObjective: "To demonstrate vaccine efficacy",
    amendments: 2
  },
  {
    id: 2,
    name: "Diabetes Management Study", 
    description: "Evaluating a new approach to diabetes management.",
    sponsor: "Merck & Co.",
    protocolNumber: "MRG-DM-101",
    phase: "Phase 2",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    indication: "Type 2 Diabetes",
    studyType: "INTERVENTIONAL",
    principalInvestigator: "Dr. Michael Chen",
    sites: 12,
    plannedSubjects: 500,
    enrolledSubjects: 450,
    targetEnrollment: 500,
    primaryObjective: "Evaluate glucose control improvement",
    amendments: 1
  },
  {
    id: 3,
    name: "Alzheimer's Disease Intervention Study",
    description: "Evaluating a novel therapeutic approach for early-stage Alzheimer's disease.",
    sponsor: "Pfizer Inc.",
    protocolNumber: "NCF-ALZ-202", 
    phase: "Phase 2",
    status: "active",
    startDate: "2024-03-10",
    endDate: "2025-09-30",
    indication: "Early-stage Alzheimer's Disease",
    studyType: "INTERVENTIONAL",
    principalInvestigator: "Dr. Emily Rodriguez",
    sites: 25,
    plannedSubjects: 800,
    enrolledSubjects: 650,
    targetEnrollment: 800,
    primaryObjective: "Assess cognitive improvement",
    amendments: 0
  }
];

// Flag to use mock data for testing (set to true to test frontend without backend)
const USE_MOCK_DATA = false;

/**
 * Get mock studies for testing
 */
const getMockStudies = () => {
  console.log('Using mock studies data');
  return MOCK_STUDIES.map(study => ({
    id: study.id,
    title: study.name,
    description: study.description,
    sponsor: study.sponsor,
    protocolNumber: study.protocolNumber,
    phase: study.phase,
    status: study.status,
    startDate: study.startDate,
    endDate: study.endDate,
    indication: study.indication,
    studyType: study.studyType,
    principalInvestigator: study.principalInvestigator,
    sites: study.sites,
    plannedSubjects: study.plannedSubjects,
    enrolledSubjects: study.enrolledSubjects,
    targetEnrollment: study.targetEnrollment,
    primaryObjective: study.primaryObjective,
    amendments: study.amendments
  }));
};

/**
 * Get all studies from backend
 * @returns {Promise<Array>} Promise that resolves to an array of studies
 */
export const getStudies = async () => {
  // If mock data flag is enabled, return mock data immediately
  if (USE_MOCK_DATA) {
    console.log('USE_MOCK_DATA flag is true, returning mock data');
    return getMockStudies();
  }

  try {
    console.log('Attempting to fetch studies from backend at:', API_PATH);
    const response = await ApiService.get(API_PATH);
    
    // Debug logging - detailed response inspection
    console.log('=== BACKEND RESPONSE DEBUG ===');
    console.log('Full response object:', response);
    console.log('Response status:', response?.status);
    console.log('Response headers:', response?.headers);
    console.log('Response data:', response?.data);
    console.log('Response data type:', typeof response?.data);
    console.log('Is response.data an array?', Array.isArray(response?.data));
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Number of studies in response:', response.data.length);
      
      // Log each individual study from backend
      response.data.forEach((study, index) => {
        console.log(`=== BACKEND STUDY ${index + 1} ===`);
        console.log('Full study object:', study);
        console.log('Study ID:', study.id);
        console.log('Study NAME field:', study.name);
        console.log('Study NAME type:', typeof study.name);
        console.log('Study NAME length:', study.name?.length);
        console.log('Study NAME is empty?', !study.name || study.name.trim() === '');
        console.log('Other fields:', {
          description: study.description,
          sponsor: study.sponsor,
          protocolNumber: study.protocolNumber,
          phase: study.phase,
          status: study.status
        });
      });
    }
    
    // Ensure response.data is an array
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.warn('Backend response is not a valid array:', response);
      return getMockStudies(); // Fall back to mock data
    }
    
    console.log('Backend response data (array):', response.data);
    console.log('Number of studies received from backend:', response.data.length);
    
    // Map the backend response to frontend format
    const mappedStudies = response.data.map((study, index) => {
      console.log(`=== MAPPING STUDY ${index + 1} ===`);
      console.log('Original backend study:', study);
      console.log('Original study.name:', study.name);
      console.log('Will map to title:', study.name || 'Untitled Study');
      
      const mappedStudy = {
        id: study.id,
        title: study.name || 'Untitled Study',
        description: study.description || 'No description available',
        sponsor: study.sponsor || 'Unknown Sponsor',
        protocolNumber: study.protocolNumber || 'N/A',
        phase: study.phase || 'N/A',
        status: study.status || 'unknown',
        startDate: study.startDate || null,
        endDate: study.endDate || null,
        indication: study.indication || 'Not specified',
        studyType: study.studyType || 'INTERVENTIONAL',
        principalInvestigator: study.principalInvestigator || 'Not assigned',
        sites: study.sites || 0,
        plannedSubjects: study.plannedSubjects || 0,
        enrolledSubjects: study.enrolledSubjects || 0,
        targetEnrollment: study.targetEnrollment || 0,
        primaryObjective: study.primaryObjective || 'Not specified',
        amendments: study.amendments || 0,
        createdAt: study.createdAt || null,
        updatedAt: study.updatedAt || null
      };
      
      console.log('Mapped study result:', mappedStudy);
      console.log('Final title value:', mappedStudy.title);
      return mappedStudy;
    });
    
    console.log('Final mapped studies array:', mappedStudies);
    
    if (mappedStudies.length === 0) {
      console.log('No studies found in backend, falling back to mock data');
      return getMockStudies();
    }
    
    // Check if any studies have empty titles (which indicates name field issues)
    const studiesWithEmptyTitles = mappedStudies.filter(study => !study.title || study.title.trim() === '' || study.title === 'Untitled Study');
    if (studiesWithEmptyTitles.length > 0) {
      console.warn(`Found ${studiesWithEmptyTitles.length} studies with empty titles:`, studiesWithEmptyTitles);
      console.warn('This indicates that the backend name field is null or empty for these studies');
    }
    
    // Log final results summary
    console.log(`=== FINAL RESULTS SUMMARY ===`);
    console.log(`Total studies from backend: ${mappedStudies.length}`);
    console.log(`Studies with proper titles: ${mappedStudies.length - studiesWithEmptyTitles.length}`);
    console.log(`Studies with missing titles: ${studiesWithEmptyTitles.length}`);
    console.log('Final mapped studies:', mappedStudies);
    
    return mappedStudies;
    
  } catch (error) {
    console.error('Error fetching studies from backend:', error);
    console.log('Falling back to mock data due to error');
    return getMockStudies();
  }
};

/**
 * Create a new study
 * @param {Object} studyData Study data to create
 * @returns {Promise<Object>} Promise that resolves to the created study
 */
export const registerStudy = async (studyData) => {
  try {
    const response = await ApiService.post(API_PATH, studyData);
    return response.data;
  } catch (error) {
    console.error('Error creating study:', error);
    throw error;
  }
};

/**
 * Get study by ID
 * @param {number} studyId Study ID
 * @returns {Promise<Object>} Promise that resolves to the study
 */
export const getStudyById = async (studyId) => {
  try {
    const response = await ApiService.get(`${API_PATH}/${studyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study:', error);
    throw error;
  }
};

/**
 * Update study
 * @param {number} studyId Study ID
 * @param {Object} studyData Study data to update
 * @returns {Promise<Object>} Promise that resolves to the updated study
 */
export const updateStudy = async (studyId, studyData) => {
  try {
    const response = await ApiService.put(`${API_PATH}/${studyId}`, studyData);
    return response.data;
  } catch (error) {
    console.error('Error updating study:', error);
    throw error;
  }
};

/**
 * Delete study
 * @param {number} studyId Study ID
 * @returns {Promise<void>} Promise that resolves when study is deleted
 */
export const deleteStudy = async (studyId) => {
  try {
    await ApiService.delete(`${API_PATH}/${studyId}`);
  } catch (error) {
    console.error('Error deleting study:', error);
    throw error;
  }
};

/**
 * Get all study statuses for dropdown lists
 * @returns {Promise<Array>} Promise that resolves to an array of study statuses
 */
export const getStudyStatuses = async () => {
  try {
    console.log('Fetching study statuses from:', `${LOOKUP_API_PATH}/statuses`);
    const response = await ApiService.get(`${LOOKUP_API_PATH}/statuses`);
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Found', response.data.length, 'study statuses');
      return response.data.map(status => ({
        id: status.id,
        value: status.code,
        label: status.name,
        description: status.description,
        allowsModification: status.allowsModification,
        isFinalStatus: status.isFinalStatus
      }));
    }
    
    // Fallback to hardcoded values if lookup fails
    return [
      { id: 1, value: 'DRAFT', label: 'Draft', description: 'Study in initial planning phase' },
      { id: 2, value: 'PLANNING', label: 'Planning', description: 'Study design being finalized' },
      { id: 3, value: 'APPROVED', label: 'Approved', description: 'Study approved and ready to start' },
      { id: 4, value: 'ACTIVE', label: 'Active', description: 'Study actively enrolling participants' },
      { id: 5, value: 'COMPLETED', label: 'Completed', description: 'Study successfully completed' },
      { id: 6, value: 'TERMINATED', label: 'Terminated', description: 'Study terminated before completion' },
      { id: 7, value: 'SUSPENDED', label: 'Suspended', description: 'Study temporarily halted' }
    ];
  } catch (error) {
    console.error('Error fetching study statuses:', error);
    // Return fallback data
    return [
      { id: 1, value: 'DRAFT', label: 'Draft', description: 'Study in initial planning phase' },
      { id: 2, value: 'PLANNING', label: 'Planning', description: 'Study design being finalized' },
      { id: 3, value: 'APPROVED', label: 'Approved', description: 'Study approved and ready to start' },
      { id: 4, value: 'ACTIVE', label: 'Active', description: 'Study actively enrolling participants' },
      { id: 5, value: 'COMPLETED', label: 'Completed', description: 'Study successfully completed' },
      { id: 6, value: 'TERMINATED', label: 'Terminated', description: 'Study terminated before completion' },
      { id: 7, value: 'SUSPENDED', label: 'Suspended', description: 'Study temporarily halted' }
    ];
  }
};

/**
 * Get all regulatory statuses for dropdown lists
 * @returns {Promise<Array>} Promise that resolves to an array of regulatory statuses
 */
export const getRegulatoryStatuses = async () => {
  try {
    console.log('Fetching regulatory statuses from:', `${LOOKUP_API_PATH}/regulatory-statuses`);
    const response = await ApiService.get(`${LOOKUP_API_PATH}/regulatory-statuses`);
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Found', response.data.length, 'regulatory statuses');
      return response.data.map(status => ({
        id: status.id,
        value: status.code,
        label: status.name,
        description: status.description,
        category: status.regulatoryCategory,
        allowsEnrollment: status.allowsEnrollment,
        requiresDocumentation: status.requiresDocumentation
      }));
    }
    
    // Fallback to hardcoded values if lookup fails
    return [
      { id: 1, value: 'NOT_APPLICABLE', label: 'Not Applicable', description: 'No regulatory approval required' },
      { id: 2, value: 'PREPARING_SUBMISSION', label: 'Preparing Submission', description: 'Preparing regulatory documents' },
      { id: 3, value: 'IND_SUBMITTED', label: 'IND Submitted', description: 'Investigational New Drug application submitted' },
      { id: 4, value: 'IRB_SUBMITTED', label: 'IRB Submitted', description: 'Submitted to Institutional Review Board' },
      { id: 5, value: 'IND_APPROVED', label: 'IND Approved', description: 'IND application approved by FDA' },
      { id: 6, value: 'IRB_APPROVED', label: 'IRB Approved', description: 'Study approved by IRB' },
      { id: 7, value: 'FULL_REGULATORY_APPROVAL', label: 'Full Regulatory Approval', description: 'All required approvals obtained' }
    ];
  } catch (error) {
    console.error('Error fetching regulatory statuses:', error);
    // Return fallback data
    return [
      { id: 1, value: 'NOT_APPLICABLE', label: 'Not Applicable', description: 'No regulatory approval required' },
      { id: 2, value: 'PREPARING_SUBMISSION', label: 'Preparing Submission', description: 'Preparing regulatory documents' },
      { id: 3, value: 'IND_SUBMITTED', label: 'IND Submitted', description: 'Investigational New Drug application submitted' },
      { id: 4, value: 'IRB_SUBMITTED', label: 'IRB Submitted', description: 'Submitted to Institutional Review Board' },
      { id: 5, value: 'IND_APPROVED', label: 'IND Approved', description: 'IND application approved by FDA' },
      { id: 6, value: 'IRB_APPROVED', label: 'IRB Approved', description: 'Study approved by IRB' },
      { id: 7, value: 'FULL_REGULATORY_APPROVAL', label: 'Full Regulatory Approval', description: 'All required approvals obtained' }
    ];
  }
};

/**
 * Get all study phases for dropdown lists
 * @returns {Promise<Array>} Promise that resolves to an array of study phases
 */
export const getStudyPhases = async () => {
  try {
    console.log('Fetching study phases from:', `${LOOKUP_API_PATH}/phases`);
    const response = await ApiService.get(`${LOOKUP_API_PATH}/phases`);
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Found', response.data.length, 'study phases');
      return response.data.map(phase => ({
        id: phase.id,
        value: phase.code,
        label: phase.name,
        description: phase.description,
        category: phase.phaseCategory,
        typicalPatientCountMin: phase.typicalPatientCountMin,
        typicalPatientCountMax: phase.typicalPatientCountMax,
        typicalDurationMonths: phase.typicalDurationMonths,
        requiresInd: phase.requiresInd,
        requiresIde: phase.requiresIde
      }));
    }
    
    // Fallback to hardcoded values if lookup fails
    return [
      { id: 1, value: 'PRECLINICAL', label: 'Preclinical', description: 'Laboratory and animal studies' },
      { id: 2, value: 'PHASE_I', label: 'Phase I', description: 'First-in-human studies focusing on safety' },
      { id: 3, value: 'PHASE_II', label: 'Phase II', description: 'Studies focusing on efficacy' },
      { id: 4, value: 'PHASE_III', label: 'Phase III', description: 'Large-scale studies to confirm efficacy' },
      { id: 5, value: 'PHASE_IV', label: 'Phase IV', description: 'Post-marketing surveillance studies' },
      { id: 6, value: 'PILOT', label: 'Pilot Study', description: 'Small-scale preliminary studies' },
      { id: 7, value: 'FEASIBILITY', label: 'Feasibility Study', description: 'Early studies to assess feasibility' }
    ];
  } catch (error) {
    console.error('Error fetching study phases:', error);
    // Return fallback data
    return [
      { id: 1, value: 'PRECLINICAL', label: 'Preclinical', description: 'Laboratory and animal studies' },
      { id: 2, value: 'PHASE_I', label: 'Phase I', description: 'First-in-human studies focusing on safety' },
      { id: 3, value: 'PHASE_II', label: 'Phase II', description: 'Studies focusing on efficacy' },
      { id: 4, value: 'PHASE_III', label: 'Phase III', description: 'Large-scale studies to confirm efficacy' },
      { id: 5, value: 'PHASE_IV', label: 'Phase IV', description: 'Post-marketing surveillance studies' },
      { id: 6, value: 'PILOT', label: 'Pilot Study', description: 'Small-scale preliminary studies' },
      { id: 7, value: 'FEASIBILITY', label: 'Feasibility Study', description: 'Early studies to assess feasibility' }
    ];
  }
};

/**
 * Get study phases by category
 * @param {string} category Phase category (PRECLINICAL, EARLY_PHASE, EFFICACY, REGISTRATION, POST_MARKET)
 * @returns {Promise<Array>} Promise that resolves to an array of study phases for the category
 */
export const getStudyPhasesByCategory = async (category) => {
  try {
    const allPhases = await getStudyPhases();
    return allPhases.filter(phase => phase.category === category);
  } catch (error) {
    console.error('Error fetching study phases by category:', error);
    return [];
  }
};

/**
 * Get lookup data for all study creation dropdowns
 * @returns {Promise<Object>} Promise that resolves to an object with all lookup data
 */
export const getStudyLookupData = async () => {
  try {
    console.log('Fetching all study lookup data...');
    
    const [statuses, regulatoryStatuses, phases] = await Promise.all([
      getStudyStatuses(),
      getRegulatoryStatuses(),
      getStudyPhases()
    ]);
    
    const lookupData = {
      studyStatuses: statuses,
      regulatoryStatuses: regulatoryStatuses,
      studyPhases: phases
    };
    
    console.log('Successfully loaded all lookup data:', {
      studyStatuses: statuses.length,
      regulatoryStatuses: regulatoryStatuses.length,
      studyPhases: phases.length
    });
    
    return lookupData;
  } catch (error) {
    console.error('Error fetching study lookup data:', error);
    throw error;
  }
};

/**
 * Debug method to test backend connectivity and data format
 * Can be called from browser console: StudyService.debugBackendConnection()
 */
export const debugBackendConnection = async () => {
  console.log('=== DEBUG BACKEND CONNECTION ===');
  
  try {
    console.log('Testing direct API call to:', API_PATH);
    const response = await ApiService.get(API_PATH);
    
    console.log('✅ Backend connection successful');
    console.log('Response status:', response?.status);
    console.log('Response data type:', typeof response?.data);
    console.log('Response data:', response?.data);
    
    if (Array.isArray(response?.data)) {
      console.log(`Found ${response.data.length} studies`);
      
      if (response.data.length > 0) {
        console.log('First study sample:', response.data[0]);
        console.log('First study name field:', response.data[0]?.name);
        
        // Test direct field access
        const testStudy = response.data[0];
        console.log('Direct field test:');
        console.log('- id:', testStudy?.id);
        console.log('- name:', testStudy?.name);
        console.log('- name type:', typeof testStudy?.name);
        console.log('- name length:', testStudy?.name?.length);
        console.log('- description:', testStudy?.description);
        console.log('- sponsor:', testStudy?.sponsor);
      } else {
        console.log('❌ Database appears to be empty - no studies found');
        console.log('You may need to:');
        console.log('1. Load sample data from SQL scripts');
        console.log('2. Create a study through the creation wizard');
        console.log('3. Manually insert data into the database');
      }
    } else {
      console.log('❌ Backend returned non-array data');
    }
    
    return response?.data;
    
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.error('Error details:', error);
    
    if (error.response) {
      console.log('HTTP Status:', error.response.status);
      console.log('HTTP Status Text:', error.response.statusText);
      console.log('Response Headers:', error.response.headers);
      console.log('Response Data:', error.response.data);
    }
    
    return null;
  }
};

/**
 * Get dashboard metrics from backend
 * @returns {Promise<Object>} Promise that resolves to dashboard metrics data
 */
export const getDashboardMetrics = async () => {
  try {
    console.log('Fetching dashboard metrics from:', `${API_PATH}/dashboard/metrics`);
    const response = await ApiService.get(`${API_PATH}/dashboard/metrics`);
    
    if (response?.data) {
      console.log('Dashboard metrics received:', response.data);
      return response.data;
    }
    
    // Fallback to default metrics if no data
    return getFallbackMetrics();
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return getFallbackMetrics();
  }
};

/**
 * Get fallback metrics for when backend is unavailable
 * @returns {Object} Fallback dashboard metrics
 */
const getFallbackMetrics = () => {
  return {
    activeStudies: 0,
    draftProtocols: 0,
    completedStudies: 0,
    totalAmendments: 0,
    studiesByStatus: {},
    studiesByPhase: {},
    lastUpdated: new Date().toISOString(),
    error: true,
    message: 'Unable to load current metrics. Please try again.'
  };
};

// Export all functions as a service object
const StudyService = {
  getStudies,
  getStudyById,
  registerStudy,
  updateStudy,
  deleteStudy,
  getStudyStatuses,
  getRegulatoryStatuses,
  getStudyPhases,
  getStudyPhasesByCategory,
  getStudyLookupData,
  getDashboardMetrics,
  debugBackendConnection
};

export default StudyService;

// Make debug method available globally for browser console testing
if (typeof window !== 'undefined') {
  window.StudyServiceDebug = {
    debugBackendConnection,
    testGetStudies: getStudies
  };
}