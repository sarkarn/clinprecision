package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for VisitDefinition entity operations
 */
@Repository
public interface VisitDefinitionRepository extends JpaRepository<VisitDefinitionEntity, Long> {

    /**
     * Find all visits for a specific study, ordered by sequence number
     */
    List<VisitDefinitionEntity> findByStudyIdOrderBySequenceNumberAsc(Long studyId);

    /**
     * Find all visits for a specific study and arm
     */
    List<VisitDefinitionEntity> findByStudyIdAndArmIdOrderBySequenceNumberAsc(Long studyId, Long armId);

    /**
     * Find visits for a study with no arm (common visits)
     */
    List<VisitDefinitionEntity> findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(Long studyId);

    /**
     * Find visit by study ID and visit name (case-insensitive)
     */
    Optional<VisitDefinitionEntity> findByStudyIdAndNameIgnoreCase(Long studyId, String name);

    /**
     * Find visits by type for a study
     */
    List<VisitDefinitionEntity> findByStudyIdAndVisitTypeOrderByTimepointAsc(
            Long studyId, VisitDefinitionEntity.VisitType visitType);

    /**
     * Find visits within a timepoint range for a study
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.studyId = :studyId " +
           "AND v.timepoint BETWEEN :startTimepoint AND :endTimepoint " +
           "ORDER BY v.timepoint ASC")
    List<VisitDefinitionEntity> findByStudyIdAndTimepointRange(
            @Param("studyId") Long studyId,
            @Param("startTimepoint") Integer startTimepoint,
            @Param("endTimepoint") Integer endTimepoint);

    /**
     * Get the maximum sequence number for a study (for auto-incrementing)
     */
    @Query("SELECT COALESCE(MAX(v.sequenceNumber), 0) FROM VisitDefinitionEntity v WHERE v.studyId = :studyId")
    Integer getMaxSequenceNumberByStudyId(@Param("studyId") Long studyId);

    /**
     * Check if visit name already exists in study (for validation)
     */
    boolean existsByStudyIdAndNameIgnoreCase(Long studyId, String name);

    /**
     * Check if visit name exists in study excluding specific visit ID (for updates)
     */
    @Query("SELECT COUNT(v) > 0 FROM VisitDefinitionEntity v WHERE v.studyId = :studyId " +
           "AND LOWER(v.name) = LOWER(:name) AND v.id != :excludeId")
    boolean existsByStudyIdAndNameIgnoreCaseExcludingId(
            @Param("studyId") Long studyId,
            @Param("name") String name,
            @Param("excludeId") Long excludeId);

    /**
     * Count total visits for a study
     */
    long countByStudyId(Long studyId);

    /**
     * Delete all visits for a study (cascade cleanup)
     */
    void deleteByStudyId(Long studyId);

    /**
     * Find visits that have forms assigned
     */
    @Query("SELECT DISTINCT v FROM VisitDefinitionEntity v " +
           "JOIN v.visitForms vf WHERE v.studyId = :studyId " +
           "ORDER BY v.sequenceNumber ASC")
    List<VisitDefinitionEntity> findVisitsWithFormsByStudyId(@Param("studyId") Long studyId);

    /**
     * Find visits without any forms assigned
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.studyId = :studyId " +
           "AND NOT EXISTS (SELECT 1 FROM VisitFormEntity vf WHERE vf.visitDefinition = v) " +
           "ORDER BY v.sequenceNumber ASC")
    List<VisitDefinitionEntity> findVisitsWithoutFormsByStudyId(@Param("studyId") Long studyId);
}