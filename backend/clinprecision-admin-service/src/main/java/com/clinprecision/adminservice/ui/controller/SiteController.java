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
@RequestMapping("/admin-ws/sites")
@Validated
@CrossOrigin(origins = "*")
public class SiteController {

    @Autowired
    private SiteManagementService siteManagementService;

    /**
     * Create a new clinical trial site
     */
    @PostMapping
    public ResponseEntity<SiteDto> createSite(
            @Valid @RequestBody CreateSiteDto createSiteDto,
            Authentication authentication) {
        
        String userId = authentication.getName();
        SiteDto createdSite = siteManagementService.createSite(createSiteDto, userId);
        
        return new ResponseEntity<>(createdSite, HttpStatus.CREATED);
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
            Authentication authentication) {
        
        String userId = authentication.getName();
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
            Authentication authentication) {
        
        String assignedBy = authentication.getName();
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
}