package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.repository.StudyVersionRepository;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.common.dto.clinops.StudyVersionCreateRequestDto;
import com.clinprecision.common.dto.clinops.StudyVersionDto;
import com.clinprecision.common.dto.clinops.StudyVersionUpdateRequestDto;
import com.clinprecision.common.entity.clinops.StudyEntity;
import com.clinprecision.common.entity.clinops.StudyVersionEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing study versions and amendments
 */
@Service
@Transactional
public class StudyVersionService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyVersionService.class);
    
    @Autowired
    private StudyVersionRepository studyVersionRepository;
    
    @Autowired
    private StudyRepository studyRepository;
    
    /**
     * Get all versions for a study
     */
    public List<StudyVersionDto> getStudyVersions(Long studyId) {
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByCreatedDateDesc(studyId);
        return versions.stream()
                .map(StudyVersionDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific version by ID
     */
    public Optional<StudyVersionDto> getVersionById(Long versionId) {
        return studyVersionRepository.findById(versionId)
                .map(StudyVersionDto::new);
    }
    
    /**
     * Get the active version for a study
     */
    public Optional<StudyVersionDto> getActiveVersion(Long studyId) {
        return studyVersionRepository.findActiveVersionByStudyId(studyId)
                .map(StudyVersionDto::new);
    }
    
    /**
     * Get the latest version for a study
     */
    public Optional<StudyVersionDto> getLatestVersion(Long studyId) {
        return studyVersionRepository.findLatestVersionByStudyId(studyId)
                .map(StudyVersionDto::new);
    }
    
    /**
     * Create a new study version
     */
    public StudyVersionDto createVersion(Long studyId, StudyVersionCreateRequestDto request, Long userId) {
        logger.info("Creating version for study {}", studyId);
        
        // LOG STUDY STATUS BEFORE VERSION CREATION
        StudyEntity studyBefore = studyRepository.findById(studyId)
                .orElseThrow(() -> new RuntimeException("Study not found with id: " + studyId));
        logger.info("BEFORE version save - Study {} status: {} (status_id: {})", 
                    studyId, 
                    studyBefore.getStudyStatus() != null ? studyBefore.getStudyStatus().getCode() : "NULL",
                    studyBefore.getStudyStatus() != null ? studyBefore.getStudyStatus().getId() : "NULL");
        
        // Validate amendment reason based on amendment type
        if (request.getAmendmentType() == StudyVersionEntity.AmendmentType.MAJOR || 
            request.getAmendmentType() == StudyVersionEntity.AmendmentType.SAFETY) {
            if (request.getAmendmentReason() == null || request.getAmendmentReason().trim().isEmpty()) {
                throw new RuntimeException("Amendment reason is required for " + request.getAmendmentType() + " amendments");
            }
        }
        
        // Get the latest version to determine next version number
        String nextVersionNumber = generateNextVersionNumber(studyId, request.getAmendmentType());
        
        // Create new version entity
        StudyVersionEntity version = new StudyVersionEntity(studyId, nextVersionNumber, userId);
        version.setAmendmentType(request.getAmendmentType());
        version.setAmendmentReason(request.getAmendmentReason());
        version.setDescription(request.getDescription());
        version.setEffectiveDate(request.getEffectiveDate());
        version.setNotifyStakeholders(request.getNotifyStakeholders());
        version.setRequiresRegulatoryApproval(request.getRequiresRegulatoryApproval());
        version.setAdditionalNotes(request.getAdditionalNotes());
        version.setChangesSummary(request.getChangesSummary());
        version.setImpactAssessment(request.getImpactAssessment());
        version.setProtocolChanges(request.getProtocolChanges());
        version.setIcfChanges(request.getIcfChanges());
        version.setRegulatorySubmissions(request.getRegulatorySubmissions());
        version.setMetadata(request.getMetadata());
        
        // Set previous version reference
        Optional<StudyVersionEntity> previousVersion = studyVersionRepository.findLatestVersionByStudyId(studyId);
        previousVersion.ifPresent(prev -> version.setPreviousVersionId(prev.getId()));
        
        // Save the new version
        logger.info("Saving version {} for study {}", nextVersionNumber, studyId);
        StudyVersionEntity savedVersion = studyVersionRepository.save(version);
        logger.info("Version saved with id: {}", savedVersion.getId());
        
        // LOG STUDY STATUS AFTER VERSION CREATION
        StudyEntity studyAfter = studyRepository.findById(studyId)
                .orElseThrow(() -> new RuntimeException("Study not found with id: " + studyId));
        logger.info("AFTER version save - Study {} status: {} (status_id: {})", 
                    studyId, 
                    studyAfter.getStudyStatus() != null ? studyAfter.getStudyStatus().getCode() : "NULL",
                    studyAfter.getStudyStatus() != null ? studyAfter.getStudyStatus().getId() : "NULL");
        
        // ALERT IF STATUS CHANGED
        boolean statusChangedToNull = (studyBefore.getStudyStatus() != null && studyAfter.getStudyStatus() == null);
        if (statusChangedToNull) {
            logger.error("⚠️ CRITICAL: Study {} status changed from {} to NULL during version creation!", 
                         studyId, studyBefore.getStudyStatus().getCode());
        }
        
        return new StudyVersionDto(savedVersion);
    }
    
    /**
     * Update a study version
     */
    public StudyVersionDto updateVersion(Long versionId, StudyVersionUpdateRequestDto request, Long userId) {
        StudyVersionEntity version = studyVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        
        // Check if version can be edited
        if (!version.isEditable()) {
            throw new RuntimeException("Version cannot be edited in current status: " + version.getStatus());
        }
        
        // Update fields
        if (request.getStatus() != null) {
            handleStatusChange(version, request.getStatus(), userId);
        }
        if (request.getAmendmentReason() != null) {
            version.setAmendmentReason(request.getAmendmentReason());
        }
        if (request.getDescription() != null) {
            version.setDescription(request.getDescription());
        }
        if (request.getEffectiveDate() != null) {
            version.setEffectiveDate(request.getEffectiveDate());
        }
        if (request.getAdditionalNotes() != null) {
            version.setAdditionalNotes(request.getAdditionalNotes());
        }
        if (request.getChangesSummary() != null) {
            version.setChangesSummary(request.getChangesSummary());
        }
        if (request.getImpactAssessment() != null) {
            version.setImpactAssessment(request.getImpactAssessment());
        }
        if (request.getProtocolChanges() != null) {
            version.setProtocolChanges(request.getProtocolChanges());
        }
        if (request.getIcfChanges() != null) {
            version.setIcfChanges(request.getIcfChanges());
        }
        if (request.getRegulatorySubmissions() != null) {
            version.setRegulatorySubmissions(request.getRegulatorySubmissions());
        }
        if (request.getReviewComments() != null) {
            version.setReviewComments(request.getReviewComments());
        }
        if (request.getMetadata() != null) {
            version.setMetadata(request.getMetadata());
        }
        
        StudyVersionEntity updatedVersion = studyVersionRepository.save(version);
        return new StudyVersionDto(updatedVersion);
    }
    
    /**
     * Delete a study version (only if in DRAFT status)
     */
    public void deleteVersion(Long versionId) {
        StudyVersionEntity version = studyVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        
        if (version.getStatus() != StudyVersionEntity.VersionStatus.DRAFT) {
            throw new RuntimeException("Only draft versions can be deleted");
        }
        
        studyVersionRepository.delete(version);
    }
    
    /**
     * Approve a version
     */
    public StudyVersionDto approveVersion(Long versionId, Long approverId) {
        StudyVersionEntity version = studyVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        
        if (!version.canBeSubmitted()) {
            throw new RuntimeException("Version cannot be approved in current status: " + version.getStatus());
        }
        
        version.setStatus(StudyVersionEntity.VersionStatus.APPROVED);
        version.setApprovedBy(approverId);
        version.setApprovedDate(LocalDateTime.now());
        
        StudyVersionEntity approvedVersion = studyVersionRepository.save(version);
        return new StudyVersionDto(approvedVersion);
    }
    
    /**
     * Activate a version (make it the current active version)
     */
    public StudyVersionDto activateVersion(Long versionId) {
        StudyVersionEntity version = studyVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        
        if (version.getStatus() != StudyVersionEntity.VersionStatus.APPROVED) {
            throw new RuntimeException("Only approved versions can be activated");
        }
        
        // Mark current active version as superseded
        studyVersionRepository.findActiveVersionByStudyId(version.getStudyId())
                .ifPresent(activeVersion -> {
                    activeVersion.setStatus(StudyVersionEntity.VersionStatus.SUPERSEDED);
                    studyVersionRepository.save(activeVersion);
                });
        
        // Activate the new version
        version.setStatus(StudyVersionEntity.VersionStatus.ACTIVE);
        if (version.getEffectiveDate() == null) {
            version.setEffectiveDate(java.time.LocalDate.now());
        }
        
        StudyVersionEntity activatedVersion = studyVersionRepository.save(version);
        return new StudyVersionDto(activatedVersion);
    }
    
    /**
     * Generate next version number based on amendment type
     */
    private String generateNextVersionNumber(Long studyId, StudyVersionEntity.AmendmentType amendmentType) {
        Optional<StudyVersionEntity> latestVersion = studyVersionRepository.findLatestVersionByStudyId(studyId);
        
        if (latestVersion.isEmpty()) {
            return "v1.0";
        }
        
        String currentVersionNumber = latestVersion.get().getVersionNumber();
        return calculateNextVersion(currentVersionNumber, amendmentType);
    }
    
    /**
     * Calculate next version number based on current version and amendment type
     */
    private String calculateNextVersion(String currentVersion, StudyVersionEntity.AmendmentType amendmentType) {
        // Remove 'v' prefix if present
        String cleanVersion = currentVersion.startsWith("v") ? currentVersion.substring(1) : currentVersion;
        String[] parts = cleanVersion.split("\\.");
        
        int major = parts.length > 0 ? Integer.parseInt(parts[0]) : 0;
        int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        
        switch (amendmentType) {
            case MAJOR:
            case SAFETY:
                // Major changes increment major version, reset minor
                return String.format("v%d.0", major + 1);
            
            case MINOR:
            case ADMINISTRATIVE:
            default:
                // Minor changes increment minor version
                return String.format("v%d.%d", major, minor + 1);
        }
    }
    
    /**
     * Handle status changes with appropriate validations and side effects
     */
    private void handleStatusChange(StudyVersionEntity version, StudyVersionEntity.VersionStatus newStatus, Long userId) {
        StudyVersionEntity.VersionStatus currentStatus = version.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new RuntimeException(String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }
        
        // Set new status
        version.setStatus(newStatus);
        
        // Handle side effects
        switch (newStatus) {
            case APPROVED:
                version.setApprovedBy(userId);
                version.setApprovedDate(LocalDateTime.now());
                break;
            case ACTIVE:
                // Mark other active versions as superseded
                studyVersionRepository.findActiveVersionByStudyId(version.getStudyId())
                        .ifPresent(activeVersion -> {
                            if (!activeVersion.getId().equals(version.getId())) {
                                activeVersion.setStatus(StudyVersionEntity.VersionStatus.SUPERSEDED);
                                studyVersionRepository.save(activeVersion);
                            }
                        });
                if (version.getEffectiveDate() == null) {
                    version.setEffectiveDate(java.time.LocalDate.now());
                }
                break;
            default:
                // No specific side effects for other statuses
                break;
        }
    }
    
    /**
     * Validate if status transition is allowed
     */
    private boolean isValidStatusTransition(StudyVersionEntity.VersionStatus from, StudyVersionEntity.VersionStatus to) {
        switch (from) {
            case DRAFT:
                return to == StudyVersionEntity.VersionStatus.UNDER_REVIEW || 
                       to == StudyVersionEntity.VersionStatus.AMENDMENT_REVIEW ||
                       to == StudyVersionEntity.VersionStatus.SUBMITTED ||
                       to == StudyVersionEntity.VersionStatus.WITHDRAWN;
            
            case UNDER_REVIEW:
                return to == StudyVersionEntity.VersionStatus.DRAFT ||
                       to == StudyVersionEntity.VersionStatus.AMENDMENT_REVIEW ||
                       to == StudyVersionEntity.VersionStatus.SUBMITTED ||
                       to == StudyVersionEntity.VersionStatus.APPROVED ||
                       to == StudyVersionEntity.VersionStatus.WITHDRAWN;
            
            case AMENDMENT_REVIEW:
                return to == StudyVersionEntity.VersionStatus.DRAFT ||
                       to == StudyVersionEntity.VersionStatus.UNDER_REVIEW ||
                       to == StudyVersionEntity.VersionStatus.SUBMITTED ||
                       to == StudyVersionEntity.VersionStatus.APPROVED ||
                       to == StudyVersionEntity.VersionStatus.WITHDRAWN;
            
            case SUBMITTED:
                return to == StudyVersionEntity.VersionStatus.UNDER_REVIEW ||
                       to == StudyVersionEntity.VersionStatus.AMENDMENT_REVIEW ||
                       to == StudyVersionEntity.VersionStatus.APPROVED ||
                       to == StudyVersionEntity.VersionStatus.WITHDRAWN;
            
            case APPROVED:
                return to == StudyVersionEntity.VersionStatus.ACTIVE ||
                       to == StudyVersionEntity.VersionStatus.WITHDRAWN;
            
            case ACTIVE:
                return to == StudyVersionEntity.VersionStatus.SUPERSEDED;
            
            case SUPERSEDED:
            case WITHDRAWN:
                return false; // Terminal states
            
            default:
                return false;
        }
    }
    
    /**
     * Get version history with change details
     */
    public List<StudyVersionDto> getVersionHistory(Long studyId) {
        List<StudyVersionEntity> versions = studyVersionRepository.findByStudyIdOrderByVersionNumberDesc(studyId);
        return versions.stream()
                .map(StudyVersionDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Update version status
     */
    public StudyVersionDto updateVersionStatus(Long versionId, StudyVersionEntity.VersionStatus status, Long userId) {
        StudyVersionEntity version = studyVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found with id: " + versionId));
        
        handleStatusChange(version, status, userId);
        StudyVersionEntity savedVersion = studyVersionRepository.save(version);
        
        return new StudyVersionDto(savedVersion);
    }
}
