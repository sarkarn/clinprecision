package com.clinprecision.userservice.repository;

import com.clinprecision.userservice.data.UserStudyRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserStudyRole entities.
 */
@Repository
public interface UserStudyRoleRepository extends JpaRepository<UserStudyRoleEntity, Long> {
    
    /**
     * Find all study roles for a specific user.
     *
     * @param userId the ID of the user
     * @return list of study roles for the specified user
     */
    List<UserStudyRoleEntity> findByUser_Id(Long userId);
    
    /**
     * Find all user roles for a specific study.
     *
     * @param studyId the ID of the study
     * @return list of user roles for the specified study
     */
    List<UserStudyRoleEntity> findByStudyId(String studyId);
    
    /**
     * Find all active user roles for a specific study.
     *
     * @param studyId the ID of the study
     * @param status the status of the roles to find
     * @return list of active user roles for the specified study
     */
    List<UserStudyRoleEntity> findByStudyIdAndStatus(String studyId, UserStudyRoleEntity.RoleStatus status);
    
    /**
     * Find a specific role for a user in a study.
     *
     * @param userId the ID of the user
     * @param studyId the ID of the study
     * @param roleCode the role code
     * @return optional containing the user study role if found
     */
    Optional<UserStudyRoleEntity> findByUser_IdAndStudyIdAndRoleCode(Long userId, String studyId, String roleCode);
    
    /**
     * Find all user roles with end dates before a specific date.
     *
     * @param endDate the end date
     * @return list of user roles that end before the specified date
     */
    List<UserStudyRoleEntity> findByEndDateBefore(LocalDateTime endDate);
    
    /**
     * Find all roles for a specific role code.
     *
     * @param roleCode the role code
     * @return list of user roles with the specified role code
     */
    List<UserStudyRoleEntity> findByRoleCode(String roleCode);
}
