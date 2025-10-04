package com.clinprecision.siteservice.client;

import com.clinprecision.common.dto.OrganizationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for communicating with the Organization Service.
 * 
 * This client uses Eureka service discovery to locate the organization-ws service
 * and makes REST calls to retrieve organization data.
 */
@FeignClient(name = "organization-ws")
public interface OrganizationServiceClient {

    /**
     * Get all organizations
     * 
     * @return List of all organizations
     */
    @GetMapping("/api/organizations")
    ResponseEntity<List<OrganizationDto>> getAllOrganizations();

    /**
     * Get an organization by ID
     * 
     * @param id the organization ID
     * @return the organization DTO
     */
    @GetMapping("/api/organizations/{id}")
    ResponseEntity<OrganizationDto> getOrganizationById(@PathVariable("id") Long id);
}
