package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.entity.studydesign.StudyEntity;
import com.clinprecision.common.entity.studydesign.StudyVersionEntity;
import com.clinprecision.studydesignservice.repository.StudyVersionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Centralized service for study status computation and state machine management
 * Implements comprehensive business rules for study status transitions
 */
@Service
@Transactional
public class StudyStatusComputationService {

    private static final Logger logger = LoggerFactory.getLogger(StudyStatusComputationService.class);

    private final StudyVersionRepository studyVersionRepository;

    public StudyStatusComputationService(StudyVersionRepository studyVersionRepository) {
        this.studyVersionRepository = studyVersionRepository;
    }

    /**
     * Study Status State Machine Definition
     * Defines allowed transitions between study statuses
     */
    private static final Map<String, Set<String>> STUDY_STATUS_TRANSITIONS = Map.of(
        "DRAFT", Set.of("UNDER_REVIEW", "PLANNING", "WITHDRAWN"),
        "PLANNING", Set.of("UNDER_REVIEW", "DRAFT", "WITHDRAWN"),
        "UNDER_REVIEW", Set.of("APPROVED", "DRAFT", "PLANNING", "REJECTED", "WITHDRAWN"),
        "APPROVED", Set.of("ACTIVE", "WITHDRAWN"),
        "REJECTED", Set.of("DRAFT", "PLANNING", "WITHDRAWN"),
        "ACTIVE", Set.of("COMPLETED", "TERMINATED", "SUSPENDED"),
        "SUSPENDED", Set.of("ACTIVE", "TERMINATED"),
        "COMPLETED", Set.of(), // Terminal state
        "TERMINATED", Set.of(), // Terminal state
        "WITHDRAWN", Set.of() // Terminal state
    );

    /**
     * Validate if a study status transition is allowed
     */
    public boolean isValidStatusTransition(String fromStatus, String toStatus) {
        if (fromStatus == null || toStatus == null) {
            return false;
        }

        Set<String> allowedTransitions = STUDY_STATUS_TRANSITIONS.get(fromStatus.toUpperCase());
        return allowedTransitions != null && allowedTransitions.contains(toStatus.toUpperCase());
    }

    /**
     * Get all valid next statuses for a given current status
     */
    public Set<String> getValidNextStatuses(String currentStatus) {
        if (currentStatus == null) {
            return Set.of("DRAFT", "PLANNING");
        }
        return STUDY_STATUS_TRANSITIONS.getOrDefault(currentStatus.toUpperCase(), Set.of());
    }

    /**
     * Validate study status transition with business rules
     */
    public StatusTransitionResult validateStatusTransition(StudyEntity study, String newStatus) {
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        logger.debug("Validating status transition for study {}: {} -> {}", 
                    study.getId(), currentStatus, newStatus);

        // Basic transition validation
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            return StatusTransitionResult.invalid(
                String.format("Invalid status transition from %s to %s", currentStatus, newStatus)
            );
        }

