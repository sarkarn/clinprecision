package com.clinprecision.adminservice.site.service;

import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinprecision.adminservice.repository.OrganizationRepository;
import com.clinprecision.adminservice.repository.SiteRepository;
import com.clinprecision.adminservice.site.command.ActivateSiteCommand;
import com.clinprecision.adminservice.site.command.AssignUserToSiteCommand;
import com.clinprecision.adminservice.site.command.CreateSiteCommand;
import com.clinprecision.adminservice.ui.model.CreateSiteDto;
import com.clinprecision.adminservice.ui.model.SiteDto;
import com.clinprecision.adminservice.ui.model.ActivateSiteDto;
import com.clinprecision.adminservice.ui.model.AssignUserToSiteDto;
import com.clinprecision.common.entity.SiteEntity;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Site Management Service using Axon Framework
 * 
 * This service orchestrates site management operations using CQRS + Event Sourcing:
 * - Commands are sent to aggregates for business logic
 * - Events are automatically stored for audit trail
 * - Read models are updated by projection handlers
 * 
 * Perfect for FDA 21 CFR Part 11 compliance requirements
 */
@Service
@Transactional
public class SiteManagementService {

    @Autowired
    private CommandGateway commandGateway;
    
    @Autowired
    private SiteRepository siteRepository; // For read operations
    
    @Autowired
    private OrganizationRepository organizationRepository;

    /**
     * Create a new clinical trial site
     * 
     * @param createSiteDto Site creation details
     * @param userId User creating the site (for audit)
     * @return Created site details
     */
    public SiteDto createSite(CreateSiteDto createSiteDto, String userId) {
        System.out.println("[SITE_CREATE] Starting site creation for: " + createSiteDto.getSiteNumber());
        
        // Validation
        if (siteRepository.findBySiteNumber(createSiteDto.getSiteNumber()).isPresent()) {
            System.out.println("[SITE_CREATE] ERROR: Site number already exists: " + createSiteDto.getSiteNumber());
            throw new IllegalArgumentException("Site number already exists: " + createSiteDto.getSiteNumber());
        }
        
        if (!organizationRepository.existsById(createSiteDto.getOrganizationId())) {
            System.out.println("[SITE_CREATE] ERROR: Organization not found: " + createSiteDto.getOrganizationId());
            throw new IllegalArgumentException("Organization not found: " + createSiteDto.getOrganizationId());
        }
        
        System.out.println("[SITE_CREATE] Validation passed for site: " + createSiteDto.getSiteNumber());
        
        // Generate unique site ID
        String siteId = UUID.randomUUID().toString();
        System.out.println("[SITE_CREATE] Generated UUID: " + siteId + " for site: " + createSiteDto.getSiteNumber());
        
        // Send command to aggregate - this will trigger event sourcing
        try {
            System.out.println("[SITE_CREATE] Sending CreateSiteCommand to Axon...");
            commandGateway.sendAndWait(new CreateSiteCommand(
                siteId,
                createSiteDto.getName(),
                createSiteDto.getSiteNumber(),
                createSiteDto.getOrganizationId(),
                createSiteDto.getAddressLine1(),
                createSiteDto.getAddressLine2(),
                createSiteDto.getCity(),
                createSiteDto.getState(),
                createSiteDto.getPostalCode(),
                createSiteDto.getCountry(),
                createSiteDto.getPhone(),
                createSiteDto.getEmail(),
                userId,
                createSiteDto.getReason()
            ));
            System.out.println("[SITE_CREATE] CreateSiteCommand sent successfully!");
        } catch (Exception e) {
            System.out.println("[SITE_CREATE] ERROR: Failed to send CreateSiteCommand: " + e.getMessage());
            e.printStackTrace();
            throw new IllegalStateException("Failed to create site - command failed: " + e.getMessage(), e);
        }
        
        System.out.println("[SITE_CREATE] Waiting for projection to create read model...");
        
        // The projection handler should have processed the event by now
        // Try multiple times with increasing delays to handle async processing
        SiteEntity createdSite = null;
        int attempts = 0;
        int maxAttempts = 10;
        
        while (attempts < maxAttempts && createdSite == null) {
            try {
                System.out.println("[SITE_CREATE] Attempt " + (attempts + 1) + "/" + maxAttempts + " - Looking for site: " + createSiteDto.getSiteNumber());
                
                createdSite = siteRepository.findBySiteNumber(createSiteDto.getSiteNumber())
                    .orElse(null);
                
                if (createdSite != null) {
                    System.out.println("[SITE_CREATE] SUCCESS: Found created site with DB ID: " + createdSite.getId());
                    break;
                }
                
                System.out.println("[SITE_CREATE] Site not found yet, waiting..." + (50 + (attempts * 25)) + "ms");
                
                // Wait a bit longer on each attempt
                Thread.sleep(50 + (attempts * 25)); // 50ms, 75ms, 100ms, etc.
                attempts++;
                
            } catch (InterruptedException e) {
                System.out.println("[SITE_CREATE] ERROR: Thread interrupted during site creation wait");
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Site creation was interrupted");
            }
        }
        
        if (createdSite == null) {
            System.out.println("[SITE_CREATE] CRITICAL ERROR: Site projection failed!");
            System.out.println("[SITE_CREATE] Site Number: " + createSiteDto.getSiteNumber());
            System.out.println("[SITE_CREATE] UUID: " + siteId);
            System.out.println("[SITE_CREATE] Attempts: " + attempts);
            
            // Check if there are any sites in the repository at all
            long totalSites = siteRepository.count();
            System.out.println("[SITE_CREATE] Total sites in database: " + totalSites);
            
            // List all site numbers for debugging
            List<SiteEntity> allSites = siteRepository.findAll();
            System.out.println("[SITE_CREATE] All existing site numbers: ");
            for (SiteEntity site : allSites) {
                System.out.println("  - " + site.getSiteNumber() + " (ID: " + site.getId() + ")");
            }
            
            throw new IllegalStateException(
                "Site projection failed after " + attempts + " attempts! " +
                "Expected site number: '" + createSiteDto.getSiteNumber() + "', " +
                "UUID: '" + siteId + "', " +
                "Total sites in DB: " + totalSites + ". " +
                "This indicates the projection handler may not be processing events correctly."
            );
        }
        
        System.out.println("[SITE_CREATE] Site creation completed successfully!");
        return mapToDto(createdSite);
    }

