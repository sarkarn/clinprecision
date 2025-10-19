package com.clinprecision.clinopsservice.formdata.repository;

import com.clinprecision.clinopsservice.formdata.entity.StudyFormDataAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for StudyFormDataAuditEntity
 * 
 * Provides data access methods for form data audit trail.
 * Supports queries for:
 * - Complete change history for a form
 * - User activity tracking
 * - Compliance and regulatory reporting
 * - Audit trail investigation
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - All queries support audit trail requirements
 * - Chronological ordering preserved
 * - No delete operations (audit records are immutable)
 * 
 * Used by:
 * - FormDataProjector (to create audit records)
 * - Audit reporting services
 * - Regulatory compliance tools
 * - Data quality monitoring
 */
@Repository
public interface StudyFormDataAuditRepository extends JpaRepository<StudyFormDataAuditEntity, Long> {

    /**
     * Find all audit records for a specific form submission
     * Use case: Complete change history for a form
     * Returns: All changes ordered chronologically (oldest first)
     */
    List<StudyFormDataAuditEntity> findByRecordIdOrderByChangedAtAsc(Long recordId);

    /**
     * Find audit records by aggregate UUID
     * Use case: Event sourcing correlation, track all changes to an aggregate
     */
    List<StudyFormDataAuditEntity> findByAggregateUuidOrderByChangedAtAsc(String aggregateUuid);

    /**
     * Find audit records for a study
     * Use case: Study-wide audit report
     */
    List<StudyFormDataAuditEntity> findByStudyIdOrderByChangedAtDesc(Long studyId);

    /**
     * Find audit records by action type
     * Use case: "Show me all form submissions" (action=INSERT) or "Show me all locks" (action=LOCK)
     */
    List<StudyFormDataAuditEntity> findByActionOrderByChangedAtDesc(String action);

    /**
     * Find audit records by user
     * Use case: User activity report, accountability tracking
     */
    List<StudyFormDataAuditEntity> findByChangedByOrderByChangedAtDesc(Long changedBy);

    /**
     * Find audit records within date range
     * Use case: Audit report for specific time period
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.changedAt >= :startDate AND a.changedAt <= :endDate ORDER BY a.changedAt DESC")
    List<StudyFormDataAuditEntity> findByChangedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Find audit records by study and date range
     * Use case: Study-specific audit report for regulatory inspection
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.studyId = :studyId " +
           "AND a.changedAt >= :startDate AND a.changedAt <= :endDate ORDER BY a.changedAt DESC")
    List<StudyFormDataAuditEntity> findByStudyIdAndChangedAtBetween(
        @Param("studyId") Long studyId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Find most recent audit record for a form
     * Use case: Get last modification details
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.recordId = :recordId ORDER BY a.changedAt DESC LIMIT 1")
    StudyFormDataAuditEntity findMostRecentByRecordId(@Param("recordId") Long recordId);

    /**
     * Find audit records by action and study
     * Use case: "Show me all form submissions for this study"
     */
    List<StudyFormDataAuditEntity> findByStudyIdAndActionOrderByChangedAtDesc(Long studyId, String action);

    /**
     * Find audit records with reasons
     * Use case: Track all changes that required justification
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.reason IS NOT NULL AND a.reason <> '' ORDER BY a.changedAt DESC")
    List<StudyFormDataAuditEntity> findAllWithReason();

    /**
     * Count audit records by action type for a study
     * Use case: Audit metrics dashboard
     */
    @Query("SELECT a.action, COUNT(a) FROM StudyFormDataAuditEntity a WHERE a.studyId = :studyId GROUP BY a.action")
    List<Object[]> countByActionForStudy(@Param("studyId") Long studyId);

    /**
     * Count total audit records for a form
     * Use case: Form change frequency analysis
     */
    Long countByRecordId(Long recordId);

    /**
     * Count audit records by user
     * Use case: User activity metrics
     */
    Long countByChangedBy(Long changedBy);

    /**
     * Find recent audit activity
     * Use case: Dashboard - recent changes
     */
    @Query(value = "SELECT * FROM study_form_data_audit ORDER BY changed_at DESC LIMIT :limit", nativeQuery = true)
    List<StudyFormDataAuditEntity> findRecentAuditActivity(@Param("limit") int limit);

    /**
     * Find UNLOCK actions (emergency use)
     * Use case: Track database unlock events (should be rare)
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.action = 'UNLOCK' ORDER BY a.changedAt DESC")
    List<StudyFormDataAuditEntity> findUnlockEvents();

    /**
     * Find audit records by event ID
     * Use case: Correlation with event store
     */
    List<StudyFormDataAuditEntity> findByEventId(String eventId);

    /**
     * Check if event ID already processed (idempotency)
     */
    boolean existsByEventId(String eventId);

    /**
     * Find significant changes (multiple fields modified)
     * Use case: Flag potentially suspicious changes for review
     */
    @Query(value = "SELECT * FROM study_form_data_audit WHERE action = 'UPDATE' " +
                   "AND jsonb_array_length(jsonb_object_keys(new_data)) > :threshold " +
                   "ORDER BY changed_at DESC", nativeQuery = true)
    List<StudyFormDataAuditEntity> findSignificantChanges(@Param("threshold") int threshold);

    /**
     * Find changes by specific user within date range
     * Use case: User-specific audit trail
     */
    @Query("SELECT a FROM StudyFormDataAuditEntity a WHERE a.changedBy = :userId " +
           "AND a.changedAt >= :startDate AND a.changedAt <= :endDate ORDER BY a.changedAt DESC")
    List<StudyFormDataAuditEntity> findByUserAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
}
