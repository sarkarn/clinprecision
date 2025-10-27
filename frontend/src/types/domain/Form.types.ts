import type { BaseEntity, EntityStatus} from '../common.types';


/**
 * Change notification configuration
 */
export interface ChangeNotification {
  /** Enable change notifications */
  enabled?: boolean;
  /** Notification recipients (roles) */
  recipients?: string[];
}
/**
 * Audit trail configuration
 */
export interface AuditConfig {
  /** Audit trail level */
  level?: 'NONE' | 'BASIC' | 'FULL';
  /** Requires electronic signature */
  electronicSignatureRequired?: boolean;
  /** Requires reason for change */
  reasonForChangeRequired?: boolean;
  /** Predefined reason options */
  reasonForChangeOptions?: string[];
  /** Track version history */
  trackVersionHistory?: boolean;
  /** Change notification configuration */
  changeNotification?: ChangeNotification;
}

/**
 * Data entry configuration
 */
export interface DataEntryConfig {
  /** Field is derived/calculated */
  isDerivedField?: boolean;
  /** Derivation formula */
  derivationFormula?: string;
  /** Fields this derivation depends on */
  derivationDependencies?: string[];
  /** Query management enabled */
  isQueryEnabled?: boolean;
  /** Editable after form lock */
  isEditableAfterLock?: boolean;
  /** Editable after database freeze */
  isEditableAfterFreeze?: boolean;
  /** Requires double data entry */
  requiresDoubleDataEntry?: boolean;
  /** Requires SDV */
  requiresSourceDataVerification?: boolean;
  /** Allow 'N/A' response */
  allowNA?: boolean;
  /** Allow 'Not Done' response */
  allowNotDone?: boolean;
  /** Allow 'Not Asked' response */
  allowNotAsked?: boolean;
  /** Allow 'Unknown' response */
  allowUnknown?: boolean;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Include in data export */
  includeInExport?: boolean;
  /** Export format */
  exportFormat?: 'original' | 'formatted' | 'coded' | 'transformed';
  /** Variable name in export */
  exportVariable?: string;
  /** Transformation to apply on export */
  exportTransformation?: string;
  /** Datasets to include in */
  includeInDataset?: string[];
  /** Export mappings by dataset type */
  exportMapping?: Record<string, DatasetMapping>;
}
/**
 * Form Field Metadata Type Definitions
 * Auto-generated from form-field-metadata-schema.json
 * Version: 1.0.0
/**
 * Form Field Metadata Type Definitions
 * Auto-generated from form-field-metadata-schema.json
 * Version: 1.0.0
 */

/**
 * Complete field metadata structure
 */
export interface FieldMetadata {
  /** Validation rules for field values */
  validation?: ValidationConfig;
  /** UI display configuration */
  ui?: UIConfig;
  /** Clinical significance flags */
  clinical?: ClinicalFlags;
  /** CDASH standard mapping */
  cdash?: CdashMapping;
  /** SDTM standard mapping */
  sdtm?: SdtmMapping;
  /** Medical coding configuration */
  coding?: MedicalCoding;
  /** Data quality rules */
  dataQuality?: DataQualityRules;
  /** Regulatory compliance metadata */
  regulatory?: RegulatoryMetadata;
  /** Audit trail configuration */
  audit?: AuditConfig;
  /** Data entry configuration */
  dataEntry?: DataEntryConfig;
  /** Export configuration */
  export?: ExportConfig;
  /** Query management configuration */
  query?: QueryConfig;
  /** Detailed field description */
  description?: string;
  /** Special instructions for data entry */
  implementationNotes?: string;
  /** Source of the data */
  dataSource?: 'CRF' | 'eCOA' | 'ePRO' | 'Lab' | 'Device' | 'EHR' | 'Other';
  /** How the data is captured */
  captureMethod?: 'manual' | 'automated' | 'imported' | 'derived';
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Whether the field is required */
  required?: boolean;
  /** Expected data type */
  type?: 'string' | 'integer' | 'decimal' | 'date' | 'datetime' | 'time' | 'email' | 'phone' | 'url';
  /** Minimum string length */
  minLength?: number;
  /** Maximum string length */
  maxLength?: number;
  /** Minimum numeric value */
  minValue?: number;
  /** Maximum numeric value */
  maxValue?: number;
  /** Regular expression pattern */
  pattern?: string;
  /** Human-readable pattern description */
  patternDescription?: string;
  /** Number of decimal places allowed */
  decimalPlaces?: number;
  /** Whether negative numbers are allowed */
  allowNegative?: boolean;
  /** Custom validation rules */
  customRules?: CustomValidationRule[];
  /** Conditional validation rules */
  conditionalValidation?: ConditionalValidation[];
}

