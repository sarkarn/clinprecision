// src/constants/FormConstants.js

/**
 * Form Constants
 * Centralized configuration for form data capture system
 */

/**
 * Form Type Identifiers
 * These correspond to form_definition table in the database
 */
export const FORM_IDS = {
  // Pre-enrollment forms (no study/visit context)
  SCREENING_ASSESSMENT: 5,
  ELIGIBILITY_CHECKLIST: 6,
  INFORMED_CONSENT: 7,

  // Study visit forms (require study and visit context)
  BASELINE_VITALS: 10,
  ADVERSE_EVENT: 20,
  CONCOMITANT_MEDICATIONS: 30,
  LABORATORY_RESULTS: 40,
  PROTOCOL_DEVIATION: 50,
  STUDY_COMPLETION: 60,

  // Add more form IDs as they are defined in the database
};

/**
 * Form Submission Status
 * Lifecycle states for form data
 */
export const FORM_STATUS = {
  DRAFT: 'DRAFT',           // Partially completed, can be edited
  SUBMITTED: 'SUBMITTED',   // Completed and submitted, can be edited
  LOCKED: 'LOCKED',         // Database locked, cannot be edited
  VALIDATED: 'VALIDATED',   // QC validated
  ARCHIVED: 'ARCHIVED'      // Historical record
};

/**
 * Default Study Configuration
 * TODO: Replace with actual study context from user session/auth
 */
export const DEFAULT_STUDY_CONFIG = {
  // Default study ID when patient is not yet enrolled in a specific study
  // This is used for screening/enrollment forms before study assignment
  DEFAULT_STUDY_ID: 1,
  
  // Default site ID - should be fetched from authenticated user's context
  // For now, using null and will be enhanced with proper auth integration
  DEFAULT_SITE_ID: null,
};

/**
 * Form Field Validation Rules
 */
export const FORM_VALIDATION = {
  MIN_FIELD_NAME_LENGTH: 1,
  MAX_FIELD_NAME_LENGTH: 100,
  MAX_TEXT_FIELD_LENGTH: 1000,
  MAX_NOTES_LENGTH: 5000,
};

/**
 * Helper Functions
 */

/**
 * Get form name by ID
 * @param {number} formId - Form identifier
 * @returns {string} - Human-readable form name
 */
export const getFormNameById = (formId) => {
  const formNames = {
    [FORM_IDS.SCREENING_ASSESSMENT]: 'Screening Assessment',
    [FORM_IDS.ELIGIBILITY_CHECKLIST]: 'Eligibility Checklist',
    [FORM_IDS.INFORMED_CONSENT]: 'Informed Consent',
    [FORM_IDS.BASELINE_VITALS]: 'Baseline Vitals',
    [FORM_IDS.ADVERSE_EVENT]: 'Adverse Event Report',
    [FORM_IDS.CONCOMITANT_MEDICATIONS]: 'Concomitant Medications',
    [FORM_IDS.LABORATORY_RESULTS]: 'Laboratory Results',
    [FORM_IDS.PROTOCOL_DEVIATION]: 'Protocol Deviation',
    [FORM_IDS.STUDY_COMPLETION]: 'Study Completion',
  };
  
  return formNames[formId] || `Form ${formId}`;
};

/**
 * Check if form is a screening/enrollment form (pre-study assignment)
 * @param {number} formId - Form identifier
 * @returns {boolean} - True if screening form
 */
export const isScreeningForm = (formId) => {
  return [
    FORM_IDS.SCREENING_ASSESSMENT,
    FORM_IDS.ELIGIBILITY_CHECKLIST,
    FORM_IDS.INFORMED_CONSENT
  ].includes(formId);
};

/**
 * Check if form requires visit context
 * @param {number} formId - Form identifier
 * @returns {boolean} - True if visit form
 */
export const isVisitForm = (formId) => {
  return [
    FORM_IDS.BASELINE_VITALS,
    FORM_IDS.ADVERSE_EVENT,
    FORM_IDS.CONCOMITANT_MEDICATIONS,
    FORM_IDS.LABORATORY_RESULTS,
    FORM_IDS.PROTOCOL_DEVIATION,
    FORM_IDS.STUDY_COMPLETION
  ].includes(formId);
};

/**
 * Validate form status
 * @param {string} status - Status to validate
 * @returns {boolean} - True if valid status
 */
export const isValidFormStatus = (status) => {
  return Object.values(FORM_STATUS).includes(status);
};

export default {
  FORM_IDS,
  FORM_STATUS,
  DEFAULT_STUDY_CONFIG,
  FORM_VALIDATION,
  getFormNameById,
  isScreeningForm,
  isVisitForm,
  isValidFormStatus
};
