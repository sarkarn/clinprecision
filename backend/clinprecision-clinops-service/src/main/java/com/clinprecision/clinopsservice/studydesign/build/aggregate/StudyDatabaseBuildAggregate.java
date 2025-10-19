package com.clinprecision.clinopsservice.studydesign.build.aggregate;

import com.clinprecision.clinopsservice.studydesign.build.domain.commands.BuildStudyDatabaseCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.CancelStudyDatabaseBuildCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.CompleteStudyDatabaseBuildCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.ValidateStudyDatabaseCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.events.*;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Study Database Build Aggregate - Core domain object for database build management
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail (FDA 21 CFR Part 11 compliance)
 * - Immutable build history
 * - Regulatory compliance tracking
 * 
 * This aggregate handles the complete lifecycle of study database builds following
 * the same pattern as PatientAggregate and SiteAggregate.
 * 
 * Business Rules:
 * - Only one build can be in progress per study at a time
 * - Builds can only be cancelled while IN_PROGRESS
 * - Validation requires successful build completion or in-progress status
 * - All state changes are recorded as immutable events
 */
@Aggregate
@Slf4j
public class StudyDatabaseBuildAggregate {

    @AggregateIdentifier
    private UUID studyDatabaseBuildId;
    
    private Long studyId;
    private String studyName;
    private String studyProtocol;
    private StudyDatabaseBuildStatus status;
    private Long requestedBy;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Map<String, Object> buildConfiguration;
    private CompleteStudyDatabaseBuildCommand.ValidationResultData lastValidationResult;
    private int formsConfigured;
    private int validationRulesSetup;
    private List<String> buildErrors;
    
    // Required default constructor for Axon
    public StudyDatabaseBuildAggregate() {
        this.buildErrors = new ArrayList<>();
    }

    /**
     * Command Handler: Build Study Database
     * 
     * Business Rules:
     * - Study must exist and be in valid state
     * - No concurrent builds for same study (enforced at service layer)
     * - User must have STUDY_MANAGER or SYSTEM_ADMIN role (enforced at controller)
     * - Study design configuration must be provided
     * - Form definitions must be present
     * - Validation rules must be defined
     */
    @CommandHandler
    public StudyDatabaseBuildAggregate(BuildStudyDatabaseCommand command) {
        log.info("Creating study database build aggregate for study: {} with build ID: {}", 
                command.getStudyId(), command.getStudyDatabaseBuildId());
        
        // Validate business rules
        validateBuildCommand(command);
        
        // Apply domain event
    AggregateLifecycle.apply(StudyDatabaseBuildStartedEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(command.getStudyId())
                .studyName(command.getStudyName())
                .studyProtocol(command.getStudyProtocol())
                .requestedBy(command.getRequestedBy())
                .startedAt(LocalDateTime.now())
                .buildConfiguration(command.getStudyDesignConfiguration())
        .buildRequestId(command.getBuildRequestId())
                .build());
        
        log.info("Study database build started event applied for build ID: {}", 
                command.getStudyDatabaseBuildId());
    }

    /**
     * Command Handler: Validate Study Database
     * 
     * Business Rules:
     * - Can only validate builds in IN_PROGRESS or COMPLETED status
     * - At least one validation type must be enabled
     */
    @CommandHandler
    public void handle(ValidateStudyDatabaseCommand command) {
        log.info("Handling validate study database command for build ID: {}", 
                command.getStudyDatabaseBuildId());
        
        // Business rule: Can only validate builds in progress or completed
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS && 
            status != StudyDatabaseBuildStatus.COMPLETED) {
            throw new IllegalStateException(
                String.format("Cannot validate database build in status: %s. " +
                            "Build must be IN_PROGRESS or COMPLETED.", status));
        }
        
        // Business rule: At least one validation type must be enabled
        if (!command.hasValidationEnabled()) {
            throw new IllegalArgumentException(
                "At least one validation type must be enabled");
        }
        
        log.info("Validation command accepted for build ID: {} with strictValidation={}, " +
                "complianceCheck={}, performanceCheck={}", 
                command.getStudyDatabaseBuildId(), 
                command.isStrictValidation(),
                command.isComplianceCheck(), 
                command.isPerformanceCheck());
        
