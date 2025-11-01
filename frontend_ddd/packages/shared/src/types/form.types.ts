import type { FormStatus, FormDataStatus} from './status.types';
import type { EntityStatus } from './common.types';




/**
 * Form Field Type Enum
 * Supported field types in form definitions
 */
export enum FormFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  DROPDOWN = 'dropdown',
  TEXTAREA = 'textarea'
}

/**
 * Form Field Metadata
 * Configuration and validation rules for form fields
 */
export interface FormFieldMetadata {
  required?: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  units?: string;
  description?: string;
  checkboxLabel?: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  pattern?: string;
}

/**
 * Form Field Definition
 * Structure of a single form field
 */
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  metadata: FormFieldMetadata;
  value?: any;
}

/**
 * Form definition
 */
export interface FormDefinition {
  id: string | number;
  formId?: number;
  name: string;
  description: string;
  fields: FormField[];
  studyId?: number;
  formType?: string;
  type?: string;
  version?: string;
  versionNumber?: number;
  structure?: string;
  formDefinition?: string;
  isLatestVersion?: boolean;
  status?: FormStatus | EntityStatus | string;
  templateId?: number | null;
  templateVersion?: string;
  isLocked?: boolean;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  formValidation?: any[];
}


/**
 * Form Data Record
 * Submitted form data with all field values
 */
export interface FormDataRecord {
  id?: number;
  formDataId?: number;
  recordId?: string;
  studyId: number;
  formId: number;
  subjectId: number | null;
  visitId: number | null;
  siteId?: number | null;
  formData: Record<string, any>;
  status: FormDataStatus;
  relatedRecordId?: string | null;
  totalFields?: number;
  completedFields?: number;
  requiredFields?: number;
  completedRequiredFields?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Form Data Submission Request
 * Data required to submit a form
 */
export interface FormDataSubmission {
  studyId: number;
  formId: number;
  subjectId: number | null;
  visitId: number | null;
  siteId?: number | null;
  formData: Record<string, any>;
  status?: FormDataStatus;
  relatedRecordId?: string | null;
  totalFields?: number;
  completedFields?: number;
  requiredFields?: number;
  completedRequiredFields?: number;
}

/**
 * Form Completion Statistics
 * Tracking of form field completion
 */
export interface FormCompletionStats {
  total: number;
  completed: number;
  requiredTotal: number;
  requiredCompleted: number;
  percentComplete: number;
  isComplete: boolean;
}

/**
 * Visit Form Summary
 * Summary of a form associated with a visit
 */
export interface VisitFormSummary {
  id: string;
  formId: number;
  name: string;
  formName?: string;
  status: FormDataStatus | string;
  completionStatus?: string;
  lastUpdated?: string;
  createdAt?: string;
}

/**
 * Form Data Submission Response
 * Response from backend after form submission
 */
export interface FormDataSubmissionResponse {
  success: boolean;
  formDataId?: number;
  recordId?: string;
  message?: string;
}

/**
 * Form validation error
 */
export interface FormValidationError {
  fieldId: string;
  fieldLabel: string;
  error: string;
  field?: string;
  type?: string;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
  ruleId?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  valid?: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  missingRequired?: string[];
  fieldErrors?: Record<string, FormValidationError[]>;
  fieldWarnings?: Record<string, FormValidationError[]>;
}


/**
 * Form Entry Data (Legacy Format)
 * Format used by FormEntry component
 */
export interface FormEntryData {
  status: 'incomplete' | 'complete';
  lastUpdated: string;
  [key: string]: any;
}

// ========== Visit-Form Association Types ==========

/**
 * Visit-Form Association
 * Represents the binding between a visit and a form
 */
export interface VisitFormAssociation {
  id?: number;
  associationId?: number;
  studyId: number;
  visitDefinitionId: number;
  visitId?: number;
  formDefinitionId: number;
  formId?: number;
  isRequired: boolean;
  isConditional: boolean;
  conditionalLogic?: string | null;
  displayOrder: number;
  instructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


/**
 * Visit-Form Matrix Entry
 * Entry in the study-wide visit-form matrix
 */
export interface VisitFormMatrixEntry {
  visitId: number;
  visitName: string;
  formId: number;
  formName: string;
  isRequired: boolean;
  isConditional: boolean;
  displayOrder: number;
  conditionalLogic?: string | null;
}

/**
 * Form Binding Data
 * Data for creating/updating form bindings
 */
export interface FormBindingData {
  visitDefinitionId?: number;
  formDefinitionId?: number;
  isRequired?: boolean;
  isConditional?: boolean;
  conditionalLogic?: string | null;
  displayOrder?: number;
  instructions?: string | null;
}

/**
 * Visit with Form Associations
 * Visit data with all associated forms
 */
export interface VisitWithForms {
  id: number;
  name: string;
  description?: string;
  forms: VisitFormAssociation[];
  requiredForms?: VisitFormAssociation[];
  optionalForms?: VisitFormAssociation[];
}

/**
 * Form with Visit Associations
 * Form data with all associated visits
 */
export interface FormWithVisits {
  id: number;
  name: string;
  description?: string;
  visits: VisitFormAssociation[];
}

/**
 * Study Visit-Form Matrix
 * Complete matrix of visit-form associations for a study
 */
export interface StudyVisitFormMatrix {
  studyId: number;
  associations: VisitFormMatrixEntry[];
  totalVisits: number;
  totalForms: number;
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


/**
 * Study form definition
 */
export interface StudyFormDefinition extends FormDefinition {
  studyId: number;
}


/**
 * Field validation result
 */
export interface FieldValidationResult {
  valid: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
}
