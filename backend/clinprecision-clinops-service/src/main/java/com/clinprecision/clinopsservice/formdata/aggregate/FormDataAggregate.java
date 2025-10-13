package com.clinprecision.clinopsservice.formdata.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.clinopsservice.formdata.domain.commands.SubmitFormDataCommand;
import com.clinprecision.clinopsservice.formdata.domain.events.FormDataSubmittedEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * FormData Aggregate - Core domain object for form data submissions
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail of all form submissions (FDA 21 CFR Part 11 compliance)
 * - Immutable form data history
 * - Regulatory compliance tracking
 * - Data quality and validation history
 * 
 * This aggregate handles the complete lifecycle of form data:
 * 1. Initial submission (DRAFT or SUBMITTED)
 * 2. Updates and corrections (future: UpdateFormDataCommand)
 * 3. Locking (future: LockFormDataCommand for database lock)
 * 4. Source data verification (future: VerifyFormDataCommand)
 * 
 * Business Context:
 * - Electronic Data Capture (EDC)
 * - Case Report Forms (CRF)
 * - Screening assessments
 * - Enrollment forms
 * - Visit-based data collection
 * 
 * Related Aggregates:
 * - PatientAggregate (subject who completed the form)
 * - StudyAggregate (study context)
 * - VisitAggregate (visit context, if applicable)
 */
@Aggregate
public class FormDataAggregate {
    
    private static final Logger logger = LoggerFactory.getLogger(FormDataAggregate.class);

    @AggregateIdentifier
    private UUID formDataId;
    
    private Long studyId;
    private Long formId;
    private Long subjectId;
    private Long visitId;
    private Long siteId;
    private Map<String, Object> formData;
    private String status; // DRAFT, SUBMITTED, LOCKED
    private Long submittedBy;
    private LocalDateTime submittedAt;
    private Integer version;
    private String relatedRecordId;
    
    // Required default constructor for Axon
    public FormDataAggregate() {
    }

    /**
     * Command Handler: Submit Form Data
     * 
     * Business Rules:
     * 1. Form must exist and be assigned to the study
     * 2. Subject must be enrolled (except for screening forms)
     * 3. Form data must not be empty
     * 4. Status must be DRAFT or SUBMITTED
     * 5. Visit-based forms require both subjectId and visitId
     * 
     * Validation:
     * - Command-level: Field presence, format
     * - Aggregate-level: Business rules
     * - Service-level: External dependencies (form exists, subject exists)
     * 
     * GCP/FDA Compliance:
     * - Creates immutable event record
     * - Captures who, what, when
     * - Preserves original data as submitted
     */
    @CommandHandler
    public FormDataAggregate(SubmitFormDataCommand command) {
        logger.info("Handling SubmitFormDataCommand: formDataId={}, studyId={}, formId={}, subjectId={}, status={}", 
            command.getFormDataId(), command.getStudyId(), command.getFormId(), 
            command.getSubjectId(), command.getStatus());
        
        // Validate command
        command.validate();
        
        // Business rule validation
        validateFormSubmission(command);
        
        // Apply event
        FormDataSubmittedEvent event = FormDataSubmittedEvent.builder()
            .formDataId(command.getFormDataId())
            .studyId(command.getStudyId())
            .formId(command.getFormId())
            .subjectId(command.getSubjectId())
            .visitId(command.getVisitId())
            .siteId(command.getSiteId())
            .formData(command.getFormData())
            .status(command.getStatus())
            .submittedBy(command.getSubmittedBy())
            .submittedAt(LocalDateTime.now())
            .relatedRecordId(command.getRelatedRecordId())
            .version(command.getVersion())
            .formVersion(null) // Will be populated by service layer
            .build();
        
        AggregateLifecycle.apply(event);
        
        logger.info("FormDataSubmittedEvent applied: {}", event.getSummary());
    }
    
    /**
     * Event Sourcing Handler: Form Data Submitted
     * 
     * Updates aggregate state from event.
     * This method is called:
     * 1. Immediately after command handler (for new submissions)
     * 2. During event replay (when rebuilding aggregate from event store)
     * 
     * IMPORTANT: This method MUST be idempotent and side-effect free
     * - No external calls
     * - No validation (already done in command handler)
     * - Only update aggregate state
     */
    @EventSourcingHandler
    public void on(FormDataSubmittedEvent event) {
        logger.debug("Applying FormDataSubmittedEvent: formDataId={}", event.getFormDataId());
        
        this.formDataId = event.getFormDataId();
        this.studyId = event.getStudyId();
        this.formId = event.getFormId();
        this.subjectId = event.getSubjectId();
        this.visitId = event.getVisitId();
        this.siteId = event.getSiteId();
        this.formData = event.getFormData();
        this.status = event.getStatus();
        this.submittedBy = event.getSubmittedBy();
        this.submittedAt = event.getSubmittedAt();
        this.version = event.getVersion();
        this.relatedRecordId = event.getRelatedRecordId();
        
        logger.debug("FormDataAggregate state updated: status={}, fieldCount={}", 
            this.status, this.formData != null ? this.formData.size() : 0);
    }
    
    /**
     * Validate form submission business rules
     * 
     * This validation happens at the aggregate level.
     * Service-level validation (form exists, subject exists) happens before command is sent.
     */
    private void validateFormSubmission(SubmitFormDataCommand command) {
        // 1. Status validation
        if (command.isLocked()) {
            throw new IllegalStateException(
                "Cannot submit form data with LOCKED status. Use database lock workflow instead.");
        }
        
        // 2. Visit-based forms must have subject
        if (command.isVisitForm() && command.getSubjectId() == null) {
            throw new IllegalArgumentException(
                "Visit-based forms require a subject ID. Form: " + command.getFormId() + 
                ", Visit: " + command.getVisitId());
        }
        
        // 3. Form data presence
        if (command.getFormData() == null || command.getFormData().isEmpty()) {
            throw new IllegalArgumentException(
                "Form data cannot be empty. At least one field must be filled.");
        }
        
        // 4. Submitted forms must have complete data (DRAFT can be partial)
        if (command.isSubmitted() && !isFormDataComplete(command.getFormData())) {
            logger.warn("Form submitted with potentially incomplete data: formId={}, fieldCount={}", 
                command.getFormId(), command.getFormData().size());
            // Note: This is a warning, not an error. Some forms allow partial submissions.
        }
        
        logger.debug("Form submission validation passed for formDataId: {}", command.getFormDataId());
    }
    
    /**
     * Check if form data appears complete
     * 
     * This is a basic check. Full validation against form definition schema
     * should happen in the service layer before sending the command.
     * 
     * A form is considered "complete" if:
     * - Has at least 3 fields (arbitrary heuristic)
     * - No null values for submitted status
     * 
     * TODO: Integrate with form definition service for schema validation
     */
    private boolean isFormDataComplete(Map<String, Object> formData) {
        if (formData == null || formData.size() < 3) {
            return false;
        }
        
        // Check for null values
        for (Map.Entry<String, Object> entry : formData.entrySet()) {
            if (entry.getValue() == null) {
                logger.debug("Form field has null value: {}", entry.getKey());
                return false;
            }
        }
        
        return true;
    }
    
    // Getters for aggregate state (used in future command handlers)
    
    public UUID getFormDataId() {
        return formDataId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public boolean isLocked() {
        return "LOCKED".equals(status);
    }
    
    public boolean isSubmitted() {
        return "SUBMITTED".equals(status) || "LOCKED".equals(status);
    }
}
