package com.clinprecision.clinopsservice.studydesign.design.service;

import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyQueryService;
import com.clinprecision.clinopsservice.studydesign.design.domain.commands.InitializeStudyDesignCommand;
import com.clinprecision.clinopsservice.studydesign.design.domain.events.StudyDesignInitializedEvent;
import com.clinprecision.clinopsservice.studydesign.design.dto.InitializeStudyDesignRequest;
import com.clinprecision.clinopsservice.studydesign.util.StudyDesignIdentifiers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.DomainEventMessage;
import org.axonframework.eventsourcing.eventstore.DomainEventStream;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.EventStoreException;
import org.axonframework.modelling.command.AggregateNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

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
                    log.debug("Study {} retrieved by legacy ID but has valid UUID: {}", studyId, studyActualUuid);
                    UUID preferredDesignUuid = StudyDesignIdentifiers.deriveFromStudyUuid(studyActualUuid);
                    return new StudyInfo(
                        studyActualUuid,
                        preferredDesignUuid,
                        studyActualUuid,
                        study.getName(),
                        false,
                        resolvedLegacyId
                    );
                } else if (isLegacyId && !hasValidUuid) {
                    UUID designUuid = StudyDesignIdentifiers.deriveFromLegacyId(resolvedLegacyId);
                    log.debug("Truly legacy study {} - generating StudyDesign UUID: {}", studyId, designUuid);
                    return new StudyInfo(
                        null,
                        designUuid,
                        null,
                        study.getName(),
                        true,
                        resolvedLegacyId
                    );
                } else {
                    UUID preferredDesignUuid = StudyDesignIdentifiers.deriveFromStudyUuid(studyActualUuid);
                    return new StudyInfo(
                        studyActualUuid,
                        preferredDesignUuid,
                        studyActualUuid,
                        study.getName(),
                        false,
                        resolvedLegacyId
                    );
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
                UUID studyAggregateUuid = study.getStudyAggregateUuid();
                UUID preferredDesignUuid = StudyDesignIdentifiers.deriveFromStudyUuid(studyAggregateUuid);
                return new StudyInfo(
                    studyAggregateUuid,
                    preferredDesignUuid,
                    studyAggregateUuid,
                    study.getName(),
                    false,
                    study.getId()
                );
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
        Optional<UUID> existing = findExistingStudyDesignId(studyInfo);
        if (existing.isPresent()) {
            UUID existingId = existing.get();
            if (!existingId.equals(studyInfo.preferredDesignUuid)) {
                log.warn("StudyDesign aggregate already exists with legacy identifier {}. Reusing legacy ID for study: {}", existingId, studyInfo.name);
            } else {
                log.debug("StudyDesign already exists using preferred identifier: {}", existingId);
            }
            return CompletableFuture.completedFuture(existingId);
        }

        log.info("StudyDesign not found, auto-initializing for study: {}", studyInfo.name);
        return initializeStudyDesign(studyInfo);
    }

    private Optional<UUID> findExistingStudyDesignId(StudyInfo studyInfo) {
        return studyInfo.candidateDesignIds()
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

            log.warn("Aggregate {} has existing events but first event type {} is not StudyDesignInitializedEvent. Ignoring as StudyDesign stream.",
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
     * Initialize new StudyDesignAggregate
     */
    private CompletableFuture<UUID> initializeStudyDesign(StudyInfo studyInfo) {
        if (studyInfo.isLegacy) {
            // For truly legacy studies (no valid UUID), create StudyDesign directly without validation
            log.info("Initializing StudyDesign for truly legacy study: {}", studyInfo.name);
            
            UUID studyDesignId = studyInfo.preferredDesignUuid;
            UUID studyAggregateUuid = Optional.ofNullable(studyInfo.studyAggregateUuid)
                .orElse(studyDesignId);
            
            InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
                .studyDesignId(studyDesignId)
                .studyAggregateUuid(studyAggregateUuid)
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
            log.info("Initializing StudyDesign for study with valid UUID: {} ({})", studyInfo.studyAggregateUuid, studyInfo.name);
            
            InitializeStudyDesignRequest request = InitializeStudyDesignRequest.builder()
                .studyAggregateUuid(studyInfo.studyAggregateUuid)
                .studyDesignId(studyInfo.preferredDesignUuid)
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
                        log.info("StudyDesign already exists (duplicate detected), using: {}", studyInfo.preferredDesignUuid);
                        return studyInfo.preferredDesignUuid;
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
        final UUID studyAggregateUuid; // Actual Study aggregate UUID (null for legacy-only studies)
        final UUID preferredDesignUuid; // Preferred StudyDesign aggregate identifier
        final UUID legacyDesignUuid; // Historical identifier (eg, same as study UUID)
        final String name;
        final boolean isLegacy;
        final Long legacyStudyId;

        StudyInfo(UUID studyAggregateUuid, UUID preferredDesignUuid, UUID legacyDesignUuid,
                  String name, boolean isLegacy, Long legacyStudyId) {
            this.studyAggregateUuid = studyAggregateUuid;
            this.preferredDesignUuid = preferredDesignUuid;
            this.legacyDesignUuid = legacyDesignUuid;
            this.name = name;
            this.isLegacy = isLegacy;
            this.legacyStudyId = legacyStudyId;
        }

        Stream<UUID> candidateDesignIds() {
            return Stream.of(legacyDesignUuid, preferredDesignUuid)
                .filter(Objects::nonNull)
                .distinct();
        }
    }
}