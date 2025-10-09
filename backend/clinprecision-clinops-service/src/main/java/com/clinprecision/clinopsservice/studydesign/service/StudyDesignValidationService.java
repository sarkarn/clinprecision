package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import com.clinprecision.clinopsservice.study.exception.StudyStatusTransitionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Study Design Validation Service - Domain Service for Study Design Operations
 * 
 * This service validates study design operations against study status business rules.
 * Study designs can only be modified when the study is in appropriate statuses.
 * 
 * Key Validations:
 * - Study design can only be modified in PLANNING, DRAFT, UNDER_REVIEW statuses
 * - Cannot modify design of ACTIVE, SUSPENDED, or terminal status studies
 * - Design initialization requires valid study
 * - Design progress updates follow study status rules
 * 
 * Architecture:
 * - Called by StudyDesignCommandService BEFORE dispatching commands
 * - Queries read model to get current study state
 * - Enforces study-design modification rules
 * - Throws domain exception if validation fails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDesignValidationService {
    
    private final StudyQueryService studyQueryService;
    
    /**
     * Validate study design initialization
     * 
     * @param studyUuid Study aggregate UUID
     * @throws StudyStatusTransitionException if validation fails
     */
    public void validateDesignInitialization(UUID studyUuid, Long legacyStudyId) {
        log.debug("Validating study design initialization for study UUID: {} (legacyId: {})", studyUuid, legacyStudyId);

        StudyEntity study = resolveStudyForValidation(studyUuid, legacyStudyId);

        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;

        if ("COMPLETED".equals(studyStatus) ||
            "TERMINATED".equals(studyStatus) ||
            "WITHDRAWN".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot initialize design for study %s: Study is in terminal status %s",
                    study.getName(), studyStatus)
            );
        }

        log.debug("Study design initialization validation passed for study: {}", study.getName());
    }

    private StudyEntity resolveStudyForValidation(UUID studyUuid, Long legacyStudyId) {
        if (studyUuid != null) {
            Optional<StudyEntity> byUuid = studyQueryService.findStudyEntityByUuid(studyUuid);
            if (byUuid.isPresent()) {
                return byUuid.get();
            }
            log.warn("Study not found by UUID {} during design initialization validation", studyUuid);
        }

        if (legacyStudyId != null) {
            Optional<StudyEntity> byId = studyQueryService.findStudyEntityById(legacyStudyId);
            if (byId.isPresent()) {
                return byId.get();
            }
            throw new StudyStatusTransitionException(
                String.format("Cannot initialize design: Study not found for legacy ID %s", legacyStudyId)
            );
        }

        if (studyUuid == null) {
            throw new StudyStatusTransitionException("Cannot initialize design: Study identifier is missing");
        }

        throw new StudyStatusTransitionException(
            String.format("Cannot initialize design: Study not found for UUID %s", studyUuid)
        );
    }
    
    /**
     * Validate study design modification (arms, visits, forms)
     * 
     * Key Rule: Design can only be modified in PLANNING, DRAFT, UNDER_REVIEW statuses
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param studyUuid Study aggregate UUID
     * @throws StudyStatusTransitionException if validation fails
     */
    public void validateDesignModification(UUID studyDesignId, UUID studyUuid) {
        log.debug("Validating study design modification for design: {} (study: {})", studyDesignId, studyUuid);
        
        // Get associated study
        StudyEntity study = studyQueryService.getStudyEntityByUuid(studyUuid);
        
        // Check if study status allows design modifications
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        // Define statuses that allow modifications
        boolean modificationAllowed = "PLANNING".equals(studyStatus) || 
                                     "DRAFT".equals(studyStatus) ||
                                     "UNDER_REVIEW".equals(studyStatus) ||
                                     "PROTOCOL_REVIEW".equals(studyStatus);
        
        if (!modificationAllowed) {
            throw new StudyStatusTransitionException(
                String.format("Cannot modify study design: Study %s is in status %s. " +
                    "Design modifications only allowed in PLANNING, DRAFT, UNDER_REVIEW, or PROTOCOL_REVIEW status.",
                    study.getName(), studyStatus)
            );
        }
        
        log.debug("Study design modification validation passed for study: {}", study.getName());
    }
    
    /**
     * Validate study arm addition
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateArmAddition(UUID studyDesignId, UUID studyUuid) {
        log.debug("Validating arm addition for design: {}", studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        log.debug("Arm addition validation passed for design: {}", studyDesignId);
    }
    
    /**
     * Validate study arm update
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param armId Arm UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateArmUpdate(UUID studyDesignId, UUID armId, UUID studyUuid) {
        log.debug("Validating arm update for arm: {} in design: {}", armId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add arm-specific validations
        // - Check if arm has enrolled subjects (if so, limit what can be changed)
        // - Validate arm type transitions
        
        log.debug("Arm update validation passed for arm: {}", armId);
    }
    
    /**
     * Validate study arm removal
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param armId Arm UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateArmRemoval(UUID studyDesignId, UUID armId, UUID studyUuid) {
        log.debug("Validating arm removal for arm: {} in design: {}", armId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add critical validation
        // - Cannot remove arm if subjects are enrolled in it
        // - Check if visits are assigned to this arm
        
        log.warn("Arm removal validation needs enhancement - check for enrolled subjects and assigned visits");
        
        log.debug("Arm removal validation passed for arm: {}", armId);
    }
    
    /**
     * Validate visit definition
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateVisitDefinition(UUID studyDesignId, UUID studyUuid) {
        log.debug("Validating visit definition for design: {}", studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        log.debug("Visit definition validation passed for design: {}", studyDesignId);
    }
    
    /**
     * Validate visit update
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateVisitUpdate(UUID studyDesignId, UUID visitId, UUID studyUuid) {
        log.debug("Validating visit update for visit: {} in design: {}", visitId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add visit-specific validations
        // - Check if visit has data captured (if so, limit what can be changed)
        // - Validate timepoint changes don't conflict with existing data
        
        log.debug("Visit update validation passed for visit: {}", visitId);
    }
    
    /**
     * Validate visit removal
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateVisitRemoval(UUID studyDesignId, UUID visitId, UUID studyUuid) {
        log.debug("Validating visit removal for visit: {} in design: {}", visitId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add critical validation
        // - Cannot remove visit if data has been captured
        // - Check if forms are assigned to this visit
        
        log.warn("Visit removal validation needs enhancement - check for captured data and form assignments");
        
        log.debug("Visit removal validation passed for visit: {}", visitId);
    }
    
    /**
     * Validate form assignment to visit
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param formId Form UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateFormAssignment(UUID studyDesignId, UUID visitId, UUID formId, UUID studyUuid) {
        log.debug("Validating form assignment: form {} to visit {} in design: {}", 
            formId, visitId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add form-specific validations
        // - Check if form exists and is in appropriate status
        // - Validate form is not already assigned to this visit
        // - Check if form type is compatible with visit type
        
        log.debug("Form assignment validation passed: form {} to visit {}", formId, visitId);
    }
    
    /**
     * Validate form assignment update
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param assignmentId Form assignment UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateFormAssignmentUpdate(UUID studyDesignId, UUID assignmentId, UUID studyUuid) {
        log.debug("Validating form assignment update for assignment: {} in design: {}", 
            assignmentId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        log.debug("Form assignment update validation passed for assignment: {}", assignmentId);
    }
    
    /**
     * Validate form assignment removal
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param assignmentId Form assignment UUID
     * @param studyUuid Study aggregate UUID
     */
    public void validateFormAssignmentRemoval(UUID studyDesignId, UUID assignmentId, UUID studyUuid) {
        log.debug("Validating form assignment removal for assignment: {} in design: {}", 
            assignmentId, studyDesignId);
        
        // Use common design modification validation
        validateDesignModification(studyDesignId, studyUuid);
        
        // TODO: Add critical validation
        // - Cannot remove form assignment if data has been captured
        
        log.warn("Form assignment removal validation needs enhancement - check for captured data");
        
        log.debug("Form assignment removal validation passed for assignment: {}", assignmentId);
    }
    
    /**
     * Validate design progress initialization
     * 
     * @param studyUuid Study aggregate UUID
     */
    public void validateDesignProgressInitialization(UUID studyUuid) {
        log.debug("Validating design progress initialization for study: {}", studyUuid);
        
        // Get associated study
        StudyEntity study = studyQueryService.getStudyEntityByUuid(studyUuid);
        
        // Design progress can be initialized for any non-terminal status
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        if ("COMPLETED".equals(studyStatus) || 
            "TERMINATED".equals(studyStatus) || 
            "WITHDRAWN".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot initialize design progress for study %s: Study is in terminal status %s",
                    study.getName(), studyStatus)
            );
        }
        
        log.debug("Design progress initialization validation passed for study: {}", study.getName());
    }
    
    /**
     * Validate design progress update
     * 
     * @param studyUuid Study aggregate UUID
     */
    public void validateDesignProgressUpdate(UUID studyUuid) {
        log.debug("Validating design progress update for study: {}", studyUuid);
        
        // Get associated study
        StudyEntity study = studyQueryService.getStudyEntityByUuid(studyUuid);
        
        // Design progress can be updated for active studies
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        if ("COMPLETED".equals(studyStatus) || 
            "TERMINATED".equals(studyStatus) || 
            "WITHDRAWN".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot update design progress for study %s: Study is in terminal status %s",
                    study.getName(), studyStatus)
            );
        }
        
        log.debug("Design progress update validation passed for study: {}", study.getName());
    }
}
