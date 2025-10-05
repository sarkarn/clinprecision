package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.studydesign.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyIdentifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Study Command Service
 * 
 * Application service for study write operations (command side).
 * Following CQRS pattern: Commands are sent to aggregates via CommandGateway.
 * 
 * Responsibilities:
 * - Send commands to Axon Command Gateway
 * - Handle command validation
 * - Provide async/sync command execution
 * - Return aggregate identifiers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyCommandService {

    private final CommandGateway commandGateway;

    /**
     * Create a new study
     * 
     * @param command The create study command
     * @return CompletableFuture with the study ID
     */
    public CompletableFuture<UUID> createStudy(CreateStudyCommand command) {
        log.info("Creating study: {}", command.getName());
        
        // Validate command
        command.validate();
        
        // Send command via Axon Command Gateway
        return commandGateway.send(command);
    }

    /**
     * Create a new study (synchronous)
     * 
     * @param command The create study command
     * @return The study ID
     */
    public UUID createStudySync(CreateStudyCommand command) {
        log.info("Creating study (sync): {}", command.getName());
        
        command.validate();
        
        try {
            return commandGateway.sendAndWait(command);
        } catch (Exception e) {
            log.error("Error creating study: {}", command.getName(), e);
            throw new RuntimeException("Failed to create study: " + e.getMessage(), e);
        }
    }

    /**
     * Change study status
     * 
     * CRITICAL: This is the explicit command-driven replacement for database triggers!
     * 
     * @param command The change status command
     * @return CompletableFuture<Void>
     */
    public CompletableFuture<Void> changeStudyStatus(ChangeStudyStatusCommand command) {
        log.info("Changing study status: {} to {}", command.getStudyId(), command.getNewStatus());
        
        command.validate();
        
        return commandGateway.send(command);
    }

    /**
     * Change study status (synchronous)
     * 
     * @param command The change status command
     */
    public void changeStudyStatusSync(ChangeStudyStatusCommand command) {
        log.info("Changing study status (sync): {} to {}", command.getStudyId(), command.getNewStatus());
        
        command.validate();
        
        try {
            commandGateway.sendAndWait(command);
        } catch (Exception e) {
            log.error("Error changing study status: {}", command.getStudyId(), e);
            throw new RuntimeException("Failed to change study status: " + e.getMessage(), e);
        }
    }

    /**
     * Update study details
     * 
     * @param command The update command
     * @return CompletableFuture<Void>
     */
    public CompletableFuture<Void> updateStudyDetails(UpdateStudyDetailsCommand command) {
        log.info("Updating study details: {}", command.getStudyId());
        
        command.validate();
        
        return commandGateway.send(command);
    }

    /**
     * Update study details (synchronous)
     * 
     * @param command The update command
     */
    public void updateStudyDetailsSync(UpdateStudyDetailsCommand command) {
        log.info("Updating study details (sync): {}", command.getStudyId());
        
        command.validate();
        
        try {
            commandGateway.sendAndWait(command);
        } catch (Exception e) {
            log.error("Error updating study details: {}", command.getStudyId(), e);
            throw new RuntimeException("Failed to update study details: " + e.getMessage(), e);
        }
    }

    /**
     * Close study
     * 
     * @param command The close study command
     * @return CompletableFuture<Void>
     */
    public CompletableFuture<Void> closeStudy(CloseStudyCommand command) {
        log.info("Closing study: {} with reason: {}", command.getStudyId(), command.getClosureReason());
        
        command.validate();
        
        return commandGateway.send(command);
    }

    /**
     * Close study (synchronous)
     * 
     * @param command The close study command
     */
    public void closeStudySync(CloseStudyCommand command) {
        log.info("Closing study (sync): {} with reason: {}", command.getStudyId(), command.getClosureReason());
        
        command.validate();
        
        try {
            commandGateway.sendAndWait(command);
        } catch (Exception e) {
            log.error("Error closing study: {}", command.getStudyId(), e);
            throw new RuntimeException("Failed to close study: " + e.getMessage(), e);
        }
    }

    /**
     * Generate new study identifier
     * 
     * Utility method for creating new study UUIDs.
     */
    public UUID generateStudyId() {
        return StudyIdentifier.newIdentifier().getValue();
    }
}
