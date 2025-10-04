package com.clinprecision.organizationservice.service;

import com.clinprecision.common.entity.OrganizationEntity;
import com.clinprecision.common.entity.OrganizationContactEntity;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing organization-related operations.
 */
public interface OrganizationService {

    List<OrganizationEntity> getAllOrganizations();

    Optional<OrganizationEntity> getOrganizationById(Long id);

    Optional<OrganizationEntity> getOrganizationByName(String name);

    Optional<OrganizationEntity> getOrganizationByExternalId(String externalId);

    List<OrganizationEntity> getOrganizationsByStatus(OrganizationEntity.OrganizationStatus status);

    OrganizationEntity createOrganization(OrganizationEntity organization);

    OrganizationEntity updateOrganization(Long id, OrganizationEntity organizationDetails);

    boolean deleteOrganization(Long id);

    List<OrganizationContactEntity> getOrganizationContacts(Long organizationId);

    OrganizationContactEntity addOrganizationContact(Long organizationId, OrganizationContactEntity contact);

    OrganizationContactEntity updateOrganizationContact(Long organizationId, Long contactId, 
                                                       OrganizationContactEntity contactDetails);

    boolean deleteOrganizationContact(Long organizationId, Long contactId);
}
