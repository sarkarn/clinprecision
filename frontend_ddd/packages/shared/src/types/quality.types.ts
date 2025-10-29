
// ============================================================================
// Protocol Deviation Enums
// ============================================================================

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

// ============================================================================
// Protocol Deviation Entities
// ============================================================================

/**
 * Protocol deviation entity
 */
export interface ProtocolDeviation {
  id: number;
  patientId: number;
  studySiteId: number;
  visitId?: number | null;
  deviationType: DeviationType | string;
  severity: DeviationSeverity | string;
  status: DeviationStatus | string;
  title: string;
  description: string;
  protocolSection?: string;
  expectedProcedure?: string;
  actualProcedure?: string;
  rootCause?: string;
  immediateAction?: string;
  correctiveAction?: string;
  requiresReporting: boolean;
  reportedToSponsorAt?: string | null;
  reportedToIrbAt?: string | null;
  reportedBy: string;
  deviationDate: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string;
  closedAt?: string | null;
  closedBy?: string;
}

/**
 * Protocol deviation with details
 */
export interface ProtocolDeviationWithDetails extends ProtocolDeviation {
  patientIdentifier?: string;
  studyName?: string;
  siteName?: string;
  visitName?: string;
  commentCount?: number;
  daysSinceDeviation?: number;
  daysSinceUpdate?: number;
  isOverdue?: boolean;
}

/**
 * Deviation comment
 */
export interface DeviationComment {
  id: number;
  deviationId: number;
  comment: string;
  commentedBy: string;
  commenterName?: string;
  commentedAt: string;
  isSystemComment?: boolean;
  relatedStatusChange?: DeviationStatus | string;
}

// ============================================================================
// Protocol Deviation Requests
// ============================================================================

/**
 * Create protocol deviation request
 */
export interface CreateProtocolDeviationRequest {
  patientId: number;
  studySiteId: number;
  visitId?: number | null;
  deviationType: DeviationType | string;
  severity: DeviationSeverity | string;
  title: string;
  description: string;
  protocolSection?: string;
  expectedProcedure?: string;
  actualProcedure?: string;
  rootCause?: string;
  immediateAction?: string;
  correctiveAction?: string;
  requiresReporting?: boolean;
  reportedBy: string;
  deviationDate?: string;
}

/**
 * Update deviation status request
 */
export interface UpdateDeviationStatusRequest {
  newStatus: DeviationStatus | string;
  updatedBy: string;
  notes?: string;
}

/**
 * Add deviation comment request
 */
export interface AddDeviationCommentRequest {
  comment: string;
  commentedBy: string;
}

/**
 * Mark reported request
 */
export interface MarkReportedRequest {
  updatedBy: string;
  reportedDate?: string;
}

// ============================================================================
// Protocol Deviation Responses
// ============================================================================

/**
 * Protocol deviation response
 */
export interface ProtocolDeviationResponse {
  deviation: ProtocolDeviation;
  success: boolean;
  message?: string;
}

/**
 * Protocol deviations list response
 */
export interface ProtocolDeviationsResponse {
  deviations: ProtocolDeviation[];
  totalCount: number;
  success: boolean;
}

/**
 * Deviation comment response
 */
export interface DeviationCommentResponse {
  comment: DeviationComment;
  success: boolean;
  message?: string;
}

/**
 * Deviation comments list response
 */
export interface DeviationCommentsResponse {
  comments: DeviationComment[];
  totalCount: number;
  success: boolean;
}

// ============================================================================
// Protocol Deviation Filters
// ============================================================================

/**
 * Protocol deviation filter options
 */
export interface ProtocolDeviationFilterOptions {
  studyId?: number;
  patientId?: number;
  studySiteId?: number;
  visitId?: number;
  type?: DeviationType | string;
  severity?: DeviationSeverity | string;
  status?: DeviationStatus | string;
  requiresReporting?: boolean;
  startDate?: string;
  endDate?: string;
  reportedBy?: string;
  activeOnly?: boolean;
  unreportedOnly?: boolean;
  criticalOnly?: boolean;
}

/**
 * Protocol deviation sort options
 */
export interface ProtocolDeviationSortOptions {
  sortBy?: 'deviationDate' | 'severity' | 'status' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Deviation Statistics and Summaries
// ============================================================================

/**
 * Deviation summary statistics
 */
export interface DeviationSummaryStatistics {
  total: number;
  open: number;
  underReview: number;
  resolved: number;
  closed: number;
  critical: number;
  major: number;
  minor: number;
  unreported: number;
  byType: Record<string, number>;
}

/**
 * Patient deviation summary
 */
export interface PatientDeviationSummary {
  patientId: number;
  patientIdentifier?: string;
  totalDeviations: number;
  activeDeviations: number;
  criticalDeviations: number;
  mostRecentDeviation?: string;
  mostCommonType?: DeviationType | string;
}

// ============================================================================
// Validation Rule Types
// ============================================================================

/**
 * Validation rule
 */
export interface ValidationRule {
  ruleId: string;
  ruleType: string;
  expression: string;
  errorMessage: string;
  severity: ValidationSeverity | string;
  enabled?: boolean;
}

/**
 * Conditional validation rule
 */
export interface ConditionalValidationRule {
  condition: string;
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
  ruleId: string;
  expression: string;
  message: string;
  severity: ValidationSeverity | string;
  relatedFields?: string[];
}

/**
 * Range check configuration
 */
export interface RangeCheck {
  checkId: string;
  type: 'normal' | 'soft' | 'hard' | 'expected' | 'possible' | 'critical';
  min?: number;
  max?: number;
  action: DataQualityAction | string;
  message: string;
}

// ============================================================================
// Field and Data Quality Metadata
// ============================================================================

/**
 * Field validation metadata
 */
export interface FieldValidationMetadata {
  required?: boolean;
  type?: 'string' | 'integer' | 'decimal' | 'date' | 'datetime' | 'time' | 'email' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  allowNegative?: boolean;
  pattern?: string;
  patternDescription?: string;
  minDate?: string;
  maxDate?: string;
  allowFutureDates?: boolean;
  warnIfToday?: boolean;
  customRules?: ValidationRule[];
  conditionalValidation?: ConditionalValidationRule[];
}

/**
 * Data quality metadata
 */
export interface DataQualityMetadata {
  rangeChecks?: RangeCheck[];
  crossFieldValidation?: CrossFieldValidationRule[];
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
  id: string;
  label?: string;
  validation?: FieldValidationMetadata;
  dataQuality?: DataQualityMetadata;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deviation type option
 */
export interface DeviationTypeOption {
  value: DeviationType | string;
  label: string;
}

/**
 * Severity level option
 */
export interface SeverityLevelOption {
  value: DeviationSeverity | string;
  label: string;
}

/**
 * Status option
 */
export interface StatusOption {
  value: DeviationStatus | string;
  label: string;
}
