package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
}