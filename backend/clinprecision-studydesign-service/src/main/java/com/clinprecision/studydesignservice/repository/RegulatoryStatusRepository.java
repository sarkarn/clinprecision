package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.RegulatoryStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for RegulatoryStatusEntity
 * Provides database access methods for regulatory status lookup operations
 */
@Repository
public interface RegulatoryStatusRepository extends JpaRepository<RegulatoryStatusEntity, Long> {
    
    /**
     * Find regulatory status by code (case insensitive)
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE UPPER(rs.code) = UPPER(:code)")
    Optional<RegulatoryStatusEntity> findByCodeIgnoreCase(@Param("code") String code);
    
    /**
     * Find all active regulatory statuses ordered by display order
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE rs.isActive = true ORDER BY rs.displayOrder")
    List<RegulatoryStatusEntity> findAllActiveOrderByDisplayOrder();
    
    /**
     * Find regulatory statuses by category
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE rs.isActive = true AND rs.regulatoryCategory = :category ORDER BY rs.displayOrder")
    List<RegulatoryStatusEntity> findByCategoryOrderByDisplayOrder(@Param("category") RegulatoryStatusEntity.RegulatoryCategory category);
    
    /**
     * Find regulatory statuses that allow enrollment
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE rs.isActive = true AND rs.allowsEnrollment = true ORDER BY rs.displayOrder")
    List<RegulatoryStatusEntity> findAllowsEnrollment();
    
    /**
     * Find regulatory statuses that require documentation
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE rs.isActive = true AND rs.requiresDocumentation = true ORDER BY rs.displayOrder")
    List<RegulatoryStatusEntity> findRequiresDocumentation();
    
    /**
     * Find regulatory status by code (exact match)
     */
    Optional<RegulatoryStatusEntity> findByCode(String code);
    
    /**
     * Check if regulatory status code exists (case insensitive) excluding a specific ID
     */
    @Query("SELECT COUNT(rs) > 0 FROM RegulatoryStatusEntity rs WHERE UPPER(rs.code) = UPPER(:code) AND rs.id != :excludeId")
    boolean existsByCodeIgnoreCaseExcludingId(@Param("code") String code, @Param("excludeId") Long excludeId);
    
    /**
     * Find default "Not Applicable" status (for studies that don't require regulatory approval)
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE UPPER(rs.code) = 'NOT_APPLICABLE' AND rs.isActive = true")
    Optional<RegulatoryStatusEntity> findNotApplicableStatus();
    
    /**
     * Find approved regulatory statuses (any category marked as APPROVED)
     */
    @Query("SELECT rs FROM RegulatoryStatusEntity rs WHERE rs.isActive = true AND rs.regulatoryCategory = 'APPROVED' ORDER BY rs.displayOrder")
    List<RegulatoryStatusEntity> findApprovedStatuses();
}