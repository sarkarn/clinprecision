package com.clinprecision.clinopsservice.studydesign.protocolmgmt.aggregate;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.events.*;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;


/**
 * Protocol Version Aggregate - Core business logic for protocol version lifecycle
 * 
 * REPLACES DATABASE TRIGGERS with explicit command handling and event sourcing.
 * All status changes are now explicit commands with full audit trail via events.
 * 
 * Business Rules:
 * 1. Version lifecycle: DRAFT → UNDER_REVIEW → SUBMITTED → APPROVED → ACTIVE
 * 2. Only one version can be ACTIVE per study at a time
 * 3. Activating a version supersedes the previous active version
 * 4. Versions can only be edited in DRAFT or UNDER_REVIEW status
 * 5. Status transitions follow VersionStatus.canTransitionTo() rules
 * 6. Major and Safety amendments require regulatory approval
 * 7. Withdrawal/Supersession are terminal states
 * 
 * Event Sourcing Benefits:
 * - Complete audit trail of all version changes
 * - Time-travel debugging (rebuild state from events)
 * - Business logic testable without database
 * - No hidden trigger logic in database
 */
@Aggregate
@NoArgsConstructor
@Slf4j
public class ProtocolVersionAggregate {

    @AggregateIdentifier
    private UUID versionId;
    
    private UUID studyAggregateUuid;
    private String versionNumber;
    private VersionStatus status;
    private AmendmentType amendmentType;
    private String description;
    private String changesSummary;
    private String impactAssessment;
    private Boolean requiresRegulatoryApproval;
    private LocalDate submissionDate;
    private LocalDate approvalDate;
    private LocalDate effectiveDate;
    private String notes;
    private String protocolChanges;
    private String icfChanges;
    private Long approvedBy;
    private String approvalComments;
    private UUID previousActiveVersionUuid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Command Handler: Create Protocol Version
     * 
     * Initial status is always DRAFT per business rules.
     * Validates amendment type requirements for regulatory approval.
     */
    @CommandHandler
    public ProtocolVersionAggregate(CreateProtocolVersionCommand command) {
        log.info("Handling CreateProtocolVersionCommand for version: {}", command.getVersionNumber());
        
        // Validation: Amendment reason required if amendment type specified
        if (command.getAmendmentType() != null && 
            (command.getChangesSummary() == null || command.getChangesSummary().trim().isEmpty())) {
            throw new IllegalArgumentException(
                "Amendment reason (changesSummary) is required when amendment type is specified"
            );
        }
        
        // Validation: Major and Safety amendments must require regulatory approval
        if (command.getAmendmentType() != null && 
            command.getAmendmentType().requiresRegulatoryApproval() &&
            !Boolean.TRUE.equals(command.getRequiresRegulatoryApproval())) {
            throw new IllegalArgumentException(
                String.format("Amendment type %s requires regulatory approval flag to be true", 
                    command.getAmendmentType())
            );
        }
        
        // Apply event
        AggregateLifecycle.apply(
            ProtocolVersionCreatedEvent.from(
                command.getVersionId(),
                command.getStudyAggregateUuid(),
                command.getStudyId(),
                command.getVersionNumber(),
                command.getDescription(),
                command.getAmendmentType(),
                command.getAmendmentReason(),
                command.getChangesSummary(),
                command.getImpactAssessment(),
                command.getPreviousVersionUuid(),
                command.getRequiresRegulatoryApproval(),
                command.getSubmissionDate(),
                command.getNotes(),
                command.getNotifyStakeholders(),
                command.getAdditionalNotes(),
                command.getProtocolChanges(),
                command.getIcfChanges(),
                command.getCreatedBy()
            )
        );
        
        log.info("ProtocolVersionCreatedEvent applied for version: {}", command.getVersionNumber());
    }

    /**
     * Command Handler: Change Version Status
     * 
     * REPLACES DATABASE TRIGGERS!
     * Validates status transitions and emits event with complete audit trail.
     * 
     * Business Rules:
     * - Status transitions follow VersionStatus.canTransitionTo() rules
     * - Terminal states (SUPERSEDED, WITHDRAWN) cannot be changed
     * - Reason required for all status changes
     */
    @CommandHandler
    public void handle(ChangeVersionStatusCommand command) {
        log.info("Handling ChangeVersionStatusCommand: {} -> {}", 
            this.status, command.getNewStatus());
        
        // Validation: Cannot change from terminal states
        if (this.status.isTerminal()) {
            throw new IllegalStateException(
                String.format("Cannot change status from terminal state: %s", this.status)
            );
        }
        
        // Validation: Check if transition is allowed
        if (!this.status.canTransitionTo(command.getNewStatus())) {
            throw new IllegalStateException(
                String.format("Invalid status transition from %s to %s. Valid transitions: %s",
                    this.status, 
                    command.getNewStatus(),
                    this.status.getValidNextStatuses())
            );
        }
        
        // Validation: Reason required
        if (command.getReason() == null || command.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Status change reason is required");
        }
        
        // Apply event - AUDIT TRAIL!
        AggregateLifecycle.apply(
            VersionStatusChangedEvent.from(
                command.getVersionId(),
                this.status,
                command.getNewStatus(),
                command.getReason(),
                command.getUserId()
            )
        );
        
        log.info("VersionStatusChangedEvent applied: {} -> {}", this.status, command.getNewStatus());
    }

