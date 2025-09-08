package com.clinprecision.userservice.ui.controllers;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import com.clinprecision.userservice.data.OrganizationEntity;
import com.clinprecision.userservice.data.OrganizationTypeEntity;
import com.clinprecision.userservice.dto.OrganizationDTO;
import com.clinprecision.userservice.dto.OrganizationTypeDTO;
import com.clinprecision.userservice.repository.OrganizationTypeRepository;
import com.clinprecision.userservice.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * REST controller for managing organizations.
 */
@RestController
@RequestMapping("/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationTypeRepository organizationTypeRepository;

    @Autowired
    public OrganizationController(OrganizationService organizationService,
                                 OrganizationTypeRepository organizationTypeRepository) {
        this.organizationService = organizationService;
        this.organizationTypeRepository = organizationTypeRepository;
    }

    /**
     * GET /organizations : Get all organizations
     *
     * @return the ResponseEntity with status 200 (OK) and the list of organizations in body
     */
    @GetMapping
    public ResponseEntity<List<OrganizationDTO>> getAllOrganizations() {
        List<OrganizationEntity> organizations = organizationService.getAllOrganizations();
        List<OrganizationDTO> organizationDTOs = organizations.stream()
                .map(OrganizationDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(organizationDTOs);
    }

    /**
     * GET /organizations/:id : Get the organization with the specified ID
     *
     * @param id the ID of the organization to retrieve
     * @return the ResponseEntity with status 200 (OK) and the organization in body, or with status 404 (Not Found)
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDTO> getOrganization(@PathVariable Long id) {
        return organizationService.getOrganizationById(id)
                .map(organization -> ResponseEntity.ok(new OrganizationDTO(organization)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /organizations : Create a new organization
     *
     * @param organizationDTO the organization to create
     * @return the ResponseEntity with status 201 (Created) and the new organization in body
     */
    @PostMapping
    public ResponseEntity<OrganizationDTO> createOrganization(@RequestBody OrganizationDTO organizationDTO) {
        // Convert DTO to entity
        OrganizationEntity organization = new OrganizationEntity();
        organization.setName(organizationDTO.getName());
        organization.setExternalId(organizationDTO.getExternalId());
        organization.setAddressLine1(organizationDTO.getAddressLine1());
        organization.setAddressLine2(organizationDTO.getAddressLine2());
        organization.setCity(organizationDTO.getCity());
        organization.setState(organizationDTO.getState());
        organization.setPostalCode(organizationDTO.getPostalCode());
        organization.setCountry(organizationDTO.getCountry());
        organization.setPhone(organizationDTO.getPhone());
        organization.setEmail(organizationDTO.getEmail());
        organization.setWebsite(organizationDTO.getWebsite());
        
        if (organizationDTO.getStatus() != null) {
            try {
                organization.setStatus(OrganizationEntity.OrganizationStatus.valueOf(organizationDTO.getStatus().toLowerCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid organization status");
            }
        }
        
        // Set organization type
        if (organizationDTO.getOrganizationTypeId() != null) {
            OrganizationTypeEntity organizationType = organizationTypeRepository.findById(organizationDTO.getOrganizationTypeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type not found"));
            organization.setOrganizationType(organizationType);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        
        // Create the organization
        OrganizationEntity createdOrganization = organizationService.createOrganization(organization);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new OrganizationDTO(createdOrganization));
    }

    /**
     * PUT /organizations/:id : Update an existing organization
     *
     * @param id the ID of the organization to update
     * @param organizationDTO the organization to update
     * @return the ResponseEntity with status 200 (OK) and the updated organization in body
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationDTO> updateOrganization(
            @PathVariable Long id,
            @RequestBody OrganizationDTO organizationDTO) {
        
        // Check if organization exists
        if (!organizationService.getOrganizationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert DTO to entity
        OrganizationEntity organization = new OrganizationEntity();
        organization.setName(organizationDTO.getName());
        organization.setExternalId(organizationDTO.getExternalId());
        organization.setAddressLine1(organizationDTO.getAddressLine1());
        organization.setAddressLine2(organizationDTO.getAddressLine2());
        organization.setCity(organizationDTO.getCity());
        organization.setState(organizationDTO.getState());
        organization.setPostalCode(organizationDTO.getPostalCode());
        organization.setCountry(organizationDTO.getCountry());
        organization.setPhone(organizationDTO.getPhone());
        organization.setEmail(organizationDTO.getEmail());
        organization.setWebsite(organizationDTO.getWebsite());
        
        if (organizationDTO.getStatus() != null) {
            try {
                organization.setStatus(OrganizationEntity.OrganizationStatus.valueOf(organizationDTO.getStatus().toLowerCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid organization status");
            }
        }
        
        // Set organization type
        if (organizationDTO.getOrganizationTypeId() != null) {
            OrganizationTypeEntity organizationType = organizationTypeRepository.findById(organizationDTO.getOrganizationTypeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type not found"));
            organization.setOrganizationType(organizationType);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        
        // Update the organization
        OrganizationEntity updatedOrganization = organizationService.updateOrganization(id, organization);
        return ResponseEntity.ok(new OrganizationDTO(updatedOrganization));
    }

    /**
     * DELETE /organizations/:id : Delete the organization with the specified ID
     *
     * @param id the ID of the organization to delete
     * @return the ResponseEntity with status 204 (NO_CONTENT)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        // Check if organization exists
        if (!organizationService.getOrganizationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Delete the organization
        boolean deleted = organizationService.deleteOrganization(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /organizations/:id/contacts : Get all contacts for an organization
     *
     * @param organizationId the ID of the organization
     * @return the ResponseEntity with status 200 (OK) and the list of contacts in body
     */
    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<Map<String, Object>>> getOrganizationContacts(@PathVariable("id") Long organizationId) {
        // Check if organization exists
        if (!organizationService.getOrganizationById(organizationId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<OrganizationContactEntity> contacts = organizationService.getOrganizationContacts(organizationId);
        List<Map<String, Object>> contactMaps = contacts.stream()
                .map(this::convertContactToMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(contactMaps);
    }

    /**
     * POST /organizations/:id/contacts : Add a contact to an organization
     *
     * @param organizationId the ID of the organization
     * @param contactMap the contact to add
     * @return the ResponseEntity with status 201 (Created) and the new contact in body
     */
    @PostMapping("/{id}/contacts")
    public ResponseEntity<Map<String, Object>> addOrganizationContact(
            @PathVariable("id") Long organizationId,
            @RequestBody Map<String, Object> contactMap) {
        
        // Check if organization exists
        if (!organizationService.getOrganizationById(organizationId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert map to entity
        OrganizationContactEntity contact = convertMapToContact(contactMap);
        
        // Add the contact to the organization
        OrganizationContactEntity createdContact = organizationService.addOrganizationContact(organizationId, contact);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertContactToMap(createdContact));
    }

    /**
     * PUT /organizations/:id/contacts/:contactId : Update a contact for an organization
     *
     * @param organizationId the ID of the organization
     * @param contactId the ID of the contact to update
     * @param contactMap the contact to update
     * @return the ResponseEntity with status 200 (OK) and the updated contact in body
     */
    @PutMapping("/{id}/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> updateOrganizationContact(
            @PathVariable("id") Long organizationId,
            @PathVariable("contactId") Long contactId,
            @RequestBody Map<String, Object> contactMap) {
        
        try {
            // Convert map to entity
            OrganizationContactEntity contact = convertMapToContact(contactMap);
            
            // Update the contact
            OrganizationContactEntity updatedContact = organizationService.updateOrganizationContact(
                    organizationId, contactId, contact);
            return ResponseEntity.ok(convertContactToMap(updatedContact));
            
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * DELETE /organizations/:id/contacts/:contactId : Delete a contact from an organization
     *
     * @param organizationId the ID of the organization
     * @param contactId the ID of the contact to delete
     * @return the ResponseEntity with status 204 (NO_CONTENT)
     */
    @DeleteMapping("/{id}/contacts/{contactId}")
    public ResponseEntity<Void> deleteOrganizationContact(
            @PathVariable("id") Long organizationId,
            @PathVariable("contactId") Long contactId) {
        
        try {
            // Delete the contact
            boolean deleted = organizationService.deleteOrganizationContact(organizationId, contactId);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * GET /organization-types : Get all organization types
     *
     * @return the ResponseEntity with status 200 (OK) and the list of organization types in body
     */
    @GetMapping("/organization-types")
    public ResponseEntity<List<OrganizationTypeDTO>> getAllOrganizationTypes() {
        List<OrganizationTypeEntity> organizationTypes = organizationTypeRepository.findAll();
        List<OrganizationTypeDTO> organizationTypeDTOs = organizationTypes.stream()
                .map(OrganizationTypeDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(organizationTypeDTOs);
    }
    
    /**
     * Helper method to convert an OrganizationContactEntity to a Map
     */
    private Map<String, Object> convertContactToMap(OrganizationContactEntity contact) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", contact.getId());
        map.put("organizationId", contact.getOrganization() != null ? contact.getOrganization().getId() : null);
        map.put("firstName", contact.getFirstName());
        map.put("lastName", contact.getLastName());
        map.put("title", contact.getTitle());
        map.put("email", contact.getEmail());
        map.put("phone", contact.getPhone());
        map.put("mobile", contact.getMobile());
        map.put("position", contact.getPosition());
        map.put("department", contact.getDepartment());
        map.put("contactType", contact.getContactType() != null ? contact.getContactType().name() : null);
        map.put("isPrimary", contact.getIsPrimary());
        map.put("createdAt", contact.getCreatedAt());
        map.put("updatedAt", contact.getUpdatedAt());
        return map;
    }
    
    /**
     * Helper method to convert a Map to an OrganizationContactEntity
     */
    private OrganizationContactEntity convertMapToContact(Map<String, Object> map) {
        OrganizationContactEntity contact = new OrganizationContactEntity();
        
        if (map.containsKey("firstName")) {
            contact.setFirstName((String) map.get("firstName"));
        }
        
        if (map.containsKey("lastName")) {
            contact.setLastName((String) map.get("lastName"));
        }
        
        if (map.containsKey("title")) {
            contact.setTitle((String) map.get("title"));
        }
        
        if (map.containsKey("email")) {
            contact.setEmail((String) map.get("email"));
        }
        
        if (map.containsKey("phone")) {
            contact.setPhone((String) map.get("phone"));
        }
        
        if (map.containsKey("mobile")) {
            contact.setMobile((String) map.get("mobile"));
        }
        
        if (map.containsKey("position")) {
            contact.setPosition((String) map.get("position"));
        }
        
        if (map.containsKey("department")) {
            contact.setDepartment((String) map.get("department"));
        }
        
        if (map.containsKey("isPrimary")) {
            contact.setIsPrimary((Boolean) map.get("isPrimary"));
        } else {
            contact.setIsPrimary(false);
        }
        
        if (map.containsKey("contactType") && map.get("contactType") != null) {
            try {
                contact.setContactType(OrganizationContactEntity.ContactType.valueOf((String) map.get("contactType")));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid contact type");
            }
        }
        
        return contact;
    }
}
