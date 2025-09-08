package com.clinprecision.userservice.repository;

import com.clinprecision.userservice.data.OrganizationTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for OrganizationType entities.
 */
@Repository
public interface OrganizationTypeRepository extends JpaRepository<OrganizationTypeEntity, Long> {
    
    /**
     * Find an organization type by its name.
     *
     * @param name the name of the organization type
     * @return optional containing the organization type if found
     */
    Optional<OrganizationTypeEntity> findByName(String name);
    
    /**
     * Find an organization type by its code.
     *
     * @param code the code of the organization type
     * @return optional containing the organization type if found
     */
    Optional<OrganizationTypeEntity> findByCode(String code);
}
