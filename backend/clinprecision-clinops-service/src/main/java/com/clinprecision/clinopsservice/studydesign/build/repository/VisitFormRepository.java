package com.clinprecision.clinopsservice.studydesign.build.repository;



import com.clinprecision.clinopsservice.studydesign.build.entity.VisitFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for VisitForm association entity operations
 */
@Repository
public interface VisitFormRepository extends JpaRepository<VisitFormEntity, Long> {

    /**
     * Find all forms associated with a specific visit
     */
    List<VisitFormEntity> findByVisitDefinitionIdOrderByDisplayOrderAsc(Long visitDefinitionId);

    /**
     * Find all visits that use a specific form
     */
    List<VisitFormEntity> findByFormDefinitionIdOrderByVisitDefinition_SequenceNumberAsc(Long formDefinitionId);

    /**
     * Find all visit-form associations for a study
     */
    @Query("SELECT vf FROM VisitFormEntity vf " +
           "JOIN vf.visitDefinition v WHERE v.studyId = :studyId " +
           "ORDER BY v.sequenceNumber ASC, vf.displayOrder ASC")
    List<VisitFormEntity> findByStudyIdOrderByVisitAndDisplayOrder(@Param("studyId") Long studyId);

    /**
     * Find a specific visit-form association
     */
    Optional<VisitFormEntity> findByVisitDefinitionIdAndFormDefinitionId(
            Long visitDefinitionId, Long formDefinitionId);

    /**
     * Check if a visit-form association already exists
     */
    boolean existsByVisitDefinitionIdAndFormDefinitionId(Long visitDefinitionId, Long formDefinitionId);

    /**
     * Get the maximum display order for forms in a visit
     */
    @Query("SELECT COALESCE(MAX(vf.displayOrder), 0) FROM VisitFormEntity vf " +
           "WHERE vf.visitDefinition.id = :visitDefinitionId")
    Integer getMaxDisplayOrderByVisitId(@Param("visitDefinitionId") Long visitDefinitionId);

    /**
     * Find required forms for a visit
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndIsRequiredTrueOrderByDisplayOrderAsc(Long visitDefinitionId);

    /**
     * Find optional forms for a visit
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndIsRequiredFalseOrderByDisplayOrderAsc(Long visitDefinitionId);

    /**
     * Find conditional forms for a visit
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndIsConditionalTrueOrderByDisplayOrderAsc(Long visitDefinitionId);

    /**
     * Count forms associated with a visit
     */
    long countByVisitDefinitionId(Long visitDefinitionId);

    /**
     * Count forms associated with a visit in a specific build (CRITICAL for progress calculation)
     * This ensures we count the correct number of forms for the patient's enrolled protocol version
     */
    long countByVisitDefinitionIdAndBuildId(Long visitDefinitionId, Long buildId);

    /**
     * Count visits that use a specific form
     */
    long countByFormDefinitionId(Long formDefinitionId);

    /**
     * Delete all associations for a visit (when visit is deleted)
     */
    void deleteByVisitDefinitionId(Long visitDefinitionId);

    /**
     * Delete all associations for a form (when form is deleted)
     */
    void deleteByFormDefinitionId(Long formDefinitionId);

    /**
     * Delete all visit-form associations for a study (cascade cleanup)
     */
    @Query("DELETE FROM VisitFormEntity vf WHERE vf.visitDefinition.studyId = :studyId")
    void deleteByStudyId(@Param("studyId") Long studyId);

    /**
     * Find forms grouped by visit for a study (for matrix view)
     */
    @Query("SELECT vf FROM VisitFormEntity vf " +
           "JOIN FETCH vf.visitDefinition v " +
           "JOIN FETCH vf.formDefinition f " +
           "WHERE v.studyId = :studyId " +
           "ORDER BY v.sequenceNumber ASC, vf.displayOrder ASC")
    List<VisitFormEntity> findVisitFormMatrixByStudyId(@Param("studyId") Long studyId);

    /**
     * Find visit-form associations with conditional logic
     */
    @Query("SELECT vf FROM VisitFormEntity vf " +
           "WHERE vf.visitDefinition.studyId = :studyId " +
           "AND vf.conditionalLogic IS NOT NULL " +
           "ORDER BY vf.visitDefinition.sequenceNumber ASC, vf.displayOrder ASC")
    List<VisitFormEntity> findConditionalFormsByStudyId(@Param("studyId") Long studyId);

    /**
     * Update display order for forms in a visit (for reordering)
     */
    @Query("UPDATE VisitFormEntity vf SET vf.displayOrder = :newOrder " +
           "WHERE vf.id = :visitFormId")
    void updateDisplayOrder(@Param("visitFormId") Long visitFormId, @Param("newOrder") Integer newOrder);
    
    // ========== UUID-based queries for Phase 4 migration ==========
    
    /**
     * Find visit-form assignment by UUID (for event-sourced model)
     */
    Optional<VisitFormEntity> findByAssignmentUuid(UUID assignmentUuid);
    
    /**
     * Find all form assignments with assignmentUuid populated (migrated records)
     */
    List<VisitFormEntity> findByVisitDefinition_StudyIdAndAssignmentUuidIsNotNull(Long studyId);
    
    /**
     * Check if any form assignments for a visit have been migrated (have assignmentUuid)
     */
    boolean existsByVisitDefinitionIdAndAssignmentUuidIsNotNull(Long visitDefinitionId);
    
    /**
     * Find by aggregate UUID (for querying all assignments in event-sourced aggregate)
     */
    List<VisitFormEntity> findByAggregateUuidOrderByDisplayOrderAsc(UUID aggregateUuid);
    
    /**
     * Find by aggregate UUID and assignment UUID (for projection updates)
     */
    Optional<VisitFormEntity> findByAggregateUuidAndAssignmentUuid(UUID aggregateUuid, UUID assignmentUuid);
    
    /**
     * Find all non-deleted form assignments by aggregate UUID
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findAllByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);
    
    /**
     * Find form assignments by visit UUID (for event-sourced queries)
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findByVisitUuid(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid);
    
    /**
     * Find required forms by visit UUID (for event-sourced queries)
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND vf.isRequired = true AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findRequiredFormsByVisit(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid);

    // ========== Build-based queries (CRITICAL FIX - Oct 16, 2025) ==========
    
    /**
     * Find forms for a visit filtered by build version (CRITICAL for protocol versioning)
     * This ensures patients enrolled under different builds see the correct form configuration
     * 
     * @param visitDefinitionId Visit definition ID
     * @param buildId Study database build ID
     * @return Forms associated with this visit in this specific build version
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndBuildIdOrderByDisplayOrderAsc(
            Long visitDefinitionId, Long buildId);

    /**
     * Find required forms for a visit filtered by build version
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndBuildIdAndIsRequiredTrueOrderByDisplayOrderAsc(
            Long visitDefinitionId, Long buildId);

    /**
     * Find optional forms for a visit filtered by build version
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndBuildIdAndIsRequiredFalseOrderByDisplayOrderAsc(
            Long visitDefinitionId, Long buildId);

    /**
     * Find all form assignments for a specific build
     * Useful for audit and build comparison
     */
    List<VisitFormEntity> findByBuildIdOrderByVisitDefinition_SequenceNumberAscDisplayOrderAsc(Long buildId);

    /**
     * Count form assignments in a build
     */
    long countByBuildId(Long buildId);
}



