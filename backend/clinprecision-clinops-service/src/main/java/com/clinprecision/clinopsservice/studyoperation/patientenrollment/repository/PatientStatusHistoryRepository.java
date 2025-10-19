package com.clinprecision.clinopsservice.studyoperation.patientenrollment.repository;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity.PatientStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PatientStatusHistoryEntity
 * 
 * <p>Provides data access methods for patient status history audit trail.
 * Follows established ClinPrecision patterns with custom queries optimized
 * for common audit and reporting use cases.</p>
 * 
 * <p>Key Query Patterns:</p>
 * <ul>
 *   <li>Find by patient (all history for a patient)</li>
 *   <li>Find by event ID (idempotency check)</li>
 *   <li>Find by status (all patients currently in a status)</li>
 *   <li>Find by date range (audit reports)</li>
 *   <li>Find by user (who made changes)</li>
 * </ul>
 * 
 * @see PatientStatusHistoryEntity
 * @see PatientStatus
 */
@Repository
public interface PatientStatusHistoryRepository extends JpaRepository<PatientStatusHistoryEntity, Long> {

    // ==================== Lookup by Patient ====================

    /**
     * Find all status changes for a patient, ordered by most recent first
     * Use case: Display patient's complete status history in UI
     * 
     * @param patientId the patient's database ID
     * @return list of status changes ordered chronologically (newest first)
     */
    List<PatientStatusHistoryEntity> findByPatientIdOrderByChangedAtDesc(Long patientId);

    /**
     * Find all status changes for a patient, ordered chronologically
     * Use case: Analyze status transition patterns
     * 
     * @param patientId the patient's database ID
     * @return list of status changes ordered chronologically (oldest first)
     */
    List<PatientStatusHistoryEntity> findByPatientIdOrderByChangedAtAsc(Long patientId);

    /**
     * Find all status changes for a patient by aggregate UUID
     * Use case: Event sourcing projectors need to query by aggregate ID
     * 
     * @param aggregateUuid the patient's aggregate UUID from event store
     * @return list of status changes ordered chronologically
     */
    List<PatientStatusHistoryEntity> findByAggregateUuidOrderByChangedAtDesc(String aggregateUuid);

    /**
     * Get the most recent status change for a patient
     * Use case: Quick lookup of current status details
     * 
     * @param patientId the patient's database ID
     * @return optional containing the most recent status change
     */
    @Query("SELECT psh FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.patientId = :patientId " +
           "ORDER BY psh.changedAt DESC " +
           "LIMIT 1")
    Optional<PatientStatusHistoryEntity> findMostRecentByPatientId(@Param("patientId") Long patientId);

    /**
     * Count total status changes for a patient
     * Use case: Identify patients with unusual number of status changes
     * 
     * @param patientId the patient's database ID
     * @return count of status changes
     */
    long countByPatientId(Long patientId);

    // ==================== Event Sourcing / Idempotency ====================

    /**
     * Find status change by event ID (for idempotency)
     * Use case: Prevent duplicate records when event is replayed
     * 
     * @param eventId unique event identifier from event store
     * @return optional containing the history record if event already processed
     */
    Optional<PatientStatusHistoryEntity> findByEventId(String eventId);

    /**
     * Check if event has already been processed
     * Use case: Fast idempotency check before creating new record
     * 
     * @param eventId unique event identifier from event store
     * @return true if event already processed
     */
    boolean existsByEventId(String eventId);

    // ==================== Status Queries ====================

    /**
     * Find all patients who transitioned to a specific status
     * Use case: Report all patients who became ACTIVE, WITHDRAWN, etc.
     * 
     * @param newStatus the status to filter by
     * @return list of status changes ordered by most recent first
     */
    List<PatientStatusHistoryEntity> findByNewStatusOrderByChangedAtDesc(PatientStatus newStatus);

    /**
     * Find all status changes from a specific previous status
     * Use case: Analyze transition patterns (e.g., how many went from SCREENING to ENROLLED)
     * 
     * @param previousStatus the previous status to filter by
     * @return list of status changes
     */
    List<PatientStatusHistoryEntity> findByPreviousStatus(PatientStatus previousStatus);

