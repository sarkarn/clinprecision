package com.clinprecision.clinopsservice.controller;

import com.clinprecision.clinopsservice.client.OrganizationServiceClient;
import com.clinprecision.common.dto.OrganizationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for proxying organization data from organization-service
 * This allows the frontend to get organization data through clinops-service
 * for Study Create/Edit dropdowns
 */
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Slf4j
public class OrganizationProxyController {

    private final OrganizationServiceClient organizationServiceClient;

    /**
     * Get all organizations
     * Proxies the request to organization-service
     * 
     * @return List of all organizations
     */
    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        log.info("Proxying request to get all organizations");
        return organizationServiceClient.getAllOrganizations();
    }

    /**
     * Get organization by ID
     * Proxies the request to organization-service
     * 
     * @param id Organization ID
     * @return Organization details
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDto> getOrganizationById(@PathVariable Long id) {
        log.info("Proxying request to get organization by ID: {}", id);
        return organizationServiceClient.getOrganizationById(id);
    }
}
