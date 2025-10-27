import type { BaseEntity} from '../common';

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