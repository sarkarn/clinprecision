package com.clinprecision.organizationservice.repository;

import com.clinprecision.common.entity.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Organization entities.
 */
@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, Long> {
    
    Optional<OrganizationEntity> findByName(String name);
    
    Optional<OrganizationEntity> findByExternalId(String externalId);
    
    List<OrganizationEntity> findByStatus(OrganizationEntity.OrganizationStatus status);
    
    List<OrganizationEntity> findByCountry(String country);
    
    List<OrganizationEntity> findByCityAndState(String city, String state);
}