    /**
     * Find all status transitions of a specific type
     * Use case: Track specific transitions (e.g., all ENROLLED → ACTIVE transitions)
     * 
     * @param previousStatus the previous status
     * @param newStatus the new status
     * @return list of matching status changes ordered by date
     */
    List<PatientStatusHistoryEntity> findByPreviousStatusAndNewStatusOrderByChangedAtDesc(
        PatientStatus previousStatus,
        PatientStatus newStatus
    );

    /**
     * Count status changes by new status
     * Use case: Dashboard metrics (e.g., "25 patients enrolled today")
     * 
     * @param newStatus the status to count
     * @return count of transitions to this status
     */
    long countByNewStatus(PatientStatus newStatus);

    // ==================== Date Range Queries ====================

    /**
     * Find all status changes within a date range
     * Use case: Monthly/quarterly audit reports
     * 
     * @param startDate start of date range (inclusive)
     * @param endDate end of date range (inclusive)
     * @return list of status changes in the date range
     */
    @Query("SELECT psh FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.changedAt >= :startDate AND psh.changedAt <= :endDate " +
           "ORDER BY psh.changedAt DESC")
    List<PatientStatusHistoryEntity> findByChangedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find status changes for a patient within date range
     * Use case: Patient-specific audit reports
     * 
     * @param patientId the patient's database ID
     * @param startDate start of date range
     * @param endDate end of date range
     * @return list of status changes
     */
    @Query("SELECT psh FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.patientId = :patientId " +
           "AND psh.changedAt >= :startDate AND psh.changedAt <= :endDate " +
           "ORDER BY psh.changedAt DESC")
    List<PatientStatusHistoryEntity> findByPatientIdAndChangedAtBetween(
        @Param("patientId") Long patientId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find all changes to a specific status within date range
     * Use case: "How many patients enrolled in Q1 2025?"
     * 
     * @param newStatus the status to filter by
     * @param startDate start of date range
     * @param endDate end of date range
     * @return list of status changes
     */
    @Query("SELECT psh FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.newStatus = :newStatus " +
           "AND psh.changedAt >= :startDate AND psh.changedAt <= :endDate " +
           "ORDER BY psh.changedAt DESC")
    List<PatientStatusHistoryEntity> findByNewStatusAndChangedAtBetween(
        @Param("newStatus") PatientStatus newStatus,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // ==================== User Audit Queries ====================

    /**
     * Find all status changes performed by a specific user
     * Use case: User activity audit
     * 
     * @param changedBy the user identifier (email or username)
     * @return list of status changes by this user
     */
    List<PatientStatusHistoryEntity> findByChangedByOrderByChangedAtDesc(String changedBy);

    /**
     * Count status changes by user
     * Use case: User activity metrics
     * 
     * @param changedBy the user identifier
     * @return count of changes by this user
     */
    long countByChangedBy(String changedBy);

    /**
     * Find status changes by user within date range
     * Use case: User activity report for specific period
     * 
     * @param changedBy the user identifier
     * @param startDate start of date range
     * @param endDate end of date range
     * @return list of status changes
     */
    @Query("SELECT psh FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.changedBy = :changedBy " +
           "AND psh.changedAt >= :startDate AND psh.changedAt <= :endDate " +
           "ORDER BY psh.changedAt DESC")
    List<PatientStatusHistoryEntity> findByChangedByAndChangedAtBetween(
        @Param("changedBy") String changedBy,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // ==================== Enrollment-Specific Queries ====================

    /**
     * Find all status changes for a specific enrollment
     * Use case: Enrollment-specific status history
     * 
     * @param enrollmentId the enrollment's database ID
     * @return list of status changes for this enrollment
     */
    List<PatientStatusHistoryEntity> findByEnrollmentIdOrderByChangedAtDesc(Long enrollmentId);

    /**
     * Find status changes that are NOT enrollment-specific
     * Use case: Global patient status changes only
     * 
     * @return list of global status changes
     */
    List<PatientStatusHistoryEntity> findByEnrollmentIdIsNullOrderByChangedAtDesc();

    // ==================== Advanced Analytics Queries ====================

    /**
     * Get status transition summary (count of each transition type)
     * Use case: Analyze most common status transitions
     * 
     * @return list of objects with previousStatus, newStatus, and count
     */
    @Query("SELECT psh.previousStatus as previousStatus, " +
           "psh.newStatus as newStatus, " +
           "COUNT(psh) as transitionCount " +
           "FROM PatientStatusHistoryEntity psh " +
           "GROUP BY psh.previousStatus, psh.newStatus " +
           "ORDER BY transitionCount DESC")
    List<StatusTransitionSummary> getStatusTransitionSummary();

    /**
     * Get patients with most status changes
     * Use case: Identify patients with unusual status change patterns
     * 
     * @param limit maximum number of results
     * @return list of patient IDs ordered by status change count
     */
    @Query("SELECT psh.patientId " +
           "FROM PatientStatusHistoryEntity psh " +
           "GROUP BY psh.patientId " +
           "ORDER BY COUNT(psh) DESC " +
           "LIMIT :limit")
    List<Long> findPatientsWithMostStatusChanges(@Param("limit") int limit);

    /**
     * Get average days between status changes for a patient
     * Use case: Calculate patient's average progression speed
     * 
     * @param patientId the patient's database ID
     * @return average days between changes, or null if insufficient data
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(DAY, previous.changedAt, current.changedAt)) " +
           "FROM PatientStatusHistoryEntity current " +
           "JOIN PatientStatusHistoryEntity previous " +
           "ON current.patientId = previous.patientId " +
           "WHERE current.patientId = :patientId " +
           "AND current.changedAt > previous.changedAt")
    Double getAverageDaysBetweenChanges(@Param("patientId") Long patientId);

    /**
     * Find patients who reached a status within a timeframe
     * Use case: "Show patients who became ACTIVE within 30 days of enrollment"
     * 
     * @param targetStatus the status to check
     * @param maxDays maximum days allowed
     * @return list of patient IDs meeting criteria
     */
    @Query("SELECT DISTINCT h1.patientId " +
           "FROM PatientStatusHistoryEntity h1 " +
           "JOIN PatientStatusHistoryEntity h2 ON h1.patientId = h2.patientId " +
           "WHERE h1.newStatus = :targetStatus " +
           "AND h2.newStatus = 'ENROLLED' " +
           "AND TIMESTAMPDIFF(DAY, h2.changedAt, h1.changedAt) <= :maxDays " +
           "AND h1.changedAt > h2.changedAt")
    List<Long> findPatientsReachingStatusWithinDays(
        @Param("targetStatus") PatientStatus targetStatus,
        @Param("maxDays") int maxDays
    );

    /**
     * Find patients who have been in a status for more than specified days
     * Use case: "Show patients in SCREENING for more than 14 days"
     * 
     * @param status the status to check
     * @param days number of days threshold
     * @return list of patient IDs
     */
    @Query("SELECT DISTINCT psh.patientId " +
           "FROM PatientStatusHistoryEntity psh " +
           "WHERE psh.newStatus = :status " +
           "AND TIMESTAMPDIFF(DAY, psh.changedAt, CURRENT_TIMESTAMP) > :days " +
           "AND NOT EXISTS (" +
           "  SELECT 1 FROM PatientStatusHistoryEntity later " +
           "  WHERE later.patientId = psh.patientId " +
           "  AND later.changedAt > psh.changedAt" +
           ")")
    List<Long> findPatientsInStatusLongerThan(
        @Param("status") PatientStatus status,
        @Param("days") int days
    );

    // ==================== Projection Interface for Status Transition Summary ====================

    /**
     * Projection interface for status transition aggregation queries
     */
    interface StatusTransitionSummary {
        PatientStatus getPreviousStatus();
        PatientStatus getNewStatus();
        Long getTransitionCount();
    }
}
