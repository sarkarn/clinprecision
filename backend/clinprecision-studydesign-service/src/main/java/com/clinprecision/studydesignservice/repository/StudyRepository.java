package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.StudyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyEntity
 * Provides database access methods for study operations
 */
@Repository
public interface StudyRepository extends JpaRepository<StudyEntity, Long> {
    
    /**
     * Find studies by status
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.status IN :statuses ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByStatusIn(@Param("statuses") List<StudyStatus> statuses);
    
    /**
     * Find studies by creator and status
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.createdBy = :userId AND s.status = :status ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByCreatedByAndStatus(@Param("userId") Long userId, @Param("status") StudyStatus status);
    
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
     * Find study by ID with organization relationships eagerly loaded
     */
    @Query("SELECT s FROM StudyEntity s LEFT JOIN FETCH s.organizationStudies os WHERE s.id = :id")
    Optional<StudyEntity> findByIdWithOrganizations(@Param("id") Long id);
    
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
     * Find studies by phase
     */
    @Query("SELECT s FROM StudyEntity s WHERE s.phase = :phase ORDER BY s.updatedAt DESC")
    List<StudyEntity> findByPhase(@Param("phase") String phase);
}
