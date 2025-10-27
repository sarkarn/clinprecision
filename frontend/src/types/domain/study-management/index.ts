
// Explicitly re-export overlapping types to resolve ambiguity
import type { BaseEntity, EntityStatus, StudyPhase } from '../common';


export type { StatusChangeRequest } from './StudyModern.types';
export type { ValidationError, ValidationWarning } from './StudyModern.types';
export * from './StudyOrganization.types';

// Export all other types from StudyModern.types except overlapping ones
export type {
	CodeListEndpoints,
	StudyFilters,
	StudySearchOptions,
	StudyAmendment,
	AmendmentCreateRequest,
	StudyDashboardData,
	StudyValidationStatus,
	ExportFormat,
	StudySearchResult,
	IStudyServiceModern
} from './StudyModern.types';




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
