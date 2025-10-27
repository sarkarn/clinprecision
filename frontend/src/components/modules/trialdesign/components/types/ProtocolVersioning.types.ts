/**
 * Protocol Versioning Types
 * Types for protocol version management in trial design
 */

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

/**
 * Status information for protocol versions
 */
export interface ProtocolVersionStatusInfo {
  value: string;
  label: string;
  description: string;
  color: string;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canActivate: boolean;
}

/**
 * Amendment type information
 */
export interface AmendmentTypeInfo {
  value: string;
  label: string;
  description: string;
}

/**
 * Protocol version model
 */
export interface ProtocolVersion {
  id: string | number;
  studyId: string;
  versionNumber: string;
  version?: string; // Legacy field
  status: ProtocolVersionStatus | string;
  statusInfo?: ProtocolVersionStatusInfo;
  amendmentType?: AmendmentType | string;
  title?: string;
  description?: string;
  effectiveDate?: string;
  expiryDate?: string;
  approvedDate?: string;
  approvedBy?: string | number;
  submittedDate?: string;
  submittedBy?: string | number;
  createdDate?: string;
  createdAt?: string;
  createdBy?: string | number;
  updatedDate?: string;
  updatedAt?: string;
  updatedBy?: string | number;
  documentUrl?: string;
  comments?: string;
  metadata?: Record<string, any>;
}

/**
 * Protocol version creation data
 */
export interface ProtocolVersionCreateData {
  studyId: string;
  versionNumber: string;
  amendmentType: AmendmentType | string;
  title?: string;
  description?: string;
  effectiveDate?: string;
  documentUrl?: string;
}

/**
 * Protocol version update data
 */
export interface ProtocolVersionUpdateData {
  versionNumber?: string;
  title?: string;
  description?: string;
  effectiveDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  comments?: string;
}

/**
 * Status configuration map
 */
export type ProtocolVersionStatusConfig = {
  [key in ProtocolVersionStatus]: ProtocolVersionStatusInfo;
};

/**
 * Amendment type configuration map
 */
export type AmendmentTypeConfig = {
  [key in AmendmentType]: AmendmentTypeInfo;
};
