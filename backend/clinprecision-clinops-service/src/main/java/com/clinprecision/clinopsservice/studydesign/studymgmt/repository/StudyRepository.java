package com.clinprecision.clinopsservice.repository;



import com.clinprecision.clinopsservice.entity.StudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for StudyEntity
 * Provides database access methods for study operations
 * 
 * DDD Enhancement: Added UUID-based query methods for event sourcing integration
 */
@Repository
public interface StudyRepository extends JpaRepository<StudyEntity, Long> {
    
    // ==================== DDD UUID-BASED METHODS (Preferred) ====================
    
    /**
     * Find study by aggregate UUID (DDD identifier)
     * This is the preferred method for DDD architecture
     * 
     * @param aggregateUuid UUID from event-sourced aggregate
     * @return Optional containing StudyEntity if found
     */
    Optional<StudyEntity> findByAggregateUuid(UUID aggregateUuid);
    
    /**
     * Find study by aggregate UUID with all relationships eagerly loaded
     * 
     * @param aggregateUuid UUID from event-sourced aggregate
     * @return Optional containing StudyEntity with loaded relationships
     */
    @Query("SELECT s FROM StudyEntity s " +
           "LEFT JOIN FETCH s.organizationStudies os " +
           "LEFT JOIN FETCH s.studyStatus ss " +
           "LEFT JOIN FETCH s.regulatoryStatus rs " +
           "LEFT JOIN FETCH s.studyPhase sp " +
           "WHERE s.aggregateUuid = :aggregateUuid")
    Optional<StudyEntity> findByAggregateUuidWithAllRelationships(@Param("aggregateUuid") UUID aggregateUuid);
    
    /**
     * Check if study exists by aggregate UUID
     * 
     * @param aggregateUuid UUID to check
     * @return true if exists, false otherwise
     */
    boolean existsByAggregateUuid(UUID aggregateUuid);
    
    // ==================== LEGACY LONG ID METHODS ====================
    
