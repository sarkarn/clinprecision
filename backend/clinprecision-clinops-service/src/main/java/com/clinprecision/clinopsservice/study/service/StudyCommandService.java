package com.clinprecision.clinopsservice.study.service;

import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.study.command.*;
import com.clinprecision.clinopsservice.study.dto.request.*;
import com.clinprecision.clinopsservice.study.mapper.StudyCommandMapper;
import java.time.Duration;
import java.util.Objects;
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
    // TODO: Inject SecurityService to get current user context
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
        
        // TODO: Get current user from security context
        // UUID userId = securityService.getCurrentUserId();
        // String userName = securityService.getCurrentUserName();
        UUID userId = UUID.randomUUID(); // Temporary - replace with actual user
        String userName = "system"; // Temporary - replace with actual user
        
        CreateStudyCommand command = commandMapper.toCreateCommand(request, userId, userName);
        
        log.debug("Dispatching CreateStudyCommand for study: {} with UUID: {}", 
                  request.getName(), command.getStudyAggregateUuid());
        
        // Send command and wait for completion (synchronous)
        commandGateway.sendAndWait(command);
        
        log.info("Study created successfully with UUID: {}", command.getStudyAggregateUuid());
        return command.getStudyAggregateUuid();
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
        
        // TODO: Get current user from security context
        UUID userId = UUID.randomUUID(); // Temporary
        String userName = "system"; // Temporary
        
        UpdateStudyCommand command = commandMapper.toUpdateCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching UpdateStudyCommand for study: {}", studyUuid);
        
        // Send command and wait for completion
        commandGateway.sendAndWait(command);
        
    log.info("Study updated successfully: {}", studyUuid);

    scheduleProjectionAwait(studyUuid, request, Duration.ofSeconds(5));
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
        
        // TODO: Get current user from security context
        UUID userId = UUID.randomUUID(); // Temporary
        String userName = "system"; // Temporary
        
        SuspendStudyCommand command = commandMapper.toSuspendCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching SuspendStudyCommand for study: {}", studyUuid);
        
        commandGateway.sendAndWait(command);
        
        log.info("Study suspended successfully: {}", studyUuid);
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
        
        // TODO: Get current user from security context
        UUID userId = UUID.randomUUID(); // Temporary
        String userName = "system"; // Temporary
        
        TerminateStudyCommand command = commandMapper.toTerminateCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching TerminateStudyCommand for study: {}", studyUuid);
        
        commandGateway.sendAndWait(command);
        
        log.warn("Study terminated (terminal state): {}", studyUuid);
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
        
        // TODO: Get current user from security context
        UUID userId = UUID.randomUUID(); // Temporary
        String userName = "system"; // Temporary
        
        WithdrawStudyCommand command = commandMapper.toWithdrawCommand(studyUuid, request, userId, userName);
        
        log.debug("Dispatching WithdrawStudyCommand for study: {}", studyUuid);
        
        commandGateway.sendAndWait(command);
        
        log.warn("Study withdrawn (terminal state): {}", studyUuid);
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
        
        // TODO: Get current user from security context
        UUID userId = UUID.randomUUID(); // Temporary
        String userName = "system"; // Temporary
        
        CompleteStudyCommand command = commandMapper.toCompleteCommand(studyUuid, userId, userName);
        
        log.debug("Dispatching CompleteStudyCommand for study: {}", studyUuid);
        
        commandGateway.sendAndWait(command);
        
        log.info("Study completed successfully: {}", studyUuid);
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
}



