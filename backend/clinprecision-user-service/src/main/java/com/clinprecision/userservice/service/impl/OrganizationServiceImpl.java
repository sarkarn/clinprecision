package com.clinprecision.userservice.service.impl;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import com.clinprecision.userservice.data.OrganizationEntity;
import com.clinprecision.userservice.repository.OrganizationContactRepository;
import com.clinprecision.userservice.repository.OrganizationRepository;
import com.clinprecision.userservice.service.OrganizationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of the OrganizationService interface.
 */
@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationContactRepository organizationContactRepository;

    @Autowired
    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                   OrganizationContactRepository organizationContactRepository) {
        this.organizationRepository = organizationRepository;
        this.organizationContactRepository = organizationContactRepository;
    }

    @Override
    public List<OrganizationEntity> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @Override
    public Optional<OrganizationEntity> getOrganizationById(Long id) {
        return organizationRepository.findById(id);
    }

    @Override
    public Optional<OrganizationEntity> getOrganizationByName(String name) {
        return organizationRepository.findByName(name);
    }

    @Override
    public Optional<OrganizationEntity> getOrganizationByExternalId(String externalId) {
        return organizationRepository.findByExternalId(externalId);
    }

    @Override
    public List<OrganizationEntity> getOrganizationsByStatus(OrganizationEntity.OrganizationStatus status) {
        return organizationRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public OrganizationEntity createOrganization(OrganizationEntity organization) {
        return organizationRepository.save(organization);
    }

    @Override
    @Transactional
    public OrganizationEntity updateOrganization(Long id, OrganizationEntity organizationDetails) {
        OrganizationEntity organization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));

        // Update organization details
        organization.setName(organizationDetails.getName());
        organization.setExternalId(organizationDetails.getExternalId());
        organization.setAddressLine1(organizationDetails.getAddressLine1());
        organization.setAddressLine2(organizationDetails.getAddressLine2());
        organization.setCity(organizationDetails.getCity());
        organization.setState(organizationDetails.getState());
        organization.setPostalCode(organizationDetails.getPostalCode());
        organization.setCountry(organizationDetails.getCountry());
        organization.setPhone(organizationDetails.getPhone());
        organization.setEmail(organizationDetails.getEmail());
        organization.setWebsite(organizationDetails.getWebsite());
        organization.setStatus(organizationDetails.getStatus());

        return organizationRepository.save(organization);
    }

    @Override
    @Transactional
    public boolean deleteOrganization(Long id) {
        if (organizationRepository.existsById(id)) {
            organizationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<OrganizationContactEntity> getOrganizationContacts(Long organizationId) {
        // Ensure organization exists
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        
        return organization.getContacts().stream().toList();
    }

    @Override
    @Transactional
    public OrganizationContactEntity addOrganizationContact(Long organizationId, OrganizationContactEntity contact) {
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        contact.setOrganization(organization);
        return organizationContactRepository.save(contact);
    }

    @Override
    @Transactional
    public OrganizationContactEntity updateOrganizationContact(Long organizationId, Long contactId, 
                                                              OrganizationContactEntity contactDetails) {
        // Ensure organization exists
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        // Ensure contact belongs to the organization
        OrganizationContactEntity contact = organization.getContacts().stream()
                .filter(c -> c.getId().equals(contactId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + contactId + 
                                                       " for organization with id: " + organizationId));

        // Update contact details

        contact.setTitle(contactDetails.getTitle());
        contact.setPhone(contactDetails.getPhone());
        contact.setEmail(contactDetails.getEmail());
        contact.setIsPrimary(contactDetails.getIsPrimary());
        contact.setDepartment(contactDetails.getDepartment());


        return organizationContactRepository.save(contact);
    }

    @Override
    @Transactional
    public boolean deleteOrganizationContact(Long organizationId, Long contactId) {
        // Ensure organization exists
        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));

        // Ensure contact belongs to the organization
        OrganizationContactEntity contact = organization.getContacts().stream()
                .filter(c -> c.getId().equals(contactId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Contact not found with id: " + contactId + 
                                                       " for organization with id: " + organizationId));

        organizationContactRepository.delete(contact);
        return true;
    }
}
