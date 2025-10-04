package com.clinprecision.userservice.feign;

import com.clinprecision.common.dto.OrganizationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for calling organization-ws microservice.
 * This replaces direct OrganizationRepository access in users-ws.
 */
@FeignClient(name = "organization-ws")
public interface OrganizationServiceClient {
    
    /**
     * Get organization by ID from organization-ws.
     * 
     * @param id Organization ID
     * @return Organization DTO or null if not found
     */
    @GetMapping("/api/organizations/{id}")
    OrganizationDto getOrganizationById(@PathVariable("id") Long id);
}
