package com.clinprecision.clinopsservice.studydesign.aggregate;

import com.clinprecision.clinopsservice.studydesign.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.domain.events.*;
import com.clinprecision.clinopsservice.studydesign.domain.model.FormAssignment;
import com.clinprecision.clinopsservice.studydesign.domain.model.StudyArm;
import com.clinprecision.clinopsservice.studydesign.domain.model.Visit;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitWindow;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * StudyDesign Aggregate Root managing study arms, visits, and form assignments
 * Enforces business rules for study design integrity
 */
@Aggregate
@NoArgsConstructor
@Slf4j
public class StudyDesignAggregate {

    @AggregateIdentifier
    private UUID studyDesignId;
    
    private UUID studyAggregateUuid;
    private Map<UUID, StudyArm> arms = new HashMap<>();
    private Map<UUID, Visit> visits = new HashMap<>();
    private Map<UUID, FormAssignment> formAssignments = new HashMap<>();

    // ===================== COMMAND HANDLERS =====================

    @CommandHandler
    public StudyDesignAggregate(InitializeStudyDesignCommand command) {
        log.info("Initializing StudyDesign: {} for Study: {}", 
            command.getStudyDesignId(), command.getStudyAggregateUuid());
        
        AggregateLifecycle.apply(StudyDesignInitializedEvent.from(
            command.getStudyDesignId(),
            command.getStudyAggregateUuid(),
            command.getStudyName(),
            command.getCreatedBy()
        ));
    }

    @CommandHandler
    public void handle(AddStudyArmCommand command) {
        log.info("Adding arm: {} to study design: {}", command.getName(), studyDesignId);
        
        // Business Rule: Unique arm names
        boolean nameExists = arms.values().stream()
            .anyMatch(arm -> arm.getName().equalsIgnoreCase(command.getName()));
        if (nameExists) {
            throw new IllegalStateException(
                String.format("Arm with name '%s' already exists", command.getName())
            );
        }
        
        // Business Rule: Unique sequence numbers
        boolean sequenceExists = arms.values().stream()
            .anyMatch(arm -> Integer.valueOf(arm.getSequenceNumber()).equals(command.getSequenceNumber()));
        if (sequenceExists) {
            throw new IllegalStateException(
                String.format("Arm with sequence number %d already exists", command.getSequenceNumber())
            );
        }
        
        AggregateLifecycle.apply(StudyArmAddedEvent.from(
            studyDesignId,
            command.getArmId(),
            command.getName(),
            command.getDescription(),
            command.getType(),
            command.getSequenceNumber(),
            command.getPlannedSubjects(),
            command.getAddedBy()
        ));
    }

    @CommandHandler
    public void handle(UpdateStudyArmCommand command) {
        log.info("Updating arm: {} in study design: {}", command.getArmId(), studyDesignId);
        
        // Business Rule: Arm must exist
        if (!arms.containsKey(command.getArmId())) {
            throw new IllegalStateException(
                String.format("Arm with ID %s does not exist", command.getArmId())
            );
        }
        
        // Business Rule: Unique arm names (excluding current arm)
        boolean nameExists = arms.values().stream()
            .filter(arm -> !arm.getArmId().equals(command.getArmId()))
            .anyMatch(arm -> arm.getName().equalsIgnoreCase(command.getName()));
        if (nameExists) {
            throw new IllegalStateException(
                String.format("Another arm with name '%s' already exists", command.getName())
            );
        }
        
        AggregateLifecycle.apply(StudyArmUpdatedEvent.from(
            studyDesignId,
            command.getArmId(),
            command.getName(),
            command.getDescription(),
            command.getPlannedSubjects(),
            command.getUpdatedBy()
        ));
    }

    @CommandHandler
    public void handle(RemoveStudyArmCommand command) {
        log.info("Removing arm: {} from study design: {}", command.getArmId(), studyDesignId);
        
        // Business Rule: Arm must exist
        if (!arms.containsKey(command.getArmId())) {
            throw new IllegalStateException(
                String.format("Arm with ID %s does not exist", command.getArmId())
            );
        }
        
        // Business Rule: Cannot remove arm if it has arm-specific visits
        boolean hasArmVisits = visits.values().stream()
            .anyMatch(visit -> command.getArmId().equals(visit.getArmId()));
        if (hasArmVisits) {
            throw new IllegalStateException(
                String.format("Cannot remove arm %s - it has arm-specific visits. Remove those visits first.", 
                    command.getArmId())
            );
        }
        
        AggregateLifecycle.apply(StudyArmRemovedEvent.from(
            studyDesignId,
            command.getArmId(),
            command.getReason(),
            command.getRemovedBy()
        ));
    }

