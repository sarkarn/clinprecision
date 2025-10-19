package com.clinprecision.clinopsservice.protocolversion.service;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Protocol Version Command Service - Application service for sending commands
 * 
 * This service provides a clean API for the controller layer to send commands
 * to the ProtocolVersionAggregate via Axon's CommandGateway.
 * 
 * Benefits:
 * - Hides Axon framework details from controllers
 * - Provides both sync and async command execution
 * - Centralized error handling and logging
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionCommandService {

    private final CommandGateway commandGateway;
    private final ProtocolVersionValidationService validationService;

    /**
     * Create a new protocol version
     * @return UUID of the created version
     */
    public CompletableFuture<UUID> createVersion(CreateProtocolVersionCommand command) {
        log.info("Sending CreateProtocolVersionCommand for version: {}", command.getVersionNumber());
        return commandGateway.send(command);
    }

    /**
     * Create version synchronously
     */
    public UUID createVersionSync(CreateProtocolVersionCommand command) {
        log.info("Sending CreateProtocolVersionCommand (sync) for version: {}", command.getVersionNumber());
        return commandGateway.sendAndWait(command);
    }

    /**
     * Change version status (REPLACES DATABASE TRIGGERS!)
     * Validates cross-entity dependencies before status change
     */
    public CompletableFuture<Void> changeStatus(ChangeVersionStatusCommand command) {
        log.info("Sending ChangeVersionStatusCommand: {} -> {}", 
            command.getVersionId(), command.getNewStatus());
        
        // Validate status change BEFORE sending command
        validationService.validateStatusChange(command.getVersionId(), command.getNewStatus());
        
        return commandGateway.send(command);
    }

    /**
     * Change version status synchronously
     * Validates cross-entity dependencies before status change
     */
    public void changeStatusSync(ChangeVersionStatusCommand command) {
        log.info("Sending ChangeVersionStatusCommand (sync): {} -> {}", 
            command.getVersionId(), command.getNewStatus());
        
        // Validate status change BEFORE sending command
        validationService.validateStatusChange(command.getVersionId(), command.getNewStatus());
        
        commandGateway.sendAndWait(command);
    }

    /**
     * Approve a version
     * Validates version can be approved before dispatching command
     */
    public CompletableFuture<Void> approveVersion(ApproveVersionCommand command) {
        log.info("Sending ApproveVersionCommand for version: {}", command.getVersionId());
        
        // Validate approval BEFORE sending command
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.APPROVED);
        
        return commandGateway.send(command);
    }

    /**
     * Approve version synchronously
     * Validates version can be approved before dispatching command
     */
    public void approveVersionSync(ApproveVersionCommand command) {
        log.info("Sending ApproveVersionCommand (sync) for version: {}", command.getVersionId());
        
        // Validate approval BEFORE sending command
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.APPROVED);
        
        commandGateway.sendAndWait(command);
    }

    /**
     * Activate a version
     * CRITICAL: Validates only ONE active version per study rule
     */
    public CompletableFuture<Void> activateVersion(ActivateVersionCommand command) {
        log.info("Sending ActivateVersionCommand for version: {}", command.getVersionId());
        
        // CRITICAL VALIDATION: Only one active version allowed per study
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.ACTIVE);
        
        return commandGateway.send(command);
    }

    /**
     * Activate version synchronously
     * CRITICAL: Validates only ONE active version per study rule
     */
    public void activateVersionSync(ActivateVersionCommand command) {
        log.info("Sending ActivateVersionCommand (sync) for version: {}", command.getVersionId());
        
        // CRITICAL VALIDATION: Only one active version allowed per study
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.ACTIVE);
        
        commandGateway.sendAndWait(command);
    }

    /**
     * Update version details
     * Validates modification allowed before dispatching command
     */
    public CompletableFuture<Void> updateDetails(UpdateVersionDetailsCommand command) {
        log.info("Sending UpdateVersionDetailsCommand for version: {}", command.getVersionId());
        
        // Validate modification allowed
        validationService.validateVersionModification(command.getVersionId());
        
        return commandGateway.send(command);
    }

    /**
     * Update version details synchronously
     * Validates modification allowed before dispatching command
     */
    public void updateDetailsSync(UpdateVersionDetailsCommand command) {
        log.info("Sending UpdateVersionDetailsCommand (sync) for version: {}", command.getVersionId());
        
        // Validate modification allowed
        validationService.validateVersionModification(command.getVersionId());
        
        commandGateway.sendAndWait(command);
    }

    /**
     * Withdraw a version
     * Validates withdrawal rules before dispatching command
     */
    public CompletableFuture<Void> withdrawVersion(WithdrawVersionCommand command) {
        log.info("Sending WithdrawVersionCommand for version: {}", command.getVersionId());
        
        // Validate withdrawal rules
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.WITHDRAWN);
        
        return commandGateway.send(command);
    }

    /**
     * Withdraw version synchronously
     * Validates withdrawal rules before dispatching command
     */
    public void withdrawVersionSync(WithdrawVersionCommand command) {
        log.info("Sending WithdrawVersionCommand (sync) for version: {}", command.getVersionId());
        
        // Validate withdrawal rules
        validationService.validateStatusChange(command.getVersionId(), VersionStatus.WITHDRAWN);
        
        commandGateway.sendAndWait(command);
    }
}



