package com.clinprecision.organizationservice.ui.controller;

import com.clinprecision.common.entity.OrganizationEntity;
import com.clinprecision.common.entity.OrganizationContactEntity;
import com.clinprecision.common.dto.OrganizationDto;
import com.clinprecision.organizationservice.service.OrganizationService;
import com.clinprecision.common.mapper.OrganizationMapper;
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
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationMapper organizationMapper;

    @Autowired
    public OrganizationController(OrganizationService organizationService,
                                 OrganizationMapper organizationMapper) {
        this.organizationService = organizationService;
        this.organizationMapper = organizationMapper;
    }

    /**
     * GET /api/organizations : Get all organizations
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
     * GET /api/organizations/:id : Get the organization with the specified ID
     *
     * @param id the ID of the organization to retrieve
     * @return the ResponseEntity with status 200 (OK) and the organization in body, or with status 404 (Not Found)
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable("id") Long id) {
        return organizationService.getOrganizationById(id)
            .map(organization -> ResponseEntity.ok(organizationMapper.toDto(organization)))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/organizations : Create a new organization
     *
     * @param organizationDTO the organization to create
     * @return the ResponseEntity with status 201 (Created) and the new organization in body
     */
    @PostMapping
    public ResponseEntity<OrganizationDto> createOrganization(@RequestBody OrganizationDto organizationDto) {
        OrganizationEntity organization = organizationMapper.toEntity(organizationDto);
        OrganizationEntity createdOrganization = organizationService.createOrganization(organization);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(organizationMapper.toDto(createdOrganization));
    }

    /**
     * PUT /api/organizations/:id : Update an existing organization
     *
     * @param id the ID of the organization to update
     * @param organizationDTO the organization to update
     * @return the ResponseEntity with status 200 (OK) and the updated organization in body
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationDto> updateOrganization(
            @PathVariable("id") Long id,
            @RequestBody OrganizationDto organizationDto) {
        
        if (!organizationService.getOrganizationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        OrganizationEntity organization = organizationMapper.toEntity(organizationDto);
        OrganizationEntity updatedOrganization = organizationService.updateOrganization(id, organization);
        return ResponseEntity.ok(organizationMapper.toDto(updatedOrganization));
    }

    /**
     * DELETE /api/organizations/:id : Delete the organization with the specified ID
     *
     * @param id the ID of the organization to delete
     * @return the ResponseEntity with status 204 (NO_CONTENT)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable("id") Long id) {
        if (!organizationService.getOrganizationById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        boolean deleted = organizationService.deleteOrganization(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/organizations/:id/contacts : Get all contacts for an organization
     *
     * @param organizationId the ID of the organization
     * @return the ResponseEntity with status 200 (OK) and the list of contacts in body
     */
    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<Map<String, Object>>> getOrganizationContacts(@PathVariable("id") Long organizationId) {
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
     * POST /api/organizations/:id/contacts : Add a contact to an organization
     *
     * @param organizationId the ID of the organization
     * @param contactMap the contact to add
     * @return the ResponseEntity with status 201 (Created) and the new contact in body
     */
    @PostMapping("/{id}/contacts")
    public ResponseEntity<Map<String, Object>> addOrganizationContact(
            @PathVariable("id") Long organizationId,
            @RequestBody Map<String, Object> contactMap) {
        
        if (!organizationService.getOrganizationById(organizationId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        OrganizationContactEntity contact = convertMapToContact(contactMap);
        OrganizationContactEntity createdContact = organizationService.addOrganizationContact(organizationId, contact);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertContactToMap(createdContact));
    }

    /**
     * PUT /api/organizations/:id/contacts/:contactId : Update a contact for an organization
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
            OrganizationContactEntity contact = convertMapToContact(contactMap);
            OrganizationContactEntity updatedContact = organizationService.updateOrganizationContact(
                    organizationId, contactId, contact);
            return ResponseEntity.ok(convertContactToMap(updatedContact));
            
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * DELETE /api/organizations/:id/contacts/:contactId : Delete a contact from an organization
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
