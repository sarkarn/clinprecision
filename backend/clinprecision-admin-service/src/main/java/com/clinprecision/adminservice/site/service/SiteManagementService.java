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
        // Validation
        if (siteRepository.findBySiteNumber(createSiteDto.getSiteNumber()).isPresent()) {
            throw new IllegalArgumentException("Site number already exists: " + createSiteDto.getSiteNumber());
        }
        
        if (!organizationRepository.existsById(createSiteDto.getOrganizationId())) {
            throw new IllegalArgumentException("Organization not found: " + createSiteDto.getOrganizationId());
        }
        
        // Generate unique site ID
        String siteId = UUID.randomUUID().toString();
        
        // Send command to aggregate - this will trigger event sourcing
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
        
        // Return the created site (read from projection)
        SiteEntity createdSite = siteRepository.findById(Long.valueOf(siteId))
            .orElseThrow(() -> new IllegalStateException("Site was not created properly"));
        
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