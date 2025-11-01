export type EntityStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'UNDER_REVIEW'
  | 'REJECTED';

export interface AuditMetadata {
  createdBy?: number;
  createdDate?: string;
  modifiedBy?: number;
  modifiedDate?: string;
}

export interface BaseEntity extends AuditMetadata {
  id?: number;
  uuid?: string;
  version?: string;
}

// Options for validators to toggle consistency checks
export interface ValidationOptions {
  checkDataIntegrity?: boolean;
  validateSchemaStructure?: boolean;
  checkBusinessRules?: boolean;
  strictMode?: boolean;
}

// Result object returned by builder validation routines
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  severity: 'ERROR' | 'CRITICAL';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  fax?: string;
}

export type StatusBadgeVariant = 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'violet';

export type ExportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';
