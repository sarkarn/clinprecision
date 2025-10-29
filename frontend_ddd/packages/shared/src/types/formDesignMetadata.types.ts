/**
 * Form Field Metadata Type Definitions
 * Comprehensive metadata structures for clinical data capture fields
 * Supports CDASH, SDTM, medical coding, regulatory compliance, and data quality
 */

// ============================================================================
// Core Metadata Structure
// ============================================================================

/**
 * Complete field metadata structure
 */
export interface FieldMetadata {
  validation?: ValidationConfig;
  ui?: UIConfig;
  clinical?: ClinicalFlags;
  cdash?: CdashMapping;
  sdtm?: SdtmMapping;
  coding?: MedicalCoding;
  dataQuality?: DataQualityRules;
  regulatory?: RegulatoryMetadata;
  audit?: AuditConfig;
  dataEntry?: DataEntryConfig;
  export?: ExportConfig;
  query?: QueryConfig;
  description?: string;
  implementationNotes?: string;
  dataSource?: 'CRF' | 'eCOA' | 'ePRO' | 'Lab' | 'Device' | 'EHR' | 'Other';
  captureMethod?: 'manual' | 'automated' | 'imported' | 'derived';
}

// ============================================================================
// Validation Configuration
// ============================================================================

/**
 * Validation configuration
 */
export interface ValidationConfig {
  required?: boolean;
  type?: 'string' | 'integer' | 'decimal' | 'date' | 'datetime' | 'time' | 'email' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  patternDescription?: string;
  decimalPlaces?: number;
  allowNegative?: boolean;
  customRules?: CustomValidationRule[];
  conditionalValidation?: ConditionalValidation[];
}

/**
 * Custom validation rule
 */
export interface CustomValidationRule {
  ruleId: string;
  ruleType?: 'range' | 'consistency' | 'format' | 'business';
  expression: string;
  errorMessage: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Conditional validation
 */
export interface ConditionalValidation {
  condition: string;
  rules: Partial<ValidationConfig>;
}

// ============================================================================
// UI Configuration
// ============================================================================

/**
 * UI configuration
 */
export interface UIConfig {
  placeholder?: string;
  helpText?: string;
  units?: string;
  unitsPosition?: 'prefix' | 'suffix';
  options?: FieldOption[];
  checkboxLabel?: string;
  defaultValue?: any;
  readOnly?: boolean;
  hidden?: boolean;
  conditionalDisplay?: ConditionalDisplay;
}

/**
 * Field option for dropdowns/radios
 */
export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  order?: number;
  codingValue?: string;
  codingSystem?: string;
}

/**
 * Conditional display configuration
 */
export interface ConditionalDisplay {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains';
  value: any;
}

// ============================================================================
// Clinical Significance
// ============================================================================

/**
 * Clinical significance flags
 */
export interface ClinicalFlags {
  sdvRequired?: boolean;
  medicalReviewRequired?: boolean;
  criticalDataPoint?: boolean;
  safetyDataPoint?: boolean;
  efficacyDataPoint?: boolean;
  dataReviewRequired?: boolean;
  medicallySignificant?: boolean;
  requiresMonitoring?: boolean;
  requiresSourceDocumentation?: boolean;
  allowableDeviationRange?: DeviationRange;
}

/**
 * Deviation range
 */
export interface DeviationRange {
  lowerBound?: number;
  upperBound?: number;
  units?: string;
}

// ============================================================================
// CDASH Mapping
// ============================================================================

/**
 * CDASH (Clinical Data Acquisition Standards Harmonization) mapping
 */
export interface CdashMapping {
  domain?: string;
  variable?: string;
  dataType?: 'Char' | 'Num' | 'Date' | 'Time';
  role?: 'Identifier' | 'Topic' | 'Timing' | 'Qualifier';
  coreStatus?: 'Required' | 'Expected' | 'Permissible';
  implementationNotes?: string;
  controlledTerminology?: string;
}

// ============================================================================
// SDTM Mapping
// ============================================================================

/**
 * SDTM (Study Data Tabulation Model) mapping
 */
export interface SdtmMapping {
  domain?: string;
  variable?: string;
  dataType?: 'Char' | 'Num' | 'ISO8601';
  role?: 'Identifier' | 'Topic' | 'Timing' | 'Grouping' | 'Qualifier';
  coreStatus?: 'Req' | 'Exp' | 'Perm';
  transformation?: 'Direct' | 'Derived' | 'Concatenated' | 'Split';
  transformationRule?: string;
  controlledTerminology?: string;
  codelist?: string;
}

// ============================================================================
// Medical Coding
// ============================================================================

/**
 * Medical coding configuration
 */
export interface MedicalCoding {
  dictionary?: 'MedDRA' | 'WHODrug' | 'ICD-10' | 'ICD-11' | 'SNOMED-CT';
  version?: string;
  level?: 'PT' | 'LLT' | 'HLT' | 'HLGT' | 'SOC';
  autoCode?: boolean;
  codeRequired?: boolean;
  allowMultipleCodes?: boolean;
  codingQuery?: CodingQuery;
}

