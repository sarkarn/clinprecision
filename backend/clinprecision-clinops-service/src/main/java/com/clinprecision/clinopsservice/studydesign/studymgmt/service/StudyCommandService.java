package com.clinprecision.clinopsservice.studydesign.studymgmt.service;

import com.clinprecision.clinopsservice.common.security.SecurityService;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmRequestDto;
import com.clinprecision.clinopsservice.studydesign.design.arm.entity.StudyArmEntity;
import com.clinprecision.clinopsservice.studydesign.design.arm.entity.StudyArmType;
import com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyEntity;
import com.clinprecision.clinopsservice.studydesign.design.arm.entity.StudyInterventionEntity;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyRandomizationStrategyEntity;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.InterventionType;
import com.clinprecision.clinopsservice.studydesign.design.arm.repository.StudyInterventionRepository;
import com.clinprecision.clinopsservice.studydesign.design.arm.repository.StudyRandomizationStrategyRepository;
import com.clinprecision.clinopsservice.studydesign.design.arm.repository.StudyArmRepository;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.InterventionDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.RandomizationStrategyDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.mapper.StudyCommandMapper;
import java.time.Duration;
import java.util.Objects;

import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Study Command Service - Handles DDD Write Operations
 * 
 * This service orchestrates write operations for the Study aggregate using CQRS pattern.
 * It converts DTOs to commands and dispatches them via Axon CommandGateway.
 * 
 * Architecture:
 * - DTOs are converted to commands by StudyCommandMapper
 * - Commands are sent to CommandGateway (Axon Framework)
 * - Aggregate handles commands and emits events
 * - Events are stored in EventStore and projected to read model
 * 
 * Thread Safety: Service methods are transactional and thread-safe via Axon
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyCommandService {
    
    private final CommandGateway commandGateway;
    private final StudyCommandMapper commandMapper;
    private final StudyValidationService validationService;
    private final StudyQueryService studyQueryService;
    private final StudyInterventionRepository interventionRepository;
    private final StudyRandomizationStrategyRepository randomizationStrategyRepository;
    private final SecurityService securityService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    // private final SecurityService securityService;
    
    /**
     * Create a new study
     * Generates a new aggregate UUID and dispatches CreateStudyCommand
     * 
     * @param request Study creation request DTO
     * @return UUID of newly created study aggregate
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     */
    @Transactional
    public UUID createStudy(StudyCreateRequestDto request) {
        log.info("Creating study: {}", request.getName());
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        log.debug("Creating study as user: {} ({})", userName, userId);
        
        CreateStudyCommand command = commandMapper.toCreateCommand(request, userId, userName);
        
        log.debug("Dispatching CreateStudyCommand for study: {} with UUID: {}", 
                  request.getName(), command.getStudyAggregateUuid());
        
        // Send command and wait for completion (synchronous)
        try {
            commandGateway.sendAndWait(command);
            log.info("Study created successfully with UUID: {}", command.getStudyAggregateUuid());
            return command.getStudyAggregateUuid();
        } catch (Exception e) {
            log.error("Failed to create study: {} with UUID: {}", request.getName(), command.getStudyAggregateUuid());
            logExceptionChain(e);
            throw e;
        }
    }
    
    /**
     * Update an existing study
     * Only allows updates when study status permits modifications
     * 
     * @param studyUuid UUID of study aggregate to update
     * @param request Study update request DTO (partial update)
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws IllegalStateException if study status doesn't allow modifications
     * @throws StudyStatusTransitionException if modification not allowed in current status
     */
    @Transactional
    public void updateStudy(UUID studyUuid, StudyUpdateRequestDto request) {
        log.info("Updating study: {}", studyUuid);
        
        // Validate modification allowed in current status
        validationService.validateStudyModification(studyUuid);
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        log.debug("Updating study as user: {} ({})", userName, userId);
        
        UpdateStudyCommand command = commandMapper.toUpdateCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching UpdateStudyCommand for study: {}", studyUuid);
        
        // Send command and wait for completion
        try {
            commandGateway.sendAndWait(command);
            log.info("Study updated successfully: {}", studyUuid);
            scheduleProjectionAwait(studyUuid, request, Duration.ofSeconds(5));
        } catch (Exception e) {
            log.error("Failed to update study: {}", studyUuid);
            logExceptionChain(e);
            throw e;
        }
    }
    
    /**
     * Suspend an active study
     * Can only be executed when study is in ACTIVE status
     * 
     * @param studyUuid UUID of study aggregate to suspend
     * @param request Suspension request with reason
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws IllegalStateException if study is not in ACTIVE status
     * @throws StudyStatusTransitionException if cross-entity validation fails
     */
    @Transactional
    public void suspendStudy(UUID studyUuid, SuspendStudyRequestDto request) {
        log.info("Suspending study: {} with reason: {}", studyUuid, request.getReason());
        
        // Validate cross-entity dependencies BEFORE sending command
        validationService.validateStatusTransition(studyUuid, "SUSPENDED");
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        
        SuspendStudyCommand command = commandMapper.toSuspendCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching SuspendStudyCommand for study: {}", studyUuid);
        
        try {
            commandGateway.sendAndWait(command);
            log.info("Study suspended successfully: {}", studyUuid);
        } catch (Exception e) {
            log.error("Failed to suspend study: {}", studyUuid);
            logExceptionChain(e);
            throw e;
        }
    }
    
    /**
     * Terminate a study
     * Terminal state - study cannot be modified after this
     * 
     * @param studyUuid UUID of study aggregate to terminate
     * @param request Termination request with reason
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws StudyStatusTransitionException if cross-entity validation fails
     */
    @Transactional
    public void terminateStudy(UUID studyUuid, TerminateStudyRequestDto request) {
        log.info("Terminating study: {} with reason: {}", studyUuid, request.getReason());
        
        // Validate cross-entity dependencies BEFORE sending command
        validationService.validateStatusTransition(studyUuid, "TERMINATED");
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        
        TerminateStudyCommand command = commandMapper.toTerminateCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching TerminateStudyCommand for study: {}", studyUuid);
        
        try {
            commandGateway.sendAndWait(command);
            log.warn("Study terminated (terminal state): {}", studyUuid);
        } catch (Exception e) {
            log.error("Failed to terminate study: {}", studyUuid);
            logExceptionChain(e);
            throw e;
        }
    }
    
    /**
     * Withdraw a study
     * Terminal state - study cannot be modified after this
     * 
     * @param studyUuid UUID of study aggregate to withdraw
     * @param request Withdrawal request with reason
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws StudyStatusTransitionException if cross-entity validation fails
     */
    @Transactional
    public void withdrawStudy(UUID studyUuid, WithdrawStudyRequestDto request) {
        log.info("Withdrawing study: {} with reason: {}", studyUuid, request.getReason());
        
        // Validate cross-entity dependencies BEFORE sending command
        validationService.validateStatusTransition(studyUuid, "WITHDRAWN");
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        
        WithdrawStudyCommand command = commandMapper.toWithdrawCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching WithdrawStudyCommand for study: {}", studyUuid);
        
        try {
            commandGateway.sendAndWait(command);
            log.warn("Study withdrawn (terminal state): {}", studyUuid);
        } catch (Exception e) {
            log.error("Failed to withdraw study: {}", studyUuid);
            logExceptionChain(e);
            throw e;
        }
    }
    
    /**
     * Complete a study
     * Marks successful completion of study
     * 
     * @param studyUuid UUID of study aggregate to complete
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws StudyStatusTransitionException if cross-entity validation fails
     */
    @Transactional
    public void completeStudy(UUID studyUuid) {
        log.info("Completing study: {}", studyUuid);
        
        // Validate cross-entity dependencies BEFORE sending command
        validationService.validateStatusTransition(studyUuid, "COMPLETED");
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        
        CompleteStudyCommand command = commandMapper.toCompleteCommand(studyUuid, userId, userName);
        
        log.debug("Dispatching CompleteStudyCommand for study: {}", studyUuid);
        
        try {
            commandGateway.sendAndWait(command);
            log.info("Study completed successfully: {}", studyUuid);
        } catch (Exception e) {
            log.error("Failed to complete study: {}", studyUuid);
            logExceptionChain(e);
            throw e;
        }
    }

    /**
     * Change study status (generic status transition handler)
     * Supports all valid status transitions defined in StudyStatusCode
     * 
     * BRIDGE PATTERN: Handles legacy studies that don't have event-sourced aggregates
     * If aggregate not found in event store, creates it from legacy data first
     * 
     * @param studyUuid UUID of study aggregate
     * @param newStatusString Target status as string (e.g., "PROTOCOL_REVIEW", "ACTIVE")
     * @param reason Optional reason for status change
     * @throws org.axonframework.commandhandling.CommandExecutionException if command fails
     * @throws IllegalArgumentException if status string is invalid
     * @throws StudyStatusTransitionException if transition is not allowed
     */
    @Transactional
    public void changeStudyStatus(UUID studyUuid, String newStatusString, String reason) {
        log.info("Changing study status: {} -> {}", studyUuid, newStatusString);
        
        // BRIDGE PATTERN: Ensure aggregate exists in event store (migrate legacy studies)
        ensureAggregateExists(studyUuid);
        
        // Convert string to StudyStatusCode enum
        StudyStatusCode newStatus;
        try {
            newStatus = StudyStatusCode.fromString(newStatusString);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status code: {}", newStatusString);
            throw new IllegalArgumentException("Invalid status: " + newStatusString + ". Valid statuses are: " + 
                java.util.Arrays.toString(StudyStatusCode.values()));
        }
        
        // Validate cross-entity dependencies BEFORE sending command
        validationService.validateStatusTransition(studyUuid, newStatusString);
        
        // Get current user from security context
        UUID userId = securityService.getCurrentUserId();
        String userName = securityService.getCurrentUserName();
        log.debug("Changing study status as user: {} ({})", userName, userId);
        
        ChangeStudyStatusCommand command = ChangeStudyStatusCommand.builder()
            .studyAggregateUuid(studyUuid)
            .newStatus(newStatus)
            .reason(reason)
            .userId(userId)
            .userName(userName)
            .build();
        
        log.debug("Dispatching ChangeStudyStatusCommand for study: {} to status: {}", studyUuid, newStatus);
        
        try {
            commandGateway.sendAndWait(command);
            log.info("Study status changed successfully: {} -> {}", studyUuid, newStatus);
        } catch (Exception e) {
            log.error("Failed to change study status: {} -> {}", studyUuid, newStatus);
            logExceptionChain(e);
            throw e;
        }
    }

    /**
     * BRIDGE PATTERN: Ensure legacy study has event-sourced aggregate
     * 
     * Checks if study aggregate exists in event store. If not, creates it from legacy data.
     * This handles migration of pre-event-sourcing studies.
     * 
     * Strategy: Try to send a probe command. If AggregateNotFoundException occurs, migrate.
     * 
     * @param studyUuid UUID of study to check/migrate
     */
    private void ensureAggregateExists(UUID studyUuid) {
        // Check if study exists in database first
        StudyEntity legacyStudy;
        try {
            legacyStudy = studyQueryService.getStudyEntityByUuid(studyUuid);
            if (legacyStudy == null) {
                throw new IllegalArgumentException("Study not found: " + studyUuid);
            }
            log.info("Found study entity: {} (ID: {})", legacyStudy.getName(), legacyStudy.getId());
        } catch (Exception e) {
            log.error("Study not found in database: {}", studyUuid);
            throw new IllegalArgumentException("Study not found: " + studyUuid, e);
        }
        
        // Check if aggregate exists in event store by querying domain events table
        // Legacy studies have no events, so we need to migrate them
        try {
            // Query to check if any events exist for this aggregate
            Integer eventCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM domain_event_entry WHERE aggregate_identifier = ?",
                Integer.class,
                studyUuid.toString()
            );
            
            if (eventCount != null && eventCount > 0) {
                log.debug("Study aggregate exists in event store with {} events", eventCount);
            } else {
                log.warn("Legacy study detected (no events in event store): {}. Migrating...", studyUuid);
                migrateLegacyStudyToEventStore(studyUuid, legacyStudy);
            }
        } catch (Exception e) {
            log.error("Failed to check event store for study {}: {}", studyUuid, e.getMessage());
            // Assume it's a legacy study and try to migrate
            log.warn("Assuming legacy study, attempting migration: {}", studyUuid);
            migrateLegacyStudyToEventStore(studyUuid, legacyStudy);
        }
    }

    /**
     * BRIDGE PATTERN: Migrate legacy study to event-sourced aggregate
     * 
     * Creates initial StudyCreated event from legacy database data.
     * This allows legacy studies to work with event-sourcing commands.
     * 
     * @param studyUuid UUID of legacy study to migrate
     * @param legacyStudy Study entity from database
     */
    private void migrateLegacyStudyToEventStore(UUID studyUuid, StudyEntity legacyStudy) {
        log.info("Migrating legacy study {} to event store", studyUuid);
        
        try {
            log.debug("Found legacy study: {} (ID: {})", legacyStudy.getProtocolNumber(), legacyStudy.getId());
            
            // Get current user for migration
            UUID userId = securityService.getCurrentUserId();
            String userName = securityService.getCurrentUserName();
            
            // Create CreateStudyCommand from legacy data
            CreateStudyCommand migrateCommand = CreateStudyCommand.builder()
                .studyAggregateUuid(studyUuid)
                .name(legacyStudy.getName())
                .description(legacyStudy.getDescription())
                .sponsor(legacyStudy.getSponsor() != null ? legacyStudy.getSponsor() : "Unknown")
                .protocolNumber(legacyStudy.getProtocolNumber())
                .indication(legacyStudy.getIndication())
                .studyType(legacyStudy.getStudyType() != null ? legacyStudy.getStudyType() : "INTERVENTIONAL")
                .principalInvestigator(legacyStudy.getPrincipalInvestigator())
                .studyCoordinator(legacyStudy.getStudyCoordinator())
                .therapeuticArea(legacyStudy.getTherapeuticArea())
                .plannedSubjects(legacyStudy.getPlannedSubjects())
                .targetEnrollment(legacyStudy.getTargetEnrollment())
                .primaryObjective(legacyStudy.getPrimaryObjective())
                .primaryEndpoint(legacyStudy.getPrimaryEndpoint())
                .startDate(legacyStudy.getStartDate())
                .endDate(legacyStudy.getEndDate())
                .studyStatusId(legacyStudy.getStudyStatus() != null ? legacyStudy.getStudyStatus().getId() : null)
                .regulatoryStatusId(legacyStudy.getRegulatoryStatus() != null ? legacyStudy.getRegulatoryStatus().getId() : null)
                .studyPhaseId(legacyStudy.getStudyPhase() != null ? legacyStudy.getStudyPhase().getId() : null)
                .userId(userId)
                .userName(userName)
                .build();
            
            // Send command to create aggregate (will create StudyCreated event)
            log.debug("Creating event-sourced aggregate for legacy study: {}", studyUuid);
            try {
                commandGateway.sendAndWait(migrateCommand);
                log.info("Successfully migrated legacy study {} to event store", studyUuid);
            } catch (Exception migrationEx) {
                log.error("Failed to send migration command for legacy study: {}", studyUuid);
                logExceptionChain(migrationEx);
                throw migrationEx;
            }
            
        } catch (Exception e) {
            log.error("Failed to migrate legacy study {} to event store: {}", studyUuid, e.getMessage());
            logExceptionChain(e);
            throw new RuntimeException("Failed to migrate legacy study: " + e.getMessage(), e);
        }
    }

    private void scheduleProjectionAwait(UUID studyUuid, StudyUpdateRequestDto request, Duration timeout) {
        if (request == null) {
            return;
        }

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    awaitProjectionUpdate(studyUuid, request, timeout);
                }
            });
        } else {
            awaitProjectionUpdate(studyUuid, request, timeout);
        }
    }

    private void awaitProjectionUpdate(UUID studyUuid, StudyUpdateRequestDto request, Duration timeout) {
        if (request == null) {
            return;
        }

        long deadline = System.nanoTime() + timeout.toNanos();
        while (System.nanoTime() < deadline) {
            try {
                StudyEntity entity = studyQueryService.getStudyEntityByUuid(studyUuid);
                if (projectionMatchesRequest(entity, request)) {
                    return;
                }
            } catch (RuntimeException ex) {
                log.debug("Projection not ready for study {}: {}", studyUuid, ex.getMessage());
            }

            try {
                Thread.sleep(50);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                return;
            }
        }

        log.warn("Timed out waiting for projection update for study {}", studyUuid);
    }

    private boolean projectionMatchesRequest(StudyEntity entity, StudyUpdateRequestDto request) {
        if (entity == null) {
            return false;
        }

        if (request.getDescription() != null && !Objects.equals(request.getDescription(), entity.getDescription())) {
            return false;
        }
        if (request.getName() != null && !Objects.equals(request.getName(), entity.getName())) {
            return false;
        }
        if (request.getSponsor() != null && !Objects.equals(request.getSponsor(), entity.getSponsor())) {
            return false;
        }
        if (request.getProtocolNumber() != null && !Objects.equals(request.getProtocolNumber(), entity.getProtocolNumber())) {
            return false;
        }
        if (request.getIndication() != null && !Objects.equals(request.getIndication(), entity.getIndication())) {
            return false;
        }
        if (request.getStudyType() != null && !Objects.equals(request.getStudyType(), entity.getStudyType())) {
            return false;
        }
        if (request.getPrincipalInvestigator() != null && !Objects.equals(request.getPrincipalInvestigator(), entity.getPrincipalInvestigator())) {
            return false;
        }
        if (request.getTherapeuticArea() != null && !Objects.equals(request.getTherapeuticArea(), entity.getTherapeuticArea())) {
            return false;
        }
        if (request.getTargetEnrollment() != null && !Objects.equals(request.getTargetEnrollment(), entity.getTargetEnrollment())) {
            return false;
        }

        return true;
    }
    
    // ===================== STUDY ARMS OPERATIONS (Bridge Pattern) =====================
    
    /**
     * Get study entity by UUID (for internal use)
     * Helper method for controllers to resolve UUIDs
     */
    public StudyEntity getStudyEntityByUuid(UUID studyUuid) {
        return studyQueryService.getStudyEntityByUuid(studyUuid);
    }
    
    /**
     * Create a study arm (bridge implementation)
     * TODO: Replace with DDD command when StudyDesignAggregate is ready
     * 
     * @param studyId Study ID
     * @param armData Arm data
     * @return Created arm DTO
     */
    @Transactional
    public StudyArmResponseDto createStudyArm(
            Long studyId, 
            StudyArmRequestDto armData) {
        
        log.info("Creating study arm '{}' for study ID: {}", armData.getName(), studyId);
        
        // Create entity
        StudyArmEntity entity =
            new StudyArmEntity();
        entity.setName(armData.getName());
        entity.setDescription(armData.getDescription());
        entity.setType(StudyArmType.valueOf(armData.getType()));
        entity.setSequence(armData.getSequence());
        entity.setPlannedSubjects(armData.getPlannedSubjects() != null ? armData.getPlannedSubjects() : 0);
        entity.setStudyId(studyId);
        entity.setCreatedBy("system"); // TODO: Get from security context
        entity.setUpdatedBy("system");
        
        // Save to read model
        StudyArmRepository armRepository =
            ((StudyQueryService) studyQueryService).getStudyArmRepository();
        StudyArmEntity saved = armRepository.save(entity);
        
        // Handle interventions if provided
        if (armData.getInterventions() != null && !armData.getInterventions().isEmpty()) {
            updateArmInterventions(saved.getId(), armData.getInterventions());
        }
        
        // Handle randomization strategy if provided
        if (armData.getRandomizationStrategy() != null) {
            updateArmRandomizationStrategy(saved.getId(), armData.getRandomizationStrategy());
        }
        
        // Convert to response DTO
        return studyQueryService.toArmResponseDto(saved);
    }
    
    /**
     * Update a study arm (bridge implementation)
     * TODO: Replace with DDD command when StudyDesignAggregate is ready
     * 
     * @param armId Arm ID
     * @param armData Updated arm data
     * @return Updated arm DTO
     */
    @Transactional
    public StudyArmResponseDto updateStudyArm(
            Long armId,
            StudyArmRequestDto armData) {
        
        log.info("Updating study arm ID: {} with interventions: {}", armId, 
                armData.getInterventions() != null ? armData.getInterventions().size() : 0);
        
        StudyArmRepository armRepository =
            ((StudyQueryService) studyQueryService).getStudyArmRepository();
        
        StudyArmEntity entity = armRepository.findById(armId)
            .orElseThrow(() -> new RuntimeException("Study arm not found: " + armId));
        
        // Update fields
        entity.setName(armData.getName());
        entity.setDescription(armData.getDescription());
        entity.setType(StudyArmType.valueOf(armData.getType()));
        entity.setSequence(armData.getSequence());
        entity.setPlannedSubjects(armData.getPlannedSubjects() != null ? armData.getPlannedSubjects() : entity.getPlannedSubjects());
        entity.setUpdatedBy("system"); // TODO: Get from security context
        
        // Save updated entity
        StudyArmEntity updated = armRepository.save(entity);
        
        // Handle interventions - delete existing and create new ones
        updateArmInterventions(armId, armData.getInterventions());
        
        // Handle randomization strategy
        updateArmRandomizationStrategy(armId, armData.getRandomizationStrategy());
        
        // Convert to response DTO
        return studyQueryService.toArmResponseDto(updated);
    }
    
    /**
     * Update interventions for a study arm
     * Deletes existing interventions and creates new ones
     * 
     * @param armId Study arm ID
     * @param interventions List of intervention DTOs
     */
    private void updateArmInterventions(Long armId, java.util.List<InterventionDto> interventions) {
        // Delete existing interventions
        interventionRepository.deleteByStudyArmId(armId);
        
        // Create new interventions if provided
        if (interventions != null && !interventions.isEmpty()) {
            log.info("Creating {} interventions for study arm ID: {}", interventions.size(), armId);
            
            for (InterventionDto dto : interventions) {
                StudyInterventionEntity entity = new StudyInterventionEntity();
                entity.setStudyArmId(armId);
                // Note: ID is ignored for new interventions - database will generate it
                // Frontend sends temporary IDs like "INT-1759775992731" for new interventions
                entity.setName(dto.getName());
                entity.setDescription(dto.getDescription());
                entity.setType(dto.getType() != null ? InterventionType.valueOf(dto.getType()) : null);
                entity.setDosage(dto.getDosage());
                entity.setFrequency(dto.getFrequency());
                entity.setRoute(dto.getRoute());
                entity.setCreatedBy("system"); // TODO: Get from security context
                entity.setUpdatedBy("system");
                
                interventionRepository.save(entity);
            }
        }
    }
    
    /**
     * Update randomization strategy for a study arm
     * Deletes existing strategy and creates new one
     * 
     * @param armId Study arm ID
     * @param strategyDto Randomization strategy DTO
     */
    private void updateArmRandomizationStrategy(Long armId, RandomizationStrategyDto strategyDto) {
        // Delete existing randomization strategy
        randomizationStrategyRepository.deleteByStudyArmId(armId);
        
        // Create new randomization strategy if provided
        if (strategyDto != null) {
            log.info("Creating randomization strategy for study arm ID: {}", armId);
            
            StudyRandomizationStrategyEntity entity = new StudyRandomizationStrategyEntity();
            entity.setStudyArmId(armId);
            entity.setType(strategyDto.getType());
            entity.setRatio(strategyDto.getRatio());
            entity.setBlockSize(strategyDto.getBlockSize());
            entity.setStratificationFactors(strategyDto.getStratificationFactors());
            entity.setNotes(strategyDto.getNotes());
            entity.setCreatedBy("system"); // TODO: Get from security context
            entity.setUpdatedBy("system");
            
            randomizationStrategyRepository.save(entity);
        }
    }
    
    /**
     * Delete a study arm (bridge implementation)
     * TODO: Replace with DDD command when StudyDesignAggregate is ready
     * 
     * @param armId Arm ID
     */
    @Transactional
    public void deleteStudyArm(Long armId) {
        log.info("Deleting study arm ID: {}", armId);
        
        StudyArmRepository armRepository =
            ((StudyQueryService) studyQueryService).getStudyArmRepository();
        
        // Soft delete - set is_deleted flag
        StudyArmEntity entity = armRepository.findById(armId)
            .orElseThrow(() -> new RuntimeException("Study arm not found: " + armId));
        
        entity.setIsDeleted(true);
        // entity.setDeletedAt(LocalDateTime.now()); // TODO: Uncomment when column exists
        // entity.setDeletedBy("system"); // TODO: Get from security context
        
        armRepository.save(entity);
        
        log.info("Study arm deleted successfully");
    }
    
    /**
     * Helper method to log the complete exception chain
     * This helps diagnose wrapped exceptions from Axon Framework
     * 
     * @param throwable The exception to log
     */
    private void logExceptionChain(Throwable throwable) {
        log.error("=== EXCEPTION CHAIN START ===");
        int level = 0;
        Throwable current = throwable;
        
        while (current != null) {
            log.error("Exception level {}: {} - {}", 
                level, 
                current.getClass().getName(), 
                current.getMessage());
            
            // Log stack trace for this level
            StackTraceElement[] stackTrace = current.getStackTrace();
            if (stackTrace != null && stackTrace.length > 0) {
                log.error("  Stack trace (first 5 elements):");
                int limit = Math.min(5, stackTrace.length);
                for (int i = 0; i < limit; i++) {
                    log.error("    at {}", stackTrace[i]);
                }
            }
            
            current = current.getCause();
            level++;
            
            if (level > 10) {
                log.error("Exception chain too deep (>10 levels), stopping trace");
                break;
            }
        }
        
        log.error("=== EXCEPTION CHAIN END ===");
    }
}






