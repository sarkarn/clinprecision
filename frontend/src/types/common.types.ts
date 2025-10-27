export type EntityStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'ARCHIVED' 
  | 'UNDER_REVIEW'
  | 'REJECTED';

export type StudyPhase = 
  | 'PHASE_I' 
  | 'PHASE_II' 
  | 'PHASE_III' 
  | 'PHASE_IV';

export interface AuditMetadata {
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface BaseEntity extends AuditMetadata {
  id?: number;
  uuid?: string;
  version?: number;
}


/**
 * Validation options
 */
export interface ValidationOptions {
  checkDataIntegrity?: boolean;
  validateSchemaStructure?: boolean;
  checkBusinessRules?: boolean;
  strictMode?: boolean;
}


/**
 * Build validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
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
 * Address information
 */
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


/**
 * Export formats
 */
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';