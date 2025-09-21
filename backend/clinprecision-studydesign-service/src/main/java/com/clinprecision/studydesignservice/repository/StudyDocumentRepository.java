package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.StudyDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StudyDocumentEntity
 * MVP version for basic document management
 */
@Repository
public interface StudyDocumentRepository extends JpaRepository<StudyDocumentEntity, Long> {

    /**
     * Find all documents for a specific study
     * @param studyId The study ID
     * @return List of documents for the study
     */
    List<StudyDocumentEntity> findByStudyIdOrderByUploadedAtDesc(Long studyId);

    /**
     * Find documents by study ID and status
     * @param studyId The study ID
     * @param status The document status
     * @return List of documents matching criteria
     */
    List<StudyDocumentEntity> findByStudyIdAndStatusOrderByUploadedAtDesc(
        Long studyId, StudyDocumentEntity.DocumentStatus status);

    /**
     * Find documents by study ID and document type
     * @param studyId The study ID
     * @param documentType The document type
     * @return List of documents matching criteria
     */
    List<StudyDocumentEntity> findByStudyIdAndDocumentTypeOrderByUploadedAtDesc(
        Long studyId, String documentType);

    /**
     * Find a specific document by study ID and document ID
     * @param studyId The study ID
     * @param documentId The document ID
     * @return Optional document entity
     */
    Optional<StudyDocumentEntity> findByIdAndStudyId(Long documentId, Long studyId);

    /**
     * Check if a document exists for a study
     * @param documentId The document ID
     * @param studyId The study ID
     * @return true if document exists for the study
     */
    boolean existsByIdAndStudyId(Long documentId, Long studyId);

    /**
     * Count documents for a study
     * @param studyId The study ID
     * @return Number of documents for the study
     */
    long countByStudyId(Long studyId);

    /**
     * Count documents by status for a study
     * @param studyId The study ID
     * @param status The document status
     * @return Number of documents with the specified status
     */
    long countByStudyIdAndStatus(Long studyId, StudyDocumentEntity.DocumentStatus status);

    /**
     * Find documents uploaded by a specific user
     * @param uploadedBy The user ID
     * @return List of documents uploaded by the user
     */
    List<StudyDocumentEntity> findByUploadedByOrderByUploadedAtDesc(Long uploadedBy);

    /**
     * Find current documents for a study (non-archived, non-superseded)
     * @param studyId The study ID
     * @return List of current documents
     */
    @Query("SELECT d FROM StudyDocumentEntity d WHERE d.studyId = :studyId " +
           "AND d.status IN ('CURRENT', 'DRAFT') ORDER BY d.uploadedAt DESC")
    List<StudyDocumentEntity> findCurrentDocumentsByStudyId(@Param("studyId") Long studyId);

    /**
     * Find documents by filename pattern for a study
     * @param studyId The study ID
     * @param filenamePattern The filename pattern (using LIKE)
     * @return List of matching documents
     */
    @Query("SELECT d FROM StudyDocumentEntity d WHERE d.studyId = :studyId " +
           "AND d.fileName LIKE :filenamePattern ORDER BY d.uploadedAt DESC")
    List<StudyDocumentEntity> findByStudyIdAndFileNameLike(
        @Param("studyId") Long studyId, 
        @Param("filenamePattern") String filenamePattern);

    /**
     * Find documents by name pattern for a study
     * @param studyId The study ID
     * @param namePattern The name pattern (using LIKE)
     * @return List of matching documents
     */
    @Query("SELECT d FROM StudyDocumentEntity d WHERE d.studyId = :studyId " +
           "AND d.name LIKE :namePattern ORDER BY d.uploadedAt DESC")
    List<StudyDocumentEntity> findByStudyIdAndNameLike(
        @Param("studyId") Long studyId, 
        @Param("namePattern") String namePattern);

    /**
     * Get total file size for all documents in a study
     * @param studyId The study ID
     * @return Total file size in bytes
     */
    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM StudyDocumentEntity d WHERE d.studyId = :studyId")
    Long getTotalFileSizeByStudyId(@Param("studyId") Long studyId);

    /**
     * Delete all documents for a study
     * @param studyId The study ID
     */
    void deleteByStudyId(Long studyId);

    /**
     * Find documents that need to be archived (superseded documents older than specified days)
     * @param days Number of days
     * @return List of documents to archive
     */
    @Query("SELECT d FROM StudyDocumentEntity d WHERE d.status = 'SUPERSEDED' " +
           "AND d.updatedAt < CURRENT_TIMESTAMP - :days DAY")
    List<StudyDocumentEntity> findDocumentsToArchive(@Param("days") int days);

    /**
     * Get document statistics for a study
     * @param studyId The study ID
     * @return Object array with statistics [total_count, total_size, current_count, draft_count]
     */
    @Query("SELECT COUNT(d), COALESCE(SUM(d.fileSize), 0), " +
           "SUM(CASE WHEN d.status = 'CURRENT' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN d.status = 'DRAFT' THEN 1 ELSE 0 END) " +
           "FROM StudyDocumentEntity d WHERE d.studyId = :studyId")
    Object[] getDocumentStatistics(@Param("studyId") Long studyId);
}