package com.clinprecision.clinopsservice.studydesign.repository;

import com.clinprecision.common.entity.clinops.VisitDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for querying VisitDefinition read models
 * Used by projections and query services
 */
@Repository
public interface VisitDefinitionReadRepository extends JpaRepository<VisitDefinitionEntity, Long> {

    /**
     * Find visit by aggregate UUID and visit UUID
     */
    Optional<VisitDefinitionEntity> findByAggregateUuidAndVisitUuid(UUID aggregateUuid, UUID visitUuid);

    /**
     * Find all visits for a study design (excluding deleted)
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.sequenceNumber")
    List<VisitDefinitionEntity> findAllByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Find all general (non-arm-specific) visits
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND v.armUuid IS NULL AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.sequenceNumber")
    List<VisitDefinitionEntity> findGeneralVisitsByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Find arm-specific visits
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND v.armUuid = :armUuid AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.sequenceNumber")
    List<VisitDefinitionEntity> findArmSpecificVisits(@Param("aggregateUuid") UUID aggregateUuid, @Param("armUuid") UUID armUuid);

    /**
     * Find visits by timepoint range
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND v.timepoint >= :minTimepoint AND v.timepoint <= :maxTimepoint AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.timepoint, v.sequenceNumber")
    List<VisitDefinitionEntity> findByTimepointRange(@Param("aggregateUuid") UUID aggregateUuid, @Param("minTimepoint") Integer minTimepoint, @Param("maxTimepoint") Integer maxTimepoint);

    /**
     * Find visits by type
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND v.visitType = :visitType AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.sequenceNumber")
    List<VisitDefinitionEntity> findByVisitType(@Param("aggregateUuid") UUID aggregateUuid, @Param("visitType") VisitDefinitionEntity.VisitType visitType);

    /**
     * Find visits by study ID (legacy)
     */
    @Query("SELECT v FROM VisitDefinitionEntity v WHERE v.studyId = :studyId AND (v.isDeleted = false OR v.isDeleted IS NULL) ORDER BY v.sequenceNumber")
    List<VisitDefinitionEntity> findAllByStudyId(@Param("studyId") Long studyId);

    /**
     * Check if visit with name exists in scope
     */
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND v.armUuid = :armUuid AND LOWER(v.name) = LOWER(:name) AND (v.isDeleted = false OR v.isDeleted IS NULL)")
    boolean existsByAggregateUuidAndArmUuidAndName(@Param("aggregateUuid") UUID aggregateUuid, @Param("armUuid") UUID armUuid, @Param("name") String name);

    /**
     * Count visits in study design
     */
    @Query("SELECT COUNT(v) FROM VisitDefinitionEntity v WHERE v.aggregateUuid = :aggregateUuid AND (v.isDeleted = false OR v.isDeleted IS NULL)")
    long countByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);
}
