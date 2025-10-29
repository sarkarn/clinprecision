/**
 * Protocol and Database Build Type Definitions
 * Types for protocol version management and database build operations
 */

import type { BaseEntity, EntityStatus } from './common.types ';
import type { ProtocolVersionStatus, AmendmentType } from './codeList.types';

// ============================================================================
// Protocol Version Enums
// ============================================================================



// ============================================================================
// Protocol Version Types
// ============================================================================

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
 * Protocol version entity
 */
export interface ProtocolVersion extends BaseEntity {
  studyId: number;
  versionNumber: string;
  version?: string;
  status: ProtocolVersionStatus | EntityStatus | string;
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
  createdAt?: string;
  updatedDate?: string;
  updatedAt?: string;
  updatedBy?: string | number;
  documentUrl?: string;
  comments?: string;
  metadata?: Record<string, any>;
  changeDescription?: string;
  approvalDate?: string;
}

/**
 * Protocol version creation data
 */
export interface ProtocolVersionCreateData {
  studyId: string | number;
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