    /**
     * Command Handler: Approve Version
     * 
     * Handles regulatory and internal approvals.
     * Automatically transitions status to APPROVED.
     * 
     * Business Rules:
     * - Effective date cannot be in the past
     * - Approver information required
     * - Can only approve versions in SUBMITTED status
     */
    @CommandHandler
    public void handle(ApproveVersionCommand command) {
        log.info("Handling ApproveVersionCommand for version: {}", this.versionNumber);
        
        // Validation: Can only approve submitted versions
        if (this.status != VersionStatus.SUBMITTED) {
            throw new IllegalStateException(
                String.format("Can only approve versions in SUBMITTED status. Current status: %s", 
                    this.status)
            );
        }
        
        // Validation: Effective date cannot be in past
        if (command.getEffectiveDate() != null && 
            command.getEffectiveDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Effective date cannot be in the past"
            );
        }
        
        // Apply approval event
        AggregateLifecycle.apply(
            VersionApprovedEvent.from(
                command.getVersionId(),
                command.getApprovedBy(),
                command.getApprovedDate(),
                command.getEffectiveDate(),
                command.getApprovalComments()
            )
        );
        
        // Apply status change event (SUBMITTED -> APPROVED)
        AggregateLifecycle.apply(
            VersionStatusChangedEvent.from(
                command.getVersionId(),
                this.status,
                VersionStatus.APPROVED,
                "Version approved" + 
                    (command.getApprovalComments() != null ? ": " + command.getApprovalComments() : ""),
                command.getApprovedBy()
            )
        );
        
