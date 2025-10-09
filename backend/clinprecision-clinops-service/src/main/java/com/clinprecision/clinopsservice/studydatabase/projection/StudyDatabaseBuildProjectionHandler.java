package com.clinprecision.clinopsservice.studydatabase.projection;

import com.clinprecision.clinopsservice.studydatabase.domain.events.*;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyDatabaseBuildEntity;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyDatabaseBuildRepository;

import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Optional;

/**
 * Study Database Build Projection Handler
 * 
 * Updates read models from study database build domain events.
 * Separates the write model (aggregate) from read model (entity) for CQRS pattern.
 * 
 * Follows established ClinPrecision patterns for event handling.
 */
@Component
@ProcessingGroup("studydatabase-projection")
public class StudyDatabaseBuildProjectionHandler {

    private static final Logger logger = LoggerFactory.getLogger(StudyDatabaseBuildProjectionHandler.class);

    @Autowired
    private StudyDatabaseBuildRepository buildRepository;

    @PostConstruct
    public void init() {
        logger.info("[STUDYDB_PROJECTION] ========== Study Database Build Projection Handler INITIALIZED ==========");
        logger.info("[STUDYDB_PROJECTION] Handler is ready to process StudyDatabaseBuild events");
        logger.info("[STUDYDB_PROJECTION] Processing Group: studydatabase-projection");
        logger.info("[STUDYDB_PROJECTION] Repository: {}", buildRepository != null ? "INJECTED" : "NULL");
        logger.info("[STUDYDB_PROJECTION] ========== Handler Registration Complete ==========");
    }

