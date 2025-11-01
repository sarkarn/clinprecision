/**
 * Patient Enrollment Service (TypeScript)
 * 
 * Handles patient registration, search, and enrollment operations
 * Provides React Query hooks for patient data management
 * 
 * @see Backend: PatientController.java
 * @see Types: Patient.types.ts
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import ApiService from '@packages/api/client/ApiService';
import type {
  Patient,
  PatientRegistrationData,
  PatientDisplay,
  PatientStatistics,
  PatientFilters,
  PatientValidationResult
} from '@shared/types/patient.types';
import { Gender } from '@shared/types/codeList.types';
import { PatientStatus } from '@shared/types/status.types';

const API_BASE = '/clinops-ws/api/v1/patients';

// ==================== API Functions ====================

/**
 * Register a new patient
 */
export async function registerPatient(patientData: PatientRegistrationData): Promise<Patient> {
  // Validate required fields
  const requiredFields: (keyof PatientRegistrationData)[] = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
  for (const field of requiredFields) {
    if (!patientData[field]) {
      const missingField = String(field);
      throw new Error(`Required field missing: ${missingField}`);
    }
  }

  // Validate contact info
  if (!patientData.phoneNumber && !patientData.email) {
    throw new Error('Either phone number or email must be provided');
  }

  console.log('[PATIENT_SERVICE] Registering patient:', patientData);
  
  const response = await ApiService.post(API_BASE, patientData);
  
  console.log('[PATIENT_SERVICE] Patient registration response:', response.data);
  return response.data;
}

/**
 * Get all patients
 */
export async function fetchAllPatients(): Promise<Patient[]> {
  console.log('[PATIENT_SERVICE] Fetching all patients');
  
  const response = await ApiService.get(API_BASE);
  
  console.log('[PATIENT_SERVICE] Found patients:', response.data.length);
  return response.data || [];
}

/**
 * Get a specific patient by ID
 */
export async function fetchPatientById(patientId: number): Promise<Patient> {
  console.log('[PATIENT_SERVICE] Fetching patient by ID:', patientId);
  
  const response = await ApiService.get(`${API_BASE}/${patientId}`);
  
  console.log('[PATIENT_SERVICE] Found patient:', response.data.id);
  return response.data;
}

/**
 * Get a specific patient by aggregate UUID
 */
export async function fetchPatientByUuid(aggregateUuid: string): Promise<Patient> {
  console.log('[PATIENT_SERVICE] Fetching patient by UUID:', aggregateUuid);
  
  const response = await ApiService.get(`${API_BASE}/uuid/${aggregateUuid}`);
  
  console.log('[PATIENT_SERVICE] Found patient by UUID:', response.data.id);
  return response.data;
}

/**
 * Search patients by name
 */
export async function searchPatientsByName(searchTerm: string): Promise<Patient[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    throw new Error('Search term is required');
  }

  console.log('[PATIENT_SERVICE] Searching patients by name:', searchTerm);
  
  const response = await ApiService.get(`${API_BASE}/search?name=${encodeURIComponent(searchTerm)}`);
  
  console.log('[PATIENT_SERVICE] Found matching patients:', response.data.length);
  return response.data || [];
}

/**
 * Get patient count for statistics
 */
export async function fetchPatientCount(): Promise<number> {
  console.log('[PATIENT_SERVICE] Fetching patient count');
  
  const response = await ApiService.get(`${API_BASE}/count`);
  
  console.log('[PATIENT_SERVICE] Patient count:', response.data);
  return response.data;
}

/**
 * Check service health
 */
export async function checkPatientServiceHealth(): Promise<any> {
  const response = await ApiService.get(`${API_BASE}/health`);
  return response.data;
}

// ==================== React Query Hooks ====================

/**
 * Hook: Fetch all patients
 */
