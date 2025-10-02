package com.clinprecision.datacaptureservice.studydatabase.service;

import com.clinprecision.datacaptureservice.studydatabase.domain.commands.*;
import com.clinprecision.datacaptureservice.studydatabase.dto.*;
import com.clinprecision.datacaptureservice.studydatabase.entity.StudyDatabaseBuildEntity;
import com.clinprecision.datacaptureservice.studydatabase.repository.StudyDatabaseBuildRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Study Database Build Command Service
 * 
 * Handles write operations using Axon CommandGateway.
 * Follows established ClinPrecision patterns for command processing.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildCommandService {

    private final CommandGateway commandGateway;
    private final StudyDatabaseBuildRepository buildRepository;

    /**
     * Build a study database
     * 
     * @param requestDto Build request details
     * @return Created build DTO with database ID and aggregate UUID
     */
    public StudyDatabaseBuildDto buildStudyDatabase(BuildStudyDatabaseRequestDto requestDto) {
        log.info("Building study database for study: {} ({})", 
                 requestDto.getStudyName(), requestDto.getStudyId());
        
        try {
            // Check for existing in-progress build
            boolean hasActiveBuild = buildRepository.existsByStudyIdAndBuildStatus(
                requestDto.getStudyId(), 
                com.clinprecision.datacaptureservice.studydatabase.entity.StudyDatabaseBuildStatus.IN_PROGRESS
            );
            
            if (hasActiveBuild) {
                throw new IllegalStateException(
                    "Study " + requestDto.getStudyId() + " already has an in-progress build. " +
                    "Please wait for it to complete or cancel it before starting a new build."
                );
            }
            
            // Generate UUIDs
            UUID studyDatabaseBuildId = UUID.randomUUID();
            String buildRequestId = generateBuildRequestId(requestDto.getStudyId());
            
            log.info("Generated build UUID: {}, request ID: {}", studyDatabaseBuildId, buildRequestId);
            
            // Send command
            sendBuildCommand(studyDatabaseBuildId, buildRequestId, requestDto);
            
            log.info("BuildStudyDatabaseCommand completed successfully for UUID: {}", studyDatabaseBuildId);
            
            // Wait for projection to update read model
            StudyDatabaseBuildEntity entity = waitForBuildProjection(
                studyDatabaseBuildId.toString(), 
                5000
            );
            
            StudyDatabaseBuildDto result = mapToDto(entity);
            
            log.info("Study database build initiated successfully: ID={}, UUID={}, RequestID={}", 
                     result.getId(), result.getAggregateUuid(), result.getBuildRequestId());
            
            return result;
            
        } catch (IllegalStateException e) {
            log.warn("Build validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error building study database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build study database: " + e.getMessage(), e);
        }
    }

    /**
     * Validate a study database build
     * 
     * @param requestDto Validation request details
     * @return Updated build DTO
     */
    public StudyDatabaseBuildDto validateStudyDatabase(ValidateStudyDatabaseRequestDto requestDto) {
        log.info("Validating study database build: {}", requestDto.getBuildRequestId());
        
        try {
            // Get existing build
            StudyDatabaseBuildEntity existingBuild = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow(() -> new IllegalArgumentException(
                "Build not found: " + requestDto.getBuildRequestId()
            ));
            
            // Create and send command
            ValidateStudyDatabaseCommand command = ValidateStudyDatabaseCommand.builder()
                    .studyDatabaseBuildId(UUID.fromString(existingBuild.getAggregateUuid()))
                    .studyId(existingBuild.getStudyId())
                    .strictValidation(requestDto.getStrictValidation())
                    .complianceCheck(requestDto.getComplianceCheck())
                    .performanceCheck(requestDto.getPerformanceCheck())
                    .build();
            
            log.info("Sending ValidateStudyDatabaseCommand to Axon for build: {}", 
                     requestDto.getBuildRequestId());
            
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(10, TimeUnit.SECONDS);
            
            // Wait and fetch updated entity
            Thread.sleep(200);
            StudyDatabaseBuildEntity updatedEntity = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow();
            
            log.info("Study database validation completed for build: {}", requestDto.getBuildRequestId());
            return mapToDto(updatedEntity);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error validating study database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to validate study database: " + e.getMessage(), e);
        }
    }

    /**
     * Cancel a study database build
     * 
     * @param requestDto Cancellation request details
     * @param cancelledBy User ID performing cancellation
     * @return Updated build DTO
     */
    public StudyDatabaseBuildDto cancelStudyDatabaseBuild(
            CancelStudyDatabaseBuildRequestDto requestDto, 
            Long cancelledBy) {
        log.info("Cancelling study database build: {} by user: {}", 
                 requestDto.getBuildRequestId(), cancelledBy);
        
        try {
            // Get existing build
            StudyDatabaseBuildEntity existingBuild = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow(() -> new IllegalArgumentException(
                "Build not found: " + requestDto.getBuildRequestId()
            ));
            
            // Create and send command
            CancelStudyDatabaseBuildCommand command = CancelStudyDatabaseBuildCommand.builder()
                    .studyDatabaseBuildId(UUID.fromString(existingBuild.getAggregateUuid()))
                    .requestedBy(cancelledBy)
                    .cancellationReason(requestDto.getCancellationReason())
                    .build();
            
            log.info("Sending CancelStudyDatabaseBuildCommand to Axon for build: {}", 
                     requestDto.getBuildRequestId());
            
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(10, TimeUnit.SECONDS);
            
            // Wait and fetch updated entity
            Thread.sleep(200);
            StudyDatabaseBuildEntity updatedEntity = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow();
            
            log.info("Study database build cancelled: {}", requestDto.getBuildRequestId());
            return mapToDto(updatedEntity);
            
        } catch (IllegalArgumentException e) {
            log.warn("Cancellation request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error cancelling study database build: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to cancel study database build: " + e.getMessage(), e);
        }
    }

    /**
     * Complete a study database build
     * 
     * @param requestDto Completion request details
     * @param completedBy User ID performing completion
     * @return Updated build DTO
     */
    public StudyDatabaseBuildDto completeStudyDatabaseBuild(
            CompleteStudyDatabaseBuildRequestDto requestDto,
            Long completedBy) {
        log.info("Completing study database build: {} by user: {}", 
                 requestDto.getBuildRequestId(), completedBy);
        
        try {
            // Get existing build
            StudyDatabaseBuildEntity existingBuild = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow(() -> new IllegalArgumentException(
                "Build not found: " + requestDto.getBuildRequestId()
            ));
            
            // Create validation result
            CompleteStudyDatabaseBuildCommand.ValidationResultData validationResult = 
                CompleteStudyDatabaseBuildCommand.ValidationResultData.builder()
                    .isValid(requestDto.getValidationResult().getIsValid())
                    .overallAssessment(requestDto.getValidationResult().getOverallAssessment())
                    .complianceStatus(requestDto.getValidationResult().getComplianceStatus())
                    .performanceScore(requestDto.getValidationResult().getPerformanceScore())
                    .build();
            
            // Create and send command
            CompleteStudyDatabaseBuildCommand command = CompleteStudyDatabaseBuildCommand.builder()
                    .studyDatabaseBuildId(UUID.fromString(existingBuild.getAggregateUuid()))
                    .completedBy(completedBy)
                    .formsConfigured(requestDto.getFormsConfigured())
                    .validationRulesSetup(requestDto.getValidationRulesSetup())
                    .validationResult(validationResult)
                    .buildMetrics(requestDto.getBuildMetrics())
                    .build();
            
            log.info("Sending CompleteStudyDatabaseBuildCommand to Axon for build: {}", 
                     requestDto.getBuildRequestId());
            
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(10, TimeUnit.SECONDS);
            
            // Wait and fetch updated entity
            Thread.sleep(200);
            StudyDatabaseBuildEntity updatedEntity = buildRepository.findByBuildRequestId(
                requestDto.getBuildRequestId()
            ).orElseThrow();
            
            log.info("Study database build completed: {}", requestDto.getBuildRequestId());
            return mapToDto(updatedEntity);
            
        } catch (IllegalArgumentException e) {
            log.warn("Completion request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error completing study database build: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to complete study database build: " + e.getMessage(), e);
        }
    }

    /**
     * Send build command in separate transaction context
     */
    @Transactional
    private void sendBuildCommand(
            UUID studyDatabaseBuildId,
            String buildRequestId,
            BuildStudyDatabaseRequestDto requestDto) {
        try {
            BuildStudyDatabaseCommand command = BuildStudyDatabaseCommand.builder()
                    .studyDatabaseBuildId(studyDatabaseBuildId)
                    .studyId(requestDto.getStudyId())
                    .studyName(requestDto.getStudyName())
                    .studyProtocol(requestDto.getStudyProtocol())
                    .requestedBy(requestDto.getRequestedBy())
                    .studyDesignConfiguration(requestDto.getBuildConfiguration())
                    .build();
            
            log.info("Sending BuildStudyDatabaseCommand to Axon for UUID: {}", studyDatabaseBuildId);
            
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(10, TimeUnit.SECONDS);
            
        } catch (Exception e) {
            log.error("Error sending build command for UUID {}: {}", studyDatabaseBuildId, e.getMessage(), e);
            throw new RuntimeException("Failed to send build command", e);
        }
    }

    /**
     * Wait for projection to create/update the read model
     */
    private StudyDatabaseBuildEntity waitForBuildProjection(String aggregateUuid, long timeoutMillis) {
        long startTime = System.currentTimeMillis();
        int attempts = 0;
        
        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            attempts++;
            
            Optional<StudyDatabaseBuildEntity> optional = buildRepository.findByAggregateUuid(aggregateUuid);
            if (optional.isPresent()) {
                log.info("Build projection found after {} attempts ({}ms)", 
                         attempts, System.currentTimeMillis() - startTime);
                return optional.get();
            }
            
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for build projection", e);
            }
        }
        
        throw new RuntimeException(
            "Timeout waiting for build projection after " + timeoutMillis + 
            "ms. UUID: " + aggregateUuid
        );
    }

    /**
     * Generate human-readable build request ID
     */
    private String generateBuildRequestId(Long studyId) {
        return "BUILD-" + studyId + "-" + System.currentTimeMillis();
    }

    /**
     * Map entity to DTO
     */
    private StudyDatabaseBuildDto mapToDto(StudyDatabaseBuildEntity entity) {
        return StudyDatabaseBuildDto.builder()
                .id(entity.getId())
                .aggregateUuid(entity.getAggregateUuid())
                .buildRequestId(entity.getBuildRequestId())
                .studyId(entity.getStudyId())
                .studyName(entity.getStudyName())
                .studyProtocol(entity.getStudyProtocol())
                .buildStatus(entity.getBuildStatus().name())
                .buildStartTime(entity.getBuildStartTime())
                .buildEndTime(entity.getBuildEndTime())
                .buildDurationSeconds(entity.getBuildDurationSeconds())
                .requestedBy(entity.getRequestedBy())
                .cancelledBy(entity.getCancelledBy())
                .validatedBy(entity.getValidatedBy())
                .tablesCreated(entity.getTablesCreated())
                .indexesCreated(entity.getIndexesCreated())
                .triggersCreated(entity.getTriggersCreated())
                .formsConfigured(entity.getFormsConfigured())
                .validationRulesCreated(entity.getValidationRulesCreated())
                .validationStatus(entity.getValidationStatus())
                .validatedAt(entity.getValidatedAt())
                .cancellationReason(entity.getCancellationReason())
                .errorDetails(entity.getErrorDetails())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .inProgress(entity.isInProgress())
                .completed(entity.isCompleted())
                .failed(entity.isFailed())
                .cancelled(entity.isCancelled())
                .build();
    }
}
