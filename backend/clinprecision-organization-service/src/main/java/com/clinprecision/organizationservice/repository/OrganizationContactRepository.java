package com.clinprecision.organizationservice.repository;

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
    
    List<OrganizationContactEntity> findByOrganization_Id(Long organizationId);
    
    List<OrganizationContactEntity> findByOrganization_IdAndIsPrimary(Long organizationId, Boolean isPrimary);
    
    Optional<OrganizationContactEntity> findByEmail(String email);
}
