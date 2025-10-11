package com.clinprecision.clinopsservice.studydatabase.repository;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyCdashMappingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing CDASH/SDTM mappings.
 * 
 * Provides queries for retrieving CDISC-compliant field mappings needed for
 * regulatory submissions and SDTM dataset generation.
 */
@Repository
public interface StudyCdashMappingRepository extends JpaRepository<StudyCdashMappingEntity, Long> {

    /**
     * Find all CDASH mappings for a study
     * 
     * @param studyId The study ID
     * @return List of CDASH mapping entities
     */
    List<StudyCdashMappingEntity> findByStudyId(Long studyId);

    /**
     * Find all active CDASH mappings for a study
     * 
     * @param studyId The study ID
     * @return List of active CDASH mapping entities
     */
    List<StudyCdashMappingEntity> findByStudyIdAndIsActiveTrue(Long studyId);

    /**
     * Find CDASH mappings for a specific form in a study
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return List of CDASH mapping entities for the form
     */
    List<StudyCdashMappingEntity> findByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Find CDASH mapping for a specific field
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param fieldName The field name
     * @return Optional containing the CDASH mapping entity if found
     */
    Optional<StudyCdashMappingEntity> findByStudyIdAndFormIdAndFieldName(
            Long studyId, Long formId, String fieldName);

    /**
     * Find all mappings for a specific CDASH domain
     * 
     * @param studyId The study ID
     * @param cdashDomain The CDASH domain (e.g., 'VS', 'AE', 'LB')
     * @return List of mappings for the domain
     */
    List<StudyCdashMappingEntity> findByStudyIdAndCdashDomain(Long studyId, String cdashDomain);

    /**
     * Find all mappings for a specific SDTM domain
     * 
     * @param studyId The study ID
     * @param sdtmDomain The SDTM domain
     * @return List of mappings for the SDTM domain
     */
    List<StudyCdashMappingEntity> findByStudyIdAndSdtmDomain(Long studyId, String sdtmDomain);

    /**
     * Find all mappings with a specific data origin
     * 
     * @param studyId The study ID
     * @param dataOrigin The data origin (COLLECTED, DERIVED, ASSIGNED, PROTOCOL)
     * @return List of mappings with the specified origin
     */
    List<StudyCdashMappingEntity> findByStudyIdAndDataOrigin(Long studyId, String dataOrigin);

    /**
     * Find all derived fields (data_origin = 'DERIVED')
     * 
     * @param studyId The study ID
     * @return List of derived field mappings
     */
    @Query("SELECT m FROM StudyCdashMappingEntity m WHERE m.studyId = :studyId " +
           "AND m.dataOrigin = 'DERIVED' AND m.isActive = true")
    List<StudyCdashMappingEntity> findDerivedFields(@Param("studyId") Long studyId);

    /**
     * Find all fields with controlled terminology
     * 
     * @param studyId The study ID
     * @return List of fields using CDISC controlled terminology
     */
    @Query("SELECT m FROM StudyCdashMappingEntity m WHERE m.studyId = :studyId " +
           "AND m.cdiscTerminologyCode IS NOT NULL AND m.isActive = true")
    List<StudyCdashMappingEntity> findFieldsWithControlledTerminology(@Param("studyId") Long studyId);

    /**
     * Find all fields with unit conversions
     * 
     * @param studyId The study ID
     * @return List of fields requiring unit conversion
     */
    @Query("SELECT m FROM StudyCdashMappingEntity m WHERE m.studyId = :studyId " +
           "AND m.unitConversionRule IS NOT NULL AND m.isActive = true")
    List<StudyCdashMappingEntity> findFieldsWithUnitConversion(@Param("studyId") Long studyId);

    /**
     * Get distinct CDASH domains for a study
     * 
     * @param studyId The study ID
     * @return List of distinct CDASH domains
     */
    @Query("SELECT DISTINCT m.cdashDomain FROM StudyCdashMappingEntity m " +
           "WHERE m.studyId = :studyId AND m.isActive = true " +
           "ORDER BY m.cdashDomain")
    List<String> findDistinctCdashDomains(@Param("studyId") Long studyId);

    /**
     * Get distinct SDTM domains for a study
     * 
     * @param studyId The study ID
     * @return List of distinct SDTM domains
     */
    @Query("SELECT DISTINCT m.sdtmDomain FROM StudyCdashMappingEntity m " +
           "WHERE m.studyId = :studyId AND m.isActive = true " +
           "ORDER BY m.sdtmDomain")
    List<String> findDistinctSdtmDomains(@Param("studyId") Long studyId);

    /**
     * Get summary statistics for CDASH mappings
     * 
     * @param studyId The study ID
     * @return Array of statistics: [totalMappings, collectedCount, derivedCount, 
     *         controlledTermCount, unitConversionCount]
     */
    @Query("SELECT COUNT(m) as totalMappings, " +
           "SUM(CASE WHEN m.dataOrigin = 'COLLECTED' THEN 1 ELSE 0 END) as collectedCount, " +
           "SUM(CASE WHEN m.dataOrigin = 'DERIVED' THEN 1 ELSE 0 END) as derivedCount, " +
           "SUM(CASE WHEN m.cdiscTerminologyCode IS NOT NULL THEN 1 ELSE 0 END) as controlledTermCount, " +
           "SUM(CASE WHEN m.unitConversionRule IS NOT NULL THEN 1 ELSE 0 END) as unitConversionCount " +
           "FROM StudyCdashMappingEntity m WHERE m.studyId = :studyId AND m.isActive = true")
    Object[] getMappingSummary(@Param("studyId") Long studyId);

    /**
     * Count total mappings for a study
     * 
     * @param studyId The study ID
     * @return Number of CDASH mappings
     */
    long countByStudyId(Long studyId);

    /**
     * Count mappings for a specific form
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return Number of CDASH mappings for the form
     */
    long countByStudyIdAndFormId(Long studyId, Long formId);

    /**
     * Check if a mapping exists for a specific field
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param fieldName The field name
     * @return True if mapping exists
     */
    boolean existsByStudyIdAndFormIdAndFieldName(Long studyId, Long formId, String fieldName);

    /**
     * Delete all mappings for a study
     * 
     * @param studyId The study ID
     * @return Number of deleted mappings
     */
    long deleteByStudyId(Long studyId);

    /**
     * Delete all mappings for a specific form
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @return Number of deleted mappings
     */
    long deleteByStudyIdAndFormId(Long studyId, Long formId);
}
