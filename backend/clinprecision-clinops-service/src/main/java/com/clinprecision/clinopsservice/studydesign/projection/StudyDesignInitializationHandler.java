package com.clinprecision.clinopsservice.studydesign.projection;

import com.clinprecision.clinopsservice.study.event.StudyCreatedEvent;
import com.clinprecision.clinopsservice.studydesign.domain.commands.InitializeStudyDesignCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventsourcing.eventstore.DomainEventStream;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.EventStoreException;
import org.axonframework.modelling.command.AggregateNotFoundException;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Handles automatic StudyDesign initialization when a Study is created
 * 
 * This ensures that every Study has a corresponding StudyDesignAggregate
 * in the event store, allowing study design operations (arms, visits, forms)
 * to work immediately after study creation.
 * 
 * Pattern: Saga-like coordination between aggregates
 * - Listens to StudyCreatedEvent
 * - Automatically dispatches InitializeStudyDesignCommand
 * - Uses the same studyAggregateUuid for correlation
 * - Works directly with event data to avoid timing issues with projections
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudyDesignInitializationHandler {

    private final CommandGateway commandGateway;
    private final EventStore eventStore;

    /**
     * Automatically initialize StudyDesignAggregate when a Study is created
     * 
     * This handler ensures that study design operations are available
     * immediately after study creation without requiring separate initialization.
     * Works directly with event data to avoid race conditions with projections.
     * 
     * @param event The StudyCreatedEvent from the StudyAggregate
     */
    @EventHandler
    public void on(StudyCreatedEvent event) {
        log.info("Auto-initializing StudyDesign for study: {} (UUID: {})", 
            event.getName(), event.getStudyAggregateUuid());
        
        // Check if StudyDesign aggregate already exists in event store
        if (checkIfStudyDesignExists(event.getStudyAggregateUuid())) {
            log.info("StudyDesign aggregate already exists for UUID: {}", event.getStudyAggregateUuid());
            return;
        }
        
        // Create command to initialize the StudyDesignAggregate
        InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
            .studyDesignId(event.getStudyAggregateUuid()) // Use same UUID as study
            .studyAggregateUuid(event.getStudyAggregateUuid())
            .studyName(event.getName())
            .createdBy(1L) // System initialization
            .build();
        
        // Dispatch command asynchronously (fire-and-forget pattern)
        commandGateway.send(command)
            .thenAccept(result -> log.debug("StudyDesign initialization completed for study: {}", 
                event.getStudyAggregateUuid()))
            .exceptionally(ex -> {
                if (isDuplicateAggregateError(ex)) {
                    log.info("StudyDesign already exists (race condition), ignoring: {}", event.getStudyAggregateUuid());
                } else {
                    log.error("Failed to auto-initialize StudyDesign for study: {}", 
                        event.getStudyAggregateUuid(), ex);
                }
                // Don't re-throw - study creation should succeed even if design init fails
                return null;
            });
    }
    
    /**
     * Check if StudyDesignAggregate exists in event store
     */
    private boolean checkIfStudyDesignExists(UUID studyDesignId) {
        String aggregateId = studyDesignId.toString();
        try {
            DomainEventStream stream = eventStore.readEvents(aggregateId);
            boolean exists = stream.hasNext();
            if (exists) {
                log.debug("StudyDesign aggregate already present in event store for UUID: {}", aggregateId);
            } else {
                log.debug("StudyDesign aggregate stream empty for UUID: {}", aggregateId);
            }
            return exists;
        } catch (AggregateNotFoundException e) {
            log.debug("No StudyDesign aggregate found in event store for UUID: {}", aggregateId);
            return false;
        } catch (EventStoreException e) {
            log.warn("Unable to read events for StudyDesign {}. Assuming aggregate does not yet exist.", aggregateId, e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error while checking event store for StudyDesign UUID: {}", aggregateId, e);
            return false;
        }
    }
    
    /**
     * Check if an exception indicates a duplicate aggregate error
     */
    private boolean isDuplicateAggregateError(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current.getMessage() != null) {
                String message = current.getMessage();
                if (message.contains("Cannot reuse aggregate identifier") || message.contains("already exists")) {
                    return true;
                }
            }
            current = current.getCause();
        }
        return false;
    }
}
