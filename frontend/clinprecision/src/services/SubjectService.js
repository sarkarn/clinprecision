// SubjectService.js
// Service functions for clinical trial subjects - integrates with backend PatientEnrollmentController
import ApiService from './ApiService';

const API_PATH = '/clinops-ws/api/v1/patients'; // Uses existing PatientEnrollmentController (merged from datacapture-ws)
const USE_MOCK_DATA = false; // Set to false to use real backend

// Mock data store (for fallback if backend is unavailable)
// NOTE: Arm fields removed for EDC blinding compliance
// See: EDC_BLINDING_ARCHITECTURE_DECISION.md
let subjects = [
  {
    id: '1',
    subjectId: 'SUBJ-001',
    studyId: '1',
    enrollmentDate: '2024-04-15',
    status: 'Active',
    visits: [
      {
        id: '1-1',
        visitId: '1-1-1',
        visitName: 'Screening Visit',
        visitDate: '2024-04-15',
        status: 'complete',
        timepoint: 0
      },
      {
        id: '1-2',
        visitId: '1-1-2',
        visitName: 'Baseline Visit',
        visitDate: '2024-04-22',
        status: 'incomplete',
        timepoint: 7
      }
    ]
  },
  {
    id: '2',
    subjectId: 'SUBJ-002',
    studyId: '1',
    enrollmentDate: '2024-04-16',
    status: 'Active',
    visits: [
      {
        id: '2-1',
        visitId: '1-2-1',
        visitName: 'Screening Visit',
        visitDate: '2024-04-16',
        status: 'complete',
        timepoint: 0
      }
    ]
  }
];

/**
 * Get subjects by study - integrates with backend PatientEnrollmentController
 * @param {string} studyId Study ID to filter subjects
 * @returns {Promise<Array>} Promise that resolves to array of subjects
 */
export const getSubjectsByStudy = async (studyId) => {
  if (USE_MOCK_DATA) {
    console.log('USE_MOCK_DATA flag is true, returning mock subjects');
    await new Promise(resolve => setTimeout(resolve, 500));
    return subjects.filter(subject => subject.studyId === studyId);
  }

  try {
    console.log('[SUBJECT SERVICE] Fetching subjects from backend for study:', studyId);
    console.log('[SUBJECT SERVICE] Requested study ID:', studyId, 'Type:', typeof studyId);
    
    // Use the dedicated /study/{studyId} endpoint for better performance
    const studyEndpoint = `${API_PATH}/study/${studyId}`;
    console.log('[SUBJECT SERVICE] Using endpoint:', studyEndpoint);
    
    const response = await ApiService.get(studyEndpoint);
    
    console.log('=== SUBJECT SERVICE BACKEND RESPONSE ===');
    console.log('Response status:', response?.status);
    console.log('Response data:', response?.data);
    console.log('Response data type:', typeof response?.data);
    console.log('Is response data an array?', Array.isArray(response?.data));
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Total patients from backend for study', studyId, ':', response.data.length);
      
      // Log each patient's studyId for debugging
      response.data.forEach((patient, index) => {
        console.log(`Patient ${index + 1}:`, {
          id: patient.id,
          patientNumber: patient.patientNumber,
          studyId: patient.studyId,
          studyIdType: typeof patient.studyId,
          status: patient.status,
          screeningNumber: patient.screeningNumber
        });
      });
      
      // Transform backend patient data to frontend subject format
      const transformedSubjects = response.data.map(patient => ({
        id: patient.id.toString(),
        subjectId: patient.screeningNumber || patient.patientNumber || `SUBJ-${patient.id}`,
        patientNumber: patient.patientNumber, // Keep auto-generated number separate
        studyId: patient.studyId?.toString() || null,
        // NOTE: Arm fields removed for EDC blinding compliance
        // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
        enrollmentDate: patient.enrollmentDate || patient.createdAt?.split('T')[0],
        status: mapPatientStatusToSubjectStatus(patient.status || 'Active'),
        firstName: patient.firstName,
        lastName: patient.lastName,
        aggregateUuid: patient.aggregateUuid,
        siteId: patient.siteId,
        visits: [] // Will be populated separately if needed
      }));
      
      console.log('Transformed subjects for study', studyId, ':', transformedSubjects);
      return transformedSubjects;
    }
    
    console.log('No subjects found or invalid response format');
    return [];
    
  } catch (error) {
    console.error('Error fetching subjects from backend:', error);
    console.log('Falling back to mock data due to error');
    
    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return subjects.filter(subject => subject.studyId === studyId);
  }
};

/**
 * Get subject by ID - uses backend PatientEnrollmentController
 * @param {string} subjectId Subject ID
 * @returns {Promise<Object>} Promise that resolves to subject details
 */
