// src/types/study/StudyModern.types.ts

/**
 * Modern Study Service Types
 * Supports CodeList integration and reference data endpoints
 */

import type { BaseEntity, EntityStatus, ExportFormat, ValidationError, ValidationWarning} from './common.types ';

import type { Visit} from './visit.types';



export interface Study extends BaseEntity {
  name?: string;
  title?: string;
  protocolNumber?: string;
  phase?: StudyPhase;
  status?: EntityStatus;
  description?: string;
  sponsorId?: number;
  sponsorName?: string;
  sponsor?: string; // Alternative sponsor field
  therapeuticArea?: string;
  indication?: string;
  startDate?: string;
  endDate?: string;
  plannedStartDate?: string; // Planned start date (can be different from actual)
  plannedEndDate?: string; // Planned end date (can be different from actual)
  estimatedEnrollment?: number;
  actualEnrollment?: number;
  organizationId?: number;
  principalInvestigator?: string; // PI for the study
  arms?: StudyArm[]; // Study arms with visits
  // Legacy compatibility
  protocolNo?: string;
}

// Study Arm definition for Study.arms
export interface StudyArm {
  id?: string | number;
  name: string;
  description?: string;
  visits?: Visit[];
}

/**
 * Study update data
 */
export interface StudyUpdateData {
  studyId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

/**
 * Version update data
 */
export interface VersionUpdateData {
  studyId: string;
  versionId: string;
  action: 'created' | 'updated' | 'activated' | 'deleted';
  timestamp: string;
}

/**
 * Computation complete data
 */
export interface ComputationCompleteData {
  studyId: string;
  computationType: string;
  result: any;
  duration: number;
  timestamp: string;
}

/**
 * Validation result data
 */
export interface ValidationResultData {
  studyId: string;
  validationId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

export interface StudyListResponse {
  content?: Study[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

/**
 * Code List endpoints for study reference data
 */
export interface CodeListEndpoints {
  REGULATORY_STATUS: string;
  STUDY_PHASE: string;
  STUDY_STATUS: string;
  AMENDMENT_TYPE: string;
  VISIT_TYPE: string;
}


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

export type StudyPhase = 
  | 'PHASE_I' 
  | 'PHASE_II' 
  | 'PHASE_III' 
  | 'PHASE_IV';

/**
 * Study filter parameters
 */
export interface StudyFilters {
  status?: EntityStatus;
  phase?: StudyPhase;
  sponsorId?: number;
  organizationId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

/**
 * Study search options
 */
export interface StudySearchOptions {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Study status change request
 */
export interface StatusChangeRequest {
  status: EntityStatus;
  reason?: string;
}

/**
 * Study amendment data
 */
export interface StudyAmendment {
  id?: number;
  studyId: number;
  amendmentType?: string;
  versionNumber?: string;
  description?: string;
  effectiveDate?: string;
  submittedBy?: number;
  approvedBy?: number;
  approvalDate?: string;
  status?: EntityStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Amendment creation request
 */
export interface AmendmentCreateRequest {
  amendmentType: string;
  versionNumber?: string;
  description: string;
  effectiveDate?: string;
}

/**
 * Study dashboard data
 */
export interface StudyDashboardData {
  totalStudies?: number;
  activeStudies?: number;
  completedStudies?: number;
  plannedStudies?: number;
  totalEnrollment?: number;
  studiesByPhase?: Record<StudyPhase, number>;
  studiesByStatus?: Record<EntityStatus, number>;
  recentStudies?: Study[];
}

/**
 * Study validation status
 */
export interface StudyValidationStatus {
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  lastValidated?: string;
}

/**
 * Study search result
 */
export interface StudySearchResult {
  studies: Study[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

/**
 * Modern Study Service interface
 */
export interface IStudyServiceModern {
  getStudies: (filters?: StudyFilters) => Promise<Study[]>;
  getStudyById: (id: number) => Promise<Study>;
  createStudy: (studyData: Study) => Promise<Study>;
  updateStudy: (id: number, studyData: Study) => Promise<Study>;
  deleteStudy: (id: number) => Promise<void>;
  changeStudyStatus: (id: number, status: EntityStatus, reason?: string) => Promise<Study>;
  getStudyAmendments: (studyId: number) => Promise<StudyAmendment[]>;
  createStudyAmendment: (studyId: number, amendmentData: AmendmentCreateRequest) => Promise<StudyAmendment>;
  getStudyDashboardData: (studyId?: number) => Promise<StudyDashboardData>;
  getStudyValidation: (studyId: number) => Promise<StudyValidationStatus>;
  exportStudy: (studyId: number, format?: ExportFormat) => Promise<Blob>;
  searchStudies: (query: string, options?: StudySearchOptions) => Promise<Study[]>;
  getCodeListApiUrl: (category?: string) => string;
  getStudyLookupData: () => Promise<any>; // Deprecated
}
