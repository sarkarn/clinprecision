package com.clinprecision.clinopsservice.formdata.repository;

import com.clinprecision.clinopsservice.formdata.entity.StudyFormDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyFormDataEntity
 * 
 * Provides data access methods for form submissions.
 * Supports queries for:
 * - Subject-specific forms (all forms for a subject)
 * - Visit-specific forms (forms completed during a visit)
 * - Study-wide queries (all submissions for a study)
 * - Status-based queries (DRAFT, SUBMITTED, LOCKED)
 * 
 * Used by:
 * - FormDataProjector (to persist events)
 * - StudyFormDataService (to retrieve form data)
 * - Reporting services (for analytics and compliance)
 */
@Repository
public interface StudyFormDataRepository extends JpaRepository<StudyFormDataEntity, Long> {

    /**
     * Find form data by aggregate UUID (used by Axon projection handlers)
     * This is the primary lookup for event sourcing integration
     */
    Optional<StudyFormDataEntity> findByAggregateUuid(String aggregateUuid);

    /**
     * Find all forms for a specific subject
     * Use case: Subject profile page showing all completed forms
     * Returns: All forms ordered by creation date (newest first)
     */
    List<StudyFormDataEntity> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);

    /**
     * Find all forms for a specific visit
     * Use case: Visit summary page showing all forms for that visit
     */
    List<StudyFormDataEntity> findByVisitIdOrderByCreatedAtDesc(Long visitId);

    /**
     * Find all forms for a specific study
     * Use case: Study dashboard, compliance reports
     */
    List<StudyFormDataEntity> findByStudyIdOrderByCreatedAtDesc(Long studyId);

    /**
     * Find forms by study and form definition
     * Use case: "Show me all screening assessments for this study"
     */
    List<StudyFormDataEntity> findByStudyIdAndFormIdOrderByCreatedAtDesc(Long studyId, Long formId);

    /**
     * Find specific form for a subject
     * Use case: Check if subject already completed a specific form
     * Returns: Most recent submission if multiple exist
     */
    Optional<StudyFormDataEntity> findFirstBySubjectIdAndFormIdOrderByCreatedAtDesc(
        Long subjectId, Long formId);

    /**
     * Find forms by status
     * Use case: "Show me all draft forms" or "Show me all locked forms"
     */
    List<StudyFormDataEntity> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Find forms by study and status
     * Use case: Study-specific status queries
     */
    List<StudyFormDataEntity> findByStudyIdAndStatusOrderByCreatedAtDesc(Long studyId, String status);

    /**
     * Find screening forms (subjectId is NULL)
     * Use case: Pre-enrollment screening assessments
     */
    @Query("SELECT f FROM StudyFormDataEntity f WHERE f.subjectId IS NULL AND f.studyId = :studyId ORDER BY f.createdAt DESC")
    List<StudyFormDataEntity> findScreeningFormsByStudy(@Param("studyId") Long studyId);

    /**
     * Find visit forms (visitId is NOT NULL)
     * Use case: Visit-based data collection reports
     */
    @Query("SELECT f FROM StudyFormDataEntity f WHERE f.visitId IS NOT NULL AND f.studyId = :studyId ORDER BY f.createdAt DESC")
    List<StudyFormDataEntity> findVisitFormsByStudy(@Param("studyId") Long studyId);

    /**
     * Find locked forms
     * Use case: Database lock verification
     */
    List<StudyFormDataEntity> findByIsLockedTrue();

    /**
     * Find forms by site
     * Use case: Site-specific reports, multi-site studies
     */
    List<StudyFormDataEntity> findBySiteIdOrderByCreatedAtDesc(Long siteId);

    /**
     * Find forms created within date range
     * Use case: Reporting, analytics, audits
     */
    @Query("SELECT f FROM StudyFormDataEntity f WHERE f.createdAt >= :startDate AND f.createdAt <= :endDate ORDER BY f.createdAt DESC")
    List<StudyFormDataEntity> findByCreatedAtBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Find forms by creator
     * Use case: User-specific form list
     */
    List<StudyFormDataEntity> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    /**
     * Find forms with related record ID
     * Use case: Track forms linked to patient status changes, query resolutions
     */
    List<StudyFormDataEntity> findByRelatedRecordId(String relatedRecordId);

    /**
     * Count forms by status for a study
     * Use case: Study dashboard metrics
     */
    @Query("SELECT f.status, COUNT(f) FROM StudyFormDataEntity f WHERE f.studyId = :studyId GROUP BY f.status")
    List<Object[]> countFormsByStatusForStudy(@Param("studyId") Long studyId);

    /**
     * Count total forms for a subject
     * Use case: Subject profile summary
     */
    Long countBySubjectId(Long subjectId);

    /**
     * Check if form exists for subject
     * Use case: Validation - "Has this subject completed screening?"
     */
    boolean existsBySubjectIdAndFormId(Long subjectId, Long formId);

    /**
     * Check if aggregate UUID exists (for idempotency)
     */
    boolean existsByAggregateUuid(String aggregateUuid);

    /**
     * Find most recent form submissions
     * Use case: Dashboard - recent activity
     */
    @Query(value = "SELECT * FROM study_form_data ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<StudyFormDataEntity> findRecentSubmissions(@Param("limit") int limit);

    /**
     * Search form data by JSON field (PostgreSQL specific)
     * Use case: "Find all forms where eligibility_age = true"
     * 
     * Example usage:
     * findByFormDataJsonField(studyId, "eligibility_age", "true")
     */
    @Query(value = "SELECT * FROM study_form_data WHERE study_id = :studyId " +
                   "AND form_data->>:fieldName = :fieldValue", nativeQuery = true)
    List<StudyFormDataEntity> findByFormDataJsonField(
        @Param("studyId") Long studyId,
        @Param("fieldName") String fieldName,
        @Param("fieldValue") String fieldValue);
}
