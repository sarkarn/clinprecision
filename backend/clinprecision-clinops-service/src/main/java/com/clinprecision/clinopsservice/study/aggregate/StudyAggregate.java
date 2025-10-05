package com.clinprecision.clinopsservice.study.aggregate;

import com.clinprecision.clinopsservice.study.command.*;
import com.clinprecision.clinopsservice.study.domain.valueobjects.StudyStatusCode;
import com.clinprecision.clinopsservice.study.event.*;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Study Aggregate - DDD Aggregate Root
 * Manages the complete lifecycle of a clinical study
 * 
 * Responsibilities:
 * - Enforce business rules and invariants
 * - Validate state transitions
 * - Emit domain events for state changes
 * - Rebuild state from event history
 * 
 * State Management:
 * - All state changes must go through events
 * - State is rebuilt from events via @EventSourcingHandler
 * - No direct state mutation outside of event handlers
 */
@Aggregate
public class StudyAggregate {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyAggregate.class);
    
    @AggregateIdentifier
    private UUID studyAggregateUuid;
    
    // Core study state (rebuilt from events)
    private String name;
    private String protocolNumber;
    private String sponsor;
    private StudyStatusCode status;
    private String version;
    private boolean isLatestVersion;
    private boolean isLocked;
    
    // Timeline
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Required for Axon Framework
    protected StudyAggregate() {
    }
    
    // ==================== COMMAND HANDLERS ====================
    
    /**
     * Constructor command handler - Creates new study aggregate
     * 
     * Business Rules:
     * - Name must not be null or empty
     * - Initial status is PLANNING
     * - New studies are never locked
     * - Initial version is "1.0"
     */
    @CommandHandler
    public StudyAggregate(CreateStudyCommand command) {
        logger.info("Creating new StudyAggregate: {}", command.getName());
        
        // Validate command
        validateCreateCommand(command);
        
        // Apply event - Axon will call @EventSourcingHandler to set state
        AggregateLifecycle.apply(
            StudyCreatedEvent.builder()
                .studyAggregateUuid(command.getStudyAggregateUuid())
                .name(command.getName())
                .description(command.getDescription())
                .sponsor(command.getSponsor())
                .protocolNumber(command.getProtocolNumber())
                .indication(command.getIndication())
                .studyType(command.getStudyType() != null ? command.getStudyType() : "INTERVENTIONAL")
                .principalInvestigator(command.getPrincipalInvestigator())
                .studyCoordinator(command.getStudyCoordinator())
                .therapeuticArea(command.getTherapeuticArea())
                .plannedSubjects(command.getPlannedSubjects() != null ? command.getPlannedSubjects() : 0)
                .targetEnrollment(command.getTargetEnrollment() != null ? command.getTargetEnrollment() : 0)
                .primaryObjective(command.getPrimaryObjective())
                .primaryEndpoint(command.getPrimaryEndpoint())
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .estimatedCompletion(command.getEstimatedCompletion())
                .initialStatus(StudyStatusCode.PLANNING)
                .studyStatusId(command.getStudyStatusId())
                .regulatoryStatusId(command.getRegulatoryStatusId())
                .studyPhaseId(command.getStudyPhaseId())
                .version("1.0")
                .isLatestVersion(true)
                .isLocked(false)
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyCreatedEvent emitted for: {}", command.getName());
    }
    
    /**
     * Update study details
     * 
     * Business Rules:
     * - Study must not be locked
     * - Study must be in a status that allows modifications
     * - Terminal states (COMPLETED, TERMINATED, WITHDRAWN) cannot be modified
     */
    @CommandHandler
    public void handle(UpdateStudyCommand command) {
        logger.info("Handling UpdateStudyCommand for aggregate: {}", studyAggregateUuid);
        
        // Validate business rules
        if (isLocked) {
            throw new IllegalStateException(
                String.format("Cannot update study %s: study is locked", studyAggregateUuid)
            );
        }
        
        if (status.isTerminal()) {
            throw new IllegalStateException(
                String.format("Cannot update study %s: study is in terminal state %s", 
                    studyAggregateUuid, status)
            );
        }
        
        if (!status.allowsModifications()) {
            logger.warn("Updating study in status {} - some restrictions may apply", status);
        }
        
        // Apply event
        AggregateLifecycle.apply(
            StudyUpdatedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .name(command.getName())
                .description(command.getDescription())
                .sponsor(command.getSponsor())
                .protocolNumber(command.getProtocolNumber())
                .indication(command.getIndication())
                .studyType(command.getStudyType())
                .principalInvestigator(command.getPrincipalInvestigator())
                .studyCoordinator(command.getStudyCoordinator())
                .therapeuticArea(command.getTherapeuticArea())
                .plannedSubjects(command.getPlannedSubjects())
                .targetEnrollment(command.getTargetEnrollment())
                .primaryObjective(command.getPrimaryObjective())
                .primaryEndpoint(command.getPrimaryEndpoint())
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .estimatedCompletion(command.getEstimatedCompletion())
                .studyPhaseId(command.getStudyPhaseId())
                .regulatoryStatusId(command.getRegulatoryStatusId())
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyUpdatedEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    /**
     * Change study status
     * 
     * Business Rules:
     * - Status transition must be valid according to state machine
     * - Cannot transition from terminal states
     * - Cross-entity dependencies validated externally (in service layer)
     */
    @CommandHandler
    public void handle(ChangeStudyStatusCommand command) {
        logger.info("Handling ChangeStudyStatusCommand: {} -> {}", 
            status, command.getNewStatus());
        
        // Validate status transition
        if (!status.canTransitionTo(command.getNewStatus())) {
            throw new IllegalStateException(
                String.format("Invalid status transition: %s -> %s for study %s",
                    status, command.getNewStatus(), studyAggregateUuid)
            );
        }
        
        // Apply event
        AggregateLifecycle.apply(
            StudyStatusChangedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .oldStatus(status)
                .newStatus(command.getNewStatus())
                .newStudyStatusId(null) // Will be set by projection
                .reason(command.getReason())
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyStatusChangedEvent emitted: {} -> {}", status, command.getNewStatus());
    }
    
    /**
     * Suspend an active study
     * 
     * Business Rules:
     * - Study must be in ACTIVE status
     * - Reason is required
     */
    @CommandHandler
    public void handle(SuspendStudyCommand command) {
        logger.info("Handling SuspendStudyCommand for aggregate: {}", studyAggregateUuid);
        
        if (status != StudyStatusCode.ACTIVE) {
            throw new IllegalStateException(
                String.format("Cannot suspend study %s: current status is %s (must be ACTIVE)",
                    studyAggregateUuid, status)
            );
        }
        
        if (command.getReason() == null || command.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Suspension reason is required");
        }
        
        AggregateLifecycle.apply(
            StudySuspendedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .reason(command.getReason())
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudySuspendedEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    /**
     * Resume a suspended study
     * 
     * Business Rules:
     * - Study must be in SUSPENDED status
     */
    @CommandHandler
    public void handle(ResumeStudyCommand command) {
        logger.info("Handling ResumeStudyCommand for aggregate: {}", studyAggregateUuid);
        
        if (status != StudyStatusCode.SUSPENDED) {
            throw new IllegalStateException(
                String.format("Cannot resume study %s: current status is %s (must be SUSPENDED)",
                    studyAggregateUuid, status)
            );
        }
        
        AggregateLifecycle.apply(
            StudyResumedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyResumedEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    /**
     * Complete a study
     * 
     * Business Rules:
     * - Study must be in ACTIVE status
     * - Completion date required
     * - Terminal state - no further modifications allowed
     */
    @CommandHandler
    public void handle(CompleteStudyCommand command) {
        logger.info("Handling CompleteStudyCommand for aggregate: {}", studyAggregateUuid);
        
        if (status != StudyStatusCode.ACTIVE) {
            throw new IllegalStateException(
                String.format("Cannot complete study %s: current status is %s (must be ACTIVE)",
                    studyAggregateUuid, status)
            );
        }
        
        LocalDate completionDate = command.getCompletionDate() != null 
            ? command.getCompletionDate() 
            : LocalDate.now();
        
        AggregateLifecycle.apply(
            StudyCompletedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .completionDate(completionDate)
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyCompletedEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    /**
     * Terminate a study
     * 
     * Business Rules:
     * - Study can be in ACTIVE or SUSPENDED status
     * - Reason is required
     * - Terminal state - no further modifications allowed
     */
    @CommandHandler
    public void handle(TerminateStudyCommand command) {
        logger.info("Handling TerminateStudyCommand for aggregate: {}", studyAggregateUuid);
        
        if (status != StudyStatusCode.ACTIVE && status != StudyStatusCode.SUSPENDED) {
            throw new IllegalStateException(
                String.format("Cannot terminate study %s: current status is %s (must be ACTIVE or SUSPENDED)",
                    studyAggregateUuid, status)
            );
        }
        
        if (command.getReason() == null || command.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Termination reason is required");
        }
        
        AggregateLifecycle.apply(
            StudyTerminatedEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .reason(command.getReason())
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyTerminatedEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    /**
     * Withdraw a study
     * 
     * Business Rules:
     * - Study can be withdrawn from most states (before ACTIVE)
     * - Reason is required
     * - Terminal state - no further modifications allowed
     */
    @CommandHandler
    public void handle(WithdrawStudyCommand command) {
        logger.info("Handling WithdrawStudyCommand for aggregate: {}", studyAggregateUuid);
        
        if (!status.canTransitionTo(StudyStatusCode.WITHDRAWN)) {
            throw new IllegalStateException(
                String.format("Cannot withdraw study %s: current status is %s",
                    studyAggregateUuid, status)
            );
        }
        
        if (command.getReason() == null || command.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Withdrawal reason is required");
        }
        
        AggregateLifecycle.apply(
            StudyWithdrawnEvent.builder()
                .studyAggregateUuid(studyAggregateUuid)
                .reason(command.getReason())
                .userId(command.getUserId())
                .userName(command.getUserName())
                .timestamp(Instant.now())
                .build()
        );
        
        logger.info("StudyWithdrawnEvent emitted for aggregate: {}", studyAggregateUuid);
    }
    
    // ==================== EVENT SOURCING HANDLERS ====================
    
    /**
     * Event sourcing handler for StudyCreatedEvent
     * Initializes aggregate state from creation event
     */
    @EventSourcingHandler
    public void on(StudyCreatedEvent event) {
        logger.debug("Applying StudyCreatedEvent to aggregate state");
        this.studyAggregateUuid = event.getStudyAggregateUuid();
        this.name = event.getName();
        this.protocolNumber = event.getProtocolNumber();
        this.sponsor = event.getSponsor();
        this.status = event.getInitialStatus();
        this.version = event.getVersion();
        this.isLatestVersion = event.getIsLatestVersion();
        this.isLocked = event.getIsLocked();
        this.startDate = event.getStartDate();
        this.endDate = event.getEndDate();
    }
    
    /**
     * Event sourcing handler for StudyUpdatedEvent
     * Updates aggregate state with changed fields
     */
    @EventSourcingHandler
    public void on(StudyUpdatedEvent event) {
        logger.debug("Applying StudyUpdatedEvent to aggregate state");
        // Only update fields that are not null (partial updates)
        if (event.getName() != null) this.name = event.getName();
        if (event.getProtocolNumber() != null) this.protocolNumber = event.getProtocolNumber();
        if (event.getSponsor() != null) this.sponsor = event.getSponsor();
        if (event.getStartDate() != null) this.startDate = event.getStartDate();
        if (event.getEndDate() != null) this.endDate = event.getEndDate();
    }
    
    /**
     * Event sourcing handler for StudyStatusChangedEvent
     * Updates aggregate status
     */
    @EventSourcingHandler
    public void on(StudyStatusChangedEvent event) {
        logger.debug("Applying StudyStatusChangedEvent: {} -> {}", 
            event.getOldStatus(), event.getNewStatus());
        this.status = event.getNewStatus();
    }
    
    /**
     * Event sourcing handler for StudySuspendedEvent
     */
    @EventSourcingHandler
    public void on(StudySuspendedEvent event) {
        logger.debug("Applying StudySuspendedEvent to aggregate state");
        this.status = StudyStatusCode.SUSPENDED;
    }
    
    /**
     * Event sourcing handler for StudyResumedEvent
     */
    @EventSourcingHandler
    public void on(StudyResumedEvent event) {
        logger.debug("Applying StudyResumedEvent to aggregate state");
        this.status = StudyStatusCode.ACTIVE;
    }
    
    /**
     * Event sourcing handler for StudyCompletedEvent
     */
    @EventSourcingHandler
    public void on(StudyCompletedEvent event) {
        logger.debug("Applying StudyCompletedEvent to aggregate state");
        this.status = StudyStatusCode.COMPLETED;
        this.isLocked = true; // Lock study upon completion
        if (event.getCompletionDate() != null) {
            this.endDate = event.getCompletionDate();
        }
    }
    
    /**
     * Event sourcing handler for StudyTerminatedEvent
     */
    @EventSourcingHandler
    public void on(StudyTerminatedEvent event) {
        logger.debug("Applying StudyTerminatedEvent to aggregate state");
        this.status = StudyStatusCode.TERMINATED;
        this.isLocked = true; // Lock study upon termination
    }
    
    /**
     * Event sourcing handler for StudyWithdrawnEvent
     */
    @EventSourcingHandler
    public void on(StudyWithdrawnEvent event) {
        logger.debug("Applying StudyWithdrawnEvent to aggregate state");
        this.status = StudyStatusCode.WITHDRAWN;
        this.isLocked = true; // Lock study upon withdrawal
    }
    
    // ==================== VALIDATION METHODS ====================
    
    /**
     * Validate CreateStudyCommand
     */
    private void validateCreateCommand(CreateStudyCommand command) {
        if (command.getName() == null || command.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        
        if (command.getStudyAggregateUuid() == null) {
            throw new IllegalArgumentException("Study aggregate UUID is required");
        }
    }
    
    // ==================== GETTERS ====================
    
    public UUID getStudyAggregateUuid() {
        return studyAggregateUuid;
    }
    
    public String getName() {
        return name;
    }
    
    public StudyStatusCode getStatus() {
        return status;
    }
    
    public boolean isLocked() {
        return isLocked;
    }
}
