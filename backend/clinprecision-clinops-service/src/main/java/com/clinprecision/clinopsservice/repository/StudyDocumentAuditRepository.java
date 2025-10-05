package com.clinprecision.clinopsservice.repository;

import com.clinprecision.common.entity.clinops.StudyDocumentAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for StudyDocumentAuditEntity
 * Provides access to document audit trail records
 */
@Repository
public interface StudyDocumentAuditRepository extends JpaRepository<StudyDocumentAuditEntity, Long> {

    /**
     * Find all audit records for a specific document
     * @param documentId The document ID
     * @return List of audit records ordered by performed date descending
     */
    List<StudyDocumentAuditEntity> findByDocumentIdOrderByPerformedAtDesc(Long documentId);

    /**
     * Find audit records by document ID and action type
     * @param documentId The document ID
     * @param actionType The action type
     * @return List of audit records matching criteria
     */
    List<StudyDocumentAuditEntity> findByDocumentIdAndActionTypeOrderByPerformedAtDesc(
        Long documentId, StudyDocumentAuditEntity.ActionType actionType);

    /**
     * Find audit records by action type within a date range
     * @param actionType The action type
     * @param startDate Start date
     * @param endDate End date
     * @return List of audit records matching criteria
     */
    @Query("SELECT a FROM StudyDocumentAuditEntity a WHERE a.actionType = :actionType " +
           "AND a.performedAt BETWEEN :startDate AND :endDate ORDER BY a.performedAt DESC")
    List<StudyDocumentAuditEntity> findByActionTypeAndDateRange(
        @Param("actionType") StudyDocumentAuditEntity.ActionType actionType,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);

    /**
     * Find audit records by user
     * @param performedBy The user who performed the action
     * @return List of audit records for the user
     */
    List<StudyDocumentAuditEntity> findByPerformedByOrderByPerformedAtDesc(String performedBy);

    /**
     * Count audit records for a document
     * @param documentId The document ID
     * @return Number of audit records for the document
     */
    long countByDocumentId(Long documentId);

    /**
     * Delete all audit records for a document
     * @param documentId The document ID
     */
    void deleteByDocumentId(Long documentId);
}
