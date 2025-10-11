package com.clinprecision.clinopsservice.studydatabase.repository;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyFieldMetadataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Study Field Metadata
 * 
 * Provides access to field-level clinical and regulatory metadata.
 * Used by worker service during database build and by runtime data entry validation.
 */
@Repository
public interface StudyFieldMetadataRepository extends JpaRepository<StudyFieldMetadataEntity, Long> {

    /**
     * Find all field metadata for a study
     */
    List<StudyFieldMetadataEntity> findByStudyId(Long studyId);

    /**
     * Find all field metadata for a specific form
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Find metadata for a specific field
     */
    Optional<StudyFieldMetadataEntity> findByStudyIdAndFormIdAndFieldName(
        Long studyId, 
        Long formId, 
        String fieldName
    );

    /**
     * Find all fields requiring SDV for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndSdvRequiredTrue(Long studyId);

    /**
     * Find all fields requiring medical review for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndMedicalReviewRequiredTrue(Long studyId);

    /**
     * Find all critical data points for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndCriticalDataPointTrue(Long studyId);

    /**
     * Find all safety data points for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndSafetyDataPointTrue(Long studyId);

    /**
     * Find all fields with electronic signature requirement
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndElectronicSignatureRequiredTrue(Long studyId);

    /**
     * Find all FDA-required fields for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndFdaRequiredTrue(Long studyId);

    /**
     * Find all fields requiring any type of review (SDV, medical, or data review)
     */
    @Query("SELECT m FROM StudyFieldMetadataEntity m WHERE m.studyId = :studyId " +
           "AND (m.sdvRequired = true OR m.medicalReviewRequired = true OR m.dataReviewRequired = true)")
    List<StudyFieldMetadataEntity> findAllFieldsRequiringReview(@Param("studyId") Long studyId);

    /**
     * Find all fields with regulatory requirements (FDA or EMA)
     */
    @Query("SELECT m FROM StudyFieldMetadataEntity m WHERE m.studyId = :studyId " +
           "AND (m.fdaRequired = true OR m.emaRequired = true)")
    List<StudyFieldMetadataEntity> findAllRegulatoryRequiredFields(@Param("studyId") Long studyId);

    /**
     * Find all derived fields for a study
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndIsDerivedFieldTrue(Long studyId);

    /**
     * Count metadata entries for a study (for build verification)
     */
    long countByStudyId(Long studyId);

    /**
     * Count metadata entries for a specific form (for build verification)
     */
    long countByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Check if metadata exists for a field
     */
    boolean existsByStudyIdAndFormIdAndFieldName(Long studyId, Long formId, String fieldName);

    /**
     * Delete all metadata for a study (cleanup)
     */
    void deleteByStudyId(Long studyId);

    /**
     * Delete all metadata for a form
     */
    void deleteByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Find fields requiring specific audit trail level
     */
    List<StudyFieldMetadataEntity> findByStudyIdAndAuditTrailLevel(
        Long studyId, 
        StudyFieldMetadataEntity.AuditTrailLevel auditTrailLevel
    );

    /**
     * Get summary statistics for a study's field metadata
     */
    @Query("SELECT " +
           "COUNT(m) as totalFields, " +
           "SUM(CASE WHEN m.sdvRequired = true THEN 1 ELSE 0 END) as sdvRequiredCount, " +
           "SUM(CASE WHEN m.medicalReviewRequired = true THEN 1 ELSE 0 END) as medicalReviewCount, " +
           "SUM(CASE WHEN m.criticalDataPoint = true THEN 1 ELSE 0 END) as criticalFieldsCount, " +
           "SUM(CASE WHEN m.fdaRequired = true THEN 1 ELSE 0 END) as fdaRequiredCount " +
           "FROM StudyFieldMetadataEntity m WHERE m.studyId = :studyId")
    Object[] getMetadataSummary(@Param("studyId") Long studyId);
}
