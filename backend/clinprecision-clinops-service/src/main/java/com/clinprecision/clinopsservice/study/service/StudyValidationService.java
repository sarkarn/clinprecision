package com.clinprecision.clinopsservice.study.service;

import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.service.CrossEntityStatusValidationService;
import com.clinprecision.clinopsservice.service.CrossEntityStatusValidationService.CrossEntityValidationResult;
import com.clinprecision.clinopsservice.study.exception.StudyStatusTransitionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

/**
 * Study Validation Service - DDD Domain Service for Cross-Aggregate Validation
 * 
 * This service acts as a bridge between DDD command services and the legacy
 * CrossEntityStatusValidationService, ensuring business rules are enforced
 * before state transitions occur in the Study aggregate.
 * 
 * Architecture:
 * - Called by StudyCommandService BEFORE dispatching commands
 * - Queries read model to get current state
 * - Delegates to CrossEntityStatusValidationService for validation logic
 * - Throws domain exception if validation fails
 * 
 * Validates:
 * - Study ↔️ ProtocolVersion dependencies
 * - Study ↔️ StudyAmendment consistency
 * - Cross-aggregate state transition rules
 * 
 * Future Refactoring (Phase 5):
 * - Refactor to use UUID-based queries
 * - Replace legacy repositories with DDD read repositories
 * - Add domain events for validation failures
 * - Implement caching for performance
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyValidationService {
    
    private final CrossEntityStatusValidationService crossEntityValidator;
    private final StudyRepository studyRepository;
    
    /**
     * Validate status transition before command execution
     * 
     * This method is called by StudyCommandService before dispatching status change commands
     * to ensure all cross-aggregate business rules are satisfied.
     * 
     * NOTE: Handles eventual consistency - if study not found in read model (e.g., during tests
     * or immediately after creation), validation is skipped and command proceeds to aggregate.
     * 
     * @param studyUuid UUID of study aggregate
     * @param targetStatus Target status code (e.g., "ACTIVE", "SUSPENDED", "COMPLETED")
     * @throws StudyStatusTransitionException if validation fails
     */
    public void validateStatusTransition(UUID studyUuid, String targetStatus) {
        log.debug("Validating status transition for study {} to {}", studyUuid, targetStatus);
        
        // Get study entity from read model (may not exist due to eventual consistency)
        StudyEntity study = studyRepository.findByAggregateUuid(studyUuid)
            .orElse(null);

        if (study == null) {
            log.warn("Study {} not projected yet (eventual consistency), skipping cross-entity validation", studyUuid);
            return;
        }
        
        // Perform cross-entity validation
        CrossEntityValidationResult result = 
            crossEntityValidator.validateCrossEntityDependencies(study, targetStatus, "STATUS_CHANGE");
        
        // Check validation result
        if (!result.isValid()) {
            String errorMessage = String.format(
                "Cannot transition study %s to status %s: %s",
                studyUuid,
                targetStatus,
                String.join("; ", result.getErrors())
            );
            log.error("Status transition validation failed: {}", errorMessage);
            throw new StudyStatusTransitionException(errorMessage, result.getErrors());
        }
        
        // Log warnings if any
        if (result.hasWarnings()) {
            log.warn("Status transition warnings for study {} → {}: {}", 
                studyUuid, targetStatus, result.getWarnings());
        }
        
        log.debug("Status transition validation passed for study {} → {} (warnings: {})", 
            studyUuid, targetStatus, result.getWarningCount());
    }
    
    /**
     * Validate study creation prerequisites
     * 
     * Called during study creation to ensure basic requirements are met
     * 
     * @param studyName Study name
     * @param organizationId Organization ID
     * @throws IllegalArgumentException if validation fails
     */
    public void validateStudyCreation(String studyName, Long organizationId) {
        log.debug("Validating study creation: {} for organization {}", studyName, organizationId);
        
        // Basic validation
        if (studyName == null || studyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        
        if (organizationId == null) {
            throw new IllegalArgumentException("Organization ID is required");
        }
        
        // TODO: Add more creation validations as needed
        // - Check organization exists
        // - Check user permissions
        // - Check naming conventions
        
        log.debug("Study creation validation passed");
    }
    
    /**
     * Validate study update prerequisites
     * 
     * Called during study updates to ensure modifications are allowed
     * 
     * NOTE: Handles eventual consistency - if study not found in read model,
     * validation is skipped and command proceeds.
     * 
     * @param studyUuid Study aggregate UUID
     * @throws StudyStatusTransitionException if modification not allowed
     */
    public void validateStudyModification(UUID studyUuid) {
        log.debug("Validating modification allowed for study {}", studyUuid);
        
        // Get study entity from read model (may not exist due to eventual consistency)
        StudyEntity study = studyRepository.findByAggregateUuid(studyUuid)
            .orElse(null);
        
        if (study == null) {
            log.warn("Study {} not projected yet (eventual consistency), allowing modification", studyUuid);
            return;
        }
        
        // Check if study status allows modifications
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        // Terminal statuses that don't allow modifications
        if ("COMPLETED".equals(currentStatus) || 
            "TERMINATED".equals(currentStatus) || 
            "WITHDRAWN".equals(currentStatus)) {
            
            String errorMessage = String.format(
                "Study %s in status %s cannot be modified (terminal state)",
                studyUuid,
                currentStatus
            );
            log.error("Modification validation failed: {}", errorMessage);
            throw new StudyStatusTransitionException(errorMessage);
        }
        
        log.debug("Study modification validation passed for study {}", studyUuid);
    }
    
    /**
     * Perform comprehensive cross-entity validation
     * 
     * Returns detailed validation result for reporting purposes
     * Used by query endpoints to check validation status without throwing exceptions
     * 
     * @param studyUuid Study aggregate UUID
     * @return CrossEntityValidationResult with errors, warnings, and details
     */
    public CrossEntityValidationResult validateStudyCrossEntity(UUID studyUuid) {
        log.debug("Performing comprehensive cross-entity validation for study {}", studyUuid);
        
        // Get study entity from read model
        StudyEntity study = studyRepository.findByAggregateUuid(studyUuid)
            .orElse(null);
        
        if (study == null) {
            log.warn("Study {} not projected yet (eventual consistency), returning empty validation result", studyUuid);
            return new CrossEntityValidationResult(true, Collections.emptyList(), Collections.emptyList(), Collections.emptyMap());
        }
        
        if (study == null) {
            throw new IllegalArgumentException("Study not found: " + studyUuid);
        }
        
        // Validate current status consistency (no target status = validate current state)
        CrossEntityValidationResult result = 
            crossEntityValidator.validateCrossEntityDependencies(study, null, "VALIDATION_CHECK");
        
        log.debug("Cross-entity validation completed for study {} - valid: {}, errors: {}, warnings: {}", 
            studyUuid, result.isValid(), result.getErrorCount(), result.getWarningCount());
        
        return result;
    }
}