    @CommandHandler
    public void handle(DefineVisitCommand command) {
        log.info("Defining visit: {} at timepoint {} in study design: {}", 
            command.getName(), command.getTimepoint(), studyDesignId);
        
        int resolvedSequenceNumber = command.getSequenceNumber() != null
            ? command.getSequenceNumber()
            : determineNextVisitSequence(command.getArmId());

        // Business Rule: If armId is specified, arm must exist
        if (command.getArmId() != null && !arms.containsKey(command.getArmId())) {
            throw new IllegalStateException(
                String.format("Arm with ID %s does not exist", command.getArmId())
            );
        }
        
        // Business Rule: Unique visit names within same scope (arm-specific or general)
        boolean nameExists = visits.values().stream()
            .filter(v -> Objects.equals(v.getArmId(), command.getArmId()))
            .anyMatch(v -> v.getName().equalsIgnoreCase(command.getName()));
        if (nameExists) {
            throw new IllegalStateException(
                String.format("Visit with name '%s' already exists in this scope", command.getName())
            );
        }
        
        // Business Rule: Unique sequence numbers within same scope
        boolean sequenceExists = visits.values().stream()
            .filter(v -> Objects.equals(v.getArmId(), command.getArmId()))
            .anyMatch(v -> v.getSequenceNumber() == resolvedSequenceNumber);
        if (sequenceExists) {
            throw new IllegalStateException(
                String.format("Visit with sequence number %d already exists in this scope", 
                    resolvedSequenceNumber)
            );
        }
        
        AggregateLifecycle.apply(VisitDefinedEvent.from(
            studyDesignId,
            studyAggregateUuid,
            command.getVisitId(),
            command.getName(),
            command.getDescription(),
            command.getTimepoint(),
            command.getWindowBefore(),
            command.getWindowAfter(),
            command.getVisitType(),
            command.getIsRequired(),
            resolvedSequenceNumber,
            command.getArmId(),
            command.getDefinedBy()
        ));
    }

    private int determineNextVisitSequence(UUID armId) {
        return visits.values().stream()
            .filter(v -> Objects.equals(v.getArmId(), armId))
            .mapToInt(Visit::getSequenceNumber)
            .max()
            .orElse(0) + 1;
    }

    @CommandHandler
    public void handle(UpdateVisitCommand command) {
        log.info("Updating visit: {} in study design: {}", command.getVisitId(), studyDesignId);
        
        // Business Rule: Visit must exist
        if (!visits.containsKey(command.getVisitId())) {
            throw new IllegalStateException(
                String.format("Visit with ID %s does not exist", command.getVisitId())
            );
        }
        
        Visit existingVisit = visits.get(command.getVisitId());
        
        // Business Rule: Unique visit names within same scope (excluding current visit)
        boolean nameExists = visits.values().stream()
            .filter(v -> !v.getVisitId().equals(command.getVisitId()))
            .filter(v -> Objects.equals(v.getArmId(), existingVisit.getArmId()))
            .anyMatch(v -> v.getName().equalsIgnoreCase(command.getName()));
        if (nameExists) {
            throw new IllegalStateException(
                String.format("Another visit with name '%s' already exists in this scope", command.getName())
            );
        }
        
        AggregateLifecycle.apply(VisitUpdatedEvent.from(
            studyDesignId,
            command.getVisitId(),
            command.getName(),
            command.getDescription(),
            command.getTimepoint(),
            command.getWindowBefore(),
            command.getWindowAfter(),
            command.getVisitType(), // BUGFIX: Added visitType
            command.getIsRequired(),
            command.getUpdatedBy()
        ));
    }

    @CommandHandler
    public void handle(RemoveVisitCommand command) {
        log.info("Removing visit: {} from study design: {}", command.getVisitId(), studyDesignId);
        log.info("Current visits in aggregate: {} visits - IDs: {}", visits.size(), visits.keySet());
        
        // Business Rule: Visit must exist
        if (!visits.containsKey(command.getVisitId())) {
            log.error("Visit {} not found in aggregate. Available {} visits: {}", 
                command.getVisitId(), visits.size(), visits.keySet());
            
            // Provide helpful error message
            String errorMsg = String.format(
                "Visit with ID %s does not exist in this study design. " +
                "Available visits (%d): %s. " +
                "This may occur if you're trying to delete a visit immediately after creating it - please wait a moment and try again.",
                command.getVisitId(), visits.size(), visits.keySet()
            );
            throw new IllegalStateException(errorMsg);
        }
        
        // Business Rule: Cannot remove visit if it has form assignments
        boolean hasFormAssignments = formAssignments.values().stream()
            .anyMatch(assignment -> assignment.getVisitId().equals(command.getVisitId()));
        if (hasFormAssignments) {
            throw new IllegalStateException(
                String.format("Cannot remove visit %s - it has form assignments. Remove those assignments first.", 
                    command.getVisitId())
            );
        }
        
        AggregateLifecycle.apply(VisitRemovedEvent.from(
            studyDesignId,
            command.getVisitId(),
            command.getReason(),
            command.getRemovedBy()
        ));
    }

