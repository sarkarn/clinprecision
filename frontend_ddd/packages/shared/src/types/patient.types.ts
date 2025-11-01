/**
 * Patient Type Definitions
 * Types for patient enrollment, demographics, and status management
 */

import type { BaseEntity } from './common.types';
import type { Gender} from './codeList.types';
import type { PatientStatus} from './status.types';

export interface Patient extends BaseEntity {
  patientId?: string | number;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | string;
  phoneNumber?: string;
  email?: string;
  status: PatientStatus | string;
  age?: number;
  studyId?: number;
  siteId?: number;
  screeningNumber?: string;
  enrollmentDate?: string;
  race?: string;
  ethnicity?: string;
  consentDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  completionDate?: string;
}


/**
 * Patient demographics
 */
export interface PatientDemographics {
  dateOfBirth: string;
  gender: Gender | string;
  ethnicity?: string;
  race?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * Patient registration data
 */
export interface PatientRegistrationData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | string;
  phoneNumber?: string;
  email?: string;
}

// ============================================================================
// Patient Display and UI
// ============================================================================

/**
 * Patient display format
 */
export interface PatientDisplay extends Patient {
  displayName: string;
  displayGender: string;
  displayStatus: string;
  displayAge: string;
  displayDateOfBirth: string;
  hasContactInfo: boolean;
}

// ============================================================================
// Patient Statistics and Analytics
// ============================================================================

/**
 * Patient statistics
 */
export interface PatientStatistics {
  totalPatients: number;
  registeredPatients: number;
  screeningPatients: number;
  enrolledPatients: number;
  withdrawnPatients: number;
  completedPatients: number;
  genderBreakdown: {
    male: number;
    female: number;
    other: number;
  };
  ageGroups: {
    '18-30': number;
    '31-50': number;
    '51-70': number;
    '70+': number;
  };
}

// ============================================================================
// Patient Filters and Search
// ============================================================================

/**
 * Patient filter criteria
 */
export interface PatientFilters {
  status?: PatientStatus | string;
  gender?: Gender | string;
  minAge?: number;
  maxAge?: number;
  name?: string;
  searchTerm?: string;
  studyId?: number;
  siteId?: number;
}

// ============================================================================
// Patient Validation
// ============================================================================

/**
 * Patient validation result
 */
export interface PatientValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Patient Status Management
// ============================================================================

/**
 * Status history entry
 */
export interface StatusHistory {
  id: number;
  patientId: number;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
  reason: string;
  notes?: string;
  enrollmentId?: number;
}

/**
 * Status change request
 */
export interface StatusChangeRequest {
  newStatus: PatientStatus | string;
  reason: string;
  changedBy: string;
  notes?: string;
  enrollmentId?: number;
}

/**
 * Patient status summary
 */
export interface PatientStatusSummary {
  patientId: number;
  currentStatus: PatientStatus | string;
  previousStatus?: string;
  totalStatusChanges: number;
  daysInCurrentStatus: number;
  statusHistory: StatusHistory[];
  lastChangedBy?: string;
  lastChangedAt?: string;
}

/**
 * Status transition
 */
export interface StatusTransition {
  from: PatientStatus | string;
  to: PatientStatus | string;
  allowed: boolean;
  requiresReason: boolean;
}

/**
 * Status transition summary
 */
export interface StatusTransitionSummary {
  fromStatus: string;
  toStatus: string;
  count: number;
  averageDays: number;
}

/**
 * Status lifecycle info
 */
export interface StatusLifecycleInfo {
  status: PatientStatus | string;
  displayName: string;
  order: number;
  description: string;
}

/**
 * Status validation result
 */
export interface StatusValidationResult {
  isValid: boolean;
  errors: string[];
}
