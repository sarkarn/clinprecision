package com.clinprecision.userservice.repository;

import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserStudyRole entities in User Service.
 * Duplicate of admin service repository for role resolution.
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
     * Find all active user roles for a specific user based on date range.
     * A role is considered active if:
     * - start_date <= current_date AND (end_date is NULL OR end_date >= current_date)
     *
     * @param userId the ID of the user
     * @param currentDate the current date to check against
     * @return list of active user roles for the specified user
     */
    @Query("SELECT usr FROM UserStudyRoleEntity usr WHERE usr.user.id = :userId " +
           "AND usr.startDate <= :currentDate " +
           "AND (usr.endDate IS NULL OR usr.endDate >= :currentDate)")
    List<UserStudyRoleEntity> findActiveByUserId(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);
    
    /**
     * Find the highest priority active role for a user.
     * Priority order: SYSTEM_ADMIN > PRINCIPAL_INVESTIGATOR > STUDY_COORDINATOR > DATA_MANAGER > CRA > MEDICAL_CODER > AUDITOR > SITE_USER
     *
     * @param userId the ID of the user
     * @param currentDate the current date to check against
     * @return optional containing the highest priority active role if found
     */
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
     * Convenience method to find all currently active user roles for a specific user.
     *
     * @param userId the ID of the user
     * @return list of currently active user roles for the specified user
     */
    default List<UserStudyRoleEntity> findActiveByUserId(Long userId) {
        return findActiveByUserId(userId, LocalDate.now());
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