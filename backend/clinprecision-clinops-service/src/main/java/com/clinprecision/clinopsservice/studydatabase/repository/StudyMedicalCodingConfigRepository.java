package com.clinprecision.clinopsservice.studydatabase.repository;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyMedicalCodingConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing medical coding configuration.
 * 
 * Provides queries for retrieving medical dictionary configuration needed for
 * coding adverse events, medical history, medications, procedures, and lab tests.
 */
@Repository
public interface StudyMedicalCodingConfigRepository extends JpaRepository<StudyMedicalCodingConfigEntity, Long> {

    /**
     * Find all medical coding configurations for a study
     * 
     * @param studyId The study ID
     * @return List of medical coding configuration entities
     */
    List<StudyMedicalCodingConfigEntity> findByStudyId(Long studyId);

    /**
     * Find all active medical coding configurations for a study
     * 
     * @param studyId The study ID
     * @return List of active medical coding configuration entities
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndIsActiveTrue(Long studyId);

    /**
     * Find medical coding configurations for a specific form
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return List of medical coding configurations for the form
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Find medical coding configuration for a specific field
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param fieldName The field name
     * @return Optional containing the medical coding configuration if found
     */
    Optional<StudyMedicalCodingConfigEntity> findByStudyIdAndFormIdAndFieldName(
            Long studyId, Long formId, String fieldName);

    /**
     * Find all configurations using a specific dictionary type
     * 
     * @param studyId The study ID
     * @param dictionaryType The dictionary type (MedDRA, WHO_DD, SNOMED, ICD10, etc.)
     * @return List of configurations using the dictionary
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndDictionaryType(Long studyId, String dictionaryType);

    /**
     * Find all fields requiring medical coding
     * 
     * @param studyId The study ID
     * @return List of fields where coding is required
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndCodingRequiredTrue(Long studyId);

    /**
     * Find all fields with auto-coding enabled
     * 
     * @param studyId The study ID
     * @return List of fields with auto-coding enabled
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndAutoCodingEnabledTrue(Long studyId);

    /**
     * Find all fields requiring manual review
     * 
     * @param studyId The study ID
     * @return List of fields requiring manual review after coding
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndManualReviewRequiredTrue(Long studyId);

    /**
     * Find all fields requiring adjudication
     * 
     * @param studyId The study ID
     * @return List of fields with adjudication workflow
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndAdjudicationRequiredTrue(Long studyId);

    /**
     * Find all configurations using a specific workflow type
     * 
     * @param studyId The study ID
     * @param workflowType The workflow type (SINGLE_CODER, DUAL_CODER, etc.)
     * @return List of configurations with the workflow type
     */
    List<StudyMedicalCodingConfigEntity> findByStudyIdAndWorkflowType(Long studyId, String workflowType);

    /**
     * Find all MedDRA configurations by hierarchy level
     * 
     * @param studyId The study ID
     * @param codeToLevel The MedDRA level (PT, LLT, HLT, HLGT, SOC)
     * @return List of MedDRA configurations for the hierarchy level
     */
    @Query("SELECT c FROM StudyMedicalCodingConfigEntity c WHERE c.studyId = :studyId " +
           "AND c.dictionaryType = 'MedDRA' AND c.codeToLevel = :codeToLevel AND c.isActive = true")
    List<StudyMedicalCodingConfigEntity> findMedDraConfigsByLevel(
            @Param("studyId") Long studyId, @Param("codeToLevel") String codeToLevel);

    /**
     * Find all fields with dual coding workflow
     * 
     * @param studyId The study ID
     * @return List of fields requiring dual coding
     */
    @Query("SELECT c FROM StudyMedicalCodingConfigEntity c WHERE c.studyId = :studyId " +
           "AND c.workflowType = 'DUAL_CODER' AND c.isActive = true")
    List<StudyMedicalCodingConfigEntity> findDualCodingFields(@Param("studyId") Long studyId);

    /**
     * Get distinct dictionary types used in a study
     * 
     * @param studyId The study ID
     * @return List of distinct dictionary types
     */
    @Query("SELECT DISTINCT c.dictionaryType FROM StudyMedicalCodingConfigEntity c " +
           "WHERE c.studyId = :studyId AND c.isActive = true " +
           "ORDER BY c.dictionaryType")
    List<String> findDistinctDictionaryTypes(@Param("studyId") Long studyId);

    /**
     * Get summary statistics for medical coding configuration
     * 
     * @param studyId The study ID
     * @return Array of statistics: [totalConfigs, codingRequiredCount, autoCodingEnabledCount,
     *         manualReviewRequiredCount, adjudicationRequiredCount]
     */
    @Query("SELECT COUNT(c) as totalConfigs, " +
           "SUM(CASE WHEN c.codingRequired = true THEN 1 ELSE 0 END) as codingRequiredCount, " +
           "SUM(CASE WHEN c.autoCodingEnabled = true THEN 1 ELSE 0 END) as autoCodingEnabledCount, " +
           "SUM(CASE WHEN c.manualReviewRequired = true THEN 1 ELSE 0 END) as manualReviewRequiredCount, " +
           "SUM(CASE WHEN c.adjudicationRequired = true THEN 1 ELSE 0 END) as adjudicationRequiredCount " +
           "FROM StudyMedicalCodingConfigEntity c WHERE c.studyId = :studyId AND c.isActive = true")
    Object[] getCodingConfigSummary(@Param("studyId") Long studyId);

    /**
     * Count total configurations for a study
     * 
     * @param studyId The study ID
     * @return Number of medical coding configurations
     */
    long countByStudyId(Long studyId);

    /**
     * Count configurations for a specific form
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return Number of configurations for the form
     */
    long countByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Count configurations using a specific dictionary
     * 
     * @param studyId The study ID
     * @param dictionaryType The dictionary type
     * @return Number of configurations using the dictionary
     */
    long countByStudyIdAndDictionaryType(Long studyId, String dictionaryType);

    /**
     * Check if a configuration exists for a specific field
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param fieldName The field name
     * @return True if configuration exists
     */
    boolean existsByStudyIdAndFormIdAndFieldName(Long studyId, Long formId, String fieldName);

    /**
     * Delete all configurations for a study
     * 
     * @param studyId The study ID
     * @return Number of deleted configurations
     */
    long deleteByStudyId(Long studyId);

    /**
     * Delete all configurations for a specific form
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return Number of deleted configurations
     */
    long deleteByStudyIdAndFormId(Long studyId, Long formId);
}
