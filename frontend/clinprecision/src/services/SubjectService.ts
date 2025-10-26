// SubjectService.ts
// Service functions for clinical trial subjects - integrates with backend PatientEnrollmentController

import ApiService from './ApiService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Backend patient status enum values
 */
export type PatientStatus = 
  | 'REGISTERED'    // Patient registered, not yet screening
  | 'SCREENING'     // Patient undergoing eligibility screening
  | 'ENROLLED'      // Patient enrolled in study
  | 'ACTIVE'        // Patient actively participating
  | 'COMPLETED'     // Patient completed study
  | 'WITHDRAWN'     // Patient withdrawn
  | 'SCREEN_FAILED'; // Patient failed screening

/**
 * Frontend subject status display values
 */
export type SubjectStatus = 
  | 'Registered'
  | 'Screening'
  | 'Enrolled'
  | 'Active'
  | 'Completed'
  | 'Withdrawn'
  | 'Screen Failed';

/**
 * Subject visit entity (subset of visit data)
 */
export interface SubjectVisit {
  id: string;
  visitId: string;
  visitName: string;
  visitDate: string;
  status: 'complete' | 'incomplete' | 'missed';
  timepoint: number;
}

/**
 * Subject/Patient entity (frontend format)
 * 
 * NOTE: Arm fields removed for EDC blinding compliance
 * See: EDC_BLINDING_ARCHITECTURE_DECISION.md
 */
export interface Subject {
  id: string;
  subjectId: string;           // Screening number or display ID
  patientNumber?: string;       // Auto-generated patient number
  studyId: string | null;
  studyName?: string;
  siteId?: string;
  enrollmentDate?: string;
  status: SubjectStatus;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  aggregateUuid?: string;
  visits?: SubjectVisit[];
  enrollmentRecordId?: number;
  createdAt?: string;
  lastModifiedAt?: string;
}

/**
 * Backend patient entity (from PatientEnrollmentController)
 */
