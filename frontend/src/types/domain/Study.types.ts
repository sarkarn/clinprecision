import type { EntityStatus, StudyPhase, BaseEntity,
     ValidationError, ValidationWarning, ExportFormat } from '../common.types';

import type { Visit } from './Visit.types';




export enum StudyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}


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

export interface StudyListResponse {
  content?: Study[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}


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
export interface StudyStatusChangeRequest {
  status: EntityStatus;
  reason?: string;
}


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


