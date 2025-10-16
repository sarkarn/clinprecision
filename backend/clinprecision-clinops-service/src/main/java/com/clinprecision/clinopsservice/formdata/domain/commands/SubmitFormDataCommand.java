package com.clinprecision.clinopsservice.formdata.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.Map;
import java.util.UUID;

/**
 * Command to submit form data for a subject in a clinical study
 * 
 * This command captures:
 * - Form responses (e.g., screening assessment, enrollment forms)
 * - Study/subject/visit context
 * - Submission metadata (who, when, status)
 * 
 * Business Rules:
 * - Form must exist and be assigned to the study
 * - Subject must be enrolled in the study (except screening forms)
 * - Form data must match form definition schema
 * - Locked forms cannot be resubmitted
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - All submissions create audit trail via FormDataSubmittedEvent
 * - Original submission preserved in event store
 * - Changes tracked via separate UpdateFormDataCommand (future)
 */
@Getter
@Builder
@ToString
public class SubmitFormDataCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Form data ID is required")
    private final UUID formDataId;
    
    @NotNull(message = "Study ID is required")
    private final Long studyId;
    
    @NotNull(message = "Form ID is required")
    private final Long formId;
    
    /**
     * Subject ID - optional for screening forms (pre-enrollment)
     * Required for all post-enrollment forms
     */
    private final Long subjectId;
    
    /**
     * Visit ID - optional for forms not tied to specific visits
     * (e.g., screening, enrollment, unscheduled events)
     */
    private final Long visitId;
    
    /**
     * Site ID - tracks which site collected this data
     * Important for multi-site studies
     */
    private final Long siteId;
    
    /**
     * Form data as JSON structure
     * Matches the form definition's field schema
     * Example:
     * {
     *   "eligibility_age": true,
     *   "eligibility_diagnosis": true,
     *   "screening_date": "2025-10-12",
     *   "assessor_name": "Dr. Smith",
     *   "notes": "Subject meets all criteria"
     * }
     */
    @NotNull(message = "Form data is required")
    private final Map<String, Object> formData;
    
    /**
     * Form status: DRAFT, SUBMITTED, LOCKED
     * - DRAFT: Can be edited, not part of official record
     * - SUBMITTED: Official submission, requires reason to edit
     * - LOCKED: Cannot be edited (database lock applied)
     */
    @NotNull(message = "Status is required")
    private final String status;
    
    /**
     * Who submitted the form (user ID)
     * Captured for audit trail
     */
    @NotNull(message = "Submitted by is required")
    private final Long submittedBy;
    
    /**
     * Optional: Reference to related records
     * - Patient status change UUID
     * - Query resolution ID
     * - Source data verification ID
     */
    private final String relatedRecordId;
    
    /**
     * Field completion tracking
     * Helps monitor form completion progress
     */
    private final Integer totalFields;
    private final Integer completedFields;
    private final Integer requiredFields;
    private final Integer completedRequiredFields;
    
    /**
     * Version number for optimistic locking
     * Prevents concurrent edit conflicts
     */
    @Builder.Default
    private final Integer version = 1;

    @Override
    public void validate() {
        super.validate();
        
        // Validate status is one of allowed values
        if (status != null && !status.matches("DRAFT|SUBMITTED|LOCKED")) {
            throw new IllegalArgumentException(
                "Status must be DRAFT, SUBMITTED, or LOCKED. Got: " + status);
        }
        
        // Post-enrollment forms require subject ID
        if (visitId != null && subjectId == null) {
            throw new IllegalArgumentException(
                "Subject ID is required for visit-based forms");
        }
        
        // Form data cannot be empty
        if (formData != null && formData.isEmpty()) {
            throw new IllegalArgumentException(
                "Form data cannot be empty");
        }
        
        // Version must be positive
        if (version != null && version < 1) {
            throw new IllegalArgumentException(
                "Version must be >= 1");
        }
    }
    
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
     * Get form data as JSON string for logging
     */
    public String getFormDataSummary() {
        if (formData == null || formData.isEmpty()) {
            return "{}";
        }
        // Return first 3 keys for summary (avoid logging sensitive data)
        int count = Math.min(3, formData.size());
        return "{" + String.join(", ", 
            formData.keySet().stream().limit(count).toArray(String[]::new)
        ) + (formData.size() > 3 ? ", ..." : "") + "}";
    }
}
