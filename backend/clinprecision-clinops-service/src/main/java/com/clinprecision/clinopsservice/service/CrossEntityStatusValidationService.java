package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.repository.StudyVersionRepository;
import com.clinprecision.clinopsservice.repository.StudyAmendmentRepository;
import com.clinprecision.common.entity.clinops.StudyAmendmentEntity;
import com.clinprecision.common.entity.clinops.StudyEntity;
import com.clinprecision.common.entity.clinops.StudyVersionEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for cross-entity status dependency validation
 * Validates consistency and dependencies between study, protocol versions, and amendments
 */
@Service
@Transactional(readOnly = true)
public class CrossEntityStatusValidationService {

    private static final Logger logger = LoggerFactory.getLogger(CrossEntityStatusValidationService.class);

    private final StudyVersionRepository studyVersionRepository;
    private final StudyAmendmentRepository studyAmendmentRepository;

    public CrossEntityStatusValidationService(StudyVersionRepository studyVersionRepository,
                                            StudyAmendmentRepository studyAmendmentRepository) {
        this.studyVersionRepository = studyVersionRepository;
        this.studyAmendmentRepository = studyAmendmentRepository;
    }

    /**
     * Comprehensive cross-entity validation for study operations
     */
    public CrossEntityValidationResult validateCrossEntityDependencies(StudyEntity study, String targetStatus, String operation) {
        logger.debug("Performing cross-entity validation for study {} - target status: {} - operation: {}", 
                    study.getId(), targetStatus, operation);

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        Map<String, Object> validationDetails = new HashMap<>();

        // Get related entities
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(study.getId());
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStudyIdOrderByVersionAndAmendmentNumber(study.getId());

        validationDetails.put("protocolVersionCount", versions.size());
        validationDetails.put("amendmentCount", amendments.size());

        // Perform validation based on target status
        switch (targetStatus != null ? targetStatus.toUpperCase() : "CURRENT") {
            case "PROTOCOL_REVIEW":
                validateProtocolReviewDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "APPROVED":
                validateApprovedDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "ACTIVE":
                validateActiveDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "SUSPENDED":
                validateSuspendedDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "COMPLETED":
                validateCompletedDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "TERMINATED":
                validateTerminatedDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            case "WITHDRAWN":
                validateWithdrawnDependencies(study, versions, amendments, errors, warnings, validationDetails);
                break;
            default:
                // Validate current status consistency
                validateCurrentStatusConsistency(study, versions, amendments, errors, warnings, validationDetails);
                break;
        }

        // Additional cross-cutting validations
        validateAmendmentConsistency(study, versions, amendments, errors, warnings, validationDetails);
        validateVersionSequencing(study, versions, errors, warnings, validationDetails);

        return new CrossEntityValidationResult(
            errors.isEmpty(),
            errors,
            warnings,
            validationDetails
        );
    }

    /**
     * Validate dependencies for PROTOCOL_REVIEW status
     */
    private void validateProtocolReviewDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                               List<StudyAmendmentEntity> amendments, List<String> errors, 
                                               List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating PROTOCOL_REVIEW dependencies for study {}", study.getId());

        // Must have at least one protocol version
        if (versions.isEmpty()) {
            errors.add("Study must have at least one protocol version before review");
        } else {
            // Check if there's a version ready for review
            boolean hasReviewableVersion = versions.stream()
                .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.DRAFT ||
                              v.getStatus() == StudyVersionEntity.VersionStatus.UNDER_REVIEW);
            