    @CommandHandler
    public void handle(AssignFormToVisitCommand command) {
        log.info("Assigning form: {} to visit: {} in study design: {}", 
            command.getFormId(), command.getVisitId(), studyDesignId);
        
        // Business Rule: Visit must exist
        if (!visits.containsKey(command.getVisitId())) {
            throw new IllegalStateException(
                String.format("Visit with ID %s does not exist", command.getVisitId())
            );
        }
        
        // Business Rule: No duplicate form assignments per visit
        boolean isDuplicate = formAssignments.values().stream()
            .anyMatch(assignment -> 
                assignment.getVisitId().equals(command.getVisitId()) &&
                assignment.getFormId().equals(command.getFormId())
            );
        if (isDuplicate) {
            throw new IllegalStateException(
                String.format("Form %s is already assigned to visit %s", 
                    command.getFormId(), command.getVisitId())
            );
        }
        
        // Business Rule: Unique display order per visit
        boolean displayOrderExists = formAssignments.values().stream()
            .filter(assignment -> assignment.getVisitId().equals(command.getVisitId()))
            .anyMatch(assignment -> assignment.getDisplayOrder() == command.getDisplayOrder());
        if (displayOrderExists) {
            throw new IllegalStateException(
                String.format("Display order %d is already used for visit %s", 
                    command.getDisplayOrder(), command.getVisitId())
            );
        }
        
        AggregateLifecycle.apply(FormAssignedToVisitEvent.from(
            studyDesignId,
            command.getAssignmentId(),
            command.getVisitId(),
            command.getFormId(),
            command.getIsRequired(),
            command.getIsConditional(),
            command.getConditionalLogic(),
            command.getDisplayOrder(),
            command.getInstructions(),
            command.getAssignedBy()
        ));
    }

    @CommandHandler
    public void handle(UpdateFormAssignmentCommand command) {
        log.info("Updating form assignment: {} in study design: {}", 
            command.getAssignmentId(), studyDesignId);
        
        // Business Rule: Assignment must exist
        if (!formAssignments.containsKey(command.getAssignmentId())) {
            throw new IllegalStateException(
                String.format("Form assignment with ID %s does not exist", command.getAssignmentId())
            );
        }
        
        AggregateLifecycle.apply(FormAssignmentUpdatedEvent.from(
            studyDesignId,
            command.getAssignmentId(),
            command.getIsRequired(),
            command.getIsConditional(),
            command.getConditionalLogic(),
            command.getInstructions(),
            command.getUpdatedBy()
        ));
    }

    @CommandHandler
    public void handle(RemoveFormAssignmentCommand command) {
        log.info("Removing form assignment: {} from study design: {}", 
            command.getAssignmentId(), studyDesignId);
        
        // Business Rule: Assignment must exist
        if (!formAssignments.containsKey(command.getAssignmentId())) {
            throw new IllegalStateException(
                String.format("Form assignment with ID %s does not exist", command.getAssignmentId())
            );
        }
        
        AggregateLifecycle.apply(FormAssignmentRemovedEvent.from(
            studyDesignId,
            command.getAssignmentId(),
            command.getReason(),
            command.getRemovedBy()
        ));
    }

    // ===================== EVENT SOURCING HANDLERS =====================

    @EventSourcingHandler
    public void on(StudyDesignInitializedEvent event) {
        this.studyDesignId = event.getStudyDesignId();
        this.studyAggregateUuid = event.getStudyAggregateUuid();
        this.arms = new HashMap<>();
        this.visits = new HashMap<>();
        this.formAssignments = new HashMap<>();
        log.debug("StudyDesign initialized: {}", studyDesignId);
    }

    @EventSourcingHandler
    public void on(StudyArmAddedEvent event) {
        StudyArm arm = StudyArm.reconstruct(
            event.getArmId(),
            event.getName(),
            event.getDescription(),
            event.getType(),
            event.getSequenceNumber(),
            event.getPlannedSubjects()
        );
        this.arms.put(event.getArmId(), arm);
        log.debug("Study arm added: {} to design: {}", event.getArmId(), studyDesignId);
    }

    @EventSourcingHandler
    public void on(StudyArmUpdatedEvent event) {
        StudyArm existingArm = this.arms.get(event.getArmId());
        if (existingArm != null) {
            StudyArm updatedArm = existingArm.withUpdatedDetails(
                event.getName(),
                event.getDescription(),
                event.getPlannedSubjects()
            );
            this.arms.put(event.getArmId(), updatedArm);
            log.debug("Study arm updated: {} in design: {}", event.getArmId(), studyDesignId);
        }
    }

