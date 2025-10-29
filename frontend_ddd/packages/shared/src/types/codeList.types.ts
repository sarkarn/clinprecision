/**
 * Code list item (API response format)
 */

export interface CodeListEndpoints {
  REGULATORY_STATUS: string;
  STUDY_PHASE: string;
  STUDY_STATUS: string;
  AMENDMENT_TYPE: string;
  VISIT_TYPE: string;
}

export interface CodeListItem {
  code?: string;
  value?: string;
  id?: string;
  displayName?: string;
  name?: string;
  label?: string;
  description?: string;
  displayOrder?: number;
  order?: number;
  [key: string]: any;
}

export enum PatientStatus {
  REGISTERED = 'REGISTERED',
  SCREENING = 'SCREENING',
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  SCREEN_FAILED = 'SCREEN_FAILED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum FormDataStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  LOCKED = 'LOCKED',
  NOT_STARTED = 'not_started',
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED'
}


/**
 * Form status
 */
export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  APPROVED = 'APPROVED',
  RETIRED = 'RETIRED',
  ARCHIVED = 'ARCHIVED',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED'
}

/**
 * Protocol version status enumeration
 */
export enum ProtocolVersionStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AMENDMENT_REVIEW = 'AMENDMENT_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUPERSEDED = 'SUPERSEDED',
  WITHDRAWN = 'WITHDRAWN'
}

/**
 * Amendment type enumeration
 */
export enum AmendmentType {
  INITIAL = 'INITIAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  SAFETY = 'SAFETY',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}
