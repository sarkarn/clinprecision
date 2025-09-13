package com.clinprecision.userservice.service;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import com.clinprecision.userservice.data.OrganizationEntity;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing organization-related operations.
 */
public interface OrganizationService {

    /**
     * Get all organizations.
     *
     * @return list of all organizations
     */
    List<OrganizationEntity> getAllOrganizations();

    /**
     * Get an organization by its ID.
     *
     * @param id the ID of the organization
     * @return optional containing the organization if found
     */
    Optional<OrganizationEntity> getOrganizationById(Long id);

    /**
     * Get an organization by its name.
     *
     * @param name the name of the organization
     * @return optional containing the organization if found
     */
    Optional<OrganizationEntity> getOrganizationByName(String name);

    /**
     * Get an organization by its external ID.
     *
     * @param externalId the external ID of the organization
     * @return optional containing the organization if found
     */
    Optional<OrganizationEntity> getOrganizationByExternalId(String externalId);

    /**
     * Get organizations by their status.
     *
     * @param status the status of the organizations to find
     * @return list of organizations with the specified status
     */
    List<OrganizationEntity> getOrganizationsByStatus(OrganizationEntity.OrganizationStatus status);

     /**
     * Create a new organization.
     *
     * @param organization the organization entity to create
     * @return the created organization entity
     */
    OrganizationEntity createOrganization(OrganizationEntity organization);

    /**
     * Update an existing organization.
     *
     * @param id the ID of the organization to update
     * @param organizationDetails the updated organization details
     * @return the updated organization entity
     * @throws RuntimeException if the organization is not found
     */
    OrganizationEntity updateOrganization(Long id, OrganizationEntity organizationDetails);

    /**
     * Delete an organization by its ID.
     *
     * @param id the ID of the organization to delete
     * @return true if deletion was successful, false otherwise
     */
    boolean deleteOrganization(Long id);

    /**
     * Get all contacts for an organization.
     *
     * @param organizationId the ID of the organization
     * @return list of organization contacts
     */
    List<OrganizationContactEntity> getOrganizationContacts(Long organizationId);

    /**
     * Add a contact to an organization.
     *
     * @param organizationId the ID of the organization
     * @param contact the contact entity to add
     * @return the created organization contact entity
     * @throws RuntimeException if the organization is not found
     */
    OrganizationContactEntity addOrganizationContact(Long organizationId, OrganizationContactEntity contact);

    /**
     * Update an organization contact.
     *
     * @param organizationId the ID of the organization
     * @param contactId the ID of the contact to update
     * @param contactDetails the updated contact details
     * @return the updated organization contact entity
     * @throws RuntimeException if the organization or contact is not found
     */
    OrganizationContactEntity updateOrganizationContact(Long organizationId, Long contactId, 
                                                       OrganizationContactEntity contactDetails);

    /**
     * Delete an organization contact.
     *
     * @param organizationId the ID of the organization
     * @param contactId the ID of the contact to delete
     * @return true if deletion was successful, false otherwise
     */
    boolean deleteOrganizationContact(Long organizationId, Long contactId);
}
