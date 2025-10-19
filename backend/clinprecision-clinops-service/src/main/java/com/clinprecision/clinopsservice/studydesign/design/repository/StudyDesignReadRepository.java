package com.clinprecision.clinopsservice.studydesign.repository;

import com.clinprecision.clinopsservice.entity.StudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Study Read Repository - Query interface for study read model
 * 
 * Following CQRS pattern: This is the read-side repository.
 * Queries against the denormalized read model for performance.
 */
@Repository
public interface StudyReadRepository extends JpaRepository<StudyEntity, Long> {

    /**
     * Find study by aggregate UUID (event sourcing identifier)
     * 
     * This is the primary lookup method for event handlers.
     */
    Optional<StudyEntity> findByAggregateUuid(UUID aggregateUuid);

    /**
     * Find study by protocol number
     */
    Optional<StudyEntity> findByProtocolNumber(String protocolNumber);

    /**
     * Find studies by status code
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.code = :statusCode")
    List<StudyEntity> findByStatus(@Param("statusCode") String statusCode);

    /**
     * Find studies by sponsor
     */
    List<StudyEntity> findBySponsor(String sponsor);

    /**
     * Find studies by phase code
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyPhase.code = :phaseCode")
    List<StudyEntity> findByPhase(@Param("phaseCode") String phaseCode);

    /**
     * Find active (non-closed) studies
     * Assumes status codes: COMPLETED, TERMINATED, WITHDRAWN indicate closed studies
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.code NOT IN ('COMPLETED', 'TERMINATED', 'WITHDRAWN')")
    List<StudyEntity> findActiveStudies();

    /**
     * Find closed studies
     * Assumes status codes: COMPLETED, TERMINATED, WITHDRAWN indicate closed studies
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.code IN ('COMPLETED', 'TERMINATED', 'WITHDRAWN')")
    List<StudyEntity> findClosedStudies();

    /**
     * Find studies by sponsor and status code
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.sponsor = :sponsor AND s.studyStatus.code = :statusCode")
    List<StudyEntity> findBySponsorAndStatus(@Param("sponsor") String sponsor, @Param("statusCode") String statusCode);

    /**
     * Check if protocol number exists
     */
    boolean existsByProtocolNumber(String protocolNumber);

    /**
     * Check if aggregate UUID exists
     */
    boolean existsByAggregateUuid(UUID aggregateUuid);

    /**
     * Find studies created by user
     */
    List<StudyEntity> findByCreatedBy(Long userId);

    /**
     * Custom query: Find studies by status IDs
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.id IN :statusIds ORDER BY s.createdAt DESC")
    List<StudyEntity> findByStatusIds(@Param("statusIds") List<Integer> statusIds);

    /**
     * Custom query: Search studies by name or protocol number
     */
    @Query("SELECT s FROM StudyEntity s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.protocolNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<StudyEntity> searchByNameOrProtocol(@Param("searchTerm") String searchTerm);

    /**
     * Custom query: Count studies by status
     */
    @Query("SELECT s.studyStatus.code, COUNT(s) FROM StudyEntity s GROUP BY s.studyStatus.code")
    List<Object[]> countByStatus();

    /**
     * Custom query: Find studies requiring action (in review statuses)
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.id IN (2, 3) ORDER BY s.createdAt ASC")
    List<StudyEntity> findStudiesRequiringReview();

    /**
     * Custom query: Find operational studies (active or suspended)
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.id IN (5, 6) ORDER BY s.name")
    List<StudyEntity> findOperationalStudies();
}
