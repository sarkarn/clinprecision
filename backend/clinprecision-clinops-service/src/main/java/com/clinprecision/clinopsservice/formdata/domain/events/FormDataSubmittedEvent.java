package com.clinprecision.clinopsservice.formdata.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Event emitted when form data is successfully submitted
 * 
 * This event represents the immutable record of a form submission in the event store.
 * It captures all context needed to:
 * - Update the read model (study_form_data table)
 * - Create audit trail (study_form_data_audit table)
 * - Trigger downstream processes (data quality checks, query generation)
 * 
 * Event Sourcing Benefits:
 * - Complete history of all form submissions preserved
 * - Can replay events to rebuild database
 * - Audit trail built-in (who, what, when)
 * - Temporal queries (state at any point in time)
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - Immutable event record
 * - Cryptographically signed (via Axon event store)
 * - Time-stamped with submittedAt
 * - User attribution via submittedBy
 */
@Getter
@Builder
@ToString(exclude = "formData") // Exclude sensitive data from logs
public class FormDataSubmittedEvent {

    /**
     * Unique identifier for this form submission
     * Used as aggregate identifier in event sourcing
     */
    private final UUID formDataId;
    
    /**
     * Study context
     */
    private final Long studyId;
    
    /**
     * Form definition reference
     */
    private final Long formId;
    
    /**
     * Subject who completed the form
     * Null for screening forms (pre-enrollment)
     */
    private final Long subjectId;
    
    /**
     * Visit this form belongs to
     * Null for non-visit forms (screening, enrollment, unscheduled)
     */
    private final Long visitId;
    
    /**
     * Site that collected this data
     */
    private final Long siteId;
    
    /**
     * Complete form data as JSON structure
     * Preserves exact state at submission time
     * 
     * Example for screening assessment:
     * {
     *   "eligibility_age": true,
     *   "eligibility_diagnosis": true,
     *   "eligibility_exclusions": false,
     *   "eligibility_consent": true,
     *   "screening_date": "2025-10-12",
     *   "assessor_name": "Dr. Sarah Chen",
     *   "notes": "Subject meets all inclusion criteria"
     * }
     */
    private final Map<String, Object> formData;
    
    /**
     * Form status at submission
     * DRAFT = working copy, not official
     * SUBMITTED = official record
     * LOCKED = database locked, cannot edit
     */
    private final String status;
    
    /**
     * User who submitted the form
     */
    private final Long submittedBy;
    
    /**
     * When the form was submitted
     * Used for audit trail and compliance reporting
     */
    private final LocalDateTime submittedAt;
    
    /**
     * Optional reference to related records
     * Examples:
     * - UUID of patient status change (for screening forms)
     * - Query ID if this submission resolves a query
     * - SDV record ID if this is source verified
     */
    private final String relatedRecordId;
    
    /**
     * Version number for optimistic locking
     * Increments with each update to detect concurrent modifications
     */
    private final Integer version;
    
    /**
     * Optional: Form definition version
     * Tracks which version of the form schema was used
     * Important for form schema evolution
     */
    private final Integer formVersion;

    /**
     * Field completion tracking
     * Helps monitor form completion progress
     */
    private final Integer totalFields;
    private final Integer completedFields;
    private final Integer requiredFields;
    private final Integer completedRequiredFields;

    /**
     * Check if this is a screening form (pre-enrollment)
     */
    public boolean isScreeningForm() {
        return subjectId == null;
    }
    
    /**
     * Check if this is a visit-based form
     */
    public boolean isVisitForm() {
        return visitId != null;
    }
    
    /**
     * Check if form is submitted (not draft)
     */
    public boolean isSubmitted() {
        return "SUBMITTED".equals(status) || "LOCKED".equals(status);
    }
    
    /**
     * Check if form is locked (cannot be edited)
     */
    public boolean isLocked() {
        return "LOCKED".equals(status);
    }
    
    /**
     * Get number of fields in form data
     */
    public int getFieldCount() {
        return formData != null ? formData.size() : 0;
    }
    
    /**
     * Get summary for logging (excludes sensitive data)
     */
    public String getSummary() {
        return String.format(
            "FormDataSubmittedEvent{formDataId=%s, studyId=%d, formId=%d, " +
            "subjectId=%s, visitId=%s, status=%s, fieldCount=%d, submittedAt=%s}",
            formDataId, studyId, formId, subjectId, visitId, status, 
            getFieldCount(), submittedAt
        );
    }
    
    /**
     * Check if this submission has related records
     */
    public boolean hasRelatedRecord() {
        return relatedRecordId != null && !relatedRecordId.trim().isEmpty();
    }
}
