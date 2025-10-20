package com.clinprecision.clinopsservice.studyoperation.visit.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.clinprecision.clinopsservice.studyoperation.visit.domain.commands.CreateVisitCommand;
import com.clinprecision.clinopsservice.studyoperation.visit.domain.events.VisitCreatedEvent;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Visit Aggregate - Core domain object for unscheduled visit management
 * 
 * PURPOSE:
 * Manages unscheduled visits created during the patient lifecycle:
 * - Screening visits (data collection for eligibility assessment)
 * - Enrollment visits (baseline data collection)
 * - Discontinuation visits (exit forms and reason capture)
 * - Adverse event visits (safety data collection)
 * 
 * ARCHITECTURE PATTERN (October 2025):
 * Status Change → (Optional) Visit Creation → Form Collection → Data Capture
 * 
 * This aggregate is separate from PatientAggregate to maintain:
 * - Single Responsibility Principle (visits are separate from patient state)
 * - Flexibility (multiple visits per patient, independent lifecycle)
 * - Audit Trail (visit creation is a separate auditable event)
 * 
 * Event Sourcing Benefits:
 * - Complete audit trail for regulatory compliance (GCP/FDA 21 CFR Part 11)
 * - Immutable visit history
 * - Time-travel capability for data queries
 */
@Aggregate
public class VisitAggregate {
    
    private static final Logger logger = LoggerFactory.getLogger(VisitAggregate.class);

    @AggregateIdentifier
    private UUID visitId;
    
    private Long patientId;
    private Long studyId;
    private Long siteId;
    private String visitType;
    private LocalDate visitDate;
    private String status;
    private Long createdBy;  // User ID who created the visit
    private LocalDateTime createdAt;
    private String notes;

    /**
     * Required no-arg constructor for Axon Framework
     */
    protected VisitAggregate() {
    }

    /**
     * Command handler for creating a new visit
     * 
     * @param command CreateVisitCommand containing visit details
     */
    @CommandHandler
    public VisitAggregate(CreateVisitCommand command) {
        logger.info("Creating visit aggregate for visitId: {}, patientId: {}, visitType: {}", 
                   command.getVisitId(), command.getPatientId(), command.getVisitType());
        
        // Business rule validation
        if (command.getVisitId() == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        if (command.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        if (command.getStudyId() == null) {
            throw new IllegalArgumentException("Study ID cannot be null");
        }
        if (command.getSiteId() == null) {
            throw new IllegalArgumentException("Site ID cannot be null");
        }
        if (command.getVisitType() == null || command.getVisitType().trim().isEmpty()) {
            throw new IllegalArgumentException("Visit type cannot be null or empty");
        }
        if (command.getVisitDate() == null) {
            throw new IllegalArgumentException("Visit date cannot be null");
        }
        
        // Emit domain event
        AggregateLifecycle.apply(new VisitCreatedEvent(
            command.getVisitId(),
            command.getPatientId(),
            command.getStudyId(),
            command.getSiteId(),
            command.getVisitType(),
            command.getVisitDate(),
            command.getStatus(),
            command.getCreatedBy(),
            command.getCreatedAt(),
            command.getNotes()
        ));
        
        logger.info("VisitCreatedEvent emitted for visitId: {}", command.getVisitId());
    }

    /**
     * Event sourcing handler for VisitCreatedEvent
     * Updates the aggregate state based on the event
     * 
     * @param event VisitCreatedEvent containing visit details
     */
    @EventSourcingHandler
    public void on(VisitCreatedEvent event) {
        logger.debug("Handling VisitCreatedEvent for visitId: {}", event.getVisitId());
        
        this.visitId = event.getVisitId();
        this.patientId = event.getPatientId();
        this.studyId = event.getStudyId();
        this.siteId = event.getSiteId();
        this.visitType = event.getVisitType();
        this.visitDate = event.getVisitDate();
        this.status = event.getStatus();
        this.createdBy = event.getCreatedBy();
        this.createdAt = event.getCreatedAt();
        this.notes = event.getNotes();
        
        logger.debug("Visit aggregate state updated for visitId: {}", visitId);
    }

    /**
     * Command handler for updating visit status
     * 
     * @param command UpdateVisitStatusCommand containing new status and user ID
     */
    @CommandHandler
    public void handle(com.clinprecision.clinopsservice.studyoperation.visit.domain.commands.UpdateVisitStatusCommand command) {
        logger.info("Updating visit status for visitId: {}, oldStatus: {}, newStatus: {}", 
                   this.visitId, this.status, command.getNewStatus());
        
        // Business rule validation
        if (command.getNewStatus() == null || command.getNewStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("New status cannot be null or empty");
        }
        if (command.getUpdatedBy() == null) {
            throw new IllegalArgumentException("UpdatedBy user ID cannot be null");
        }
        
        // Don't allow status update if already the same
        if (this.status != null && this.status.equals(command.getNewStatus())) {
            logger.warn("Visit status is already {}, skipping update", this.status);
            return;
        }
        
        // Emit domain event
        AggregateLifecycle.apply(new com.clinprecision.clinopsservice.studyoperation.visit.domain.events.VisitStatusChangedEvent(
            command.getAggregateUuid(),
            this.status, // old status
            command.getNewStatus(),
            command.getUpdatedBy(),
            command.getNotes(),
            System.currentTimeMillis()
        ));
        
        logger.info("VisitStatusChangedEvent emitted for visitId: {}", this.visitId);
    }

    /**
     * Event sourcing handler for VisitStatusChangedEvent
     * Updates the aggregate state based on the event
     * 
     * @param event VisitStatusChangedEvent containing status change details
     */
    @EventSourcingHandler
    public void on(com.clinprecision.clinopsservice.studyoperation.visit.domain.events.VisitStatusChangedEvent event) {
        logger.debug("Handling VisitStatusChangedEvent for visitId: {}, oldStatus: {}, newStatus: {}", 
                    this.visitId, event.getOldStatus(), event.getNewStatus());
        
        this.status = event.getNewStatus();
        
        logger.debug("Visit aggregate status updated to: {}", this.status);
    }

    // Getters for aggregate state (used in business logic methods)
    public UUID getVisitId() {
        return visitId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public Long getStudyId() {
        return studyId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public String getVisitType() {
        return visitType;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public String getStatus() {
        return status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getNotes() {
        return notes;
    }
}
