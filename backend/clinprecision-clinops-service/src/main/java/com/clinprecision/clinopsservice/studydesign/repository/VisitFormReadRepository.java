package com.clinprecision.clinopsservice.studydesign.repository;

import com.clinprecision.common.entity.clinops.VisitFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for querying VisitForm (FormAssignment) read models
 * Used by projections and query services
 */
@Repository
public interface VisitFormReadRepository extends JpaRepository<VisitFormEntity, Long> {

    /**
     * Find form assignment by aggregate UUID and assignment UUID
     */
    Optional<VisitFormEntity> findByAggregateUuidAndAssignmentUuid(UUID aggregateUuid, UUID assignmentUuid);

    /**
     * Find all form assignments for a study design (excluding deleted)
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findAllByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Find all form assignments for a specific visit
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findByVisitUuid(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid);

    /**
     * Find all visits where a form is assigned
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.formUuid = :formUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.visitUuid, vf.displayOrder")
    List<VisitFormEntity> findByFormUuid(@Param("aggregateUuid") UUID aggregateUuid, @Param("formUuid") UUID formUuid);

    /**
     * Find required form assignments for a visit
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND vf.isRequired = true AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.displayOrder")
    List<VisitFormEntity> findRequiredFormsByVisit(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid);

    /**
     * Find conditional form assignments
     */
    @Query("SELECT vf FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.isConditional = true AND (vf.isDeleted = false OR vf.isDeleted IS NULL) ORDER BY vf.visitUuid, vf.displayOrder")
    List<VisitFormEntity> findConditionalForms(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Check if form is already assigned to visit
     */
    @Query("SELECT CASE WHEN COUNT(vf) > 0 THEN true ELSE false END FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND vf.formUuid = :formUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL)")
    boolean existsByVisitAndForm(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid, @Param("formUuid") UUID formUuid);

    /**
     * Check if display order is used for visit
     */
    @Query("SELECT CASE WHEN COUNT(vf) > 0 THEN true ELSE false END FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND vf.displayOrder = :displayOrder AND (vf.isDeleted = false OR vf.isDeleted IS NULL)")
    boolean existsByVisitAndDisplayOrder(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid, @Param("displayOrder") Integer displayOrder);

    /**
     * Count form assignments for a visit
     */
    @Query("SELECT COUNT(vf) FROM VisitFormEntity vf WHERE vf.aggregateUuid = :aggregateUuid AND vf.visitUuid = :visitUuid AND (vf.isDeleted = false OR vf.isDeleted IS NULL)")
    long countByVisitUuid(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitUuid") UUID visitUuid);
}
