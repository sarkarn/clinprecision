package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import com.clinprecision.studydesignservice.entity.OrganizationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for OrganizationStudyEntity
 * Provides database access methods for organization-study relationships
 */
@Repository
public interface OrganizationStudyRepository extends JpaRepository<OrganizationStudyEntity, Long> {
    
    /**
     * Find all organization-study relationships for a specific study
     */
    List<OrganizationStudyEntity> findByStudyId(Long studyId);
    
    /**
     * Find specific organization-study relationship by study, organization and role
     */
    Optional<OrganizationStudyEntity> findByStudyIdAndOrganizationIdAndRole(
        Long studyId, Long organizationId, OrganizationRole role);
    
    /**
     * Find organization-study relationships by organization ID
     */
    List<OrganizationStudyEntity> findByOrganizationId(Long organizationId);
    
    /**
     * Find organization-study relationships by role
     */
    List<OrganizationStudyEntity> findByRole(OrganizationRole role);
    
    /**
     * Delete all organization-study relationships for a specific study
     */
    @Modifying
    @Query("DELETE FROM OrganizationStudyEntity os WHERE os.study.id = :studyId")
    void deleteByStudyId(@Param("studyId") Long studyId);
    
    /**
     * Delete specific organization-study relationship
     */
    @Modifying
    @Query("DELETE FROM OrganizationStudyEntity os WHERE os.study.id = :studyId AND os.organizationId = :organizationId AND os.role = :role")
    void deleteByStudyIdAndOrganizationIdAndRole(
        @Param("studyId") Long studyId, 
        @Param("organizationId") Long organizationId, 
        @Param("role") OrganizationRole role);
    
    /**
     * Check if organization-study relationship exists
     */
    @Query("SELECT COUNT(os) > 0 FROM OrganizationStudyEntity os WHERE os.study.id = :studyId AND os.organizationId = :organizationId AND os.role = :role")
    boolean existsByStudyIdAndOrganizationIdAndRole(
        @Param("studyId") Long studyId, 
        @Param("organizationId") Long organizationId, 
        @Param("role") OrganizationRole role);
}
