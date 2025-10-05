package com.clinprecision.clinopsservice.protocolversion.repository;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.protocolversion.entity.ProtocolVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Protocol Version Read Repository - Query operations for read model
 * 
 * Provides optimized queries for the Protocol Version read model.
 * Used by ProtocolVersionQueryService to serve queries.
 */
@Repository
public interface ProtocolVersionReadRepository extends JpaRepository<ProtocolVersionEntity, Long> {

    /**
     * Find version by aggregate UUID (event sourcing identifier)
     */
    Optional<ProtocolVersionEntity> findByAggregateUuid(UUID aggregateUuid);

    /**
     * Find all versions for a study
     */
    List<ProtocolVersionEntity> findByStudyAggregateUuid(UUID studyAggregateUuid);

    /**
     * Find versions by status
     */
    List<ProtocolVersionEntity> findByStatus(VersionStatus status);

    /**
     * Find versions for a study by status
     */
    List<ProtocolVersionEntity> findByStudyAggregateUuidAndStatus(
        UUID studyAggregateUuid, 
        VersionStatus status
    );

    /**
     * Find active version for a study
     * CRITICAL: Only one version should be active per study
     */
    @Query("SELECT v FROM ProtocolVersionEntity v WHERE v.studyAggregateUuid = :studyUuid AND v.status = 'ACTIVE'")
    Optional<ProtocolVersionEntity> findActiveVersionByStudyUuid(@Param("studyUuid") UUID studyUuid);

    /**
     * Find version by version number for a study
     */
    Optional<ProtocolVersionEntity> findByStudyAggregateUuidAndVersionNumber(
        UUID studyAggregateUuid, 
        String versionNumber
    );

    /**
     * Check if a version number exists for a study
     */
    boolean existsByStudyAggregateUuidAndVersionNumber(
        UUID studyAggregateUuid, 
        String versionNumber
    );

    /**
     * Find versions requiring regulatory approval
     */
    @Query("SELECT v FROM ProtocolVersionEntity v WHERE v.requiresRegulatoryApproval = true AND v.status IN ('SUBMITTED', 'AMENDMENT_REVIEW')")
    List<ProtocolVersionEntity> findVersionsAwaitingRegulatoryApproval();

    /**
     * Find all versions for a study ordered by creation date
     */
    List<ProtocolVersionEntity> findByStudyAggregateUuidOrderByCreatedAtDesc(UUID studyAggregateUuid);

    /**
     * Count versions by status for a study
     */
    long countByStudyAggregateUuidAndStatus(UUID studyAggregateUuid, VersionStatus status);

    // ============================================================================
    // LEGACY COMPATIBILITY METHODS (Bridge until Study module migrated to DDD)
    // ============================================================================
    // NOTE: These methods query by Long studyId for backward compatibility
    // with legacy StudyEntity. Once Study module is migrated to DDD with UUIDs,
    // use the UUID-based methods above instead.
    // TODO: Remove these after Study module is migrated to DDD/Event Sourcing
    // ============================================================================

    /**
     * Find all versions for a study by legacy Long ID, ordered by creation date
     * @deprecated Use findByStudyAggregateUuidOrderByCreatedAtDesc once Study has UUIDs
     */
    @Deprecated
    List<ProtocolVersionEntity> findByStudyIdOrderByCreatedAtDesc(Long studyId);

    /**
     * Find all versions for a study by legacy Long ID, ordered by version number
     * @deprecated Use findByStudyAggregateUuidOrderByCreatedAtDesc once Study has UUIDs
     */
    @Deprecated
    List<ProtocolVersionEntity> findByStudyIdOrderByVersionNumberDesc(Long studyId);

    /**
     * Find active version by legacy study ID
     * @deprecated Use findActiveVersionByStudyUuid once Study has UUIDs
     */
    @Deprecated
    @Query("SELECT v FROM ProtocolVersionEntity v WHERE v.studyId = :studyId AND v.status = 'ACTIVE'")
    Optional<ProtocolVersionEntity> findActiveVersionByStudyId(@Param("studyId") Long studyId);

    /**
     * Find versions by legacy study ID and status
     * @deprecated Use findByStudyAggregateUuidAndStatus once Study has UUIDs
     */
    @Deprecated
    List<ProtocolVersionEntity> findByStudyIdAndStatus(Long studyId, VersionStatus status);
}