export const getSubjectById = async (subjectId) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }
    return { ...subject };
  }

  try {
    console.log('Fetching subject by ID:', subjectId, 'from:', `${API_PATH}/${subjectId}`);
    const response = await ApiService.get(`${API_PATH}/${subjectId}`);
    
    if (response?.data) {
      const patient = response.data;
      
      // Transform backend patient data to frontend subject format
      const transformedSubject = {
        id: patient.id.toString(),
        subjectId: patient.screeningNumber || patient.patientNumber || `SUBJ-${patient.id}`,
        patientNumber: patient.patientNumber, // Keep auto-generated number separate
        studyId: patient.studyId?.toString(),
        studyName: patient.studyName,
        // NOTE: Arm fields removed for EDC blinding compliance
        // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
        enrollmentDate: patient.enrollmentDate || patient.createdAt?.split('T')[0],
        status: mapPatientStatusToSubjectStatus(patient.status || 'Active'),
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phoneNumber,
        phoneNumber: patient.phoneNumber,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        aggregateUuid: patient.aggregateUuid,
        siteId: patient.siteId,
        visits: [], // Will be populated separately if needed
        createdAt: patient.createdAt,
        lastModifiedAt: patient.updatedAt
      };
      
      console.log('Transformed subject details:', transformedSubject);
      return transformedSubject;
    }
    
    throw new Error('Subject not found');
    
  } catch (error) {
    console.error('Error fetching subject by ID:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Subject not found');
    }
    
    // Fallback to mock data
    console.log('Falling back to mock data');
    await new Promise(resolve => setTimeout(resolve, 500));
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }
    return { ...subject };
  }
};

/**
 * Enroll a new subject - uses backend PatientEnrollmentController
 * @param {Object} subjectData Subject enrollment data
 * @returns {Promise<Object>} Promise that resolves to enrolled subject
 */
export const enrollSubject = async (subjectData) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newId = (subjects.length + 1).toString();
    const newSubject = {
      id: newId,
      ...subjectData,
      visits: []
    };
    
    subjects.push(newSubject);
    return { ...newSubject };
  }

  try {
    console.log('Enrolling subject with data:', subjectData);

    // Step 1: Register patient (if not already registered). Backend requires registration fields.
    const patientRegistrationData = {
      firstName: subjectData.firstName || 'Subject',
      lastName: subjectData.lastName || subjectData.subjectId || `Patient-${Date.now()}`,
      email: subjectData.email || `${subjectData.subjectId}@clinprecision.local`,
      phoneNumber: subjectData.phone || '+1-000-000-0000',
      // Minimal valid DOB/Gender placeholders if UI doesn't collect yet
      dateOfBirth: subjectData.dateOfBirth || '1990-01-01',
      gender: subjectData.gender || 'OTHER'
    };

    console.log('Registering patient with payload:', patientRegistrationData);
    const registerResp = await ApiService.post(API_PATH, patientRegistrationData);

    if (!registerResp?.data || !registerResp.data.id) {
      throw new Error('Patient registration failed');
    }

    const patient = registerResp.data;
    const patientId = patient.id;

    // Step 2: Enroll patient into study at a site (persist siteId)
    const enrollmentPayload = {
      studyId: parseInt(subjectData.studyId),
      // siteId here represents site_studies.id (the study-site association)
      siteId: parseInt(subjectData.siteId),
      screeningNumber: subjectData.subjectId,
      enrollmentDate: subjectData.enrollmentDate
    };
    console.log('Calling enroll endpoint with:', enrollmentPayload);
    const enrollResp = await ApiService.post(`${API_PATH}/${patientId}/enroll`, enrollmentPayload);

    if (!enrollResp?.data) {
      throw new Error('Enrollment failed');
    }

    const enrollment = enrollResp.data;

    // Compose frontend subject result
    const enrolledSubject = {
      id: patientId.toString(),
      subjectId: subjectData.subjectId,
      studyId: subjectData.studyId?.toString(),
      // NOTE: Arm fields removed for EDC blinding compliance
      // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
      // Randomization handled by external IWRS/RTSM system
      siteId: subjectData.siteId?.toString(),
      enrollmentDate: subjectData.enrollmentDate,
      status: 'Enrolled',
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phoneNumber,
      aggregateUuid: patient.aggregateUuid,
      enrollmentRecordId: enrollment.id,
      visits: []
    };

    console.log('Subject enrolled successfully:', enrolledSubject);
    return enrolledSubject;

  } catch (error) {
    console.error('Error enrolling subject:', error);
    
    if (error.response?.data?.message) {
      throw new Error(`Enrollment failed: ${error.response.data.message}`);
    }
    
    throw new Error(`Failed to enroll subject: ${error.message}`);
  }
};

