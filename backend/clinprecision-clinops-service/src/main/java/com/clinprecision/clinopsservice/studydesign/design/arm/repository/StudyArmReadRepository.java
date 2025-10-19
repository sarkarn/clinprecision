package com.clinprecision.clinopsservice.studydesign.design.arm.repository;

import com.clinprecision.clinopsservice.studydesign.design.arm.entity.StudyArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for querying StudyArm read models
 * Used by projections and query services
 */
@Repository
public interface StudyArmReadRepository extends JpaRepository<StudyArmEntity, Long> {

    /**
     * Find arm by aggregate UUID and arm UUID
     */
    Optional<StudyArmEntity> findByAggregateUuidAndArmUuid(UUID aggregateUuid, UUID armUuid);

    /**
     * Find all arms for a study design (excluding deleted)
     */
    @Query("SELECT a FROM StudyArmEntity a WHERE a.aggregateUuid = :aggregateUuid AND (a.isDeleted = false OR a.isDeleted IS NULL) ORDER BY a.sequence")
    List<StudyArmEntity> findAllByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Find all arms including deleted ones
     */
    @Query("SELECT a FROM StudyArmEntity a WHERE a.aggregateUuid = :aggregateUuid ORDER BY a.sequence")
    List<StudyArmEntity> findAllByAggregateUuidIncludingDeleted(@Param("aggregateUuid") UUID aggregateUuid);

    /**
     * Find arms by study ID (legacy)
     */
    @Query("SELECT a FROM StudyArmEntity a WHERE a.studyId = :studyId AND (a.isDeleted = false OR a.isDeleted IS NULL) ORDER BY a.sequence")
    List<StudyArmEntity> findAllByStudyId(@Param("studyId") Long studyId);

    /**
     * Check if arm with name exists in study design
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM StudyArmEntity a WHERE a.aggregateUuid = :aggregateUuid AND LOWER(a.name) = LOWER(:name) AND (a.isDeleted = false OR a.isDeleted IS NULL)")
    boolean existsByAggregateUuidAndName(@Param("aggregateUuid") UUID aggregateUuid, @Param("name") String name);

    /**
     * Count active arms in study design
     */
    @Query("SELECT COUNT(a) FROM StudyArmEntity a WHERE a.aggregateUuid = :aggregateUuid AND (a.isDeleted = false OR a.isDeleted IS NULL)")
    long countByAggregateUuid(@Param("aggregateUuid") UUID aggregateUuid);
}
