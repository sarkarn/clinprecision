// src/types/study/StudyModern.types.ts

/**
 * Modern Study Service Types
 * Supports CodeList integration and reference data endpoints
 */

import type { Study, StudyPhase, EntityStatus } from '../index';

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
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

/**
 * Export formats
 */
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';

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
