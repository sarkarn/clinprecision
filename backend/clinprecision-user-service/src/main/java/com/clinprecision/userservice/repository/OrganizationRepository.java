package com.clinprecision.userservice.repository;

import com.clinprecision.userservice.data.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Organization entities.
 */
@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, Long> {
    
    /**
     * Find an organization by its name.
     *
     * @param name the name of the organization
     * @return optional containing the organization if found
     */
    Optional<OrganizationEntity> findByName(String name);
    
    /**
     * Find an organization by its external ID.
     *
     * @param externalId the external ID of the organization
     * @return optional containing the organization if found
     */
    Optional<OrganizationEntity> findByExternalId(String externalId);
    
    /**
     * Find all organizations by their status.
     *
     * @param status the status of the organizations to find
     * @return list of organizations with the specified status
     */
    List<OrganizationEntity> findByStatus(OrganizationEntity.OrganizationStatus status);
    
    /**
     * Find all organizations by their organization type ID.
     *
     * @param orgTypeId the ID of the organization type
     * @return list of organizations with the specified organization type
     */
    List<OrganizationEntity> findByOrganizationType_Id(Long orgTypeId);
    
    /**
     * Find all organizations by their country.
     *
     * @param country the country of the organizations
     * @return list of organizations in the specified country
     */
    List<OrganizationEntity> findByCountry(String country);
    
    /**
     * Find all organizations in a specific city and state.
     *
     * @param city the city of the organizations
     * @param state the state of the organizations
     * @return list of organizations in the specified city and state
     */
    List<OrganizationEntity> findByCityAndState(String city, String state);
}
