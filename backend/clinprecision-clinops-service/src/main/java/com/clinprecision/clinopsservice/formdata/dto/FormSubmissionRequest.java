package com.clinprecision.clinopsservice.formdata.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * FormSubmissionRequest - DTO for form data submission API
 * 
 * Used by frontend to submit form data via REST API.
 * Validated by Spring @Valid annotation in controller.
 * 
 * Example JSON payload for screening assessment:
 * {
 *   "studyId": 1,
 *   "formId": 5,
 *   "subjectId": null,
 *   "visitId": null,
 *   "siteId": 10,
 *   "formData": {
 *     "eligibility_age": true,
 *     "eligibility_diagnosis": true,
 *     "eligibility_exclusions": false,
 *     "eligibility_consent": true,
 *     "screening_date": "2025-10-12",
 *     "assessor_name": "Dr. Sarah Chen",
 *     "notes": "Subject meets all criteria"
 *   },
 *   "status": "SUBMITTED",
 *   "relatedRecordId": "uuid-of-status-change"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionRequest {

    /**
     * Study this form belongs to
     * Required for all forms
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;

    /**
     * Form definition ID
     * References study_forms table
     * Required to identify which form template is being filled
     */
    @NotNull(message = "Form ID is required")
    private Long formId;

    /**
     * Subject who completed the form
     * NULL for screening forms (pre-enrollment)
     * Required for all post-enrollment forms
     */
    private Long subjectId;

    /**
     * Visit this form belongs to
     * NULL for non-visit forms (screening, enrollment, unscheduled)
     * Required for visit-based data collection
     */
    private Long visitId;

    /**
     * Site that collected this data
     * Important for multi-site studies
     * Optional (can be inferred from user's site)
     */
    private Long siteId;

    /**
     * Complete form data as key-value map
     * Keys are field names from form definition
     * Values can be any JSON-serializable type
     * 
     * Validation:
     * - Must not be empty
     * - Should match form definition schema (validated in service layer)
     * - Field names should correspond to form fields
     */
    @NotNull(message = "Form data is required")
    @NotEmpty(message = "Form data cannot be empty")
    private Map<String, Object> formData;

    /**
     * Form status
     * - DRAFT: Working copy, can be edited
     * - SUBMITTED: Official submission, requires reason to edit
     * - LOCKED: Cannot be edited (database lock)
     * 
     * Default: DRAFT
     * Most form submissions will use SUBMITTED
     */
    @NotNull(message = "Status is required")
    @Builder.Default
    private String status = "SUBMITTED";

    /**
     * Optional: Link to related records
     * Examples:
     * - UUID of patient status change (for screening forms)
     * - Query ID if this resolves a query
     * - SDV record ID if this is source verified
     */
    private String relatedRecordId;

    /**
     * Field completion tracking
     * Sent from frontend to track progress
     */
    private Integer totalFields;
    private Integer completedFields;
    private Integer requiredFields;
    private Integer completedRequiredFields;

    /**
     * Validation helper: Check if this is a screening form
     */
    public boolean isScreeningForm() {
        return subjectId == null;
    }

    /**
     * Validation helper: Check if this is a visit form
     */
    public boolean isVisitForm() {
        return visitId != null;
    }

    /**
     * Validation helper: Check if status is valid
     */
    public boolean hasValidStatus() {
        return status != null && status.matches("DRAFT|SUBMITTED|LOCKED");
    }

    /**
     * Get field count for logging
     */
    public int getFieldCount() {
        return formData != null ? formData.size() : 0;
    }
}
