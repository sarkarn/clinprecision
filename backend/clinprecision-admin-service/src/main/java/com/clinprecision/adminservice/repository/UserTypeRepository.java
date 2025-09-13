package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.UserTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserType entities.
 */
@Repository
public interface UserTypeRepository extends JpaRepository<UserTypeEntity, Long> {
    
    /**
     * Find a user type by its name.
     *
     * @param name the name of the user type
     * @return optional containing the user type if found
     */
    Optional<UserTypeEntity> findByName(String name);
    
    /**
     * Find a user type by its code.
     *
     * @param code the code of the user type
     * @return optional containing the user type if found
     */
    Optional<UserTypeEntity> findByCode(String code);
    
    /**
     * Find all user types by their category.
     *
     * @param category the category of the user types to find
     * @return list of user types with the specified category
     */
    List<UserTypeEntity> findByCategory(UserTypeEntity.UserCategory category);
}