    /**
     * Find studies by status IDs
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyStatus.id IN :statusIds ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByStatusIdIn(@Param("statusIds") List<Long> statusIds);
    
    /**
     * Find studies by status code
     */
    @Query("SELECT s FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = UPPER(:statusCode) ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByStatusCode(@Param("statusCode") String statusCode);
    
    /**
     * Find studies by creator and status ID
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.createdBy = :userId AND s.studyStatus.id = :statusId ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByCreatedByAndStatusId(@Param("userId") Long userId, @Param("statusId") Long statusId);
    
    /**
     * Find study by protocol number
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.protocolNumber = :protocolNumber")
    Optional<StudyEntity> findByProtocolNumber(@Param("protocolNumber") String protocolNumber);
    
    /**
     * Count studies with protocol number excluding a specific study
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s WHERE s.protocolNumber = :protocolNumber AND s.id != :excludeId")
    Long countByProtocolNumberExcludingId(@Param("protocolNumber") String protocolNumber, @Param("excludeId") Long excludeId);
    
    /**
     * Find study by ID with all relationships eagerly loaded
     */
    @Query("SELECT s FROM StudyEntity s " +
           "LEFT JOIN FETCH s.organizationStudies os " +
           "LEFT JOIN FETCH s.studyStatus ss " +
           "LEFT JOIN FETCH s.regulatoryStatus rs " +
           "LEFT JOIN FETCH s.studyPhase sp " +
           "WHERE s.id = :id")
    Optional<StudyEntity> findByIdWithAllRelationships(@Param("id") Long id);
    
    /**
     * Find studies by name containing text (case insensitive)
     */
    @Query("SELECT s FROM StudyEntity s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY s.name")
    List<StudyEntity> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find studies by sponsor containing text (case insensitive)
     */
    @Query("SELECT s FROM StudyEntity s WHERE LOWER(s.sponsor) LIKE LOWER(CONCAT('%', :sponsor, '%')) ORDER BY s.name")
    List<StudyEntity> findBySponsorContainingIgnoreCase(@Param("sponsor") String sponsor);
    
    /**
     * Find studies by phase ID
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.studyPhase.id = :phaseId ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByPhaseId(@Param("phaseId") Long phaseId);
    
    /**
     * Find studies by phase code
     */
    @Query("SELECT s FROM StudyEntity s JOIN s.studyPhase sp WHERE UPPER(sp.code) = UPPER(:phaseCode) ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByPhaseCode(@Param("phaseCode") String phaseCode);
    
    /**
     * Find all studies ordered by most recently updated first
     */
    @Query("SELECT s FROM StudyEntity s ORDER BY s.updatedAt DESC")
    List<StudyEntity> findAllByOrderByUpdatedAtDesc();
    
    /**
     * Find all studies with comprehensive filtering and sorting for list view
     */
    @Query("SELECT s FROM StudyEntity s " +
           "LEFT JOIN s.studyStatus ss " +
           "LEFT JOIN s.studyPhase sp " +
           "LEFT JOIN s.regulatoryStatus rs " +
           "WHERE (:statusId IS NULL OR s.studyStatus.id = :statusId) AND " +
           "(:phaseId IS NULL OR s.studyPhase.id = :phaseId) AND " +
           "(:regulatoryStatusId IS NULL OR s.regulatoryStatus.id = :regulatoryStatusId) AND " +
           "(:sponsor IS NULL OR LOWER(s.sponsor) LIKE LOWER(CONCAT('%', :sponsor, '%'))) " +
           "ORDER BY s.updatedAt DESC")
    List<StudyEntity> findAllWithFilters(@Param("statusId") Long statusId,
                                        @Param("phaseId") Long phaseId,
                                        @Param("regulatoryStatusId") Long regulatoryStatusId,
                                        @Param("sponsor") String sponsor);
    
    /**
     * Find studies by regulatory status allowing enrollment
     */
    @Query("SELECT s FROM StudyEntity s JOIN s.regulatoryStatus rs WHERE rs.allowsEnrollment = true ORDER BY s.updatedAt DESC")
    List<StudyEntity> findStudiesAllowingEnrollment();
    
    /**
     * Find studies in modifiable status
     */
    @Query("SELECT s FROM StudyEntity s JOIN s.studyStatus ss WHERE ss.allowsModification = true ORDER BY s.updatedAt DESC")
    List<StudyEntity> findModifiableStudies();
    
    /**
     * Count studies by phase category
     */
    @Query("SELECT sp.phaseCategory, COUNT(s) FROM StudyEntity s JOIN s.studyPhase sp GROUP BY sp.phaseCategory")
    List<Object[]> countStudiesByPhaseCategory();
    
    /**
     * Count studies by status
     */
    @Query("SELECT ss.name, COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss GROUP BY ss.name")
    List<Object[]> countStudiesByStatus();
    
    /**
     * Count active studies (studies with ACTIVE status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = 'ACTIVE'")
    Long countActiveStudies();
    
    /**
     * Count draft studies (studies with DRAFT status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = 'DRAFT'")
    Long countDraftStudies();
    
    /**
     * Count completed studies (studies with COMPLETED status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = 'COMPLETED'")
    Long countCompletedStudies();
    
    /**
     * Count suspended studies (studies with SUSPENDED status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = 'SUSPENDED'")
    Long countSuspendedStudies();
    
    /**
     * Count terminated studies (studies with TERMINATED status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = 'TERMINATED'")
    Long countTerminatedStudies();
    
    /**
     * Get total amendments count across all studies
     */
    @Query("SELECT SUM(COALESCE(s.amendments, 0)) FROM StudyEntity s")
    Long getTotalAmendments();
    
    /**
     * Count studies by status code (generic method for any status)
     */
    @Query("SELECT COUNT(s) FROM StudyEntity s JOIN s.studyStatus ss WHERE UPPER(ss.code) = UPPER(:statusCode)")
    Long countStudiesByStatusCode(@Param("statusCode") String statusCode);
    
    /**
     * Get studies count by phase for dashboard metrics
     */
    @Query("SELECT sp.name, COUNT(s) FROM StudyEntity s JOIN s.studyPhase sp GROUP BY sp.name ORDER BY sp.displayOrder")
    List<Object[]> countStudiesByPhaseName();
}