        log.info("Version approved: {}", this.versionNumber);
    }

    /**
     * Command Handler: Activate Version
     * 
     * Makes version active and supersedes previous active version.
     * CRITICAL: Only one version can be active per study at a time.
     * 
     * Business Rules:
     * - Can only activate APPROVED versions
     * - Previous active version is automatically superseded
     * - Activation reason required
     */
    @CommandHandler
    public void handle(ActivateVersionCommand command) {
        log.info("Handling ActivateVersionCommand for version: {}", this.versionNumber);
        
        // Validation: Can only activate approved versions
        if (this.status != VersionStatus.APPROVED) {
            throw new IllegalStateException(
                String.format("Can only activate versions in APPROVED status. Current status: %s", 
                    this.status)
            );
        }
        
        // Validation: Activation reason required
        if (command.getActivationReason() == null || command.getActivationReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Activation reason is required");
        }
        
        // Apply activation event
        AggregateLifecycle.apply(
            VersionActivatedEvent.from(
                command.getVersionId(),
                command.getPreviousActiveVersionUuid(),
                command.getActivationReason(),
                command.getActivatedBy()
            )
        );
        
        // Apply status change event (APPROVED -> ACTIVE)
        AggregateLifecycle.apply(
            VersionStatusChangedEvent.from(
                command.getVersionId(),
                this.status,
                VersionStatus.ACTIVE,
                "Version activated: " + command.getActivationReason(),
                command.getActivatedBy()
            )
        );
        
        log.info("Version activated: {}", this.versionNumber);
        
        // NOTE: The supersession of previous active version is handled by the application service
        // which sends a separate ChangeVersionStatusCommand for the previous version
    }

    /**
     * Command Handler: Update Version Details
     * 
     * Updates editable fields of the version.
     * 
     * Business Rules:
     * - Can only update versions in DRAFT or UNDER_REVIEW status
     * - At least one field must be provided
     * - Cannot update approved or active versions
     */
    @CommandHandler
    public void handle(UpdateVersionDetailsCommand command) {
        log.info("Handling UpdateVersionDetailsCommand for version: {}", this.versionNumber);
        
        // Validation: Can only update editable versions
        if (!this.status.isEditable()) {
            throw new IllegalStateException(
                String.format("Cannot update version in status: %s. Only DRAFT and UNDER_REVIEW versions can be edited.",
                    this.status)
            );
        }
        
        // Validation: At least one field required
        if (command.getDescription() == null &&
            command.getChangesSummary() == null &&
            command.getImpactAssessment() == null &&
            command.getNotes() == null &&
            command.getProtocolChanges() == null &&
            command.getIcfChanges() == null) {
            throw new IllegalArgumentException(
                "At least one field must be provided for update"
            );
        }
        
        // Apply update event
        AggregateLifecycle.apply(
            VersionDetailsUpdatedEvent.from(
                command.getVersionId(),
                command.getDescription(),
                command.getChangesSummary(),
                command.getImpactAssessment(),
                command.getAdditionalNotes(),
                command.getProtocolChanges(),
                command.getIcfChanges(),
                command.getUpdatedBy()
            )
        );
        
        log.info("Version details updated: {}", this.versionNumber);
    }

    /**
     * Command Handler: Withdraw Version
     * 
     * Withdraws/cancels a version. Terminal state.
     * 
     * Business Rules:
     * - Cannot withdraw versions in terminal states
     * - Cannot withdraw ACTIVE versions (must supersede instead)
     * - Detailed withdrawal reason required (min 10 characters)
     */
    @CommandHandler
    public void handle(WithdrawVersionCommand command) {
        log.info("Handling WithdrawVersionCommand for version: {}", this.versionNumber);
        
        // Validation: Cannot withdraw from terminal states
        if (this.status.isTerminal()) {
            throw new IllegalStateException(
                String.format("Cannot withdraw version already in terminal state: %s", this.status)
            );
        }
        
        // Validation: Cannot directly withdraw ACTIVE versions
        if (this.status == VersionStatus.ACTIVE) {
            throw new IllegalStateException(
                "Cannot withdraw ACTIVE version directly. Use supersession by activating a new version."
            );
        }
        
        // Validation: Detailed reason required
        if (command.getWithdrawalReason() == null || 
            command.getWithdrawalReason().trim().length() < 10) {
            throw new IllegalArgumentException(
                "Withdrawal reason is required and must be at least 10 characters"
            );
        }
        
        // Apply withdrawal event
        AggregateLifecycle.apply(
            VersionWithdrawnEvent.from(
                command.getVersionId(),
                command.getWithdrawalReason(),
                command.getWithdrawnBy()
            )
        );
        
        // Apply status change event (current -> WITHDRAWN)
        AggregateLifecycle.apply(
            VersionStatusChangedEvent.from(
                command.getVersionId(),
                this.status,
                VersionStatus.WITHDRAWN,
                "Version withdrawn: " + command.getWithdrawalReason(),
                command.getWithdrawnBy()
            )
        );
        
        log.info("Version withdrawn: {}", this.versionNumber);
    }

    // ==================== EVENT SOURCING HANDLERS ====================
    // These methods rebuild aggregate state from events
    
    @EventSourcingHandler
    public void on(ProtocolVersionCreatedEvent event) {
        this.versionId = event.getVersionId();
        this.studyAggregateUuid = event.getStudyAggregateUuid();
        this.versionNumber = event.getVersionNumber().getValue();
        this.status = event.getInitialStatus();
        this.amendmentType = event.getAmendmentType();
        this.description = event.getDescription();
        this.changesSummary = event.getChangesSummary();
        this.impactAssessment = event.getImpactAssessment();
        this.requiresRegulatoryApproval = event.getRequiresRegulatoryApproval();
        this.submissionDate = null; // Not in event
        this.notes = event.getAdditionalNotes();
        this.protocolChanges = event.getProtocolChanges();
        this.icfChanges = event.getIcfChanges();
        this.createdAt = event.getOccurredAt();
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate state initialized from ProtocolVersionCreatedEvent");
    }

    @EventSourcingHandler
    public void on(VersionStatusChangedEvent event) {
        this.status = event.getNewStatus();
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate status updated: {} -> {}", event.getOldStatus(), event.getNewStatus());
    }

    @EventSourcingHandler
    public void on(VersionApprovedEvent event) {
        this.approvedBy = event.getApprovedBy();
        this.approvalDate = event.getApprovedDate().toLocalDate();
        this.effectiveDate = event.getEffectiveDate();
        this.approvalComments = event.getApprovalComments();
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate approval details set");
    }

    @EventSourcingHandler
    public void on(VersionActivatedEvent event) {
        this.previousActiveVersionUuid = event.getPreviousActiveVersionUuid();
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate activated, previous version: {}", event.getPreviousActiveVersionUuid());
    }

    @EventSourcingHandler
    public void on(VersionDetailsUpdatedEvent event) {
        if (event.getDescription() != null) {
            this.description = event.getDescription();
        }
        if (event.getChangesSummary() != null) {
            this.changesSummary = event.getChangesSummary();
        }
        if (event.getImpactAssessment() != null) {
            this.impactAssessment = event.getImpactAssessment();
        }
        if (event.getAdditionalNotes() != null) {
            this.notes = event.getAdditionalNotes();
        }
        if (event.getProtocolChanges() != null) {
            this.protocolChanges = event.getProtocolChanges();
        }
        if (event.getIcfChanges() != null) {
            this.icfChanges = event.getIcfChanges();
        }
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate details updated");
    }

    @EventSourcingHandler
    public void on(VersionWithdrawnEvent event) {
        // Withdrawal reason stored in event, not in aggregate state
        this.updatedAt = event.getOccurredAt();
        
        log.debug("Aggregate marked as withdrawn");
    }
}



