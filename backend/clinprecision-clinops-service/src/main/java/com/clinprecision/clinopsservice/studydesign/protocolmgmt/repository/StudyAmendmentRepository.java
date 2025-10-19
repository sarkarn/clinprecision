package com.clinprecision.clinopsservice.studydesign.protocolmgmt.repository;



import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.StudyAmendmentEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for StudyAmendment entity operations
 */
@Repository
public interface StudyAmendmentRepository extends JpaRepository<StudyAmendmentEntity, Long> {
    
    /**
     * Find all amendments for a specific study version, ordered by amendment number
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.studyVersionId = :studyVersionId ORDER BY sa.amendmentNumber ASC")
    List<StudyAmendmentEntity> findByStudyVersionIdOrderByAmendmentNumberAsc(@Param("studyVersionId") Long studyVersionId);
    
    /**
     * Find all amendments for a specific study (across all versions)
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa " +
           "JOIN ProtocolVersionEntity sv ON sa.studyVersionId = sv.id " +
           "WHERE sv.studyId = :studyId " +
           "ORDER BY sv.versionNumber DESC, sa.amendmentNumber ASC")
    List<StudyAmendmentEntity> findByStudyIdOrderByVersionAndAmendmentNumber(@Param("studyId") Long studyId);
    
    /**
     * Find amendments by status
     */
    List<StudyAmendmentEntity> findByStatusOrderByCreatedDateDesc(StudyAmendmentEntity.AmendmentStatus status);
    
    /**
     * Find amendments by study version and status
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.studyVersionId = :studyVersionId AND sa.status = :status ORDER BY sa.amendmentNumber ASC")
    List<StudyAmendmentEntity> findByStudyVersionIdAndStatus(@Param("studyVersionId") Long studyVersionId, 
                                                            @Param("status") StudyAmendmentEntity.AmendmentStatus status);
    
    /**
     * Find amendments by amendment type
     */
    List<StudyAmendmentEntity> findByAmendmentTypeOrderByCreatedDateDesc(AmendmentType amendmentType);
    
    /**
     * Find the next amendment number for a version
     */
    @Query("SELECT COALESCE(MAX(sa.amendmentNumber), 0) + 1 FROM StudyAmendmentEntity sa WHERE sa.studyVersionId = :studyVersionId")
    Integer findNextAmendmentNumber(@Param("studyVersionId") Long studyVersionId);
    
    /**
     * Count amendments by study version
     */
    Long countByStudyVersionId(Long studyVersionId);
    
    /**
     * Find amendments that impact subjects
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.impactOnSubjects = true ORDER BY sa.createdDate DESC")
    List<StudyAmendmentEntity> findAmendmentsImpactingSubjects();
    
    /**
     * Find amendments requiring consent updates
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.requiresConsentUpdate = true ORDER BY sa.createdDate DESC")
    List<StudyAmendmentEntity> findAmendmentsRequiringConsentUpdate();
    
    /**
     * Find amendments requiring regulatory notification
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.requiresRegulatoryNotification = true ORDER BY sa.createdDate DESC")
    List<StudyAmendmentEntity> findAmendmentsRequiringRegulatoryNotification();
    
    /**
     * Find amendments created by a specific user
     */
    List<StudyAmendmentEntity> findByCreatedByOrderByCreatedDateDesc(Long createdBy);
    
    /**
     * Find amendments reviewed by a specific user
     */
    List<StudyAmendmentEntity> findByReviewedByOrderByReviewedDateDesc(Long reviewedBy);
    
    /**
     * Find amendments approved by a specific user
     */
    List<StudyAmendmentEntity> findByApprovedByOrderByApprovedDateDesc(Long approvedBy);
    
    /**
     * Find draft amendments (can be edited)
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.status = 'DRAFT' ORDER BY sa.createdDate DESC")
    List<StudyAmendmentEntity> findDraftAmendments();
    
    /**
     * Find amendments pending review
     */
    @Query("SELECT sa FROM StudyAmendmentEntity sa WHERE sa.status IN ('SUBMITTED', 'UNDER_REVIEW') ORDER BY sa.submittedDate ASC")
    List<StudyAmendmentEntity> findAmendmentsPendingReview();
}