export interface Patient {
  id: number;
  patientNumber?: string;
  screeningNumber?: string;
  studyId?: number;
  studyName?: string;
  siteId?: number;
  status?: PatientStatus;
  enrollmentDate?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  aggregateUuid?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data required to enroll a new subject
 */
export interface SubjectEnrollmentData {
  subjectId: string;          // Screening number
  studyId: string;
  siteId: string;             // site_studies.id (study-site association)
  enrollmentDate: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

/**
 * Patient status history record
 */
export interface PatientStatusHistory {
  id: number;
  patientId: number;
  oldStatus: PatientStatus;
  newStatus: PatientStatus;
  changeDate: string;
  changedBy?: string;
  reason?: string;
  notes?: string;
}

// ============================================================================
// API BASE PATH & CONFIGURATION
// ============================================================================

const API_PATH = '/clinops-ws/api/v1/patients'; // Uses existing PatientEnrollmentController (merged from datacapture-ws)
const USE_MOCK_DATA = false; // Set to false to use real backend

// ============================================================================
// MOCK DATA (For fallback if backend is unavailable)
// ============================================================================

// NOTE: Arm fields removed for EDC blinding compliance
// See: EDC_BLINDING_ARCHITECTURE_DECISION.md
const mockSubjects: Subject[] = [
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map backend patient status to frontend subject status
 * Follows the patient lifecycle: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
 * 
 * @param patientStatus - Backend patient status (enum value)
 * @returns Frontend subject status (display value)
 */
export const mapPatientStatusToSubjectStatus = (patientStatus?: PatientStatus | string): SubjectStatus => {
  const statusMap: Record<PatientStatus, SubjectStatus> = {
    'REGISTERED': 'Registered',       // Patient registered, not yet screening
    'SCREENING': 'Screening',         // Patient undergoing eligibility screening
    'ENROLLED': 'Enrolled',           // Patient enrolled in study
    'ACTIVE': 'Active',               // Patient actively participating
    'COMPLETED': 'Completed',         // Patient completed study
    'WITHDRAWN': 'Withdrawn',         // Patient withdrawn
    'SCREEN_FAILED': 'Screen Failed'  // Patient failed screening
  };
  
  return statusMap[patientStatus as PatientStatus] || (patientStatus as SubjectStatus) || 'Registered';
};

/**
 * Transform backend patient data to frontend subject format
 * 
 * @param patient - Backend patient entity
 * @returns Frontend subject entity
 */
export const transformPatientToSubject = (patient: Patient): Subject => {
  return {
    id: patient.id.toString(),
    subjectId: patient.screeningNumber || patient.patientNumber || `SUBJ-${patient.id}`,
    patientNumber: patient.patientNumber,
    studyId: patient.studyId?.toString() || null,
    studyName: patient.studyName,
    siteId: patient.siteId?.toString(),
    // NOTE: Arm fields removed for EDC blinding compliance
    // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
    enrollmentDate: patient.enrollmentDate || patient.createdAt?.split('T')[0],
    status: mapPatientStatusToSubjectStatus(patient.status),
    firstName: patient.firstName,
    middleName: patient.middleName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phoneNumber,
    phoneNumber: patient.phoneNumber,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    aggregateUuid: patient.aggregateUuid,
    visits: [], // Will be populated separately if needed
    createdAt: patient.createdAt,
    lastModifiedAt: patient.updatedAt
  };
};

// ============================================================================
// API FUNCTIONS (Functional Exports)
// ============================================================================

/**
 * Get subjects by study - integrates with backend PatientEnrollmentController
 * 
 * @param studyId - Study ID to filter subjects
 * @returns Promise that resolves to array of subjects
 * 
 * @example
 * const subjects = await fetchSubjectsByStudy('123');
 */
export const fetchSubjectsByStudy = async (studyId: string | number): Promise<Subject[]> => {
  if (USE_MOCK_DATA) {
    console.log('USE_MOCK_DATA flag is true, returning mock subjects');
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSubjects.filter(subject => subject.studyId === String(studyId));
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
      response.data.forEach((patient: Patient, index: number) => {
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
      const transformedSubjects = response.data.map((patient: Patient) => transformPatientToSubject(patient));
      
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
    return mockSubjects.filter(subject => subject.studyId === studyId);
  }
};

/**
 * Get subject by ID - uses backend PatientEnrollmentController
 * 
 * @param subjectId - Subject ID
 * @returns Promise that resolves to subject details
 * 
 * @example
 * const subject = await fetchSubjectById('123');
 */
export const fetchSubjectById = async (subjectId: string): Promise<Subject> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const subject = mockSubjects.find(s => s.id === subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }
    return { ...subject };
  }

  try {
    console.log('Fetching subject by ID:', subjectId, 'from:', `${API_PATH}/${subjectId}`);
    const response = await ApiService.get(`${API_PATH}/${subjectId}`);
    
    if (response?.data) {
      const patient: Patient = response.data;
      const transformedSubject = transformPatientToSubject(patient);
      
      console.log('Transformed subject details:', transformedSubject);
      return transformedSubject;
    }
    
    throw new Error('Subject not found');
    
  } catch (error: any) {
    console.error('Error fetching subject by ID:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Subject not found');
    }
    
    // Fallback to mock data
    console.log('Falling back to mock data');
    await new Promise(resolve => setTimeout(resolve, 500));
    const subject = mockSubjects.find(s => s.id === subjectId);
    if (!subject) {
      throw new Error('Subject not found');
    }
    return { ...subject };
  }
};

/**
 * Enroll a new subject - uses backend PatientEnrollmentController
 * 
 * @param subjectData - Subject enrollment data
 * @returns Promise that resolves to enrolled subject
 * 
 * @example
 * const enrolled = await enrollSubject({
 *   subjectId: 'SUBJ-001',
 *   studyId: '123',
 *   siteId: '456',
 *   enrollmentDate: '2024-01-15',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 */
export const enrollSubject = async (subjectData: SubjectEnrollmentData): Promise<Subject> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newId = (mockSubjects.length + 1).toString();
    const newSubject: Subject = {
      id: newId,
      subjectId: subjectData.subjectId,
      studyId: subjectData.studyId,
      siteId: subjectData.siteId,
      enrollmentDate: subjectData.enrollmentDate,
      firstName: subjectData.firstName,
      lastName: subjectData.lastName,
      email: subjectData.email,
      phone: subjectData.phone,
      dateOfBirth: subjectData.dateOfBirth,
      gender: subjectData.gender,
      status: 'Enrolled',
      visits: []
    };
    
    mockSubjects.push(newSubject);
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

