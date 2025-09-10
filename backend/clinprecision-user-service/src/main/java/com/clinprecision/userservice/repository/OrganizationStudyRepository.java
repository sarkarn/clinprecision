package com.clinprecision.userservice.repository;

import com.clinprecision.userservice.data.OrganizationStudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for OrganizationStudy entities.
 */
@Repository
public interface OrganizationStudyRepository extends JpaRepository<OrganizationStudyEntity, Long> {
    
    /**
     * Find all study relationships for a specific organization.
     *
     * @param organizationId the ID of the organization
     * @return list of study relationships for the specified organization
     */
    List<OrganizationStudyEntity> findByOrganization_Id(Long organizationId);
    
    /**
     * Find all organization relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @return list of organization relationships for the specified study
     */
    List<OrganizationStudyEntity> findByStudyId(Long studyId);
    
    /**
     * Find all active organization relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @param status the status of the relationships to find
     * @return list of active organization relationships for the specified study
     */
    List<OrganizationStudyEntity> findByStudyIdAndStatus(Long studyId, OrganizationStudyEntity.OrganizationStudyStatus status);
    
    /**
     * Find a specific role relationship for an organization in a study.
     *
     * @param organizationId the ID of the organization
     * @param studyId the ID of the study
     * @param roleCode the role code
     * @return optional containing the organization study relationship if found
     */
    Optional<OrganizationStudyEntity> findByOrganization_IdAndStudyIdAndRoleCode(Long organizationId, Long studyId, String roleCode);
    
    /**
     * Find all organization study relationships with end dates before a specific date.
     *
     * @param endDate the end date
     * @return list of relationships that end before the specified date
     */
    List<OrganizationStudyEntity> findByEndDateBefore(LocalDateTime endDate);
    
    /**
     * Find all relationships for a specific role code.
     *
     * @param roleCode the role code
     * @return list of relationships with the specified role code
     */
    List<OrganizationStudyEntity> findByRoleCode(String roleCode);
}