        // Business rule validations
        return validateBusinessRules(study, currentStatus, newStatus);
    }

    /**
     * Validate business rules for status transitions
     */
    private StatusTransitionResult validateBusinessRules(StudyEntity study, String currentStatus, String newStatus) {
        switch (newStatus.toUpperCase()) {
            case "UNDER_REVIEW":
                return validateUnderReviewTransition(study);
            case "APPROVED":
                return validateApprovedTransition(study);
            case "ACTIVE":
                return validateActiveTransition(study);
            case "COMPLETED":
                return validateCompletedTransition(study);
            case "TERMINATED":
                return validateTerminatedTransition(study);
            case "SUSPENDED":
                return validateSuspendedTransition(study);
            default:
                return StatusTransitionResult.valid();
        }
    }

    /**
     * Validate transition to UNDER_REVIEW status
     */
    private StatusTransitionResult validateUnderReviewTransition(StudyEntity study) {
        List<String> errors = new ArrayList<>();

        // Check if study has basic required information
        if (study.getName() == null || study.getName().trim().isEmpty()) {
            errors.add("Study name is required for review");
        }
        if (study.getDescription() == null || study.getDescription().trim().isEmpty()) {
            errors.add("Study description is required for review");
        }
        if (study.getPrimaryObjective() == null || study.getPrimaryObjective().trim().isEmpty()) {
            errors.add("Primary objective is required for review");
        }

        return errors.isEmpty() ? StatusTransitionResult.valid() : StatusTransitionResult.invalid(errors);
    }

    /**
     * Validate transition to APPROVED status
     */
    private StatusTransitionResult validateApprovedTransition(StudyEntity study) {
        List<String> errors = new ArrayList<>();

        // Check if study has been properly reviewed
        if (!"UNDER_REVIEW".equalsIgnoreCase(study.getStudyStatus().getCode())) {
            errors.add("Study must be under review before approval");
        }

        // Check if study has at least one approved protocol version
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
        boolean hasApprovedVersion = versions.stream()
                .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.APPROVED);
        
        if (!hasApprovedVersion) {
            errors.add("Study must have at least one approved protocol version");
        }

        return errors.isEmpty() ? StatusTransitionResult.valid() : StatusTransitionResult.invalid(errors);
    }

    /**
     * Validate transition to ACTIVE status
     */
    private StatusTransitionResult validateActiveTransition(StudyEntity study) {
        List<String> errors = new ArrayList<>();

        // Study must be approved first
        if (!"APPROVED".equalsIgnoreCase(study.getStudyStatus().getCode())) {
            errors.add("Study must be approved before activation");
        }

        // Check if study has an active protocol version
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
        boolean hasActiveVersion = versions.stream()
                .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE);
        
        if (!hasActiveVersion) {
            errors.add("Study must have an active protocol version");
        }

        // Additional validation: check if all required design phases are complete
        // This would integrate with design phase completion checking
        if (!areAllDesignPhasesComplete(study)) {
            errors.add("All study design phases must be completed before activation");
        }

        return errors.isEmpty() ? StatusTransitionResult.valid() : StatusTransitionResult.invalid(errors);
    }

    /**
     * Validate transition to COMPLETED status
     */
    private StatusTransitionResult validateCompletedTransition(StudyEntity study) {
        List<String> errors = new ArrayList<>();

        // Study must be active to be completed
        if (!"ACTIVE".equalsIgnoreCase(study.getStudyStatus().getCode())) {
            errors.add("Only active studies can be marked as completed");
        }

        // Additional business rules for completion
        // This could include checking enrollment targets, data collection status, etc.

        return errors.isEmpty() ? StatusTransitionResult.valid() : StatusTransitionResult.invalid(errors);
    }

    /**
     * Validate transition to TERMINATED status
     */
    private StatusTransitionResult validateTerminatedTransition(StudyEntity study) {
        // Termination can happen from most non-terminal states
        // Business rules could include requiring termination reason, approval process, etc.
        return StatusTransitionResult.valid();
    }

    /**
     * Validate transition to SUSPENDED status
     */
    private StatusTransitionResult validateSuspendedTransition(StudyEntity study) {
        List<String> errors = new ArrayList<>();

        // Only active studies can be suspended
        if (!"ACTIVE".equalsIgnoreCase(study.getStudyStatus().getCode())) {
            errors.add("Only active studies can be suspended");
        }

        return errors.isEmpty() ? StatusTransitionResult.valid() : StatusTransitionResult.invalid(errors);
    }

    /**
     * Compute overall study status based on protocol versions and business rules
     */
    public String computeStudyStatus(StudyEntity study) {
        logger.debug("Computing study status for study {}", study.getId());

        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : "DRAFT";
        
        // Get all protocol versions for this study
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());

        if (versions.isEmpty()) {
            return "DRAFT"; // No versions = draft study
        }

        // Check for active versions
        boolean hasActiveVersion = versions.stream()
                .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE);

        // Check for approved versions
        boolean hasApprovedVersion = versions.stream()
                .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.APPROVED);

        // Apply business logic for status computation
        if ("ACTIVE".equalsIgnoreCase(currentStatus) && !hasActiveVersion) {
            // Study marked as active but no active versions - should be approved
            return hasApprovedVersion ? "APPROVED" : "UNDER_REVIEW";
        }

        if (hasActiveVersion && !"ACTIVE".equalsIgnoreCase(currentStatus) && 
            !isTerminalStatus(currentStatus)) {
            // Has active versions but study not marked as active
            return "ACTIVE";
        }

        // Maintain current status if no conflicts found
        return currentStatus;
    }

    /**
     * Check if status is terminal (no further transitions allowed)
     */
    public boolean isTerminalStatus(String status) {
        if (status == null) return false;
        Set<String> nextStatuses = STUDY_STATUS_TRANSITIONS.get(status.toUpperCase());
        return nextStatuses != null && nextStatuses.isEmpty();
    }

    /**
     * Check if study allows modifications based on current status
     */
    public boolean allowsModification(StudyEntity study) {
        if (study.getStudyStatus() == null) {
            return true; // No status = draft = allows modification
        }

        String status = study.getStudyStatus().getCode();
        
        // Check entity-level configuration
        if (study.getStudyStatus().getAllowsModification() != null) {
            return study.getStudyStatus().getAllowsModification();
        }

        // Default business rules
        return !isTerminalStatus(status) && 
               !"ACTIVE".equalsIgnoreCase(status) && 
               !"UNDER_REVIEW".equalsIgnoreCase(status);
    }

    /**
     * Get status transition recommendations
     */
    public List<StatusTransitionRecommendation> getStatusTransitionRecommendations(StudyEntity study) {
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : "DRAFT";
        Set<String> validNextStatuses = getValidNextStatuses(currentStatus);

        return validNextStatuses.stream()
                .map(status -> {
                    StatusTransitionResult validation = validateStatusTransition(study, status);
                    return new StatusTransitionRecommendation(
                        status,
                        validation.isValid(),
                        validation.getErrorMessages(),
                        getStatusDescription(status)
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Helper method to check if all design phases are complete
     * This would integrate with the design phase completion logic
     */
    private boolean areAllDesignPhasesComplete(StudyEntity study) {
        // Placeholder - would integrate with actual design phase checking
        // This could check completion of objectives, endpoints, population, etc.
        return true;
    }

    /**
     * Get human-readable description for status
     */
    private String getStatusDescription(String status) {
        return switch (status.toUpperCase()) {
            case "DRAFT" -> "Study is in draft state and can be modified";
            case "PLANNING" -> "Study is in planning phase";
            case "UNDER_REVIEW" -> "Study is being reviewed for approval";
            case "APPROVED" -> "Study has been approved and ready for activation";
            case "REJECTED" -> "Study has been rejected and needs revision";
            case "ACTIVE" -> "Study is actively recruiting and collecting data";
            case "SUSPENDED" -> "Study is temporarily suspended";
            case "COMPLETED" -> "Study has been completed successfully";
            case "TERMINATED" -> "Study has been terminated";
            case "WITHDRAWN" -> "Study has been withdrawn";
            default -> "Unknown status";
        };
    }

    /**
     * Result class for status transition validation
     */
    public static class StatusTransitionResult {
        private final boolean valid;
        private final List<String> errorMessages;

        private StatusTransitionResult(boolean valid, List<String> errorMessages) {
            this.valid = valid;
            this.errorMessages = errorMessages != null ? errorMessages : Collections.emptyList();
        }

        public static StatusTransitionResult valid() {
            return new StatusTransitionResult(true, null);
        }

        public static StatusTransitionResult invalid(String message) {
            return new StatusTransitionResult(false, List.of(message));
        }

        public static StatusTransitionResult invalid(List<String> messages) {
            return new StatusTransitionResult(false, messages);
        }

        public boolean isValid() { return valid; }
        public List<String> getErrorMessages() { return errorMessages; }
    }

    /**
     * Recommendation class for status transitions
     */
    public static class StatusTransitionRecommendation {
        private final String targetStatus;
        private final boolean isAllowed;
        private final List<String> requirements;
        private final String description;

        public StatusTransitionRecommendation(String targetStatus, boolean isAllowed, 
                                            List<String> requirements, String description) {
            this.targetStatus = targetStatus;
            this.isAllowed = isAllowed;
            this.requirements = requirements != null ? requirements : Collections.emptyList();
            this.description = description;
        }

        public String getTargetStatus() { return targetStatus; }
        public boolean isAllowed() { return isAllowed; }
        public List<String> getRequirements() { return requirements; }
        public String getDescription() { return description; }
    }
}