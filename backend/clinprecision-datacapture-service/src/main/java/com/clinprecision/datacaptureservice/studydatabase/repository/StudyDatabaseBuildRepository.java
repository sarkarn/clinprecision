package com.clinprecision.datacaptureservice.studydatabase.repository;

import com.clinprecision.datacaptureservice.studydatabase.entity.StudyDatabaseBuildEntity;
import com.clinprecision.datacaptureservice.studydatabase.entity.StudyDatabaseBuildStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyDatabaseBuildEntity
 * Follows established ClinPrecision patterns for CQRS read model access
 */
@Repository
public interface StudyDatabaseBuildRepository extends JpaRepository<StudyDatabaseBuildEntity, Long> {

    /**
     * Find build by aggregate UUID (used by Axon projection handlers)
     * This is the primary lookup method for event handlers
     */
    Optional<StudyDatabaseBuildEntity> findByAggregateUuid(String aggregateUuid);

    /**
     * Find build by build request ID (human-readable identifier)
     */
    Optional<StudyDatabaseBuildEntity> findByBuildRequestId(String buildRequestId);

    /**
     * Find all builds for a specific study
     */
    List<StudyDatabaseBuildEntity> findByStudyId(Long studyId);

    /**
     * Find all builds for a study ordered by start time (most recent first)
     */
    List<StudyDatabaseBuildEntity> findByStudyIdOrderByBuildStartTimeDesc(Long studyId);

    /**
     * Find the most recent build for a study
     */
    Optional<StudyDatabaseBuildEntity> findTopByStudyIdOrderByBuildStartTimeDesc(Long studyId);

    /**
     * Find builds by status
     */
    List<StudyDatabaseBuildEntity> findByBuildStatus(StudyDatabaseBuildStatus buildStatus);

    /**
     * Find builds by study and status
     */
    List<StudyDatabaseBuildEntity> findByStudyIdAndBuildStatus(Long studyId, StudyDatabaseBuildStatus buildStatus);

    /**
     * Find all in-progress builds (for monitoring)
     */
    List<StudyDatabaseBuildEntity> findByBuildStatusOrderByBuildStartTimeDesc(StudyDatabaseBuildStatus buildStatus);

    /**
     * Find builds requested by a specific user
     */
    List<StudyDatabaseBuildEntity> findByRequestedBy(Long requestedBy);

    /**
     * Find builds within a date range
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.buildStartTime >= :startDate AND b.buildStartTime <= :endDate")
    List<StudyDatabaseBuildEntity> findByBuildStartTimeBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count builds by study
     */
    long countByStudyId(Long studyId);

    /**
     * Count builds by study and status
     */
    long countByStudyIdAndBuildStatus(Long studyId, StudyDatabaseBuildStatus buildStatus);

    /**
     * Check if a build request ID already exists (for uniqueness validation)
     */
    boolean existsByBuildRequestId(String buildRequestId);

    /**
     * Check if study has an in-progress build (prevent concurrent builds)
     */
    boolean existsByStudyIdAndBuildStatus(Long studyId, StudyDatabaseBuildStatus buildStatus);

    /**
     * Find completed builds for a study
     */
    List<StudyDatabaseBuildEntity> findByStudyIdAndBuildStatusOrderByBuildEndTimeDesc(
            Long studyId, 
            StudyDatabaseBuildStatus buildStatus);

    /**
     * Find failed builds that need attention
     */
    List<StudyDatabaseBuildEntity> findByBuildStatusAndBuildStartTimeAfterOrderByBuildStartTimeDesc(
            StudyDatabaseBuildStatus buildStatus,
            LocalDateTime afterDate);

    /**
     * Find builds that took longer than expected (performance monitoring)
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.buildStatus = :status " +
           "AND TIMESTAMPDIFF(SECOND, b.buildStartTime, b.buildEndTime) > :durationSeconds")
    List<StudyDatabaseBuildEntity> findLongRunningBuilds(
            @Param("status") StudyDatabaseBuildStatus status,
            @Param("durationSeconds") long durationSeconds);

    /**
     * Get build statistics by study
     */
    @Query("SELECT b.buildStatus as status, COUNT(b) as count " +
           "FROM StudyDatabaseBuildEntity b WHERE b.studyId = :studyId GROUP BY b.buildStatus")
    List<Object[]> getBuildStatisticsByStudy(@Param("studyId") Long studyId);

    /**
     * Find recent builds (last N days)
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.buildStartTime >= :since ORDER BY b.buildStartTime DESC")
    List<StudyDatabaseBuildEntity> findRecentBuilds(@Param("since") LocalDateTime since);

    /**
     * Find builds with validation warnings
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.validationStatus = 'WARNING' ORDER BY b.validatedAt DESC")
    List<StudyDatabaseBuildEntity> findBuildsWithValidationWarnings();

    /**
     * Find builds that were cancelled
     */
    List<StudyDatabaseBuildEntity> findByCancelledByIsNotNullOrderByCancelledAtDesc();
}
