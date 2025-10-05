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
     * Find studies by status
     */
    List<StudyEntity> findByStatus(String status);

    /**
     * Find studies by sponsor
     */
    List<StudyEntity> findBySponsor(String sponsor);

    /**
     * Find studies by phase
     */
    List<StudyEntity> findByPhase(String phase);

    /**
     * Find active (non-closed) studies
     */
    List<StudyEntity> findByClosedFalse();

    /**
     * Find closed studies
     */
    List<StudyEntity> findByClosedTrue();

    /**
     * Find studies by sponsor and status
     */
    List<StudyEntity> findBySponsorAndStatus(String sponsor, String status);

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
    @Query("SELECT s FROM StudyEntity s WHERE s.statusId IN :statusIds ORDER BY s.createdAt DESC")
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
    @Query("SELECT s.status, COUNT(s) FROM StudyEntity s GROUP BY s.status")
    List<Object[]> countByStatus();

    /**
     * Custom query: Find studies requiring action (in review statuses)
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.statusId IN (2, 3) ORDER BY s.createdAt ASC")
    List<StudyEntity> findStudiesRequiringReview();

    /**
     * Custom query: Find operational studies (active or suspended)
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.statusId IN (5, 6) ORDER BY s.name")
    List<StudyEntity> findOperationalStudies();
}
