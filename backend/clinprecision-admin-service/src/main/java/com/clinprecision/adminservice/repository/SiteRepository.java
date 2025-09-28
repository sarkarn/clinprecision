package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.SiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Site entities.
 */
@Repository
public interface SiteRepository extends JpaRepository<SiteEntity, Long> {
    
    /**
     * Find a site by its name.
     *
     * @param name the name of the site
     * @return optional containing the site if found
     */
    Optional<SiteEntity> findByName(String name);
    
    /**
     * Find a site by its site number.
     *
     * @param siteNumber the site number
     * @return optional containing the site if found
     */
    Optional<SiteEntity> findBySiteNumber(String siteNumber);
    
    /**
     * Find a site by its aggregate UUID (Axon identifier).
     *
     * @param aggregateUuid the aggregate UUID
     * @return optional containing the site if found
     */
    Optional<SiteEntity> findByAggregateUuid(String aggregateUuid);
    
    /**
     * Find all sites by their status.
     *
     * @param status the status of the sites to find
     * @return list of sites with the specified status
     */
    List<SiteEntity> findByStatus(SiteEntity.SiteStatus status);
    
    /**
     * Find all sites by their organization ID.
     *
     * @param organizationId the ID of the organization
     * @return list of sites belonging to the specified organization
     */
    List<SiteEntity> findByOrganization_Id(Long organizationId);
    
    /**
     * Find all sites by their principal investigator ID.
     *
     * @param principalInvestigatorId the ID of the principal investigator
     * @return list of sites with the specified principal investigator
     */
    List<SiteEntity> findByPrincipalInvestigator_Id(Long principalInvestigatorId);
    
    /**
     * Find all sites in a specific country.
     *
     * @param country the country of the sites
     * @return list of sites in the specified country
     */
    List<SiteEntity> findByCountry(String country);
    
    /**
     * Find all sites in a specific city and state.
     *
     * @param city the city of the sites
     * @param state the state of the sites
     * @return list of sites in the specified city and state
     */
    List<SiteEntity> findByCityAndState(String city, String state);
}