/**
 * Custom validation rule
 */
export interface CustomValidationRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Type of validation rule */
  ruleType?: 'range' | 'consistency' | 'format' | 'business';
  /** JavaScript expression to evaluate */
  expression: string;
  /** Error message to display */
  errorMessage: string;
  /** Severity level */
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Conditional validation
 */
export interface ConditionalValidation {
  /** JavaScript condition expression */
  condition: string;
  /** Validation rules to apply when condition is true */
  rules: Partial<ValidationConfig>;
}

/**
 * UI configuration
 */
export interface UIConfig {
  /** Placeholder text */
  placeholder?: string;
  /** Help text or tooltip */
  helpText?: string;
  /** Units of measurement */
  units?: string;
  /** Position of units relative to value */
  unitsPosition?: 'prefix' | 'suffix';
  /** Options for radio/dropdown fields */
  options?: FieldOption[];
  /** Label for checkbox fields */
  checkboxLabel?: string;
  /** Default field value */
  defaultValue?: any;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Whether field is hidden */
  hidden?: boolean;
  /** Conditional display rules */
  conditionalDisplay?: ConditionalDisplay;
}

/**
 * Field option for radio/dropdown
 */
export interface FieldOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Option description */
  description?: string;
  /** Display order */
  order?: number;
  /** Coded value for standards */
  codingValue?: string;
  /** Coding system (e.g., HL7) */
  codingSystem?: string;
}

/**
 * Conditional display configuration
 */
export interface ConditionalDisplay {
  /** Field ID to check */
  field: string;
  /** Comparison operator */
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains';
  /** Value to compare against */
  value: any;
}

/**
 * Clinical significance flags
 */
export interface ClinicalFlags {
  /** Source Data Verification required */
  sdvRequired?: boolean;
  /** Medical review required */
  medicalReviewRequired?: boolean;
  /** Critical data point */
  criticalDataPoint?: boolean;
  /** Safety data point */
  safetyDataPoint?: boolean;
  /** Efficacy data point */
  efficacyDataPoint?: boolean;
  /** Data review required */
  dataReviewRequired?: boolean;
  /** Medically significant data */
  medicallySignificant?: boolean;
  /** Requires ongoing monitoring */
  requiresMonitoring?: boolean;
  /** Requires source documentation */
  requiresSourceDocumentation?: boolean;
  /** Allowable deviation range */
  allowableDeviationRange?: DeviationRange;
}

/**
 * Deviation range
 */
export interface DeviationRange {
  /** Lower bound of allowable deviation */
  lowerBound?: number;
  /** Upper bound of allowable deviation */
  upperBound?: number;
  /** Units for deviation (%, absolute, etc.) */
  units?: string;
}

/**
 * CDASH mapping
 */
export interface CdashMapping {
  /** CDASH domain (e.g., DM, AE, VS) */
  domain?: string;
  /** CDASH variable name */
  variable?: string;
  /** CDASH data type */
  dataType?: 'Char' | 'Num' | 'Date' | 'Time';
  /** Variable role */
  role?: 'Identifier' | 'Topic' | 'Timing' | 'Qualifier';
  /** Core variable status */
  coreStatus?: 'Required' | 'Expected' | 'Permissible';
  /** CDASH implementation notes */
  implementationNotes?: string;
  /** Controlled terminology code */
  controlledTerminology?: string;
}

/**
 * SDTM mapping
 */
export interface SdtmMapping {
  /** SDTM domain (e.g., DM, AE, VS) */
  domain?: string;
  /** SDTM variable name */
  variable?: string;
  /** SDTM data type */
  dataType?: 'Char' | 'Num' | 'ISO8601';
  /** Variable role */
  role?: 'Identifier' | 'Topic' | 'Timing' | 'Grouping' | 'Qualifier';
  /** Core variable status */
  coreStatus?: 'Req' | 'Exp' | 'Perm';
  /** Data transformation type */
  transformation?: 'Direct' | 'Derived' | 'Concatenated' | 'Split';
  /** Transformation rule or formula */
  transformationRule?: string;
  /** Controlled terminology code */
  controlledTerminology?: string;
  /** CDISC codelist name */
  codelist?: string;
}

