package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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
    List<UserStudyRoleEntity> findByStudyId(Long studyId);
    
    /**
     * Find all active user roles for a specific study based on date range.
     * A role is considered active if:
     * - start_date <= current_date AND (end_date is NULL OR end_date >= current_date)
     *
     * @param studyId the ID of the study
     * @param currentDate the current date to check against
     * @return list of active user roles for the specified study
     */
    @Query("SELECT usr FROM UserStudyRoleEntity usr WHERE usr.studyId = :studyId " +
           "AND usr.startDate <= :currentDate " +
           "AND (usr.endDate IS NULL OR usr.endDate >= :currentDate)")
    List<UserStudyRoleEntity> findActiveByStudyId(@Param("studyId") Long studyId, @Param("currentDate") LocalDate currentDate);
    
    /**
     * Find a specific role for a user in a study.
     *
     * @param userId the ID of the user
     * @param studyId the ID of the study
     * @param roleId the role ID
     * @return optional containing the user study role if found
     */
    Optional<UserStudyRoleEntity> findByUser_IdAndStudyIdAndRole_Id(Long userId, Long studyId, Long roleId);
    
    /**
     * Find all user roles with end dates before a specific date.
     *
     * @param endDate the end date
     * @return list of user roles that end before the specified date
     */
    List<UserStudyRoleEntity> findByEndDateBefore(LocalDate endDate);
    
    /**
     * Find all roles for a specific role ID.
     *
     * @param roleId the role ID
     * @return list of user roles with the specified role ID
     */
    List<UserStudyRoleEntity> findByRole_Id(Long roleId);


    @Query("SELECT usr FROM UserStudyRoleEntity usr WHERE usr.user.id = :userId " +
            "AND usr.startDate <= :currentDate " +
            "AND (usr.endDate IS NULL OR usr.endDate >= :currentDate) " +
            "ORDER BY " +
            "CASE usr.role.name " +
            "WHEN 'SYSTEM_ADMIN' THEN 1 " +
            "WHEN 'PRINCIPAL_INVESTIGATOR' THEN 2 " +
            "WHEN 'STUDY_COORDINATOR' THEN 3 " +
            "WHEN 'DATA_MANAGER' THEN 4 " +
            "WHEN 'CRA' THEN 5 " +
            "WHEN 'MEDICAL_CODER' THEN 6 " +
            "WHEN 'AUDITOR' THEN 7 " +
            "WHEN 'SITE_USER' THEN 8 " +
            "ELSE 9 END")
    List<UserStudyRoleEntity> findHighestPriorityActiveRoleByUserId(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);


    /**
     * Convenience method to find all currently active user roles for a specific study.
     * This replaces the old findByStudyIdAndStatus method.
     *
     * @param studyId the ID of the study
     * @return list of currently active user roles for the specified study
     */
    default List<UserStudyRoleEntity> findActiveByStudyId(Long studyId) {
        return findActiveByStudyId(studyId, LocalDate.now());
    }

    /**
     * Convenience method to find the highest priority active role for a user.
     *
     * @param userId the ID of the user
     * @return optional containing the highest priority active role if found
     */
    default Optional<UserStudyRoleEntity> findHighestPriorityActiveRoleByUserId(Long userId) {
        List<UserStudyRoleEntity> roles = findHighestPriorityActiveRoleByUserId(userId, LocalDate.now());
        return roles.isEmpty() ? Optional.empty() : Optional.of(roles.get(0));
    }
}
