/**
 * Visit Details
 * Complete details of a visit including all associated forms
 */

import type { BaseEntity, EntityStatus} from './common.types ';
import type { VisitFormSummary} from './form.types';

export interface CRF {
  id?: string | number;
  name: string;
  type: string;
  description?: string;
}



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
  name?: string; // Visit name (alternative to visitName)
  visitNumber?: number;
  timepoint?: number; // Day/timepoint in study schedule
  scheduledDate?: string;
  actualDate?: string;
  visitDate?: string; // Legacy compatibility
  status?: EntityStatus;
  windowStart?: string;
  windowEnd?: string;
  notes?: string;
  description?: string; // Visit description
  crfs?: CRF[]; // CRFs associated with this visit
}


export interface VisitDetails {
  id: string | number;
  visitId?: number;
  subjectId: string | number;
  visitName: string;
  description: string;
  visitDate: string;
  status: string;
  timepoint: number;
  forms: VisitFormSummary[];
  scheduledDate?: string;
  actualDate?: string;
  visitType?: string;
}

/**
 * Visit Status Update Request
 * Data required to update visit status
 */
export interface VisitStatusUpdate {
  newStatus: string;
  updatedBy: string;
  notes?: string;
}