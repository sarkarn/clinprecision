package com.clinprecision.adminservice.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.clinprecision.adminservice.site.service.SiteManagementService;
import com.clinprecision.adminservice.ui.model.ActivateSiteDto;
import com.clinprecision.adminservice.ui.model.AssignUserToSiteDto;
import com.clinprecision.adminservice.ui.model.CreateSiteDto;
import com.clinprecision.adminservice.ui.model.SiteDto;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Site Management REST Controller
 * 
 * Provides endpoints for clinical trial site management using Axon Framework:
 * - Create new sites
 * - Activate sites for studies
 * - Assign users to sites
 * - Query site information
 * 
 * All operations are audit-compliant for FDA 21 CFR Part 11
 */
@RestController
@RequestMapping("/sites")
@Validated
public class SiteController {

    @Autowired
    private SiteManagementService siteManagementService;
    
    // Study-site association operations are handled in StudySiteAssociationController

    /**
     * Create a new clinical trial site
     */
    @PostMapping
    public ResponseEntity<SiteDto> createSite(
            @Valid @RequestBody CreateSiteDto createSiteDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        System.out.println("[CONTROLLER] ========== Site Creation Request Received ==========");
        System.out.println("[CONTROLLER] Site Name: " + createSiteDto.getName());
        System.out.println("[CONTROLLER] Site Number: " + createSiteDto.getSiteNumber());
        System.out.println("[CONTROLLER] Organization ID: " + createSiteDto.getOrganizationId());
        
        try {
            // Extract user ID from authentication or headers
            String userId = getUserId(authentication, userEmail, authorization);
            System.out.println("[CONTROLLER] User ID resolved: " + userId);
            
            System.out.println("[CONTROLLER] Calling SiteManagementService.createSite()...");
            SiteDto createdSite = siteManagementService.createSite(createSiteDto, userId);
            
            System.out.println("[CONTROLLER] Site creation successful! Returning site with ID: " + createdSite.getId());
            return new ResponseEntity<>(createdSite, HttpStatus.CREATED);
            
        } catch (Exception e) {
            System.out.println("[CONTROLLER] ERROR: Site creation failed!");
            System.out.println("[CONTROLLER] Error type: " + e.getClass().getSimpleName());
            System.out.println("[CONTROLLER] Error message: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to let the exception handler deal with it
        }
    }

    /**
     * Get all sites
     */
    @GetMapping
    public ResponseEntity<List<SiteDto>> getAllSites() {
        List<SiteDto> sites = siteManagementService.getAllSites();
        return ResponseEntity.ok(sites);
    }

    /**
     * Get site by ID
     */
    @GetMapping("/{siteId}")
    public ResponseEntity<SiteDto> getSiteById(@PathVariable Long siteId) {
        SiteDto site = siteManagementService.getSiteById(siteId);
        return ResponseEntity.ok(site);
    }

    /**
     * Get sites by organization
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<SiteDto>> getSitesByOrganization(@PathVariable Long organizationId) {
        List<SiteDto> sites = siteManagementService.getSitesByOrganization(organizationId);
        return ResponseEntity.ok(sites);
    }

    /**
     * Activate a site for a study
     */
    @PostMapping("/{siteId}/activate")
    public ResponseEntity<SiteDto> activateSite(
            @PathVariable Long siteId,
            @Valid @RequestBody ActivateSiteDto activateDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String userId = getUserId(authentication, userEmail, authorization);
        SiteDto activatedSite = siteManagementService.activateSite(siteId, activateDto, userId);
        
        return ResponseEntity.ok(activatedSite);
    }

    /**
     * Assign a user to a site
     */
    @PostMapping("/{siteId}/users")
    public ResponseEntity<SiteDto> assignUserToSite(
            @PathVariable Long siteId,
            @Valid @RequestBody AssignUserToSiteDto assignDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String assignedBy = getUserId(authentication, userEmail, authorization);
        SiteDto updatedSite = siteManagementService.assignUserToSite(siteId, assignDto, assignedBy);
        
        return ResponseEntity.ok(updatedSite);
    }

    /**
     * Exception handler for validation errors
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleValidationException(IllegalArgumentException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    /**
     * Exception handler for illegal state errors
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
    }

    /**
     * Exception handler for null authentication
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<String> handleNullPointerException(NullPointerException e) {
        if (e.getMessage() != null && e.getMessage().contains("authentication")) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Helper method to extract user ID from various sources
     */
    private String getUserId(Authentication authentication, String userEmail, String authorization) {
        // Try to get from authentication first
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        
        // Fall back to userEmail header (from API Gateway)
        if (userEmail != null && !userEmail.trim().isEmpty()) {
            return userEmail;
        }
        
        // Fall back to a default for testing/development
        if (authorization != null && authorization.startsWith("Bearer ")) {
            // In production, you would decode the JWT token here
            return "system"; // Default user for development
        }
        
        // If no authentication info available, throw exception
        throw new IllegalArgumentException("User authentication required but not provided");
    }
    // Study-site association endpoints were moved back to StudySiteAssociationController (/api/sites/*)
}