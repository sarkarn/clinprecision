package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.domain.commands.InitializeStudyDesignCommand;
import com.clinprecision.clinopsservice.studydesign.dto.InitializeStudyDesignRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventsourcing.eventstore.DomainEventStream;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.EventStoreException;
import org.axonframework.modelling.command.AggregateNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for auto-initializing StudyDesignAggregates
 * 
 * Provides generic solution for ensuring StudyDesignAggregate exists
 * for any study, handling both legacy studies and new ones.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDesignAutoInitializationService {

    private final CommandGateway commandGateway;
    private final StudyQueryService studyQueryService;
    private final StudyDesignCommandService studyDesignCommandService;
    private final EventStore eventStore;

    /**
     * Ensure StudyDesignAggregate exists for the given study ID
     * If it doesn't exist, automatically initialize it
     * 
     * @param studyId Legacy study ID or UUID as string
     * @return StudyDesignId (UUID) that can be used for operations
     */
    public CompletableFuture<UUID> ensureStudyDesignExists(String studyId) {
        log.info("Ensuring StudyDesign exists for study: {}", studyId);
        
        return getStudyInfo(studyId)
            .thenCompose(this::getOrCreateStudyDesignId);
    }
    
    /**
     * Ensure StudyDesignAggregate exists for the given study UUID
     * 
     * @param studyUuid Study aggregate UUID
     * @return StudyDesignId (UUID) that can be used for operations
     */
    public CompletableFuture<UUID> ensureStudyDesignExistsByUuid(UUID studyUuid) {
        log.info("Ensuring StudyDesign exists for study UUID: {}", studyUuid);
        
        return getStudyInfoByUuid(studyUuid)
            .thenCompose(this::getOrCreateStudyDesignId);
    }

    /**
     * Get study information by ID (supports both legacy ID and UUID)
     */
    private CompletableFuture<StudyInfo> getStudyInfo(String studyId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                StudyResponseDto study;
                boolean isLegacyId = false;
                Long legacyId = null;

                // Try as UUID first
                try {
                    UUID uuid = UUID.fromString(studyId);
                    study = studyQueryService.getStudyByUuid(uuid);
                } catch (IllegalArgumentException e) {
                    // Not a UUID, try as legacy ID
                    legacyId = Long.parseLong(studyId);
                    study = studyQueryService.getStudyById(legacyId);
                    isLegacyId = true;
                }

                // Check if the study has a valid UUID (not null and not a placeholder)
                UUID studyActualUuid = study.getStudyAggregateUuid();
                boolean hasValidUuid = studyActualUuid != null &&
                    !studyActualUuid.toString().equals("00000000-0000-0000-0000-000000000000");

                Long resolvedLegacyId = legacyId != null ? legacyId : study.getId();

                if (isLegacyId && hasValidUuid) {
                    // Study retrieved by legacy ID but has valid UUID - use the actual UUID
                    log.debug("Study {} retrieved by legacy ID but has valid UUID: {}", studyId, studyActualUuid);
                    return new StudyInfo(studyActualUuid, studyActualUuid, study.getName(), false, resolvedLegacyId);
                } else if (isLegacyId && !hasValidUuid) {
                    // Truly legacy study without valid UUID - generate one
                    UUID designUuid = UUID.nameUUIDFromBytes(("study-design-" + studyId).getBytes());
                    log.debug("Truly legacy study {} - generating UUID: {}", studyId, designUuid);
                    return new StudyInfo(designUuid, null, study.getName(), true, resolvedLegacyId);
                } else {
                    // UUID-based retrieval - use existing UUID
                    return new StudyInfo(studyActualUuid, studyActualUuid, study.getName(), false, resolvedLegacyId);
                }

            } catch (Exception e) {
                log.error("Failed to get study info for: {}", studyId, e);
                throw new RuntimeException("Study not found: " + studyId, e);
            }
        });
    }
    
    /**
     * Get study information by UUID
     */
    private CompletableFuture<StudyInfo> getStudyInfoByUuid(UUID studyUuid) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                StudyResponseDto study = studyQueryService.getStudyByUuid(studyUuid);
                return new StudyInfo(study.getStudyAggregateUuid(), study.getStudyAggregateUuid(), study.getName(), false, study.getId());
            } catch (Exception e) {
                log.error("Failed to get study info for UUID: {}", studyUuid, e);
                throw new RuntimeException("Study not found: " + studyUuid, e);
            }
        });
    }

    /**
     * Get existing StudyDesignId or create new one if needed
     */
    private CompletableFuture<UUID> getOrCreateStudyDesignId(StudyInfo studyInfo) {
        // For now, use studyAggregateUuid as studyDesignId (1:1 mapping)
        // This follows the pattern where StudyDesignAggregate uses same UUID as Study
        UUID potentialStudyDesignId = studyInfo.aggregateUuid;
        
        return checkIfStudyDesignExists(potentialStudyDesignId)
            .thenCompose(exists -> {
                if (exists) {
                    log.debug("StudyDesign already exists: {}", potentialStudyDesignId);
                    return CompletableFuture.completedFuture(potentialStudyDesignId);
                } else {
                    log.info("StudyDesign not found, auto-initializing for study: {}", studyInfo.name);
                    return initializeStudyDesign(studyInfo);
                }
            });
    }

    /**
     * Check if StudyDesignAggregate exists in event store
     */
    private CompletableFuture<Boolean> checkIfStudyDesignExists(UUID studyDesignId) {
        String aggregateId = studyDesignId.toString();
        try {
            DomainEventStream stream = eventStore.readEvents(aggregateId);
            boolean exists = stream.hasNext();
            if (exists) {
                log.info("StudyDesign aggregate already present in event store for UUID: {}", aggregateId);
            } else {
                log.info("StudyDesign aggregate stream empty for UUID: {}", aggregateId);
            }
            return CompletableFuture.completedFuture(exists);
        } catch (AggregateNotFoundException e) {
            log.info("No StudyDesign aggregate found in event store for UUID: {}", aggregateId);
            return CompletableFuture.completedFuture(false);
        } catch (EventStoreException e) {
            log.warn("Unable to read events for StudyDesign {}. Assuming aggregate does not yet exist.", aggregateId, e);
            return CompletableFuture.completedFuture(false);
        } catch (Exception e) {
            log.error("Unexpected error while checking event store for StudyDesign UUID: {}", aggregateId, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Initialize new StudyDesignAggregate
     */
    private CompletableFuture<UUID> initializeStudyDesign(StudyInfo studyInfo) {
        if (studyInfo.isLegacy) {
            // For truly legacy studies (no valid UUID), create StudyDesign directly without validation
            log.info("Initializing StudyDesign for truly legacy study: {}", studyInfo.name);
            
            UUID studyDesignId = studyInfo.aggregateUuid; // Use the generated UUID
            
            InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
                .studyDesignId(studyDesignId)
                .studyAggregateUuid(studyDesignId) // Use same UUID for legacy compatibility
                .studyName(studyInfo.name)
                .createdBy(1L) // System initialization
                .build();
            
            return commandGateway.send(command)
                .thenApply(result -> {
                    log.info("Successfully auto-initialized StudyDesign: {} for legacy study: {}", 
                        studyDesignId, studyInfo.name);
                    return studyDesignId;
                })
                .exceptionally(ex -> {
                    if (isDuplicateAggregateError(ex)) {
                        log.info("StudyDesign already exists (duplicate detected), using: {}", studyDesignId);
                        return studyDesignId;
                    }
                    log.error("Failed to auto-initialize StudyDesign for legacy study: {}", studyInfo.name, ex);
                    throw new RuntimeException("Failed to initialize StudyDesign", ex);
                });
        } else {
            // For studies with valid UUIDs (including those retrieved by legacy ID), use standard validation
            log.info("Initializing StudyDesign for study with valid UUID: {} ({})", studyInfo.studyActualUuid, studyInfo.name);
            
            InitializeStudyDesignRequest request = InitializeStudyDesignRequest.builder()
                .studyAggregateUuid(studyInfo.studyActualUuid)
                .studyDesignId(studyInfo.aggregateUuid)
                .studyName(studyInfo.name)
                .legacyStudyId(studyInfo.legacyStudyId)
                .createdBy(1L) // System initialization
                .build();
            
            return studyDesignCommandService.initializeStudyDesign(request)
                .thenApply(designId -> {
                    log.info("Successfully auto-initialized StudyDesign: {} for study: {}", 
                        designId, studyInfo.name);
                    return designId;
                })
                .exceptionally(ex -> {
                    if (isDuplicateAggregateError(ex)) {
                        log.info("StudyDesign already exists (duplicate detected), using: {}", studyInfo.aggregateUuid);
                        return studyInfo.aggregateUuid;
                    }
                    log.error("Failed to auto-initialize StudyDesign for study: {}", studyInfo.name, ex);
                    throw new RuntimeException("Failed to initialize StudyDesign", ex);
                });
        }
    }

    private boolean isDuplicateAggregateError(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current.getMessage() != null) {
                String message = current.getMessage();
                if (message.contains("Cannot reuse aggregate identifier") || message.contains("already exists")) {
                    return true;
                }
            }
            if (current instanceof IllegalStateException && current.getMessage() != null && current.getMessage().contains("already exists")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    /**
     * Helper class to hold study information
     */
    private static class StudyInfo {
        final UUID aggregateUuid; // UUID for StudyDesign (may be generated)
        final UUID studyActualUuid; // Actual study UUID (null for legacy studies)
        final String name;
        final boolean isLegacy;
        final Long legacyStudyId;
        
        StudyInfo(UUID aggregateUuid, UUID studyActualUuid, String name, boolean isLegacy, Long legacyStudyId) {
            this.aggregateUuid = aggregateUuid;
            this.studyActualUuid = studyActualUuid;
            this.name = name;
            this.isLegacy = isLegacy;
            this.legacyStudyId = legacyStudyId;
        }
    }
}