    /**
     * Activate a clinical trial site for a study
     * 
     * @param siteId Site to activate
     * @param activateDto Activation details
     * @param userId User performing activation
     * @return Updated site details
     */
    public SiteDto activateSite(Long siteId, ActivateSiteDto activateDto, String userId) {
        // Validation
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
        
        if (site.getStatus() != SiteEntity.SiteStatus.pending) {
            throw new IllegalArgumentException("Site must be in PENDING status to activate");
        }
        
        // Send command to aggregate
        commandGateway.sendAndWait(new ActivateSiteCommand(
            siteId.toString(),
            activateDto.getStudyId(),
            userId,
            activateDto.getReason()
        ));
        
        // Return updated site
        SiteEntity updatedSite = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalStateException("Site not found after activation"));
        
        return mapToDto(updatedSite);
    }

    /**
     * Assign a user to a clinical trial site
     * 
     * @param siteId Site ID
     * @param assignDto Assignment details
     * @param assignedBy User performing the assignment
     * @return Updated site details
     */
    public SiteDto assignUserToSite(Long siteId, AssignUserToSiteDto assignDto, String assignedBy) {
        // Validation
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
        
        // Send command to aggregate
        commandGateway.sendAndWait(new AssignUserToSiteCommand(
            siteId.toString(),
            assignDto.getUserId(),
            assignDto.getRoleId(),
            assignedBy,
            assignDto.getReason()
        ));
        
        // Return updated site
        SiteEntity updatedSite = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalStateException("Site not found after user assignment"));
        
        return mapToDto(updatedSite);
    }

    /**
     * Get all sites (read operation)
     */
    public List<SiteDto> getAllSites() {
        return siteRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get site by ID (read operation)
     */
    public SiteDto getSiteById(Long siteId) {
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
        return mapToDto(site);
    }

    /**
     * Get sites by organization (read operation)
     */
    public List<SiteDto> getSitesByOrganization(Long organizationId) {
        return siteRepository.findByOrganization_Id(organizationId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Map entity to DTO
     */
    private SiteDto mapToDto(SiteEntity entity) {
        SiteDto dto = new SiteDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSiteNumber(entity.getSiteNumber());
        dto.setOrganizationId(entity.getOrganization() != null ? entity.getOrganization().getId() : null);
        dto.setOrganizationName(entity.getOrganization() != null ? entity.getOrganization().getName() : null);
        dto.setAddressLine1(entity.getAddressLine1());
        dto.setAddressLine2(entity.getAddressLine2());
        dto.setCity(entity.getCity());
        dto.setState(entity.getState());
        dto.setPostalCode(entity.getPostalCode());
        dto.setCountry(entity.getCountry());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setStatus(entity.getStatus().name());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}