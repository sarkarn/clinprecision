/**
 * Quality Management Domain Types
 * Type definitions for protocol deviations, validation rules, and quality control
 * 
 * Features:
 * - Protocol deviation tracking and management
 * - Deviation severity and status lifecycle
 * - Form validation engine with rules
 * - Data quality checks and cross-field validation
 * - Reporting requirements (sponsor, IRB)
 * 
 * @see ProtocolDeviationService.ts
 * @see ValidationEngine.ts
 */

// ==================== Enums ====================

/**
 * Protocol deviation types
 */
export enum DeviationType {
  VISIT_WINDOW = 'VISIT_WINDOW',
  INCLUSION_EXCLUSION = 'INCLUSION_EXCLUSION',
  PROTOCOL_PROCEDURE = 'PROTOCOL_PROCEDURE',
  MEDICATION = 'MEDICATION',
  INFORMED_CONSENT = 'INFORMED_CONSENT',
  DATA_MANAGEMENT = 'DATA_MANAGEMENT',
  STUDY_CONDUCT = 'STUDY_CONDUCT',
  SAFETY = 'SAFETY',
  OTHER = 'OTHER',
}

/**
 * Deviation severity levels
 */
export enum DeviationSeverity {
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
}

/**
 * Deviation status lifecycle
 */
export enum DeviationStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Validation error severity
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Data quality action types
 */
export enum DataQualityAction {
  WARNING = 'warning',
  ERROR = 'error',
  QUERY = 'query',
  BLOCK = 'block',
}

// ==================== Protocol Deviation Entities ====================

/**
 * Protocol deviation entity
 */
export interface ProtocolDeviation {
  /** Deviation ID */
  id: number;
  
  /** Patient database ID */
  patientId: number;
  
  /** Study-site relationship ID */
  studySiteId: number;
  
  /** Visit ID (if deviation tied to visit) */
  visitId?: number | null;
  
  /** Deviation type */
  deviationType: DeviationType;
  
  /** Severity level */
  severity: DeviationSeverity;
  
  /** Current status */
  status: DeviationStatus;
  
  /** Brief title */
  title: string;
  
  /** Detailed description */
  description: string;
  
  /** Protocol section reference */
  protocolSection?: string;
  
  /** What should have happened */
  expectedProcedure?: string;
  
  /** What actually happened */
  actualProcedure?: string;
  
  /** Root cause analysis */
  rootCause?: string;
  
  /** Immediate corrective action */
  immediateAction?: string;
  
  /** Long-term corrective action */
  correctiveAction?: string;
  
  /** Requires sponsor/IRB reporting */
  requiresReporting: boolean;
  
  /** Reported to sponsor timestamp */
  reportedToSponsorAt?: string | null;
  
  /** Reported to IRB timestamp */
  reportedToIrbAt?: string | null;
  
  /** User who reported */
  reportedBy: string;
  
  /** Deviation occurrence date */
  deviationDate: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Resolution date */
  resolvedAt?: string | null;
  
  /** User who resolved */
  resolvedBy?: string;
  
  /** Closure date */
  closedAt?: string | null;
  
  /** User who closed */
  closedBy?: string;
}

/**
 * Extended protocol deviation with additional context
 */
export interface ProtocolDeviationWithDetails extends ProtocolDeviation {
  /** Patient identifier (for display) */
  patientIdentifier?: string;
  
  /** Study name */
  studyName?: string;
  
  /** Site name */
  siteName?: string;
  
  /** Visit name (if applicable) */
  visitName?: string;
  
  /** Number of comments */
  commentCount?: number;
  
  /** Days since deviation occurred */
  daysSinceDeviation?: number;
  
  /** Days since last update */
  daysSinceUpdate?: number;
  
  /** Whether deviation is overdue for review */
  isOverdue?: boolean;
}

/**
 * Deviation comment
 */
export interface DeviationComment {
  /** Comment ID */
  id: number;
  
  /** Deviation ID */
  deviationId: number;
  
  /** Comment text */
  comment: string;
  
  /** User who commented */
  commentedBy: string;
  
  /** Commenter name (for display) */
  commenterName?: string;
  
  /** Comment timestamp */
  commentedAt: string;
  
  /** Whether this is a system comment */
  isSystemComment?: boolean;
  
  /** Related status change (if applicable) */
  relatedStatusChange?: DeviationStatus;
}

// ==================== Request/Response DTOs ====================

/**
 * Create protocol deviation request
 */
export interface CreateProtocolDeviationRequest {
  /** Patient database ID (required) */
  patientId: number;
  
  /** Study-site relationship ID (required) */
  studySiteId: number;
  
  /** Visit ID (optional) */
  visitId?: number | null;
  
  /** Deviation type (required) */
  deviationType: DeviationType;
  
  /** Severity (required) */
  severity: DeviationSeverity;
  
  /** Title (required) */
  title: string;
  
  /** Description (required) */
  description: string;
  