/**
 * Medical coding configuration
 */
export interface MedicalCoding {
  /** Medical dictionary to use */
  dictionary?: 'MedDRA' | 'WHODrug' | 'ICD-10' | 'ICD-11' | 'SNOMED-CT';
  /** Dictionary version */
  version?: string;
  /** MedDRA coding level */
  level?: 'PT' | 'LLT' | 'HLT' | 'HLGT' | 'SOC';
  /** Enable automatic coding */
  autoCode?: boolean;
  /** Coding is required */
  codeRequired?: boolean;
  /** Allow multiple codes */
  allowMultipleCodes?: boolean;
  /** Coding query configuration */
  codingQuery?: CodingQuery;
}

/**
 * Coding query configuration
 */
export interface CodingQuery {
  /** Auto-generate query for coding issues */
  autoGenerateQuery?: boolean;
  /** Threshold for auto-query generation */
  queryThreshold?: 'low' | 'medium' | 'high';
}

/**
 * Data quality rules
 */
export interface DataQualityRules {
  /** Range validation checks */
  rangeChecks?: RangeCheck[];
  /** Data consistency rules */
  consistencyRules?: ConsistencyRule[];
  /** Cross-field validation rules */
  crossFieldValidation?: CrossFieldValidation[];
  /** Duplicate checking configuration */
  duplicateCheck?: DuplicateCheck;
}

/**
 * Range check configuration
 */
export interface RangeCheck {
  /** Unique check identifier */
  checkId: string;
  /** Range check type */
  type: 'normal' | 'expected' | 'possible' | 'critical';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Action to take */
  action: 'warning' | 'error' | 'query' | 'info';
  /** Message to display */
  message?: string;
}

/**
 * Consistency rule
 */
export interface ConsistencyRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Consistency rule type */
  type: 'temporal' | 'logical' | 'anatomical';
  /** Related field IDs */
  relatedFields?: string[];
  /** Rule expression */
  expression: string;
  /** Error message */
  message?: string;
}

/**
 * Cross-field validation
 */
