package com.clinprecision.clinopsservice.repository;



import com.clinprecision.clinopsservice.entity.StudyVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyVersion entity operations
 */
@Repository
public interface StudyVersionRepository extends JpaRepository<StudyVersionEntity, Long> {
    
    /**
     * Find all versions for a specific study, ordered by creation date descending
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.studyId = :studyId ORDER BY sv.createdDate DESC")
    List<StudyVersionEntity> findByStudyIdOrderByCreatedDateDesc(@Param("studyId") Long studyId);
    
    /**
     * Find all versions for a specific study, ordered by version number descending
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.studyId = :studyId ORDER BY sv.versionNumber DESC")
    List<StudyVersionEntity> findByStudyIdOrderByVersionNumberDesc(@Param("studyId") Long studyId);
    
    /**
     * Find the active version for a study
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.studyId = :studyId AND sv.status = 'ACTIVE'")
    Optional<StudyVersionEntity> findActiveVersionByStudyId(@Param("studyId") Long studyId);
    
    /**
     * Find the latest version for a study (highest version number)
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.studyId = :studyId ORDER BY sv.versionNumber DESC LIMIT 1")
    Optional<StudyVersionEntity> findLatestVersionByStudyId(@Param("studyId") Long studyId);
    
    /**
     * Find versions by status
     */
    List<StudyVersionEntity> findByStatus(StudyVersionEntity.VersionStatus status);
    
    /**
     * Find versions by study and status
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.studyId = :studyId AND sv.status = :status ORDER BY sv.createdDate DESC")
    List<StudyVersionEntity> findByStudyIdAndStatus(@Param("studyId") Long studyId, 
                                                   @Param("status") StudyVersionEntity.VersionStatus status);
    
    /**
     * Find versions requiring regulatory approval
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.requiresRegulatoryApproval = true AND sv.status IN ('DRAFT', 'UNDER_REVIEW')")
    List<StudyVersionEntity> findVersionsRequiringRegulatoryApproval();
    
    /**
     * Count total versions for a study
     */
    Long countByStudyId(Long studyId);
    
    /**
     * Check if a version number already exists for a study
     */
    boolean existsByStudyIdAndVersionNumber(Long studyId, String versionNumber);
    
    /**
     * Find versions created by a specific user
     */
    List<StudyVersionEntity> findByCreatedByOrderByCreatedDateDesc(Long createdBy);
    
    /**
     * Find versions approved by a specific user
     */
    List<StudyVersionEntity> findByApprovedByOrderByApprovedDateDesc(Long approvedBy);
    
    /**
     * Find versions by amendment type
     */
    List<StudyVersionEntity> findByAmendmentTypeOrderByCreatedDateDesc(StudyVersionEntity.AmendmentType amendmentType);
    
    /**
     * Find versions with effective date in future
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.effectiveDate > CURRENT_DATE ORDER BY sv.effectiveDate ASC")
    List<StudyVersionEntity> findFutureEffectiveVersions();
    
    /**
     * Find versions that need stakeholder notification
     */
    @Query("SELECT sv FROM StudyVersionEntity sv WHERE sv.notifyStakeholders = true AND sv.status = 'APPROVED' ORDER BY sv.approvedDate DESC")
    List<StudyVersionEntity> findVersionsNeedingNotification();
}



