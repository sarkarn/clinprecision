/**
 * Code list item (API response format)
 */



export enum PatientStatus {
  REGISTERED = 'REGISTERED',
  SCREENING = 'SCREENING',
  ENROLLED = 'ENROLLED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
  SCREEN_FAILED = 'SCREEN_FAILED'
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