export interface CrossFieldValidation {
  /** Unique rule identifier */
  ruleId: string;
  /** Related field IDs */
  relatedFields: string[];
  /** Validation expression */
  expression: string;
  /** Error message */
  message?: string;
  /** Severity level */
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Duplicate check configuration
 */
export interface DuplicateCheck {
  /** Enable duplicate checking */
  enabled?: boolean;
  /** Scope of duplicate check */
  scope?: 'visit' | 'subject' | 'study';
  /** Fields to check for duplicates */
  fields?: string[];
}

/**
 * Regulatory compliance metadata
 */
export interface RegulatoryMetadata {
  /** Required by FDA */
  fdaRequired?: boolean;
  /** Required by EMA */
  emaRequired?: boolean;
  /** Subject to 21 CFR Part 11 */
  cfr21Part11?: boolean;
  /** Required by GCP */
  gcpRequired?: boolean;
  /** HIPAA protected information */
  hipaaProtected?: boolean;
  /** PHI category */
  phiCategory?: 'identifier' | 'demographic' | 'dates' | 'contact' | 'financial' | 'health';
  /** Requires de-identification */
  deidentificationRequired?: boolean;
  /** Data retention period in years */
  retentionYears?: number;
  /** Requires archiving */
  archivingRequired?: boolean;
}

/**
 * Audit trail configuration
 */




/**
 * Dataset mapping
 */
export interface DatasetMapping {
  /** Target domain */
  domain?: string;
  /** Target dataset */
  dataset?: string;
  /** Target variable name */
  variable?: string;
}

/**
 * Query management configuration
 */
export interface QueryConfig {
  /** Enable automatic query generation */
  autoQueryEnabled?: boolean;
  /** Auto-query rules */
  autoQueryRules?: AutoQueryRule[];
  /** Enable manual queries */
  manualQueryEnabled?: boolean;
  /** Query workflow configuration */
  queryWorkflow?: QueryWorkflow;
}

/**
 * Auto-query rule
 */
export interface AutoQueryRule {
  /** Unique rule identifier */
  ruleId: string;
  /** Condition for query generation */
  condition: string;
  /** Query text template */
  queryText: string;
  /** Query priority */
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Query workflow configuration
 */
export interface QueryWorkflow {
  /** Response required */
  requiresResponse?: boolean;
  /** Allow clarification requests */
  allowClarification?: boolean;
  /** Requires approval to close */
  requiresClosureApproval?: boolean;
}

/**
 * Complete field definition (used in form definitions)
 */
export interface FieldDefinition {
  /** Unique field identifier */
  id: string;
  /** Field type */
  type: 'text' | 'number' | 'date' | 'datetime' | 'time' | 'radio' | 'checkbox' | 'dropdown' | 'textarea';
  /** Field label */
  label: string;
  /** Complete field metadata */
  metadata: FieldMetadata;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field ID */
  field: string;
  /** Error type */
  type: string;
  /** Error message */
  message: string;
  /** Rule ID that triggered error */
  ruleId?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Field ID */
  field: string;
  /** Warning type */
  type: string;
  /** Warning message */
  message: string;
  /** Rule ID that triggered warning */
  ruleId?: string;
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
  /** Fields with errors (for quick lookup) */
  fieldErrors: Record<string, ValidationError[]>;
  /** Fields with warnings (for quick lookup) */
  fieldWarnings: Record<string, ValidationWarning[]>;
}



/**
 * Study Form Definition
 * Form definition entity for study-specific forms
 */
export interface StudyFormDefinition {
  id: number;
  formId?: number;
  studyId: number;
  name: string;
  description?: string;
  formType: string;
  type?: string;
  fields: string;
  structure: string;
  formDefinition?: string;
  version?: string;
  versionNumber?: number;
  isLatestVersion?: boolean;
  status: FormStatus | string;
  templateId?: number | null;
  templateVersion?: string;
  isLocked?: boolean;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Form Template
 * Reusable form template
 */
export interface FormTemplate {
  id: number;
  templateId?: number;
  name: string;
  description?: string;
  type: string;
  formType?: string;
  fields: string;
  structure: string;
  version: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Study Form Request
 * Data required to create a new study form
 */
export interface CreateStudyFormRequest {
  studyId: number;
  name: string;
  description?: string;
  formType?: string;
  type?: string;
  fields?: string;
  structure?: string;
  formDefinition?: string;
  version?: string;
  status?: FormStatus | string;
  templateId?: number | null;
  templateVersion?: string;
}

/**
 * Update Study Form Request
 * Data for updating an existing study form
 */
export interface UpdateStudyFormRequest {
  name?: string;
  description?: string;
  formType?: string;
  type?: string;
  fields?: string;
  structure?: string;
  version?: string;
  status?: FormStatus | string;
  templateId?: number | null;
}

/**
 * Create Form From Template Request
 * Data for creating a form from a template
 */
export interface CreateFormFromTemplateRequest {
  studyId: number;
  templateId: number;
  formName: string;
  customizations?: Partial<CreateStudyFormRequest>;
}

/**
 * Form Search Parameters
 * Parameters for searching forms
 */
export interface FormSearchParams {
  studyId: number;
  searchTerm?: string;
  status?: FormStatus | string;
  formType?: string;
  tag?: string;
}




export interface CRF {
  id?: string | number;
  name: string;
  type: string;
  description?: string;
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS= 'IN_PROGRESS',
  COMPLETED ='COMPLETED',
  ACTIVE = 'ACTIVE',
  VERIFIED ='VERIFIED',
  LOCKED = 'LOCKED',
  APPROVED = 'APPROVED',
  RETIRED = 'RETIRED',
  ARCHIVED = 'ARCHIVED'
}



export interface FormField {
  id?: number;
  name?: string;
  label?: string;
  fieldType?: string;
  dataType?: string;
  required?: boolean;
  codeListId?: number;
  validationRules?: Record<string, any>;
  cdiscVariable?: string;
  order?: number;
}

export interface Form extends BaseEntity {
  formId?: number;
  studyId?: number;
  formName?: string;
  formTitle?: string;
  formType?: string;
  version?: number;
  status?: EntityStatus;
  fields?: FormField[];
  cdiscDomain?: string;
}

export interface FormInstance {
  instanceId?: number;
  formId?: number;
  patientId?: number;
  visitId?: number;
  status?: FormStatus;
  enteredBy?: string;
  entryDate?: string;
  verifiedBy?: string;
  verificationDate?: string;
  lockedBy?: string;
  lockDate?: string;
  data?: Record<string, any>;
}