/**
 * Update subject status
 * @param {string} subjectId Subject ID
 * @param {string} status New status
 * @returns {Promise<Object>} Promise that resolves to updated subject
 */
export const updateSubjectStatus = async (subjectId, status) => {
  // Note: Backend PatientEnrollmentController doesn't have update endpoint yet
  // This would require extending the backend controller
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
      throw new Error('Subject not found');
    }
    
    subjects[subjectIndex].status = status;
    return { ...subjects[subjectIndex] };
  }

  // For now, return the subject with updated status (would need backend implementation)
  try {
    const subject = await getSubjectById(subjectId);
    subject.status = status;
    console.log('Subject status updated (client-side only):', subject);
    return subject;
  } catch (error) {
    console.error('Error updating subject status:', error);
    throw error;
  }
};

/**
 * Search subjects by name
 * @param {string} searchTerm Search term
 * @returns {Promise<Array>} Promise that resolves to matching subjects
 */
export const searchSubjects = async (searchTerm) => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return subjects.filter(subject => 
      subject.subjectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.firstName && subject.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subject.lastName && subject.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  try {
    console.log('Searching subjects with term:', searchTerm);
    const response = await ApiService.get(`${API_PATH}/search?name=${encodeURIComponent(searchTerm)}`);
    
    if (response?.data && Array.isArray(response.data)) {
      // Transform backend patient data to frontend subject format
      const transformedSubjects = response.data.map(patient => ({
        id: patient.id.toString(),
        subjectId: patient.screeningNumber || patient.patientNumber || `SUBJ-${patient.id}`,
        patientNumber: patient.patientNumber, // Keep auto-generated number separate
        studyId: patient.studyId?.toString(),
        // NOTE: Arm fields removed for EDC blinding compliance
        // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
        enrollmentDate: patient.enrollmentDate || patient.createdAt?.split('T')[0],
        status: mapPatientStatusToSubjectStatus(patient.status || 'Active'),
        firstName: patient.firstName,
        lastName: patient.lastName,
        aggregateUuid: patient.aggregateUuid
      }));
      
      console.log('Found subjects matching search term:', transformedSubjects);
      return transformedSubjects;
    }
    
    return [];
    
  } catch (error) {
    console.error('Error searching subjects:', error);
    // Fallback to mock data search
    await new Promise(resolve => setTimeout(resolve, 500));
    return subjects.filter(subject => 
      subject.subjectId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

/**
 * Map backend patient status to frontend subject status
 * Follows the patient lifecycle: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
 * @param {string} patientStatus Backend patient status (enum value)
 * @returns {string} Frontend subject status (display value)
 */
const mapPatientStatusToSubjectStatus = (patientStatus) => {
  const statusMap = {
    'REGISTERED': 'Registered',       // Patient registered, not yet screening
    'SCREENING': 'Screening',         // Patient undergoing eligibility screening
    'ENROLLED': 'Enrolled',           // Patient enrolled in study
    'ACTIVE': 'Active',               // Patient actively participating
    'COMPLETED': 'Completed',         // Patient completed study
    'WITHDRAWN': 'Withdrawn',         // Patient withdrawn
    'SCREEN_FAILED': 'Screen Failed'  // Patient failed screening
  };
  
  return statusMap[patientStatus] || patientStatus || 'Registered';
};

/**
 * Get subject count for dashboard/statistics
 * @returns {Promise<number>} Promise that resolves to subject count
 */
export const getSubjectCount = async () => {
  try {
    console.log('Getting subject count from backend');
    const response = await ApiService.get(`${API_PATH}/count`);
    
    if (response?.data !== undefined) {
      console.log('Subject count from backend:', response.data);
      return response.data;
    }
    
    // Fallback: get all subjects and count
    const allSubjects = await ApiService.get(API_PATH);
    const count = allSubjects?.data?.length || 0;
    console.log('Subject count calculated from full list:', count);
    return count;
    
  } catch (error) {
    console.error('Error getting subject count:', error);
    return 0;
  }
};

/**
 * Get status history for a patient
 * Returns complete audit trail of all status changes
 * 
 * @param {number|string} patientId - The patient/subject ID
 * @returns {Promise<Array>} Promise that resolves to array of status history records
 */
export const getStatusHistory = async (patientId) => {
  try {
    console.log('Getting status history for patient:', patientId);
    const response = await ApiService.get(`${API_PATH}/${patientId}/status/history`);
    
    if (response?.data) {
      console.log('Status history retrieved:', response.data.length, 'records');
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting status history:', error);
    throw error;
  }
};

// Export service functions
const SubjectService = {
  getSubjectsByStudy,
  getSubjectById,
  getStatusHistory,
  enrollSubject,
  updateSubjectStatus,
  searchSubjects,
  getSubjectCount
};

export default SubjectService;
