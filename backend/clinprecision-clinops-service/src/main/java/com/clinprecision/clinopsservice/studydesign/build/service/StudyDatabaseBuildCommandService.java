package com.clinprecision.clinopsservice.studydesign.build.service;


import com.clinprecision.clinopsservice.studydesign.design.arm.entity.StudyArmEntity;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.build.entity.StudyDatabaseBuildEntity;
import com.clinprecision.clinopsservice.studydesign.build.repository.StudyDatabaseBuildRepository;

import com.clinprecision.clinopsservice.studydesign.build.domain.commands.BuildStudyDatabaseCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.CancelStudyDatabaseBuildCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.CompleteStudyDatabaseBuildCommand;
import com.clinprecision.clinopsservice.studydesign.build.domain.commands.ValidateStudyDatabaseCommand;
import com.clinprecision.clinopsservice.studydesign.build.dto.*;
import com.clinprecision.clinopsservice.studydesign.build.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydesign.design.arm.repository.StudyArmRepository;
import com.clinprecision.clinopsservice.studydesign.design.form.repository.FormDefinitionRepository;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.studydesign.studymgmt.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final FormDefinitionRepository formDefinitionRepository;
    private final StudyRepository studyRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final StudyArmRepository studyArmRepository;

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
                StudyDatabaseBuildStatus.IN_PROGRESS
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
            
            // Seed a minimal read model record upfront to avoid polling timeouts when
            // the tracking processor starts slower than the command completes.
            seedReadModel(studyDatabaseBuildId.toString(), buildRequestId, requestDto);

            // Send command
            sendBuildCommand(studyDatabaseBuildId, buildRequestId, requestDto);
            
            log.info("BuildStudyDatabaseCommand completed successfully for UUID: {}", studyDatabaseBuildId);
            
            // Wait for projection to update read model
            // Increased timeout to 15 seconds to account for event processing
            StudyDatabaseBuildEntity entity = waitForBuildProjection(
                studyDatabaseBuildId.toString(), 
                15000
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
     * Seed a minimal read model entity so that UI can find it immediately.
     * It will be completed/updated by the projection handler once events are processed.
     */
    private void seedReadModel(String aggregateUuid, String buildRequestId, BuildStudyDatabaseRequestDto requestDto) {
        try {
            Optional<StudyDatabaseBuildEntity> existing = buildRepository.findByAggregateUuid(aggregateUuid);
            if (existing.isPresent()) {
                return; // already present
            }
            StudyDatabaseBuildEntity seed = StudyDatabaseBuildEntity.builder()
                    .aggregateUuid(aggregateUuid)
                    .buildRequestId(buildRequestId)
                    .studyId(requestDto.getStudyId())
                    .studyName(requestDto.getStudyName())
                    .studyProtocol(requestDto.getStudyProtocol())
                    .buildStatus(StudyDatabaseBuildStatus.IN_PROGRESS)
                    .buildStartTime(java.time.LocalDateTime.now())
                    .requestedBy(requestDto.getRequestedBy())
                    .tablesCreated(0)
                    .indexesCreated(0)
                    .triggersCreated(0)
                    .formsConfigured(0)
                    .validationRulesCreated(0)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            buildRepository.save(seed);
            log.debug("Seeded read model entity for build UUID: {}", aggregateUuid);
        } catch (Exception e) {
            log.warn("Failed to seed read model for {}: {}", aggregateUuid, e.getMessage());
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
            Long studyId = requestDto.getStudyId();
            
            // Fetch study to verify it exists
            var study = studyRepository.findById(studyId)
                    .orElseThrow(() -> new IllegalArgumentException("Study not found: " + studyId));
            
            log.info("Fetching study design data for study ID: {}", studyId);
            
            // Fetch form definitions for the study
            var formDefinitions = formDefinitionRepository.findByStudyId(studyId);
            log.info("Found {} form definitions for study {}", formDefinitions.size(), studyId);
            
            // Fetch visit definitions for the study
            List<VisitDefinitionEntity> visitDefinitions =
                    visitDefinitionRepository.findByStudyIdOrderBySequenceNumberAsc(studyId);
            log.info("Found {} visit definitions for study {}", visitDefinitions.size(), studyId);
            
            // Fetch study arms
            List<StudyArmEntity> studyArms =
                    studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
            log.info("Found {} study arms for study {}", studyArms.size(), studyId);
            
            // Build study design configuration from actual data
            Map<String, Object> studyDesignConfig = new HashMap<>();
            
            // Add forms to configuration
            List<Map<String, Object>> forms = new ArrayList<>();
            for (var form : formDefinitions) {
                Map<String, Object> formData = new HashMap<>();
                formData.put("id", form.getId());
                formData.put("name", form.getName());
                formData.put("description", form.getDescription());
                formData.put("formType", form.getFormType());
                formData.put("version", form.getVersion());
                formData.put("status", form.getStatus().name());
                formData.put("fields", form.getFields()); // JSON string
                formData.put("structure", form.getStructure()); // JSON string
                forms.add(formData);
            }
            studyDesignConfig.put("forms", forms);
            
            // Add visits to configuration
            List<Map<String, Object>> visits = new ArrayList<>();
            for (var visit : visitDefinitions) {
                Map<String, Object> visitData = new HashMap<>();
                visitData.put("id", visit.getId());
                visitData.put("name", visit.getName());
                visitData.put("description", visit.getDescription());
                visitData.put("visitType", visit.getVisitType().name());
                visitData.put("timepoint", visit.getTimepoint());
                visitData.put("windowBefore", visit.getWindowBefore());
                visitData.put("windowAfter", visit.getWindowAfter());
                visitData.put("isRequired", visit.getIsRequired());
                visitData.put("sequenceNumber", visit.getSequenceNumber());
                visits.add(visitData);
            }
            studyDesignConfig.put("visits", visits);
            
            // Add study arms to configuration
            List<Map<String, Object>> arms = new ArrayList<>();
            for (var arm : studyArms) {
                Map<String, Object> armData = new HashMap<>();
                armData.put("id", arm.getId());
                armData.put("name", arm.getName());
                armData.put("description", arm.getDescription());
                armData.put("type", arm.getType().name());
                armData.put("sequence", arm.getSequence());
                armData.put("plannedSubjects", arm.getPlannedSubjects());
                arms.add(armData);
            }
            studyDesignConfig.put("arms", arms);
            
            // Add study metadata
            studyDesignConfig.put("studyId", studyId);
            studyDesignConfig.put("studyName", study.getName());
            studyDesignConfig.put("protocolNumber", study.getProtocolNumber());
            studyDesignConfig.put("formsCount", formDefinitions.size());
            studyDesignConfig.put("visitsCount", visitDefinitions.size());
            studyDesignConfig.put("armsCount", studyArms.size());
            
            // Create validation rules configuration
            // For now, create basic validation rules based on forms
            Map<String, Object> validationRules = new HashMap<>();
            List<Map<String, Object>> rules = new ArrayList<>();
            
            // Generate basic required field validation rules from forms
            for (var form : formDefinitions) {
                Map<String, Object> rule = new HashMap<>();
                rule.put("formId", form.getId());
                rule.put("formName", form.getName());
                rule.put("ruleType", "REQUIRED");
                rule.put("message", "Required fields must be completed for " + form.getName());
                rules.add(rule);
            }
            
            validationRules.put("rules", rules);
            validationRules.put("rulesCount", rules.size());
            
            log.info("Built study design configuration with {} forms, {} visits, {} arms, and {} validation rules",
                    forms.size(), visits.size(), arms.size(), rules.size());
            
        BuildStudyDatabaseCommand command = BuildStudyDatabaseCommand.builder()
                    .studyDatabaseBuildId(studyDatabaseBuildId)
                    .studyId(requestDto.getStudyId())
                    .studyName(requestDto.getStudyName())
                    .studyProtocol(requestDto.getStudyProtocol())
                    .requestedBy(requestDto.getRequestedBy())
            .buildRequestId(buildRequestId)
                    .studyDesignConfiguration(studyDesignConfig)
                    .validationRules(validationRules)
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
        
        log.info("Waiting for build projection with UUID: {}, timeout: {}ms", aggregateUuid, timeoutMillis);
        
        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            attempts++;
            
            if (attempts % 10 == 0) {
                log.debug("Still waiting for projection... attempt {}, elapsed: {}ms", 
                         attempts, System.currentTimeMillis() - startTime);
            }
            
            Optional<StudyDatabaseBuildEntity> optional = buildRepository.findByAggregateUuid(aggregateUuid);
            if (optional.isPresent()) {
                log.info("Build projection found after {} attempts ({}ms)", 
                         attempts, System.currentTimeMillis() - startTime);
                return optional.get();
            }
            
            try {
                Thread.sleep(200); // Increased sleep time from 100ms to 200ms
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for build projection", e);
            }
        }
        
        log.error("Timeout waiting for build projection. UUID: {}, Attempts: {}, Elapsed: {}ms", 
                 aggregateUuid, attempts, System.currentTimeMillis() - startTime);
        
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