            if (!hasReviewableVersion) {
                warnings.add("No protocol versions are in reviewable status (DRAFT or UNDER_REVIEW)");
            }
        }

        // Check for pending amendments
        long pendingAmendments = amendments.stream()
            .filter(a -> a.getStatus() == StudyAmendmentEntity.AmendmentStatus.DRAFT ||
                        a.getStatus() == StudyAmendmentEntity.AmendmentStatus.UNDER_REVIEW)
            .count();
        
        details.put("pendingAmendments", pendingAmendments);
        if (pendingAmendments > 0) {
            warnings.add(String.format("Study has %d pending amendments that should be reviewed", pendingAmendments));
        }
    }

    /**
     * Validate dependencies for APPROVED status
     */
    private void validateApprovedDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                            List<StudyAmendmentEntity> amendments, List<String> errors, 
                                            List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating APPROVED dependencies for study {}", study.getId());

        // Must have at least one approved protocol version
        boolean hasApprovedVersion = versions.stream()
            .anyMatch(v -> v.getStatus() == StudyVersionEntity.VersionStatus.APPROVED);
        
        if (!hasApprovedVersion) {
            errors.add("Study must have at least one approved protocol version");
        }

        // Check for unapproved amendments in approved versions
        List<StudyVersionEntity> approvedVersions = versions.stream()
            .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.APPROVED)
            .collect(Collectors.toList());

        for (StudyVersionEntity version : approvedVersions) {
            List<StudyAmendmentEntity> versionAmendments = amendments.stream()
                .filter(a -> a.getStudyVersionId().equals(version.getId()))
                .collect(Collectors.toList());

            long unapprovedAmendments = versionAmendments.stream()
                .filter(a -> a.getStatus() != StudyAmendmentEntity.AmendmentStatus.APPROVED &&
                            a.getStatus() != StudyAmendmentEntity.AmendmentStatus.IMPLEMENTED)
                .count();

            if (unapprovedAmendments > 0) {
                warnings.add(String.format("Protocol version %s has %d unapproved amendments", 
                           version.getVersionNumber(), unapprovedAmendments));
            }
        }

        details.put("approvedVersions", approvedVersions.size());
    }

    /**
     * Validate dependencies for ACTIVE status
     */
    private void validateActiveDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                          List<StudyAmendmentEntity> amendments, List<String> errors, 
                                          List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating ACTIVE dependencies for study {}", study.getId());

        // Must have exactly one active protocol version
        List<StudyVersionEntity> activeVersions = versions.stream()
            .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
            .collect(Collectors.toList());

        if (activeVersions.isEmpty()) {
            errors.add("Active study must have exactly one active protocol version");
        } else if (activeVersions.size() > 1) {
            errors.add(String.format("Study has %d active protocol versions - only one is allowed", activeVersions.size()));
        }

        details.put("activeVersions", activeVersions.size());

        // Check for pending safety amendments in active version
        if (!activeVersions.isEmpty()) {
            StudyVersionEntity activeVersion = activeVersions.get(0);
            List<StudyAmendmentEntity> safetyAmendments = amendments.stream()
                .filter(a -> a.getStudyVersionId().equals(activeVersion.getId()))
                .filter(a -> a.getAmendmentType() == StudyVersionEntity.AmendmentType.SAFETY)
                .filter(a -> a.getStatus() == StudyAmendmentEntity.AmendmentStatus.SUBMITTED ||
                            a.getStatus() == StudyAmendmentEntity.AmendmentStatus.UNDER_REVIEW)
                .collect(Collectors.toList());

            if (!safetyAmendments.isEmpty()) {
                warnings.add(String.format("Active protocol version has %d pending safety amendments requiring attention", 
                           safetyAmendments.size()));
            }

            details.put("pendingSafetyAmendments", safetyAmendments.size());
        }

        // Validate no superseded versions are marked as active
        long supersededActiveVersions = versions.stream()
            .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
            .filter(v -> versions.stream()
                .anyMatch(newer -> newer.getVersionNumber().compareTo(v.getVersionNumber()) > 0 &&
                                  newer.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE))
            .count();

        if (supersededActiveVersions > 0) {
            errors.add("Found superseded protocol versions still marked as active");
        }
    }

    /**
     * Validate dependencies for SUSPENDED status
     */
    private void validateSuspendedDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                             List<StudyAmendmentEntity> amendments, List<String> errors, 
                                             List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating SUSPENDED dependencies for study {}", study.getId());

        // Active protocol versions should remain active during suspension
        List<StudyVersionEntity> activeVersions = versions.stream()
            .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
            .collect(Collectors.toList());

        if (activeVersions.isEmpty()) {
            warnings.add("Suspended study has no active protocol versions - consider version status review");
        }

        // Check for pending safety amendments that might require immediate attention
        long criticalAmendments = amendments.stream()
            .filter(a -> a.getAmendmentType() == StudyVersionEntity.AmendmentType.SAFETY)
            .filter(a -> a.getStatus() == StudyAmendmentEntity.AmendmentStatus.UNDER_REVIEW ||
                        a.getStatus() == StudyAmendmentEntity.AmendmentStatus.SUBMITTED)
            .count();

        if (criticalAmendments > 0) {
            warnings.add(String.format("Suspended study has %d pending safety amendments requiring review", criticalAmendments));
        }

        details.put("criticalAmendmentsDuringSuspension", criticalAmendments);
    }

    /**
     * Validate dependencies for COMPLETED status
     */
    private void validateCompletedDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                             List<StudyAmendmentEntity> amendments, List<String> errors, 
                                             List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating COMPLETED dependencies for study {}", study.getId());

        // All amendments should be in final status
        long nonFinalAmendments = amendments.stream()
            .filter(a -> a.getStatus() != StudyAmendmentEntity.AmendmentStatus.IMPLEMENTED &&
                        a.getStatus() != StudyAmendmentEntity.AmendmentStatus.REJECTED &&
                        a.getStatus() != StudyAmendmentEntity.AmendmentStatus.WITHDRAWN)
            .count();

        if (nonFinalAmendments > 0) {
            warnings.add(String.format("Completed study has %d amendments not in final status", nonFinalAmendments));
        }

        // Check for required completion documentation
        boolean hasCompletionDocumentation = amendments.stream()
            .anyMatch(a -> a.getAmendmentType() == StudyVersionEntity.AmendmentType.ADMINISTRATIVE &&
                          a.getDescription() != null && 
                          a.getDescription().toLowerCase().contains("completion"));

        if (!hasCompletionDocumentation) {
            warnings.add("Completed study should have completion documentation amendment");
        }

        details.put("nonFinalAmendments", nonFinalAmendments);
        details.put("hasCompletionDocumentation", hasCompletionDocumentation);
    }

    /**
     * Validate dependencies for TERMINATED status
     */
    private void validateTerminatedDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                              List<StudyAmendmentEntity> amendments, List<String> errors, 
                                              List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating TERMINATED dependencies for study {}", study.getId());

        // Should have termination documentation
        boolean hasTerminationAmendment = amendments.stream()
            .anyMatch(a -> a.getAmendmentType() == StudyVersionEntity.AmendmentType.ADMINISTRATIVE &&
                          a.getDescription() != null && 
                          (a.getDescription().toLowerCase().contains("termination") ||
                           a.getDescription().toLowerCase().contains("early closure")));

        if (!hasTerminationAmendment) {
            warnings.add("Terminated study should have termination documentation amendment");
        }

        // Check for pending amendments that need closure
        long pendingAmendments = amendments.stream()
            .filter(a -> a.getStatus() == StudyAmendmentEntity.AmendmentStatus.UNDER_REVIEW ||
                        a.getStatus() == StudyAmendmentEntity.AmendmentStatus.SUBMITTED)
            .count();

        if (pendingAmendments > 0) {
            warnings.add(String.format("Terminated study has %d pending amendments that should be resolved", pendingAmendments));
        }

        details.put("hasTerminationDocumentation", hasTerminationAmendment);
        details.put("pendingAmendmentsAtTermination", pendingAmendments);
    }

    /**
     * Validate dependencies for WITHDRAWN status
     */
    private void validateWithdrawnDependencies(StudyEntity study, List<StudyVersionEntity> versions, 
                                             List<StudyAmendmentEntity> amendments, List<String> errors, 
                                             List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating WITHDRAWN dependencies for study {}", study.getId());

        // All protocol versions should be withdrawn or superseded
        long activeVersions = versions.stream()
            .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
            .count();

        if (activeVersions > 0) {
            errors.add("Withdrawn study cannot have active protocol versions");
        }

        // Check for withdrawal documentation
        boolean hasWithdrawalAmendment = amendments.stream()
            .anyMatch(a -> a.getAmendmentType() == StudyVersionEntity.AmendmentType.ADMINISTRATIVE &&
                          a.getDescription() != null && 
                          a.getDescription().toLowerCase().contains("withdrawal"));

        if (!hasWithdrawalAmendment) {
            warnings.add("Withdrawn study should have withdrawal documentation amendment");
        }

        details.put("activeVersionsInWithdrawnStudy", activeVersions);
        details.put("hasWithdrawalDocumentation", hasWithdrawalAmendment);
    }

    /**
     * Validate current status consistency
     */
    private void validateCurrentStatusConsistency(StudyEntity study, List<StudyVersionEntity> versions, 
                                                List<StudyAmendmentEntity> amendments, List<String> errors, 
                                                List<String> warnings, Map<String, Object> details) {
        
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : "UNKNOWN";
        logger.debug("Validating current status consistency for study {} - status: {}", study.getId(), currentStatus);

        // Check study-version status alignment
        if ("ACTIVE".equalsIgnoreCase(currentStatus)) {
            long activeVersions = versions.stream()
                .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
                .count();
            
            if (activeVersions == 0) {
                errors.add("Study marked as ACTIVE but has no active protocol versions");
            } else if (activeVersions > 1) {
                errors.add(String.format("Study has %d active protocol versions - only one allowed", activeVersions));
            }
        }

        // Check for orphaned active versions
        if (!"ACTIVE".equalsIgnoreCase(currentStatus)) {
            long activeVersions = versions.stream()
                .filter(v -> v.getStatus() == StudyVersionEntity.VersionStatus.ACTIVE)
                .count();
            
            if (activeVersions > 0) {
                warnings.add(String.format("Study status is %s but has %d active protocol versions", 
                           currentStatus, activeVersions));
            }
        }
    }

    /**
     * Validate amendment consistency across versions
     */
    private void validateAmendmentConsistency(StudyEntity study, List<StudyVersionEntity> versions, 
                                            List<StudyAmendmentEntity> amendments, List<String> errors, 
                                            List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating amendment consistency for study {}", study.getId());

        // Check for amendments with invalid version references
        List<Long> versionIds = versions.stream().map(StudyVersionEntity::getId).collect(Collectors.toList());
        List<StudyAmendmentEntity> orphanedAmendments = amendments.stream()
            .filter(a -> !versionIds.contains(a.getStudyVersionId()))
            .collect(Collectors.toList());

        if (!orphanedAmendments.isEmpty()) {
            errors.add(String.format("Found %d amendments referencing non-existent protocol versions", orphanedAmendments.size()));
        }

        // Check for duplicate amendment numbers within versions
        Map<Long, List<StudyAmendmentEntity>> amendmentsByVersion = amendments.stream()
            .collect(Collectors.groupingBy(StudyAmendmentEntity::getStudyVersionId));

        for (Map.Entry<Long, List<StudyAmendmentEntity>> entry : amendmentsByVersion.entrySet()) {
            List<StudyAmendmentEntity> versionAmendments = entry.getValue();
            Set<Integer> amendmentNumbers = new HashSet<>();
            
            for (StudyAmendmentEntity amendment : versionAmendments) {
                if (!amendmentNumbers.add(amendment.getAmendmentNumber())) {
                    errors.add(String.format("Protocol version %d has duplicate amendment number %d", 
                             entry.getKey(), amendment.getAmendmentNumber()));
                }
            }
        }

        details.put("orphanedAmendments", orphanedAmendments.size());
    }

    /**
     * Validate protocol version sequencing
     */
    private void validateVersionSequencing(StudyEntity study, List<StudyVersionEntity> versions, 
                                         List<String> errors, List<String> warnings, Map<String, Object> details) {
        
        logger.debug("Validating version sequencing for study {}", study.getId());

        if (versions.size() <= 1) {
            return; // No sequencing issues with 0 or 1 versions
        }

        // Check for gaps in version numbering
        List<String> versionNumbers = versions.stream()
            .map(StudyVersionEntity::getVersionNumber)
            .sorted()
            .collect(Collectors.toList());

        for (int i = 1; i < versionNumbers.size(); i++) {
            // Basic sequencing check - could be enhanced based on versioning scheme
            // This is a simple check for now
        }

        // Check for multiple versions with the same effective date
        Map<LocalDate, List<StudyVersionEntity>> versionsByDate = versions.stream()
            .filter(v -> v.getEffectiveDate() != null)
            .collect(Collectors.groupingBy(StudyVersionEntity::getEffectiveDate));

        for (Map.Entry<LocalDate, List<StudyVersionEntity>> entry : versionsByDate.entrySet()) {
            if (entry.getValue().size() > 1) {
                warnings.add(String.format("Multiple protocol versions have the same effective date: %s", 
                           entry.getKey()));
            }
        }

        details.put("versionSequenceChecked", true);
        details.put("versionsWithSameDate", versionsByDate.entrySet().stream()
                                                           .mapToInt(e -> e.getValue().size() > 1 ? e.getValue().size() : 0)
                                                           .sum());
    }

    /**
     * Result class for cross-entity validation
     */
    public static class CrossEntityValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;
        private final Map<String, Object> validationDetails;

        public CrossEntityValidationResult(boolean valid, List<String> errors, List<String> warnings, 
                                         Map<String, Object> validationDetails) {
            this.valid = valid;
            this.errors = errors != null ? errors : Collections.emptyList();
            this.warnings = warnings != null ? warnings : Collections.emptyList();
            this.validationDetails = validationDetails != null ? validationDetails : Collections.emptyMap();
        }

        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
        public Map<String, Object> getValidationDetails() { return validationDetails; }

        public boolean hasWarnings() { return !warnings.isEmpty(); }
        public int getErrorCount() { return errors.size(); }
        public int getWarningCount() { return warnings.size(); }
    }
}
