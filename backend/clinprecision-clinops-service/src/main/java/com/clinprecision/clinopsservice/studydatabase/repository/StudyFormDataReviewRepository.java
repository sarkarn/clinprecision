package com.clinprecision.clinopsservice.studydatabase.repository;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyFormDataReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for managing data review and SDV records.
 * 
 * Provides queries for managing the review workflow including SDV, medical review,
 * data quality review, and query management.
 */
@Repository
public interface StudyFormDataReviewRepository extends JpaRepository<StudyFormDataReviewEntity, Long> {

    /**
     * Find all reviews for a study
     * 
     * @param studyId The study ID
     * @return List of review entities
     */
    List<StudyFormDataReviewEntity> findByStudyId(Long studyId);

    /**
     * Find all active reviews for a study
     * 
     * @param studyId The study ID
     * @return List of active review entities
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndIsActiveTrue(Long studyId);

    /**
     * Find reviews by status for a study
     * 
     * @param studyId The study ID
     * @param reviewStatus The review status (PENDING, IN_PROGRESS, COMPLETED, etc.)
     * @return List of reviews with the specified status
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndReviewStatus(Long studyId, String reviewStatus);

    /**
     * Find reviews by type for a study
     * 
     * @param studyId The study ID
     * @param reviewType The review type (SDV, MEDICAL_REVIEW, etc.)
     * @return List of reviews of the specified type
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndReviewType(Long studyId, String reviewType);

    /**
     * Find reviews by type and status
     * 
     * @param studyId The study ID
     * @param reviewType The review type
     * @param reviewStatus The review status
     * @return List of reviews matching both criteria
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndReviewTypeAndReviewStatus(
            Long studyId, String reviewType, String reviewStatus);

    /**
     * Find all pending reviews for a study
     * 
     * @param studyId The study ID
     * @return List of pending reviews
     */
    @Query("SELECT r FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.reviewStatus = 'PENDING' AND r.isActive = true " +
           "ORDER BY r.createdAt ASC")
    List<StudyFormDataReviewEntity> findPendingReviews(@Param("studyId") Long studyId);

    /**
     * Find reviews assigned to a specific reviewer
     * 
     * @param reviewerId The reviewer user ID
     * @return List of reviews assigned to the reviewer
     */
    List<StudyFormDataReviewEntity> findByReviewerId(Long reviewerId);

    /**
     * Find pending reviews assigned to a reviewer
     * 
     * @param reviewerId The reviewer user ID
     * @return List of pending reviews for the reviewer
     */
    @Query("SELECT r FROM StudyFormDataReviewEntity r WHERE r.reviewerId = :reviewerId " +
           "AND r.reviewStatus IN ('PENDING', 'IN_PROGRESS') AND r.isActive = true " +
           "ORDER BY r.createdAt ASC")
    List<StudyFormDataReviewEntity> findPendingReviewsByReviewer(@Param("reviewerId") Long reviewerId);

    /**
     * Find reviews for a specific subject
     * 
     * @param studyId The study ID
     * @param subjectId The subject ID
     * @return List of reviews for the subject
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndSubjectId(Long studyId, Long subjectId);

    /**
     * Find reviews for a specific form instance
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param subjectId The subject ID
     * @param visitId The visit ID (can be null)
     * @return List of reviews for the form instance
     */
    @Query("SELECT r FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.formId = :formId AND r.subjectId = :subjectId " +
           "AND (:visitId IS NULL OR r.visitId = :visitId) AND r.isActive = true")
    List<StudyFormDataReviewEntity> findReviewsForFormInstance(
            @Param("studyId") Long studyId,
            @Param("formId") Long formId,
            @Param("subjectId") Long subjectId,
            @Param("visitId") Long visitId);

    /**
     * Find reviews with discrepancies
     * 
     * @param studyId The study ID
     * @return List of reviews where discrepancies were found
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndDiscrepancyFoundTrue(Long studyId);

    /**
     * Find reviews with open queries
     * 
     * @param studyId The study ID
     * @return List of reviews with open queries
     */
    @Query("SELECT r FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.queryStatus = 'OPEN' AND r.isActive = true")
    List<StudyFormDataReviewEntity> findReviewsWithOpenQueries(@Param("studyId") Long studyId);

    /**
     * Find reviews requiring follow-up
     * 
     * @param studyId The study ID
     * @return List of reviews requiring follow-up
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndFollowUpRequiredTrue(Long studyId);

    /**
     * Find overdue follow-ups
     * 
     * @param studyId The study ID
     * @param now Current timestamp
     * @return List of reviews with overdue follow-ups
     */
    @Query("SELECT r FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.followUpRequired = true AND r.followUpDueDate < :now " +
           "AND r.reviewStatus != 'COMPLETED' AND r.isActive = true")
    List<StudyFormDataReviewEntity> findOverdueFollowUps(
            @Param("studyId") Long studyId,
            @Param("now") LocalDateTime now);

