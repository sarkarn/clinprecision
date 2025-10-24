/**
 * Core Type Definitions for ClinPrecision EDC
 * 
 * This file provides base types used across the application.
 * As we migrate from JavaScript to TypeScript, these types will
 * be expanded and refined.
 */

// ============================================================================
// Common/Shared Types
// ============================================================================

export type EntityStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'ARCHIVED' 
  | 'UNDER_REVIEW'
  | 'REJECTED';

export type StudyPhase = 
  | 'PHASE_I' 
  | 'PHASE_II' 
  | 'PHASE_III' 
  | 'PHASE_IV';

export interface AuditMetadata {
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface BaseEntity extends AuditMetadata {
  id?: number;
  uuid?: string;
  version?: number;
}

// ============================================================================
// Study Types
// ============================================================================

export interface Study extends BaseEntity {
  name?: string;
  title?: string;
  protocolNumber?: string;
  phase?: StudyPhase;
  status?: EntityStatus;
  description?: string;
  sponsorId?: number;
  sponsorName?: string;
  therapeuticArea?: string;
  indication?: string;
  startDate?: string;
  endDate?: string;
  estimatedEnrollment?: number;
  actualEnrollment?: number;
  organizationId?: number;
  // Legacy compatibility
  protocolNo?: string;
}

export interface StudyListResponse {
  content?: Study[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

// ============================================================================
// Protocol Types
// ============================================================================

export interface ProtocolVersion extends BaseEntity {
  studyId?: number;
  versionNumber?: string;
  status?: EntityStatus;
  effectiveDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  changeDescription?: string;
  approvedBy?: string;
  approvalDate?: string;
}

// ============================================================================
// Site Types
// ============================================================================

export interface Site extends BaseEntity {
  siteNumber?: string;
  siteName?: string;
  name?: string;  // Legacy compatibility
  status?: EntityStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  principalInvestigator?: string;
  contactPhone?: string;
  contactEmail?: string;
  activationDate?: string;
  capacity?: number;
}

export interface SiteStudyAssociation {
  studyId?: number;
  siteId?: number;
  site?: Site;
  status?: EntityStatus;
  activationDate?: string;
  enrollmentCapacity?: number;
}

// ============================================================================
// Patient/Subject Types
// ============================================================================

export type PatientStatus = 
  | 'SCREENING' 
  | 'ENROLLED' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'WITHDRAWN' 
  | 'DISCONTINUED'
  | 'SCREEN_FAILED';

export interface Patient extends BaseEntity {
  patientId?: string;
  subjectId?: string;
  studyId?: number;
  siteId?: number;
  status?: PatientStatus;
  screeningNumber?: string;
  enrollmentDate?: string;
  dateOfBirth?: string;
  gender?: string;
  race?: string;
  ethnicity?: string;
  consentDate?: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  completionDate?: string;
}

// ============================================================================
// Visit Types
// ============================================================================

export type VisitType = 
  | 'SCREENING' 
  | 'ENROLLMENT' 
  | 'SCHEDULED' 
  | 'UNSCHEDULED' 
  | 'ADVERSE_EVENT'
  | 'DISCONTINUATION'
  | 'EARLY_TERMINATION'
  | 'FOLLOW_UP';

export interface Visit extends BaseEntity {
  visitId?: string;
  patientId?: number;
  studyId?: number;
  siteId?: number;
  visitType?: VisitType;
  visitName?: string;
  visitNumber?: number;
  scheduledDate?: string;
  actualDate?: string;
  visitDate?: string; // Legacy compatibility
  status?: EntityStatus;
  windowStart?: string;
  windowEnd?: string;
  notes?: string;
}

// ============================================================================
// Form/CRF Types
// ============================================================================

export type FormStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'VERIFIED' 
  | 'LOCKED';

export interface FormField {
  id?: number;
  name?: string;
  label?: string;
  fieldType?: string;
  dataType?: string;
  required?: boolean;
  codeListId?: number;
  validationRules?: Record<string, any>;
  cdiscVariable?: string;
  order?: number;
}

export interface Form extends BaseEntity {
  formId?: number;
  studyId?: number;
  formName?: string;
  formTitle?: string;
  formType?: string;
  version?: number;
  status?: EntityStatus;
  fields?: FormField[];
  cdiscDomain?: string;
}

export interface FormInstance {
  instanceId?: number;
  formId?: number;
  patientId?: number;
  visitId?: number;
  status?: FormStatus;
  enteredBy?: string;
  entryDate?: string;
  verifiedBy?: string;
  verificationDate?: string;
  lockedBy?: string;
  lockDate?: string;
  data?: Record<string, any>;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization extends BaseEntity {
  organizationId?: number;
  name?: string;
  type?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: EntityStatus;
}

// ============================================================================
// Design Types
// ============================================================================

export interface StudyDesignProgress {
  studyId?: number;
  phase?: string;
  status?: string;
  completionPercentage?: number;
  lastModifiedDate?: string;
}

export interface DesignPhase {
  id?: string;
  name?: string;
  description?: string;
  status?: EntityStatus;
  order?: number;
  requiredFields?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseQueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export interface UseMutationResult<T, V = any> {
  mutate: (variables: V) => Promise<T>;
  mutateAsync: (variables: V) => Promise<T>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: Error | null;
  data?: T;
}