    /**
     * Handle Study Database Build Started Event
     * Creates the initial read model entity when build is initiated
     */
    @EventHandler
    public void on(StudyDatabaseBuildStartedEvent event) {
        logger.info("[STUDYDB_PROJECTION] Processing StudyDatabaseBuildStartedEvent for build: {}", 
                    event.getStudyDatabaseBuildId());
        
        try {
            // Check if entity already exists (for idempotency)
            Optional<StudyDatabaseBuildEntity> existing = 
                buildRepository.findByAggregateUuid(event.getStudyDatabaseBuildId().toString());
            
            if (existing.isPresent()) {
                logger.warn("[STUDYDB_PROJECTION] Build entity already exists, updating...");
                StudyDatabaseBuildEntity entity = existing.get();
                updateFromStartedEvent(entity, event);
                buildRepository.save(entity);
            } else {
                logger.info("[STUDYDB_PROJECTION] Creating new build entity...");
                StudyDatabaseBuildEntity newEntity = createFromStartedEvent(event);
                buildRepository.save(newEntity);
            }
            
            logger.info("[STUDYDB_PROJECTION] StudyDatabaseBuildStartedEvent processed successfully");
            
        } catch (Exception e) {
            logger.error("[STUDYDB_PROJECTION] Error processing StudyDatabaseBuildStartedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Database Build Completed Event
     * Updates the read model with completion details
     */
    @EventHandler
    public void on(StudyDatabaseBuildCompletedEvent event) {
        logger.info("[STUDYDB_PROJECTION] Processing StudyDatabaseBuildCompletedEvent for build: {}", 
                    event.getStudyDatabaseBuildId());
        
        try {
            StudyDatabaseBuildEntity entity = findEntityOrThrow(event.getStudyDatabaseBuildId().toString());
            
            entity.setBuildStatus(StudyDatabaseBuildStatus.COMPLETED);
            entity.setBuildEndTime(event.getCompletedAt());
            entity.setFormsConfigured(event.getFormsConfigured());
            entity.setValidationRulesCreated(event.getValidationRulesSetup());
            
            // Set validation results if available
            if (event.getValidationResult() != null) {
                entity.setValidationStatus(event.getValidationResult().getOverallAssessment());
                // Validation timestamp and user are not in this event structure
                // Store validation results as JSON if needed
                entity.setValidationResults(formatValidationResults(event.getValidationResult()));
            }
            
            // Set build metrics if available
            if (event.getBuildMetrics() != null && !event.getBuildMetrics().isEmpty()) {
                entity.setTablesCreated(getMetricAsInteger(event.getBuildMetrics().get("tablesCreated")));
                entity.setIndexesCreated(getMetricAsInteger(event.getBuildMetrics().get("indexesCreated")));
                entity.setTriggersCreated(getMetricAsInteger(event.getBuildMetrics().get("triggersCreated")));
            }
            
            buildRepository.save(entity);
            logger.info("[STUDYDB_PROJECTION] Build marked as COMPLETED successfully");
            
        } catch (Exception e) {
            logger.error("[STUDYDB_PROJECTION] Error processing StudyDatabaseBuildCompletedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Database Build Failed Event
     * Updates the read model with failure details
     */
    @EventHandler
    public void on(StudyDatabaseBuildFailedEvent event) {
        logger.info("[STUDYDB_PROJECTION] Processing StudyDatabaseBuildFailedEvent for build: {}", 
                    event.getStudyDatabaseBuildId());
        
        try {
            StudyDatabaseBuildEntity entity = findEntityOrThrow(event.getStudyDatabaseBuildId().toString());
            
            entity.setBuildStatus(StudyDatabaseBuildStatus.FAILED);
            entity.setBuildEndTime(event.getFailedAt());
            
            // Build error details
            StringBuilder errorDetails = new StringBuilder();
            errorDetails.append("Error: ").append(event.getErrorMessage()).append("\n");
            
            if (event.getBuildPhase() != null) {
                errorDetails.append("Failed at phase: ").append(event.getBuildPhase()).append("\n");
            }
            
            if (event.getExceptionType() != null) {
                errorDetails.append("Exception type: ").append(event.getExceptionType()).append("\n");
            }
            
            if (event.getValidationErrors() != null && !event.getValidationErrors().isEmpty()) {
                errorDetails.append("\nValidation Errors:\n");
                event.getValidationErrors().forEach(error -> 
                    errorDetails.append("- ").append(error).append("\n"));
            }
            
            entity.setErrorDetails(errorDetails.toString());
            
            buildRepository.save(entity);
            logger.info("[STUDYDB_PROJECTION] Build marked as FAILED successfully");
            
        } catch (Exception e) {
            logger.error("[STUDYDB_PROJECTION] Error processing StudyDatabaseBuildFailedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Database Build Cancelled Event
     * Updates the read model with cancellation details
     */
    @EventHandler
    public void on(StudyDatabaseBuildCancelledEvent event) {
        logger.info("[STUDYDB_PROJECTION] Processing StudyDatabaseBuildCancelledEvent for build: {}", 
                    event.getStudyDatabaseBuildId());
        
        try {
            StudyDatabaseBuildEntity entity = findEntityOrThrow(event.getStudyDatabaseBuildId().toString());
            
            entity.setBuildStatus(StudyDatabaseBuildStatus.CANCELLED);
            entity.setBuildEndTime(event.getCancelledAt());
            entity.setCancelledBy(event.getCancelledBy().toString());
            entity.setCancelledAt(event.getCancelledAt());
            entity.setCancellationReason(event.getCancellationReason());
            
            buildRepository.save(entity);
            logger.info("[STUDYDB_PROJECTION] Build marked as CANCELLED successfully");
            
        } catch (Exception e) {
            logger.error("[STUDYDB_PROJECTION] Error processing StudyDatabaseBuildCancelledEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Handle Study Database Validation Completed Event
     * Updates the read model with validation results
     */
    @EventHandler
    public void on(StudyDatabaseValidationCompletedEvent event) {
        logger.info("[STUDYDB_PROJECTION] Processing StudyDatabaseValidationCompletedEvent for build: {}", 
                    event.getStudyDatabaseBuildId());
        
        try {
            StudyDatabaseBuildEntity entity = findEntityOrThrow(event.getStudyDatabaseBuildId().toString());
            
            if (event.getValidationResult() != null) {
                entity.setValidationStatus(event.getValidationResult().getOverallAssessment());
                entity.setValidationResults(formatValidationResultFromEvent(event.getValidationResult()));
            }
            entity.setValidatedAt(event.getValidatedAt());
            entity.setValidatedBy(event.getValidatedBy().toString());
            
            buildRepository.save(entity);
            logger.info("[STUDYDB_PROJECTION] Validation results updated successfully");
            
        } catch (Exception e) {
            logger.error("[STUDYDB_PROJECTION] Error processing StudyDatabaseValidationCompletedEvent: {}", 
                        e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Create new entity from StudyDatabaseBuildStartedEvent
     */
    private StudyDatabaseBuildEntity createFromStartedEvent(StudyDatabaseBuildStartedEvent event) {
        return StudyDatabaseBuildEntity.builder()
                .aggregateUuid(event.getStudyDatabaseBuildId().toString())
                .buildRequestId(event.getBuildRequestId())
                .studyId(event.getStudyId())
                .studyName(event.getStudyName())
                .studyProtocol(event.getStudyProtocol())
                .buildStatus(StudyDatabaseBuildStatus.IN_PROGRESS)
                .buildStartTime(event.getStartedAt())
                .requestedBy(event.getRequestedBy())
                .buildConfiguration(formatBuildConfiguration(event.getBuildConfiguration()))
                .tablesCreated(0)
                .indexesCreated(0)
                .triggersCreated(0)
                .formsConfigured(0)
                .validationRulesCreated(0)
                .createdAt(event.getStartedAt())
                .build();
    }

    /**
     * Update existing entity from StudyDatabaseBuildStartedEvent
     */
    private void updateFromStartedEvent(StudyDatabaseBuildEntity entity, StudyDatabaseBuildStartedEvent event) {
        entity.setStudyName(event.getStudyName());
        entity.setStudyProtocol(event.getStudyProtocol());
        entity.setBuildStatus(StudyDatabaseBuildStatus.IN_PROGRESS);
        entity.setBuildStartTime(event.getStartedAt());
        entity.setRequestedBy(event.getRequestedBy());
        entity.setBuildConfiguration(formatBuildConfiguration(event.getBuildConfiguration()));
    }

    /**
     * Find entity by aggregate UUID or throw exception
     */
    private StudyDatabaseBuildEntity findEntityOrThrow(String aggregateUuid) {
        return buildRepository.findByAggregateUuid(aggregateUuid)
                .orElseThrow(() -> new IllegalStateException(
                        "Study database build entity not found for aggregate UUID: " + aggregateUuid));
    }

    /**
     * Format build configuration for storage
     */
    private String formatBuildConfiguration(java.util.Map<String, Object> config) {
        if (config == null || config.isEmpty()) {
            return null;
        }
        try {
            // Simple JSON-like formatting - in production use Jackson ObjectMapper
            return config.toString();
        } catch (Exception e) {
            logger.warn("[STUDYDB_PROJECTION] Error formatting build configuration: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Format validation results for storage (from completed event)
     */
    private String formatValidationResults(StudyDatabaseBuildCompletedEvent.ValidationResultData validationResult) {
        if (validationResult == null) {
            return null;
        }
        try {
            // Simple formatting - in production use Jackson ObjectMapper
            return String.format("Valid: %s, Assessment: %s, Compliance: %s, Performance: %s",
                    validationResult.isValid(),
                    validationResult.getOverallAssessment(),
                    validationResult.getComplianceStatus(),
                    validationResult.getPerformanceScore());
        } catch (Exception e) {
            logger.warn("[STUDYDB_PROJECTION] Error formatting validation results: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Format validation results for storage (from validation event)
     */
    private String formatValidationResultFromEvent(StudyDatabaseValidationCompletedEvent.ValidationResultData validationResult) {
        if (validationResult == null) {
            return null;
        }
        try {
            // Simple formatting - in production use Jackson ObjectMapper
            return String.format("Valid: %s, Assessment: %s, Compliance: %s, Performance: %s",
                    validationResult.isValid(),
                    validationResult.getOverallAssessment(),
                    validationResult.getComplianceStatus(),
                    validationResult.getPerformanceScore());
        } catch (Exception e) {
            logger.warn("[STUDYDB_PROJECTION] Error formatting validation results: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get metric value as Integer
     */
    private Integer getMetricAsInteger(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            logger.warn("[STUDYDB_PROJECTION] Error parsing metric as integer: {}", value);
            return 0;
        }
    }
}



