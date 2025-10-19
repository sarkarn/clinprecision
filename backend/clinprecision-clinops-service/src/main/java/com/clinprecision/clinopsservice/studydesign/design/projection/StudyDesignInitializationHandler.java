package com.clinprecision.clinopsservice.studydesign.design.projection;

import com.clinprecision.clinopsservice.studydesign.studymgmt.event.StudyCreatedEvent;
import com.clinprecision.clinopsservice.studydesign.design.domain.commands.InitializeStudyDesignCommand;
import com.clinprecision.clinopsservice.studydesign.design.domain.events.StudyDesignInitializedEvent;
import com.clinprecision.clinopsservice.studydesign.util.StudyDesignIdentifiers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.DomainEventMessage;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventsourcing.eventstore.DomainEventStream;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.EventStoreException;
import org.axonframework.modelling.command.AggregateNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

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
        
        UUID studyUuid = event.getStudyAggregateUuid();
        UUID preferredDesignId = StudyDesignIdentifiers.deriveFromStudyUuid(studyUuid);

        Optional<UUID> existingDesignId = findExistingStudyDesignId(studyUuid, preferredDesignId);
        if (existingDesignId.isPresent()) {
            UUID existingId = existingDesignId.get();
            if (!existingId.equals(preferredDesignId)) {
                log.warn("StudyDesign aggregate already exists with legacy identifier {}. Reusing existing aggregate for study: {}", existingId, studyUuid);
            } else {
                log.info("StudyDesign aggregate already exists for UUID: {}", existingId);
            }
            return;
        }
        
        // Check if StudyDesign aggregate already exists in event store
        // Create command to initialize the StudyDesignAggregate
        InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
            .studyDesignId(preferredDesignId)
            .studyAggregateUuid(studyUuid)
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
    
    private Optional<UUID> findExistingStudyDesignId(UUID legacyCandidate, UUID preferredDesignId) {
        return Stream.of(legacyCandidate, preferredDesignId)
            .filter(Objects::nonNull)
            .distinct()
            .filter(this::isValidStudyDesignStream)
            .findFirst();
    }

    private boolean isValidStudyDesignStream(UUID studyDesignId) {
        String aggregateId = studyDesignId.toString();
        try {
            DomainEventStream stream = eventStore.readEvents(aggregateId);
            if (!stream.hasNext()) {
                return false;
            }

            DomainEventMessage<?> firstEvent = stream.next();
            if (StudyDesignInitializedEvent.class.equals(firstEvent.getPayloadType())) {
                log.debug("Validated StudyDesign stream for aggregate {}", aggregateId);
                return true;
            }

            log.warn("Aggregate {} has events but first event type {} is not StudyDesignInitializedEvent. Ignoring as StudyDesign stream.",
                aggregateId, firstEvent.getPayloadType().getSimpleName());
            return false;
        } catch (AggregateNotFoundException e) {
            return false;
        } catch (EventStoreException e) {
            log.warn("Unable to read events for StudyDesign {}. Assuming aggregate does not yet exist.", aggregateId, e);
            return false;
        } catch (Exception e) {
            log.error("Unexpected error while checking StudyDesign stream for UUID: {}", aggregateId, e);
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