export function useAllPatients(options?: Omit<UseQueryOptions<Patient[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<Patient[], Error>({
    queryKey: ['patients', 'all'],
    queryFn: fetchAllPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook: Fetch patient by ID
 */
export function usePatient(
  patientId: number | undefined,
  options?: Omit<UseQueryOptions<Patient, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<Patient, Error>({
    queryKey: ['patients', patientId],
    queryFn: () => fetchPatientById(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Fetch patient by UUID
 */
export function usePatientByUuid(
  aggregateUuid: string | undefined,
  options?: Omit<UseQueryOptions<Patient, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<Patient, Error>({
    queryKey: ['patients', 'uuid', aggregateUuid],
    queryFn: () => fetchPatientByUuid(aggregateUuid!),
    enabled: !!aggregateUuid,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Search patients by name
 */
export function usePatientSearch(
  searchTerm: string | undefined,
  options?: Omit<UseQueryOptions<Patient[], Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery<Patient[], Error>({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: () => searchPatientsByName(searchTerm!),
    enabled: !!searchTerm && searchTerm.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
}

/**
 * Hook: Get patient count
 */
export function usePatientCount(options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<number, Error>({
    queryKey: ['patients', 'count'],
    queryFn: fetchPatientCount,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Hook: Register patient mutation
 */
export function useRegisterPatient(
  options?: Omit<UseMutationOptions<Patient, Error, PatientRegistrationData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation<Patient, Error, PatientRegistrationData>({
    mutationFn: registerPatient,
    onSuccess: (patient) => {
      // Invalidate patient queries to refetch
      queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'count'] });
      queryClient.setQueryData(['patients', patient.id], patient);
      
      console.log('[PATIENT_SERVICE] Patient registered successfully:', patient.id);
    },
    ...options
  });
}

// ==================== Utility Functions ====================

/**
 * Calculate patient statistics from patient list
 */
export function calculatePatientStatistics(patients: Patient[]): PatientStatistics {
  console.log('[PATIENT_SERVICE] Calculating patient statistics');
  
  const stats: PatientStatistics = {
    totalPatients: patients.length,
    registeredPatients: patients.filter(p => p.status === PatientStatus.REGISTERED).length,
    screeningPatients: patients.filter(p => p.status === PatientStatus.SCREENING).length,
    enrolledPatients: patients.filter(p => p.status === PatientStatus.ENROLLED).length,
    withdrawnPatients: patients.filter(p => p.status === PatientStatus.WITHDRAWN).length,
    completedPatients: patients.filter(p => p.status === PatientStatus.COMPLETED).length,
    genderBreakdown: {
      male: patients.filter(p => p.gender === Gender.MALE).length,
      female: patients.filter(p => p.gender === Gender.FEMALE).length,
      other: patients.filter(p => p.gender === Gender.OTHER).length
    },
    ageGroups: {
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    }
  };

  // Calculate age groups
  patients.forEach(patient => {
    const age = patient.age || 0;
    if (age >= 18 && age <= 30) stats.ageGroups['18-30']++;
    else if (age >= 31 && age <= 50) stats.ageGroups['31-50']++;
    else if (age >= 51 && age <= 70) stats.ageGroups['51-70']++;
    else if (age > 70) stats.ageGroups['70+']++;
  });

  console.log('[PATIENT_SERVICE] Patient statistics calculated:', stats);
  return stats;
}

/**
 * Validate patient data before submission
 */
export function validatePatientData(patientData: Partial<PatientRegistrationData>): PatientValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!patientData.firstName || patientData.firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (patientData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!patientData.lastName || patientData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (patientData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!patientData.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    // Validate age (must be at least 18)
    const birthDate = new Date(patientData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.push('Patient must be at least 18 years old');
    }

    // Check if date is not in the future
    if (birthDate > today) {
      errors.push('Date of birth cannot be in the future');
    }
  }

  if (!patientData.gender) {
    errors.push('Gender is required');
  }

  // Contact information validation
  if (!patientData.phoneNumber && !patientData.email) {
    errors.push('Either phone number or email must be provided');
  }

  if (patientData.email && !isValidEmail(patientData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (patientData.phoneNumber && !isValidPhone(patientData.phoneNumber)) {
    errors.push('Please enter a valid phone number');
  }

  // Middle name validation (optional but if provided, must be valid)
  if (patientData.middleName && patientData.middleName.trim().length === 1) {
    errors.push('Middle name must be at least 2 characters long if provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format patient data for display
 */
export function formatPatientForDisplay(patient: Patient | null): PatientDisplay | null {
  if (!patient) return null;

  return {
    ...patient,
    displayName: `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`,
    displayGender: patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : 'Unknown',
    displayStatus: patient.status ? patient.status.charAt(0) + patient.status.slice(1).toLowerCase() : 'Unknown',
    displayAge: patient.age ? `${patient.age} years old` : 'Age unknown',
    displayDateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown',
    hasContactInfo: !!(patient.phoneNumber || patient.email)
  };
}

/**
 * Filter patients by various criteria
 */
export function filterPatients(patients: Patient[], filters: PatientFilters = {}): Patient[] {
  let filtered = [...patients];

  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }

  if (filters.gender) {
    filtered = filtered.filter(p => p.gender === filters.gender);
  }

  if (filters.minAge !== undefined) {
    filtered = filtered.filter(p => (p.age || 0) >= filters.minAge!);
  }

  if (filters.maxAge !== undefined) {
    filtered = filtered.filter(p => (p.age || 0) <= filters.maxAge!);
  }

  if (filters.name) {
    const searchTerm = filters.name.toLowerCase();
    filtered = filtered.filter(p => {
      const fullName = `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  }

  return filtered;
}

// ==================== Helper Functions ====================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{9,}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ==================== Legacy Compatibility ====================

/**
 * Legacy object export for backward compatibility
 * @deprecated Use named exports and hooks instead
 */
export const PatientEnrollmentService = {
  registerPatient,
  getAllPatients: fetchAllPatients,
  getPatientById: fetchPatientById,
  getPatientByUuid: fetchPatientByUuid,
  searchPatientsByName,
  getPatientCount: fetchPatientCount,
  getPatientStatistics: calculatePatientStatistics,
  validatePatientData,
  formatPatientForDisplay,
  filterPatients,
  checkHealth: checkPatientServiceHealth
};

export default PatientEnrollmentService;