/**
 * Coding query configuration
 */
export interface CodingQuery {
  autoGenerateQuery?: boolean;
  queryThreshold?: 'low' | 'medium' | 'high';
}

// ============================================================================
// Data Quality Rules
// ============================================================================

/**
 * Data quality rules
 */
export interface DataQualityRules {
  rangeChecks?: RangeCheck[];
  consistencyRules?: ConsistencyRule[];
  crossFieldValidation?: CrossFieldValidation[];
  duplicateCheck?: DuplicateCheck;
}

/**
 * Range check configuration
 */
export interface RangeCheck {
  checkId: string;
  type: 'normal' | 'expected' | 'possible' | 'critical';
  min?: number;
  max?: number;
  action: 'warning' | 'error' | 'query' | 'info';
  message?: string;
}

/**
 * Consistency rule
 */
export interface ConsistencyRule {
  ruleId: string;
  type: 'temporal' | 'logical' | 'anatomical';
  relatedFields?: string[];
  expression: string;
  message?: string;
}

/**
 * Cross-field validation
 */
export interface CrossFieldValidation {
  ruleId: string;
  relatedFields: string[];
  expression: string;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Duplicate check configuration
 */
export interface DuplicateCheck {
  enabled?: boolean;
  scope?: 'visit' | 'subject' | 'study';
  fields?: string[];
}

// ============================================================================
// Regulatory Compliance
// ============================================================================

/**
 * Regulatory compliance metadata
 */
export interface RegulatoryMetadata {
  fdaRequired?: boolean;
  emaRequired?: boolean;
  cfr21Part11?: boolean;
  gcpRequired?: boolean;
  hipaaProtected?: boolean;
  phiCategory?: 'identifier' | 'demographic' | 'dates' | 'contact' | 'financial' | 'health';
  deidentificationRequired?: boolean;
  retentionYears?: number;
  archivingRequired?: boolean;
}

// ============================================================================
// Audit Trail Configuration
// ============================================================================

/**
 * Audit trail configuration
 */
export interface AuditConfig {
  level?: 'NONE' | 'BASIC' | 'FULL';
  electronicSignatureRequired?: boolean;
  reasonForChangeRequired?: boolean;
  reasonForChangeOptions?: string[];
  trackVersionHistory?: boolean;
  changeNotification?: ChangeNotification;
}

/**
 * Change notification configuration
 */
export interface ChangeNotification {
  enabled?: boolean;
  recipients?: string[];
}

// ============================================================================
// Data Entry Configuration
// ============================================================================

/**
 * Data entry configuration
 */
export interface DataEntryConfig {
  isDerivedField?: boolean;
  derivationFormula?: string;
  derivationDependencies?: string[];
  isQueryEnabled?: boolean;
  isEditableAfterLock?: boolean;
  isEditableAfterFreeze?: boolean;
  requiresDoubleDataEntry?: boolean;
  requiresSourceDataVerification?: boolean;
  allowNA?: boolean;
  allowNotDone?: boolean;
  allowNotAsked?: boolean;
  allowUnknown?: boolean;
}

// ============================================================================
// Export Configuration
// ============================================================================

/**
 * Export configuration
 */
export interface ExportConfig {
  includeInExport?: boolean;
  exportFormat?: 'original' | 'formatted' | 'coded' | 'transformed';
  exportVariable?: string;
  exportTransformation?: string;
  includeInDataset?: string[];
  exportMapping?: Record<string, DatasetMapping>;
}

/**
 * Dataset mapping
 */
export interface DatasetMapping {
  domain?: string;
  dataset?: string;
  variable?: string;
}

// ============================================================================
// Query Management Configuration
// ============================================================================

/**
 * Query management configuration
 */
export interface QueryConfig {
  autoQueryEnabled?: boolean;
  autoQueryRules?: AutoQueryRule[];
  manualQueryEnabled?: boolean;
  queryWorkflow?: QueryWorkflow;
}

/**
 * Auto-query rule
 */
export interface AutoQueryRule {
  ruleId: string;
  condition: string;
  queryText: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Query workflow configuration
 */
export interface QueryWorkflow {
  requiresResponse?: boolean;
  allowClarification?: boolean;
  requiresClosureApproval?: boolean;
}

// ============================================================================
// Field Definition
// ============================================================================

/**
 * Complete field definition
 */
export interface FieldDefinition {
  id: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'time' | 'radio' | 'checkbox' | 'dropdown' | 'textarea';
  label: string;
  metadata: FieldMetadata;
}

// ============================================================================
// Validation Results
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  type: string;
  message: string;
  ruleId?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  type: string;
  message: string;
  ruleId?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fieldErrors: Record<string, ValidationError[]>;
  fieldWarnings: Record<string, ValidationWarning[]>;
}
