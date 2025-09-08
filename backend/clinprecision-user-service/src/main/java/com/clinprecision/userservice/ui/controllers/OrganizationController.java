package com.clinprecision.userservice.ui.controllers;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import com.clinprecision.userservice.data.OrganizationEntity;
import com.clinprecision.userservice.data.OrganizationTypeEntity;
import com.clinprecision.userservice.ui.model.OrganizationDto;
import com.clinprecision.userservice.ui.model.OrganizationTypeDto;
import com.clinprecision.userservice.mapper.OrganizationMapper;
import com.clinprecision.userservice.mapper.OrganizationTypeMapper;
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
    private final OrganizationMapper organizationMapper;
    private final OrganizationTypeMapper organizationTypeMapper;

    @Autowired
    public OrganizationController(OrganizationService organizationService,
                                 OrganizationTypeRepository organizationTypeRepository,
                                 OrganizationMapper organizationMapper,
                                 OrganizationTypeMapper organizationTypeMapper) {
        this.organizationService = organizationService;
        this.organizationTypeRepository = organizationTypeRepository;
        this.organizationMapper = organizationMapper;
        this.organizationTypeMapper = organizationTypeMapper;
    }

    /**
     * GET /organizations : Get all organizations
     *
     * @return the ResponseEntity with status 200 (OK) and the list of organizations in body
     */
    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        List<OrganizationEntity> organizations = organizationService.getAllOrganizations();
    List<OrganizationDto> organizationDtos = organizations.stream()
        .map(organizationMapper::toDto)
        .collect(Collectors.toList());
    return ResponseEntity.ok(organizationDtos);
    }

    /**
     * GET /organizations/:id : Get the organization with the specified ID
     *
     * @param id the ID of the organization to retrieve
     * @return the ResponseEntity with status 200 (OK) and the organization in body, or with status 404 (Not Found)
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable Long id) {
    return organizationService.getOrganizationById(id)
        .map(organization -> ResponseEntity.ok(organizationMapper.toDto(organization)))
        .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /organizations : Create a new organization
     *
     * @param organizationDTO the organization to create
     * @return the ResponseEntity with status 201 (Created) and the new organization in body
     */
    @PostMapping
    public ResponseEntity<OrganizationDto> createOrganization(@RequestBody OrganizationDto organizationDto) {
        // Convert DTO to entity
    OrganizationEntity organization = organizationMapper.toEntity(organizationDto);
        if (organizationDto.getOrganizationType() != null && organizationDto.getOrganizationType().getId() != null) {
            OrganizationTypeEntity organizationType = organizationTypeRepository.findById(organizationDto.getOrganizationType().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type not found"));
            organization.setOrganizationType(organizationType);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        OrganizationEntity createdOrganization = organizationService.createOrganization(organization);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(organizationMapper.toDto(createdOrganization));
    }

    /**
     * PUT /organizations/:id : Update an existing organization
     *
     * @param id the ID of the organization to update
     * @param organizationDTO the organization to update
     * @return the ResponseEntity with status 200 (OK) and the updated organization in body
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationDto> updateOrganization(
            @PathVariable Long id,
            @RequestBody OrganizationDto organizationDto) {
        if (!organizationService.getOrganizationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
    OrganizationEntity organization = organizationMapper.toEntity(organizationDto);
        if (organizationDto.getOrganizationType() != null && organizationDto.getOrganizationType().getId() != null) {
            OrganizationTypeEntity organizationType = organizationTypeRepository.findById(organizationDto.getOrganizationType().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type not found"));
            organization.setOrganizationType(organizationType);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        OrganizationEntity updatedOrganization = organizationService.updateOrganization(id, organization);
    return ResponseEntity.ok(organizationMapper.toDto(updatedOrganization));
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
    public ResponseEntity<List<OrganizationTypeDto>> getAllOrganizationTypes() {
        List<OrganizationTypeEntity> organizationTypes = organizationTypeRepository.findAll();
    List<OrganizationTypeDto> organizationTypeDtos = organizationTypes.stream()
        .map(organizationTypeMapper::toDto)
        .collect(Collectors.toList());
    return ResponseEntity.ok(organizationTypeDtos);
    }
    
    /**
     * Helper method to convert an OrganizationContactEntity to a Map
     */
    private Map<String, Object> convertContactToMap(OrganizationContactEntity contact) {
    Map<String, Object> map = new HashMap<>();
    map.put("id", contact.getId());
    map.put("organizationId", contact.getOrganization() != null ? contact.getOrganization().getId() : null);
    map.put("contactName", contact.getContactName());
    map.put("title", contact.getTitle());
    map.put("department", contact.getDepartment());
    map.put("email", contact.getEmail());
    map.put("phone", contact.getPhone());
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
        if (map.containsKey("contactName")) {
            contact.setContactName((String) map.get("contactName"));
        }
        if (map.containsKey("title")) {
            contact.setTitle((String) map.get("title"));
        }
        if (map.containsKey("department")) {
            contact.setDepartment((String) map.get("department"));
        }
        if (map.containsKey("email")) {
            contact.setEmail((String) map.get("email"));
        }
        if (map.containsKey("phone")) {
            contact.setPhone((String) map.get("phone"));
        }
        if (map.containsKey("isPrimary")) {
            contact.setIsPrimary((Boolean) map.get("isPrimary"));
        } else {
            contact.setIsPrimary(false);
        }
        return contact;
    }
}