    @EventSourcingHandler
    public void on(StudyArmRemovedEvent event) {
        this.arms.remove(event.getArmId());
        log.debug("Study arm removed: {} from design: {}", event.getArmId(), studyDesignId);
    }

    @EventSourcingHandler
    public void on(VisitDefinedEvent event) {
        Visit visit = Visit.reconstruct(
            event.getVisitId(),
            event.getName(),
            event.getDescription(),
            event.getTimepoint(),
            VisitWindow.of(event.getWindowBefore(), event.getWindowAfter()),
            event.getVisitType(),
            event.getIsRequired(),
            event.getSequenceNumber(),
            event.getArmId()
        );
        this.visits.put(event.getVisitId(), visit);
        log.debug("Visit defined: {} in design: {}", event.getVisitId(), studyDesignId);
    }

    @EventSourcingHandler
    public void on(VisitUpdatedEvent event) {
        Visit existingVisit = this.visits.get(event.getVisitId());
        if (existingVisit != null) {
            Visit updatedVisit = existingVisit.withUpdatedDetails(
                event.getName(),
                event.getDescription(),
                event.getTimepoint(),
                VisitWindow.of(event.getWindowBefore(), event.getWindowAfter()),
                event.getVisitType(), // BUGFIX: Added visitType
                event.getIsRequired()
            );
            this.visits.put(event.getVisitId(), updatedVisit);
            log.debug("Visit updated: {} in design: {}", event.getVisitId(), studyDesignId);
        }
    }

    @EventSourcingHandler
    public void on(VisitRemovedEvent event) {
        this.visits.remove(event.getVisitId());
        log.debug("Visit removed: {} from design: {}", event.getVisitId(), studyDesignId);
    }

    @EventSourcingHandler
    public void on(FormAssignedToVisitEvent event) {
        FormAssignment assignment = FormAssignment.reconstruct(
            event.getAssignmentId(),
            event.getVisitId(),
            event.getFormId(),
            event.getIsRequired(),
            event.getIsConditional(),
            event.getConditionalLogic(),
            event.getDisplayOrder(),
            event.getInstructions()
        );
        this.formAssignments.put(event.getAssignmentId(), assignment);
        log.debug("Form assigned: {} to visit: {} in design: {}", 
            event.getFormId(), event.getVisitId(), studyDesignId);
    }

    @EventSourcingHandler
    public void on(FormAssignmentUpdatedEvent event) {
        FormAssignment existing = this.formAssignments.get(event.getAssignmentId());
        if (existing != null) {
            FormAssignment updated = existing.withUpdatedDetails(
                event.getIsRequired(),
                event.getIsConditional(),
                event.getConditionalLogic(),
                event.getInstructions()
            );
            this.formAssignments.put(event.getAssignmentId(), updated);
            log.debug("Form assignment updated: {} in design: {}", 
                event.getAssignmentId(), studyDesignId);
        }
    }

    @EventSourcingHandler
    public void on(FormAssignmentRemovedEvent event) {
        this.formAssignments.remove(event.getAssignmentId());
        log.debug("Form assignment removed: {} from design: {}", 
            event.getAssignmentId(), studyDesignId);
    }

    // ===================== STUDY-RELATED EVENT HANDLERS =====================
    // These events should logically belong to StudyAggregate but are being routed here
    // Adding handlers to prevent "Aggregate identifier must be non-null" errors

    @EventSourcingHandler
    public void on(StudyClosedEvent event) {
        // This event uses studyId but should not affect StudyDesign state
        // We add this handler to prevent Axon from failing during aggregate reconstitution
        log.debug("StudyClosedEvent received for studyId: {} in StudyDesign aggregate: {}", 
            event.getStudyId(), studyDesignId);
        // No state changes needed since this is a Study-level event, not StudyDesign-level
    }

    @EventSourcingHandler
    public void on(StudyDetailsUpdatedEvent event) {
        // This event uses studyId but should not affect StudyDesign state
        // We add this handler to prevent Axon from failing during aggregate reconstitution
        log.debug("StudyDetailsUpdatedEvent received for studyId: {} in StudyDesign aggregate: {}", 
            event.getStudyId(), studyDesignId);
        // No state changes needed since this is a Study-level event, not StudyDesign-level
    }

    @EventSourcingHandler
    public void on(StudyStatusChangedEvent event) {
        // This event uses studyId but should not affect StudyDesign state  
        // We add this handler to prevent Axon from failing during aggregate reconstitution
        log.debug("StudyStatusChangedEvent received for studyId: {} ({} -> {}) in StudyDesign aggregate: {}", 
            event.getStudyId(), event.getOldStatus(), event.getNewStatus(), studyDesignId);
        // No state changes needed since this is a Study-level event, not StudyDesign-level
    }
}