        // Note: Actual validation logic is handled by external service (DatabaseValidationService)
        // This command handler just validates business rules and accepts the command
        // The validation completed event will be applied when validation service completes
    }

    /**
     * Command Handler: Complete Study Database Build
     * 
     * Business Rules:
     * - Can only complete builds in IN_PROGRESS status
     * - Validation result must be successful
     * - At least one form must be configured
     */
    @CommandHandler
    public void handle(CompleteStudyDatabaseBuildCommand command) {
        log.info("Handling complete study database build command for build ID: {}", 
                command.getStudyDatabaseBuildId());
        
        // Business rule: Can only complete builds in progress
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                String.format("Cannot complete database build in status: %s. " +
                            "Build must be IN_PROGRESS.", status));
        }
        
        // Business rule: Validation must be successful
        if (command.getValidationResult() == null || !command.getValidationResult().isValid()) {
            throw new IllegalStateException(
                "Cannot complete build without successful validation result");
        }
        
        // Business rule: At least one form must be configured
        if (command.getFormsConfigured() <= 0) {
            throw new IllegalStateException(
                "Cannot complete build without at least one configured form");
        }
        
        // Convert command validation result to event validation result
        StudyDatabaseBuildCompletedEvent.ValidationResultData eventValidationResult =
            StudyDatabaseBuildCompletedEvent.ValidationResultData.builder()
                .isValid(command.getValidationResult().isValid())
                .overallAssessment(command.getValidationResult().getOverallAssessment())
                .complianceStatus(command.getValidationResult().getComplianceStatus())
                .performanceScore(command.getValidationResult().getPerformanceScore())
                .build();
        
        // Apply completion event
        AggregateLifecycle.apply(StudyDatabaseBuildCompletedEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(this.studyId)
                .completedBy(command.getCompletedBy())
                .completedAt(LocalDateTime.now())
                .startedAt(this.startedAt)
                .validationResult(eventValidationResult)
                .formsConfigured(command.getFormsConfigured())
                .validationRulesSetup(command.getValidationRulesSetup())
                .buildMetrics(command.getBuildMetrics())
                .message("Database build completed successfully")
                .build());
        
        log.info("Study database build completion event applied for build ID: {}", 
                command.getStudyDatabaseBuildId());
    }

    /**
     * Command Handler: Cancel Study Database Build
     * 
     * Business Rules:
     * - Can only cancel builds in IN_PROGRESS status
     * - Cancellation reason must be provided for audit trail
     */
    @CommandHandler
    public void handle(CancelStudyDatabaseBuildCommand command) {
        log.info("Handling cancel study database build command for build ID: {}", 
                command.getStudyDatabaseBuildId());
        
        // Business rule: Can only cancel builds in progress
        if (status != StudyDatabaseBuildStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                String.format("Cannot cancel database build in status: %s. " +
                            "Build must be IN_PROGRESS.", status));
        }
        
        // Apply cancellation event
        AggregateLifecycle.apply(StudyDatabaseBuildCancelledEvent.builder()
                .studyDatabaseBuildId(command.getStudyDatabaseBuildId())
                .studyId(this.studyId)
                .cancelledBy(command.getRequestedBy())
                .cancelledAt(LocalDateTime.now())
                .cancellationReason(command.getCancellationReason())
                .build());
        
        log.info("Study database build cancellation event applied for build ID: {}", 
                command.getStudyDatabaseBuildId());
    }

    /**
     * Event Handler: Study Database Build Started
     * 
     * Updates aggregate state when build is started
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        this.studyDatabaseBuildId = event.getStudyDatabaseBuildId();
        this.studyId = event.getStudyId();
        this.studyName = event.getStudyName();
        this.studyProtocol = event.getStudyProtocol();
        this.status = StudyDatabaseBuildStatus.IN_PROGRESS;
        this.requestedBy = event.getRequestedBy();
        this.startedAt = event.getStartedAt();
        this.buildConfiguration = event.getBuildConfiguration();
        this.buildErrors = new ArrayList<>();
        this.formsConfigured = 0;
        this.validationRulesSetup = 0;
        
        log.debug("Aggregate state updated: Study database build started for study: {} with ID: {}", 
                event.getStudyId(), event.getStudyDatabaseBuildId());
    }

    /**
     * Event Handler: Study Database Build Completed
     * 
     * Updates aggregate state when build is completed successfully
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildCompletedEvent event) {
        this.status = StudyDatabaseBuildStatus.COMPLETED;
        this.completedAt = event.getCompletedAt();
        
        // Convert event validation result to command validation result type
        this.lastValidationResult = CompleteStudyDatabaseBuildCommand.ValidationResultData.builder()
                .isValid(event.getValidationResult().isValid())
                .overallAssessment(event.getValidationResult().getOverallAssessment())
                .complianceStatus(event.getValidationResult().getComplianceStatus())
                .performanceScore(event.getValidationResult().getPerformanceScore())
                .build();
        
        this.formsConfigured = event.getFormsConfigured();
        this.validationRulesSetup = event.getValidationRulesSetup();
        
        log.debug("Aggregate state updated: Study database build completed for study: {} at: {}", 
                event.getStudyId(), event.getCompletedAt());
    }

    /**
     * Event Handler: Study Database Build Failed
     * 
     * Updates aggregate state when build fails
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildFailedEvent event) {
        this.status = StudyDatabaseBuildStatus.FAILED;
        this.completedAt = event.getFailedAt();
        
        // Add error messages to build errors list
        if (event.getErrorMessage() != null) {
            this.buildErrors.add(event.getErrorMessage());
        }
        if (event.getValidationErrors() != null) {
            this.buildErrors.addAll(event.getValidationErrors());
        }
        
        log.debug("Aggregate state updated: Study database build failed for study: {} with error: {}", 
                event.getStudyId(), event.getErrorMessage());
    }

    /**
     * Event Handler: Study Database Build Cancelled
     * 
     * Updates aggregate state when build is cancelled
     */
    @EventSourcingHandler
    public void on(StudyDatabaseBuildCancelledEvent event) {
        this.status = StudyDatabaseBuildStatus.CANCELLED;
        this.completedAt = event.getCancelledAt();
        
        log.debug("Aggregate state updated: Study database build cancelled for study: {} reason: {}", 
                event.getStudyId(), event.getCancellationReason());
    }

    /**
     * Event Handler: Study Database Validation Completed
     * 
     * Updates aggregate state when validation completes
     */
    @EventSourcingHandler
    public void on(StudyDatabaseValidationCompletedEvent event) {
        // Convert event validation result to command validation result type
        this.lastValidationResult = CompleteStudyDatabaseBuildCommand.ValidationResultData.builder()
                .isValid(event.getValidationResult().isValid())
                .overallAssessment(event.getValidationResult().getOverallAssessment())
                .complianceStatus(event.getValidationResult().getComplianceStatus())
                .performanceScore(event.getValidationResult().getPerformanceScore())
                .build();
        
        log.debug("Aggregate state updated: Study database validation completed for study: {} valid: {}", 
                event.getStudyId(), event.getValidationResult().isValid());
    }

    /**
     * Validate business rules for build command
     */
    private void validateBuildCommand(BuildStudyDatabaseCommand command) {
        // Validate study ID
        if (command.getStudyId() == null || command.getStudyId() <= 0) {
            throw new IllegalArgumentException("Valid study ID is required");
        }
        
        // Validate study name
        if (command.getStudyName() == null || command.getStudyName().trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        
        // Validate study protocol
        if (command.getStudyProtocol() == null || command.getStudyProtocol().trim().isEmpty()) {
            throw new IllegalArgumentException("Study protocol is required");
        }
        
        // Validate form definitions presence
        if (!command.hasFormDefinitions()) {
            throw new IllegalArgumentException(
                "Form definitions are required in study design configuration");
        }
        
        // Validate validation rules presence
        if (!command.hasValidationRules()) {
            throw new IllegalArgumentException(
                "Validation rules are required for database build");
        }
        
        log.debug("Build command validation passed for study: {}", command.getStudyId());
    }
    
    /**
     * Study Database Build Status Enumeration
     * 
     * Defines the lifecycle states of a database build
     */
    public enum StudyDatabaseBuildStatus {
        IN_PROGRESS("In Progress", "Database build is currently running"),
        COMPLETED("Completed", "Database build completed successfully"),
        FAILED("Failed", "Database build failed with errors"),
        CANCELLED("Cancelled", "Database build was cancelled by user");
        
        private final String displayName;
        private final String description;
        
        StudyDatabaseBuildStatus(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }
        
        public String getDisplayName() { 
            return displayName; 
        }
        
        public String getDescription() { 
            return description; 
        }
    }
}



