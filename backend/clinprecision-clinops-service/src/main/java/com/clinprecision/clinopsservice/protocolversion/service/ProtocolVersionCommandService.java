package com.clinprecision.clinopsservice.protocolversion.service;

import com.clinprecision.clinopsservice.protocolversion.domain.commands.*;
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
     */
    public CompletableFuture<Void> changeStatus(ChangeVersionStatusCommand command) {
        log.info("Sending ChangeVersionStatusCommand: {} -> {}", 
            command.getVersionId(), command.getNewStatus());
        return commandGateway.send(command);
    }

    /**
     * Change version status synchronously
     */
    public void changeStatusSync(ChangeVersionStatusCommand command) {
        log.info("Sending ChangeVersionStatusCommand (sync): {} -> {}", 
            command.getVersionId(), command.getNewStatus());
        commandGateway.sendAndWait(command);
    }

    /**
     * Approve a version
     */
    public CompletableFuture<Void> approveVersion(ApproveVersionCommand command) {
        log.info("Sending ApproveVersionCommand for version: {}", command.getVersionId());
        return commandGateway.send(command);
    }

    /**
     * Approve version synchronously
     */
    public void approveVersionSync(ApproveVersionCommand command) {
        log.info("Sending ApproveVersionCommand (sync) for version: {}", command.getVersionId());
        commandGateway.sendAndWait(command);
    }

    /**
     * Activate a version
     */
    public CompletableFuture<Void> activateVersion(ActivateVersionCommand command) {
        log.info("Sending ActivateVersionCommand for version: {}", command.getVersionId());
        return commandGateway.send(command);
    }

    /**
     * Activate version synchronously
     */
    public void activateVersionSync(ActivateVersionCommand command) {
        log.info("Sending ActivateVersionCommand (sync) for version: {}", command.getVersionId());
        commandGateway.sendAndWait(command);
    }

    /**
     * Update version details
     */
    public CompletableFuture<Void> updateDetails(UpdateVersionDetailsCommand command) {
        log.info("Sending UpdateVersionDetailsCommand for version: {}", command.getVersionId());
        return commandGateway.send(command);
    }

    /**
     * Update version details synchronously
     */
    public void updateDetailsSync(UpdateVersionDetailsCommand command) {
        log.info("Sending UpdateVersionDetailsCommand (sync) for version: {}", command.getVersionId());
        commandGateway.sendAndWait(command);
    }

    /**
     * Withdraw a version
     */
    public CompletableFuture<Void> withdrawVersion(WithdrawVersionCommand command) {
        log.info("Sending WithdrawVersionCommand for version: {}", command.getVersionId());
        return commandGateway.send(command);
    }

    /**
     * Withdraw version synchronously
     */
    public void withdrawVersionSync(WithdrawVersionCommand command) {
        log.info("Sending WithdrawVersionCommand (sync) for version: {}", command.getVersionId());
        commandGateway.sendAndWait(command);
    }
}
