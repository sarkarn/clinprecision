package com.clinprecision.clinopsservice.protocolversion.service;

import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.protocolversion.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.protocolversion.repository.ProtocolVersionReadRepository;
import com.clinprecision.clinopsservice.service.CrossEntityStatusValidationService;
import com.clinprecision.clinopsservice.service.CrossEntityStatusValidationService.CrossEntityValidationResult;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import com.clinprecision.clinopsservice.study.exception.StudyStatusTransitionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Protocol Version Validation Service - Domain Service for Cross-Aggregate Validation
 * 
 * This service validates protocol version operations against cross-aggregate business rules,
 * particularly focusing on Study ↔️ ProtocolVersion dependencies.
 * 
 * Key Validations:
 * - Only ONE protocol version can be ACTIVE per study at a time
 * - Protocol version status transitions must align with study status
 * - Cannot activate version if study is not in appropriate status
 * - Cannot withdraw/supersede version if it's the only active version
 * - Study must have approved version before becoming APPROVED
 * 
 * Architecture:
 * - Called by ProtocolVersionCommandService BEFORE dispatching commands
 * - Queries read model to get current state
 * - Enforces one-active-version-per-study rule
 * - Throws domain exception if validation fails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionValidationService {
    
    private final ProtocolVersionReadRepository protocolVersionRepository;
    private final StudyQueryService studyQueryService;
    private final CrossEntityStatusValidationService crossEntityValidator;
    
    /**
     * Validate protocol version status change
     * 
     * Critical validation: Ensures only ONE active version per study
     * 
     * @param versionId Protocol version aggregate UUID
     * @param targetStatus Target version status
     * @throws StudyStatusTransitionException if validation fails
     */
    public void validateStatusChange(UUID versionId, VersionStatus targetStatus) {
        log.debug("Validating protocol version status change: {} → {}", versionId, targetStatus);
        
        // Get version entity from read model
        ProtocolVersionEntity version = getVersionEntityById(versionId);
        
        // Get associated study
        StudyEntity study = studyQueryService.getStudyEntityByUuid(version.getStudyAggregateUuid());
        
        // Validate based on target status
        switch (targetStatus) {
            case ACTIVE:
                validateActivation(version, study);
                break;
            case APPROVED:
                validateApproval(version, study);
                break;
            case SUPERSEDED:
                validateSupersession(version, study);
                break;
            case WITHDRAWN:
                validateWithdrawal(version, study);
                break;
            case DRAFT:
            case UNDER_REVIEW:
            case SUBMITTED:
            case AMENDMENT_REVIEW:
                // These transitions generally don't require cross-entity validation
                log.debug("Status {} generally allows transitions", targetStatus);
                break;
            default:
                log.warn("Unknown status transition target: {}", targetStatus);
        }
        
        // Perform comprehensive cross-entity validation
        CrossEntityValidationResult result = 
            crossEntityValidator.validateCrossEntityDependencies(study, null, "PROTOCOL_VERSION_STATUS_CHANGE");
        
        if (!result.isValid()) {
            String errorMessage = String.format(
                "Cannot change protocol version %s to status %s: %s",
                version.getVersionNumber(),
                targetStatus,
                String.join("; ", result.getErrors())
            );
            log.error("Protocol version status validation failed: {}", errorMessage);
            throw new StudyStatusTransitionException(errorMessage, result.getErrors());
        }
        
        // Log warnings if any
        if (result.hasWarnings()) {
            log.warn("Protocol version status change warnings: {}", result.getWarnings());
        }
        
        log.debug("Protocol version status validation passed: {} → {}", versionId, targetStatus);
    }
    
    /**
     * Validate protocol version activation
     * 
     * CRITICAL RULE: Only ONE active version allowed per study
     * 
     * @param version Version to activate
     * @param study Associated study
     */
    private void validateActivation(ProtocolVersionEntity version, StudyEntity study) {
        log.debug("Validating protocol version activation: {} for study {}", 
            version.getVersionNumber(), study.getAggregateUuid());
        
        // Check current study status
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        // Study must be in appropriate status to activate version
        if (!"APPROVED".equals(studyStatus) && !"ACTIVE".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot activate protocol version %s: Study status is %s (must be APPROVED or ACTIVE)",
                    version.getVersionNumber(), studyStatus)
            );
        }
        
        // CRITICAL: Check for existing active versions
        List<ProtocolVersionEntity> activeVersions = protocolVersionRepository
            .findByStudyIdAndStatus(study.getId(), VersionStatus.ACTIVE);
        
        if (!activeVersions.isEmpty()) {
            // Check if this version is already the active one
            boolean isAlreadyActive = activeVersions.stream()
                .anyMatch(v -> v.getId().equals(version.getId()));
            
            if (!isAlreadyActive) {
                throw new StudyStatusTransitionException(
                    String.format("Cannot activate protocol version %s: Study already has %d active version(s). " +
                        "Only ONE active version allowed per study. " +
                        "Active version(s): %s",
                        version.getVersionNumber(),
                        activeVersions.size(),
                        activeVersions.stream().map(ProtocolVersionEntity::getVersionNumber).toList())
                );
            }
        }
        
        log.debug("Protocol version activation validation passed: {}", version.getVersionNumber());
    }
    
    /**
     * Validate protocol version approval
     * 
     * @param version Version to approve
     * @param study Associated study
     */
    private void validateApproval(ProtocolVersionEntity version, StudyEntity study) {
        log.debug("Validating protocol version approval: {} for study {}", 
            version.getVersionNumber(), study.getAggregateUuid());
        
        // Version must be in UNDER_REVIEW status to be approved
        if (version.getStatus() != VersionStatus.UNDER_REVIEW) {
            throw new StudyStatusTransitionException(
                String.format("Cannot approve protocol version %s: Current status is %s (must be UNDER_REVIEW)",
                    version.getVersionNumber(), version.getStatus())
            );
        }
        
        // Check if study allows version approval
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        if ("COMPLETED".equals(studyStatus) || 
            "TERMINATED".equals(studyStatus) || 
            "WITHDRAWN".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot approve protocol version %s: Study is in terminal status %s",
                    version.getVersionNumber(), studyStatus)
            );
        }
        
        log.debug("Protocol version approval validation passed: {}", version.getVersionNumber());
    }
    
    /**
     * Validate protocol version supersession
     * 
     * @param version Version to supersede
     * @param study Associated study
     */
    private void validateSupersession(ProtocolVersionEntity version, StudyEntity study) {
        log.debug("Validating protocol version supersession: {} for study {}", 
            version.getVersionNumber(), study.getAggregateUuid());
        
        // Cannot supersede if it's the only version
        List<ProtocolVersionEntity> allVersions = protocolVersionRepository
            .findByStudyIdOrderByVersionNumberDesc(study.getId());
        
        if (allVersions.size() == 1) {
            throw new StudyStatusTransitionException(
                String.format("Cannot supersede protocol version %s: It's the only version for this study",
                    version.getVersionNumber())
            );
        }
        
        // If this is the active version, ensure there's a newer approved version to take over
        if (version.getStatus() == VersionStatus.ACTIVE) {
            boolean hasNewerApprovedVersion = allVersions.stream()
                .anyMatch(v -> v.getVersionNumber().compareTo(version.getVersionNumber()) > 0 &&
                              v.getStatus() == VersionStatus.APPROVED);
            
            if (!hasNewerApprovedVersion) {
                throw new StudyStatusTransitionException(
                    String.format("Cannot supersede active protocol version %s: No newer approved version available to replace it",
                        version.getVersionNumber())
                );
            }
        }
        
        log.debug("Protocol version supersession validation passed: {}", version.getVersionNumber());
    }
    
    /**
     * Validate protocol version withdrawal
     * 
     * @param version Version to withdraw
     * @param study Associated study
     */
    private void validateWithdrawal(ProtocolVersionEntity version, StudyEntity study) {
        log.debug("Validating protocol version withdrawal: {} for study {}", 
            version.getVersionNumber(), study.getAggregateUuid());
        
        // Cannot withdraw the only version
        List<ProtocolVersionEntity> allVersions = protocolVersionRepository
            .findByStudyIdOrderByVersionNumberDesc(study.getId());
        
        if (allVersions.size() == 1) {
            throw new StudyStatusTransitionException(
                String.format("Cannot withdraw protocol version %s: It's the only version for this study",
                    version.getVersionNumber())
            );
        }
        
        // If this is the active version, ensure study can function without it
        if (version.getStatus() == VersionStatus.ACTIVE) {
            String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
            
            if ("ACTIVE".equals(studyStatus)) {
                throw new StudyStatusTransitionException(
                    String.format("Cannot withdraw active protocol version %s: Study is in ACTIVE status and requires an active version",
                        version.getVersionNumber())
                );
            }
        }
        
        log.debug("Protocol version withdrawal validation passed: {}", version.getVersionNumber());
    }
    
    /**
     * Validate protocol version creation
     * 
     * @param studyUuid Study aggregate UUID
     * @param versionNumber Version number
     */
    public void validateVersionCreation(UUID studyUuid, String versionNumber) {
        log.debug("Validating protocol version creation: {} for study {}", versionNumber, studyUuid);
        
        // Get associated study
        StudyEntity study = studyQueryService.getStudyEntityByUuid(studyUuid);
        
        // Check if study allows version creation
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        if ("COMPLETED".equals(studyStatus) || 
            "TERMINATED".equals(studyStatus) || 
            "WITHDRAWN".equals(studyStatus)) {
            throw new StudyStatusTransitionException(
                String.format("Cannot create protocol version for study %s: Study is in terminal status %s",
                    study.getName(), studyStatus)
            );
        }
        
        // Check for duplicate version numbers
        List<ProtocolVersionEntity> existingVersions = protocolVersionRepository
            .findByStudyIdOrderByVersionNumberDesc(study.getId());
        
        boolean duplicateExists = existingVersions.stream()
            .anyMatch(v -> v.getVersionNumber().equals(versionNumber));
        
        if (duplicateExists) {
            throw new StudyStatusTransitionException(
                String.format("Cannot create protocol version %s: Version number already exists for this study",
                    versionNumber)
            );
        }
        
        log.debug("Protocol version creation validation passed: {} for study {}", versionNumber, studyUuid);
    }
    
    /**
     * Validate protocol version modification
     * 
     * @param versionId Protocol version aggregate UUID
     */
    public void validateVersionModification(UUID versionId) {
        log.debug("Validating protocol version modification: {}", versionId);
        
        // Get version entity from read model
        ProtocolVersionEntity version = getVersionEntityById(versionId);
        
        // Cannot modify versions in certain statuses
        if (version.getStatus() == VersionStatus.APPROVED ||
            version.getStatus() == VersionStatus.ACTIVE ||
            version.getStatus() == VersionStatus.SUPERSEDED ||
            version.getStatus() == VersionStatus.WITHDRAWN) {
            
            throw new StudyStatusTransitionException(
                String.format("Cannot modify protocol version %s: Status is %s (only DRAFT and UNDER_REVIEW can be modified)",
                    version.getVersionNumber(), version.getStatus())
            );
        }
        
        log.debug("Protocol version modification validation passed: {}", version.getVersionNumber());
    }
    
    /**
     * Get version entity by aggregate UUID (helper method)
     * 
     * @param versionId Protocol version aggregate UUID
     * @return ProtocolVersionEntity
     */
    private ProtocolVersionEntity getVersionEntityById(UUID versionId) {
        return protocolVersionRepository.findByAggregateUuid(versionId)
            .orElseThrow(() -> new IllegalArgumentException("Protocol version not found: " + versionId));
    }
}
