/**
 * Patient Domain Types
 * 
 * Type definitions for patient enrollment, demographics, and status management
 * Used across data capture and enrollment workflows
 */

/**
 * Patient Status Enum
 * Represents the lifecycle status of a patient in a clinical trial
 * 
 */

import type { BaseEntity} from '../common.types';

export interface Patient extends BaseEntity {
  id: number;
  aggregateUuid?: string;
  studyId?: number;
  siteId?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  status?: PatientStatus;
  screeningNumber?: string;
  enrollmentDate?: string;

  race?: string;
  ethnicity?: string;
  consentDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}


export enum PatientStatus {
  REGISTERED = 'REGISTERED',
  SCREENING = 'SCREENING',
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  SCREEN_FAILED = 'SCREEN_FAILED',
  DISCONTINUED = "DISCONTINUED",
  LOST_TO_FOLLOWUP = 'LOST_TO_FOLLOWUP',
}



/**
 * Patient Gender Enum
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

/**
 * Patient Demographics
 * Personal and demographic information
 */
export interface PatientDemographics {
  dateOfBirth: string;
  gender: Gender;
  ethnicity?: string;
  race?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * Patient Entity
 * Core patient data structure
 */

/**
 * Patient Registration Data
 * Data required to register a new patient
 */
export interface PatientRegistrationData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber?: string;
  email?: string;
}

/**
 * Patient Display Format
 * Formatted patient data for UI presentation
 */
export interface PatientDisplay extends Patient {
  displayName: string;
  displayGender: string;
  displayStatus: string;
  displayAge: string;
  displayDateOfBirth: string;
  hasContactInfo: boolean;
}

/**
 * Patient Statistics
 * Aggregate patient statistics and analytics
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

/**
 * Patient Filter Criteria
 * Filter options for patient search and filtering
 */
export interface PatientFilters {
  status?: PatientStatus;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  name?: string;
}

/**
 * Patient Validation Result
 * Result of patient data validation
 */
export interface PatientValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Status History Entry
 * Record of a patient status change
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
 * Status Change Request
 * Data required to change patient status
 */
export interface StatusChangeRequest {
  newStatus: PatientStatus;
  reason: string;
  changedBy: string;
  notes?: string;
  enrollmentId?: number;
}

/**
 * Patient Status Summary
 * Comprehensive status summary including history and analytics
 */
export interface PatientStatusSummary {
  patientId: number;
  currentStatus: PatientStatus;
  previousStatus?: string;
  totalStatusChanges: number;
  daysInCurrentStatus: number;
  statusHistory: StatusHistory[];
  lastChangedBy?: string;
  lastChangedAt?: string;
}

/**
 * Status Transition
 * Valid status transition definition
 */
export interface StatusTransition {
  from: PatientStatus;
  to: PatientStatus;
  allowed: boolean;
  requiresReason: boolean;
}

/**
 * Status Transition Summary (Analytics)
 * Aggregated transition statistics
 */
export interface StatusTransitionSummary {
  fromStatus: string;
  toStatus: string;
  count: number;
  averageDays: number;
}

/**
 * Status Lifecycle Info
 * Status metadata for lifecycle tracking
 */
export interface StatusLifecycleInfo {
  status: PatientStatus;
  displayName: string;
  order: number;
  description: string;
}

/**
 * Status Validation Result
 * Result of status change validation
 */
export interface StatusValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Status Badge Variant
 * UI badge color variant for status display
 */
export type StatusBadgeVariant = 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'violet';