    const patient: Patient = registerResp.data;
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
    const enrolledSubject: Subject = {
      id: patientId.toString(),
      subjectId: subjectData.subjectId,
      studyId: subjectData.studyId,
      // NOTE: Arm fields removed for EDC blinding compliance
      // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
      // Randomization handled by external IWRS/RTSM system
      siteId: subjectData.siteId,
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

  } catch (error: any) {
    console.error('Error enrolling subject:', error);
    
    if (error.response?.data?.message) {
      throw new Error(`Enrollment failed: ${error.response.data.message}`);
    }
    
    throw new Error(`Failed to enroll subject: ${error.message}`);
  }
};

/**
 * Update subject status
 * 
 * @param subjectId - Subject ID
 * @param status - New status
 * @returns Promise that resolves to updated subject
 * 
 * @example
 * const updated = await updateSubjectStatus('123', 'Active');
 * 
 * @note Backend PatientEnrollmentController doesn't have update endpoint yet
 * This would require extending the backend controller
 */
export const updateSubjectStatus = async (subjectId: string, status: SubjectStatus): Promise<Subject> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subjectIndex = mockSubjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) {
      throw new Error('Subject not found');
    }
    
    mockSubjects[subjectIndex].status = status;
    return { ...mockSubjects[subjectIndex] };
  }

  // For now, return the subject with updated status (would need backend implementation)
  try {
    const subject = await fetchSubjectById(subjectId);
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
 * 
 * @param searchTerm - Search term
 * @returns Promise that resolves to matching subjects
 * 
 * @example
 * const results = await searchSubjects('john');
 */
export const searchSubjects = async (searchTerm: string): Promise<Subject[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSubjects.filter(subject => 
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
      const transformedSubjects = response.data.map((patient: Patient) => transformPatientToSubject(patient));
      
      console.log('Found subjects matching search term:', transformedSubjects);
      return transformedSubjects;
    }
    
    return [];
    
  } catch (error) {
    console.error('Error searching subjects:', error);
    // Fallback to mock data search
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSubjects.filter(subject => 
      subject.subjectId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

/**
 * Get subject count for dashboard/statistics
 * 
 * @returns Promise that resolves to subject count
 * 
 * @example
 * const count = await fetchSubjectCount();
 */
export const fetchSubjectCount = async (): Promise<number> => {
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
 * @param patientId - The patient/subject ID
 * @returns Promise that resolves to array of status history records
 * 
 * @example
 * const history = await fetchStatusHistory('123');
 */
export const fetchStatusHistory = async (patientId: string): Promise<PatientStatusHistory[]> => {
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

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * React Query hook to fetch subjects by study
 * 
 * @param studyId - Study ID
 * 
 * @example
 * const { data: subjects, isLoading } = useSubjectsByStudy('123');
 */
export const useSubjectsByStudy = (studyId: string) => {
  return useQuery({
    queryKey: ['study', studyId, 'subjects'],
    queryFn: () => fetchSubjectsByStudy(studyId),
    enabled: !!studyId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to fetch subject by ID
 * 
 * @param subjectId - Subject ID
 * 
 * @example
 * const { data: subject, isLoading } = useSubject('123');
 */
export const useSubject = (subjectId: string) => {
  return useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => fetchSubjectById(subjectId),
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to enroll a new subject
 * 
 * @example
 * const enrollMutation = useEnrollSubject();
 * await enrollMutation.mutateAsync({
 *   subjectId: 'SUBJ-001',
 *   studyId: '123',
 *   siteId: '456',
 *   enrollmentDate: '2024-01-15'
 * });
 */
export const useEnrollSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollSubject,
    onSuccess: (data) => {
      // Invalidate subjects list for this study
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', data.studyId, 'subjects'] });
      }
      // Set the newly enrolled subject in cache
      queryClient.setQueryData(['subject', data.id], data);
    }
  });
};

/**
 * React Query hook to update subject status
 * 
 * @example
 * const updateMutation = useUpdateSubjectStatus();
 * await updateMutation.mutateAsync({ subjectId: '123', status: 'Active' });
 */
export const useUpdateSubjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, status }: { subjectId: string; status: SubjectStatus }) => 
      updateSubjectStatus(subjectId, status),
    onSuccess: (data, variables) => {
      // Update subject in cache
      queryClient.setQueryData(['subject', variables.subjectId], data);
      // Invalidate subjects list for this study
      if (data.studyId) {
        queryClient.invalidateQueries({ queryKey: ['study', data.studyId, 'subjects'] });
      }
    }
  });
};

/**
 * React Query hook to search subjects
 * 
 * @param searchTerm - Search term
 * 
 * @example
 * const { data: results, isLoading } = useSearchSubjects('john');
 */
export const useSearchSubjects = (searchTerm: string) => {
  return useQuery({
    queryKey: ['subjects', 'search', searchTerm],
    queryFn: () => searchSubjects(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2, // Only search if term is at least 2 characters
    staleTime: 2 * 60 * 1000 // 2 minutes (shorter than regular queries since search results change more)
  });
};

/**
 * React Query hook to fetch subject count
 * 
 * @example
 * const { data: count, isLoading } = useSubjectCount();
 */
export const useSubjectCount = () => {
  return useQuery({
    queryKey: ['subjects', 'count'],
    queryFn: fetchSubjectCount,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * React Query hook to fetch patient status history
 * 
 * @param patientId - Patient/subject ID
 * 
 * @example
 * const { data: history, isLoading } = useStatusHistory('123');
 */
export const useStatusHistory = (patientId: string) => {
  return useQuery({
    queryKey: ['patient', patientId, 'status-history'],
    queryFn: () => fetchStatusHistory(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// ============================================================================
// LEGACY EXPORTS (For Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use named exports and React Query hooks instead
 * This export maintains backward compatibility with existing code
 */
const SubjectService = {
  getSubjectsByStudy: fetchSubjectsByStudy,
  getSubjectById: fetchSubjectById,
  getStatusHistory: fetchStatusHistory,
  enrollSubject,
  updateSubjectStatus,
  searchSubjects,
  getSubjectCount: fetchSubjectCount
};

export default SubjectService;

// Named exports for direct function access
export const getSubjectsByStudy = fetchSubjectsByStudy;
export const getSubjectById = fetchSubjectById;
export const getStatusHistory = fetchStatusHistory;
