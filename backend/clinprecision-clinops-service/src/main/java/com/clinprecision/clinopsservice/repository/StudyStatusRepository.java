package com.clinprecision.clinopsservice.repository;



import com.clinprecision.common.entity.clinops.StudyStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyStatusEntity
 * Provides database access methods for study status lookup operations
 */
@Repository
public interface StudyStatusRepository extends JpaRepository<StudyStatusEntity, Long> {
    
    /**
     * Find study status by code (case insensitive)
     */
    @Query("SELECT ss FROM StudyStatusEntity ss WHERE UPPER(ss.code) = UPPER(:code)")
    Optional<StudyStatusEntity> findByCodeIgnoreCase(@Param("code") String code);
    
    /**
     * Find all active study statuses ordered by display order
     */
    @Query("SELECT ss FROM StudyStatusEntity ss WHERE ss.isActive = true ORDER BY ss.displayOrder")
    List<StudyStatusEntity> findAllActiveOrderByDisplayOrder();
    
    /**
     * Find study statuses that allow modification
     */
    @Query("SELECT ss FROM StudyStatusEntity ss WHERE ss.isActive = true AND ss.allowsModification = true ORDER BY ss.displayOrder")
    List<StudyStatusEntity> findAllowsModification();
    
    /**
     * Find final statuses (terminal statuses)
     */
    @Query("SELECT ss FROM StudyStatusEntity ss WHERE ss.isActive = true AND ss.isFinalStatus = true ORDER BY ss.displayOrder")
    List<StudyStatusEntity> findFinalStatuses();
    
    /**
     * Find study status by code (exact match)
     */
    Optional<StudyStatusEntity> findByCode(String code);
    
    /**
     * Check if status code exists (case insensitive) excluding a specific ID
     */
    @Query("SELECT COUNT(ss) > 0 FROM StudyStatusEntity ss WHERE UPPER(ss.code) = UPPER(:code) AND ss.id != :excludeId")
    boolean existsByCodeIgnoreCaseExcludingId(@Param("code") String code, @Param("excludeId") Long excludeId);
    
    /**
     * Find default draft status (typically used for new studies)
     */
    @Query("SELECT ss FROM StudyStatusEntity ss WHERE UPPER(ss.code) = 'DRAFT' AND ss.isActive = true")
    Optional<StudyStatusEntity> findDraftStatus();
}