    /**
     * Find reviews verified against source documents
     * 
     * @param studyId The study ID
     * @return List of source-verified reviews
     */
    List<StudyFormDataReviewEntity> findByStudyIdAndVerifiedAgainstSourceTrue(Long studyId);

    /**
     * Get review statistics by type and status
     * 
     * @param studyId The study ID
     * @return Array of statistics: [totalReviews, pendingCount, inProgressCount,
     *         completedCount, queryRaisedCount, discrepancyCount]
     */
    @Query("SELECT COUNT(r) as totalReviews, " +
           "SUM(CASE WHEN r.reviewStatus = 'PENDING' THEN 1 ELSE 0 END) as pendingCount, " +
           "SUM(CASE WHEN r.reviewStatus = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount, " +
           "SUM(CASE WHEN r.reviewStatus = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
           "SUM(CASE WHEN r.reviewStatus = 'QUERY_RAISED' THEN 1 ELSE 0 END) as queryRaisedCount, " +
           "SUM(CASE WHEN r.discrepancyFound = true THEN 1 ELSE 0 END) as discrepancyCount " +
           "FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId AND r.isActive = true")
    Object[] getReviewStatistics(@Param("studyId") Long studyId);

    /**
     * Get review statistics by type
     * 
     * @param studyId The study ID
     * @param reviewType The review type
     * @return Array of statistics for the specific review type
     */
    @Query("SELECT COUNT(r) as totalReviews, " +
           "SUM(CASE WHEN r.reviewStatus = 'PENDING' THEN 1 ELSE 0 END) as pendingCount, " +
           "SUM(CASE WHEN r.reviewStatus = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
           "SUM(CASE WHEN r.discrepancyFound = true THEN 1 ELSE 0 END) as discrepancyCount " +
           "FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.reviewType = :reviewType AND r.isActive = true")
    Object[] getReviewStatisticsByType(
            @Param("studyId") Long studyId,
            @Param("reviewType") String reviewType);

    /**
     * Get distinct review types used in a study
     * 
     * @param studyId The study ID
     * @return List of distinct review types
     */
    @Query("SELECT DISTINCT r.reviewType FROM StudyFormDataReviewEntity r " +
           "WHERE r.studyId = :studyId AND r.isActive = true " +
           "ORDER BY r.reviewType")
    List<String> findDistinctReviewTypes(@Param("studyId") Long studyId);

    /**
     * Count total reviews for a study
     * 
     * @param studyId The study ID
     * @return Number of reviews
     */
    long countByStudyId(Long studyId);

    /**
     * Count reviews by status
     * 
     * @param studyId The study ID
     * @param reviewStatus The review status
     * @return Number of reviews with the status
     */
    long countByStudyIdAndReviewStatus(Long studyId, String reviewStatus);

    /**
     * Count pending reviews
     * 
     * @param studyId The study ID
     * @return Number of pending reviews
     */
    @Query("SELECT COUNT(r) FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.reviewStatus = 'PENDING' AND r.isActive = true")
    long countPendingReviews(@Param("studyId") Long studyId);

    /**
     * Count reviews with open queries
     * 
     * @param studyId The study ID
     * @return Number of reviews with open queries
     */
    @Query("SELECT COUNT(r) FROM StudyFormDataReviewEntity r WHERE r.studyId = :studyId " +
           "AND r.queryStatus = 'OPEN' AND r.isActive = true")
    long countOpenQueries(@Param("studyId") Long studyId);

    /**
     * Check if a review exists for a specific form field
     * 
     * @param studyId The study ID
     * @param formId The form ID
     * @param subjectId The subject ID
     * @param fieldName The field name
     * @param reviewType The review type
     * @return True if review exists
     */
    boolean existsByStudyIdAndFormIdAndSubjectIdAndFieldNameAndReviewType(
            Long studyId, Long formId, Long subjectId, String fieldName, String reviewType);

    /**
     * Delete all reviews for a study
     * 
     * @param studyId The study ID
     * @return Number of deleted reviews
     */
    long deleteByStudyId(Long studyId);

    /**
     * Delete reviews for a specific subject
     * 
     * @param studyId The study ID
     * @param subjectId The subject ID
     * @return Number of deleted reviews
     */
    long deleteByStudyIdAndSubjectId(Long studyId, Long subjectId);
}