  /** Protocol section (optional) */
  protocolSection?: string;
  
  /** Expected procedure (optional) */
  expectedProcedure?: string;
  
  /** Actual procedure (optional) */
  actualProcedure?: string;
  
  /** Root cause (optional) */
  rootCause?: string;
  
  /** Immediate action (optional) */
  immediateAction?: string;
  
  /** Corrective action (optional) */
  correctiveAction?: string;
  
  /** Requires reporting (optional, defaults to false) */
  requiresReporting?: boolean;
  
  /** Reported by (required) */
  reportedBy: string;
  
  /** Deviation date (optional, defaults to today) */
  deviationDate?: string;
}

/**
 * Update deviation status request
 */
export interface UpdateDeviationStatusRequest {
  /** New status (required) */
  newStatus: DeviationStatus;
  
  /** User making update (required) */
  updatedBy: string;
  
  /** Notes about status change (optional) */
  notes?: string;
}

/**
 * Add deviation comment request
 */
export interface AddDeviationCommentRequest {
  /** Comment text (required) */
  comment: string;
  
  /** User adding comment (required) */
  commentedBy: string;
}

/**
 * Mark reported request
 */
export interface MarkReportedRequest {
  /** User making the update (required) */
  updatedBy: string;
  
  /** Reporting date (optional, defaults to now) */
  reportedDate?: string;
}

/**
 * Protocol deviation response
 */
export interface ProtocolDeviationResponse {
  /** Deviation data */
  deviation: ProtocolDeviation;
  
  /** Success flag */
  success: boolean;
  
  /** Message */
  message?: string;
}

/**
 * Protocol deviations list response
 */
export interface ProtocolDeviationsResponse {
  /** Array of deviations */
  deviations: ProtocolDeviation[];
  
  /** Total count */
  totalCount: number;
  
  /** Success flag */
  success: boolean;
}

/**
 * Deviation comment response
 */
export interface DeviationCommentResponse {
  /** Comment data */
  comment: DeviationComment;
  
  /** Success flag */
  success: boolean;
  
  /** Message */
  message?: string;
}

/**
 * Deviation comments list response
 */
export interface DeviationCommentsResponse {
  /** Array of comments */
  comments: DeviationComment[];
  
  /** Total count */
  totalCount: number;
  
  /** Success flag */
  success: boolean;
}

// ==================== Filter Options ====================

/**
 * Protocol deviation filter options
 */
export interface ProtocolDeviationFilterOptions {
  /** Study ID */
  studyId?: number;
  
  /** Patient ID */
  patientId?: number;
  
  /** Study site ID */
  studySiteId?: number;
  
  /** Visit ID */
  visitId?: number;
  
  /** Deviation type */
  type?: DeviationType;
  
  /** Severity */
  severity?: DeviationSeverity;
  
  /** Status */
  status?: DeviationStatus;
  
  /** Requires reporting */
  requiresReporting?: boolean;
  
  /** Start date (from) */
  startDate?: string;
  
  /** End date (to) */
  endDate?: string;
  
  /** Reported by user */
  reportedBy?: string;
  
  /** Active only (not closed) */
  activeOnly?: boolean;
  
  /** Unreported only */
  unreportedOnly?: boolean;
  
  /** Critical only */
  criticalOnly?: boolean;
}

/**
 * Protocol deviation sort options
 */
export interface ProtocolDeviationSortOptions {
  /** Sort field */
  sortBy?: 'deviationDate' | 'severity' | 'status' | 'createdAt' | 'updatedAt';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

// ==================== Validation Engine Types ====================

/**
 * Validation error
 */
export interface ValidationError {
  /** Field identifier */
  field: string;
  
  /** Error type */
  type: string;
  
  /** Error message */
  message: string;
  
  /** Severity level */
  severity?: ValidationSeverity;
  
  /** Rule ID that triggered error */
  ruleId: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Field identifier */
  field: string;
  
  /** Warning type */
  type: string;
  
  /** Warning message */
  message: string;
  
  /** Severity level */
  severity: ValidationSeverity;
  
  /** Rule ID that triggered warning */
  ruleId: string;
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  /** Whether field is valid */
  valid: boolean;
  
  /** Validation errors */
  errors: ValidationError[];
  
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  /** Whether entire form is valid */
  valid: boolean;
  
  /** All validation errors */
  errors: ValidationError[];
  
  /** All validation warnings */
  warnings: ValidationWarning[];
  
  /** Errors by field */
  fieldErrors: Record<string, ValidationError[]>;
  
  /** Warnings by field */
  fieldWarnings: Record<string, ValidationWarning[]>;
}

/**
 * Validation rule
 */
export interface ValidationRule {
  /** Rule ID */
  ruleId: string;
  
  /** Rule type */
  ruleType: string;
  
  /** Rule expression (JavaScript) */
  expression: string;
  
  /** Error message */
  errorMessage: string;
  
  /** Severity */
  severity: ValidationSeverity;
  
