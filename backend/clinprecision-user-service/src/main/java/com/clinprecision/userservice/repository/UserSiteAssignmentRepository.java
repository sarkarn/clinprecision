package com.clinprecision.userservice.repository;

import com.clinprecision.userservice.data.UserSiteAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserSiteAssignment entities.
 */
@Repository
public interface UserSiteAssignmentRepository extends JpaRepository<UserSiteAssignmentEntity, Long> {
    
    /**
     * Find all site assignments for a specific user.
     *
     * @param userId the ID of the user
     * @return list of site assignments for the specified user
     */
    List<UserSiteAssignmentEntity> findByUser_Id(Long userId);
    
    /**
     * Find all user assignments for a specific site.
     *
     * @param siteId the ID of the site
     * @return list of user assignments for the specified site
     */
    List<UserSiteAssignmentEntity> findBySite_Id(Long siteId);
    
    /**
     * Find all active user assignments for a specific site.
     *
     * @param siteId the ID of the site
     * @param status the status of the assignments to find
     * @return list of active user assignments for the specified site
     */
    List<UserSiteAssignmentEntity> findBySite_IdAndStatus(Long siteId, UserSiteAssignmentEntity.AssignmentStatus status);
    
    /**
     * Find a specific role assignment for a user at a site.
     *
     * @param userId the ID of the user
     * @param siteId the ID of the site
     * @param roleCode the role code
     * @return optional containing the user site assignment if found
     */
    Optional<UserSiteAssignmentEntity> findByUser_IdAndSite_IdAndRoleCode(Long userId, Long siteId, String roleCode);
    
    /**
     * Find all user assignments for a specific study.
     *
     * @param studyId the ID of the study
     * @return list of user assignments for the specified study
     */
    List<UserSiteAssignmentEntity> findByStudyId(String studyId);
    
    /**
     * Find all user assignments with end dates before a specific date.
     *
     * @param endDate the end date
     * @return list of user assignments that end before the specified date
     */
    List<UserSiteAssignmentEntity> findByEndDateBefore(LocalDateTime endDate);
    
    /**
     * Find all assignments for a specific role code.
     *
     * @param roleCode the role code
     * @return list of user assignments with the specified role code
     */
    List<UserSiteAssignmentEntity> findByRoleCode(String roleCode);
}
