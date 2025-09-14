package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.OrganizationContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for OrganizationContact entities.
 */
@Repository
public interface OrganizationContactRepository extends JpaRepository<OrganizationContactEntity, Long> {
    
    /**
     * Find all contacts for a specific organization.
     *
     * @param organizationId the ID of the organization
     * @return list of contacts for the specified organization
     */
    List<OrganizationContactEntity> findByOrganization_Id(Long organizationId);
    
    /**
     * Find all primary contacts for a specific organization.
     *
     * @param organizationId the ID of the organization
     * @param isPrimary whether the contact is primary
     * @return list of primary contacts for the specified organization
     */
    List<OrganizationContactEntity> findByOrganization_IdAndIsPrimary(Long organizationId, Boolean isPrimary);
    
    /**
     * Find a contact by email.
     *
     * @param email the email of the contact
     * @return optional containing the contact if found
     */
    Optional<OrganizationContactEntity> findByEmail(String email);
    
}