  /** Whether rule is enabled */
  enabled?: boolean;
}

/**
 * Conditional validation rule
 */
export interface ConditionalValidationRule {
  /** Condition expression */
  condition: string;
  
  /** Rules to apply if condition is met */
  rules: {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

/**
 * Cross-field validation rule
 */
export interface CrossFieldValidationRule {
  /** Rule ID */
  ruleId: string;
  
  /** Validation expression */
  expression: string;
  
  /** Error message */
  message: string;
  
  /** Severity */
  severity: ValidationSeverity;
  
  /** Related fields */
  relatedFields?: string[];
}

/**
 * Range check configuration
 */
export interface RangeCheck {
  /** Check ID */
  checkId: string;
  
  /** Check type (normal, soft, hard) */
  type: 'normal' | 'soft' | 'hard';
  
  /** Minimum value */
  min?: number;
  
  /** Maximum value */
  max?: number;
  
  /** Action to take */
  action: DataQualityAction;
  
  /** Check message */
  message: string;
}

/**
 * Field metadata validation config
 */
export interface FieldValidationMetadata {
  /** Whether field is required */
  required?: boolean;
  
  /** Data type */
  type?: 'string' | 'integer' | 'decimal' | 'date' | 'datetime' | 'email' | 'phone' | 'url';
  
  /** Minimum length (strings) */
  minLength?: number;
  
  /** Maximum length (strings) */
  maxLength?: number;
  
  /** Minimum value (numbers) */
  minValue?: number;
  
  /** Maximum value (numbers) */
  maxValue?: number;
  
  /** Decimal places (numbers) */
  decimalPlaces?: number;
  
  /** Allow negative numbers */
  allowNegative?: boolean;
  
  /** Regex pattern */
  pattern?: string;
  
  /** Pattern description */
  patternDescription?: string;
  
  /** Minimum date */
  minDate?: string;
  
  /** Maximum date */
  maxDate?: string;
  
  /** Allow future dates */
  allowFutureDates?: boolean;
  
  /** Warn if date is today */
  warnIfToday?: boolean;
  
  /** Custom validation rules */
  customRules?: ValidationRule[];
  
  /** Conditional validation */
  conditionalValidation?: ConditionalValidationRule[];
}

/**
 * Data quality metadata
 */
export interface DataQualityMetadata {
  /** Range checks */
  rangeChecks?: RangeCheck[];
  
  /** Cross-field validation */
  crossFieldValidation?: CrossFieldValidationRule[];
  
  /** Data quality queries */
  autoQueries?: Array<{
    queryId: string;
    condition: string;
    message: string;
  }>;
}

/**
 * Complete field metadata
 */
export interface FieldMetadata {
  /** Field ID */
  id: string;
  
  /** Field label */
  label?: string;
  
  /** Validation configuration */
  validation?: FieldValidationMetadata;
  
  /** Data quality configuration */
  dataQuality?: DataQualityMetadata;
}

/**
 * Form definition for validation
 */
export interface FormDefinition {
  /** Form ID */
  id: string;
  
  /** Form name */
  name: string;
  
  /** Form version */
  version?: string;
  
  /** Form fields */
  fields: FieldMetadata[];
  
  /** Form-level validation rules */
  formValidation?: ValidationRule[];
}

// ==================== Utility Types ====================

/**
 * Deviation type option
 */
export interface DeviationTypeOption {
  /** Enum value */
  value: DeviationType;
  
  /** Display label */
  label: string;
}

/**
 * Severity level option
 */
export interface SeverityLevelOption {
  /** Enum value */
  value: DeviationSeverity;
  
  /** Display label */
  label: string;
}

/**
 * Status option
 */
export interface StatusOption {
  /** Enum value */
  value: DeviationStatus;
  
  /** Display label */
  label: string;
}

/**
 * Deviation summary statistics
 */
export interface DeviationSummaryStatistics {
  /** Total deviations */
  total: number;
  
  /** Open deviations */
  open: number;
  
  /** Under review */
  underReview: number;
  
  /** Resolved deviations */
  resolved: number;
  
  /** Closed deviations */
  closed: number;
  
  /** Critical deviations */
  critical: number;
  
  /** Major deviations */
  major: number;
  
  /** Minor deviations */
  minor: number;
  
  /** Unreported deviations */
  unreported: number;
  
  /** Deviations by type */
  byType: Record<DeviationType, number>;
}

/**
 * Patient deviation summary
 */
export interface PatientDeviationSummary {
  /** Patient ID */
  patientId: number;
  
  /** Patient identifier */
  patientIdentifier?: string;
  
  /** Total deviations */
  totalDeviations: number;
  
  /** Active deviations */
  activeDeviations: number;
  
  /** Critical deviations */
  criticalDeviations: number;
  
  /** Most recent deviation date */
  mostRecentDeviation?: string;
  
  /** Most common deviation type */
  mostCommonType?: DeviationType;
}
