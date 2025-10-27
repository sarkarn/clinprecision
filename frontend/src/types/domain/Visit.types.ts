import type { BaseEntity, EntityStatus} from '../common.types';
import type {CRF} from './Form.types'

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
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