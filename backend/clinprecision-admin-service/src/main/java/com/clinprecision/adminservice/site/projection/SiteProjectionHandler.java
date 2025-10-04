package com.clinprecision.adminservice.site.projection;

import com.clinprecision.adminservice.repository.*;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserSiteAssignmentEntity;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.config.ProcessingGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.clinprecision.adminservice.site.event.SiteActivatedEvent;
import com.clinprecision.adminservice.site.event.SiteCreatedEvent;
import com.clinprecision.adminservice.site.event.SiteUpdatedEvent;
import com.clinprecision.adminservice.site.event.UserAssignedToSiteEvent;
import com.clinprecision.common.entity.SiteEntity;
import com.clinprecision.common.entity.SiteEntity.SiteStatus;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.annotation.PostConstruct;

/**
 * Site Projection Handler - Updates read models from events
 * 
 * This creates the read-side projections from domain events.
 * Separates the write model (aggregate) from read model (entity)
 * for CQRS pattern implementation.
 * 
 * Uses subscribing event processor for immediate synchronous processing
 */
@Component
@ProcessingGroup("site-projection")
@Transactional
public class SiteProjectionHandler {

    @Autowired
    private SiteRepository siteRepository;
    
    @Autowired
    private UserSiteAssignmentRepository userSiteAssignmentRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;

    // In-memory mapping from UUID to site number (for demo purposes)
    // In production, you'd use a database table or Redis for this mapping
    private final Map<String, String> uuidToSiteNumber = new ConcurrentHashMap<>();

    /**
     * Initialization method to confirm the handler is loaded
     */
    @PostConstruct
    public void init() {
        System.out.println("[PROJECTION] ========== SiteProjectionHandler INITIALIZED ==========");
        System.out.println("[PROJECTION] Handler is ready to process SiteCreatedEvent, SiteUpdatedEvent, SiteActivatedEvent, UserAssignedToSiteEvent");
        System.out.println("[PROJECTION] Processing Group: site-projection (subscribing/synchronous)");
        System.out.println("[PROJECTION] ========== Handler Registration Complete ==========");
    }

    /**
     * Handle Site Created Event
     * Creates the read model entity for queries
     */
    @EventHandler
    @Transactional
    public void on(SiteCreatedEvent event) {
        System.out.println("[PROJECTION] ========== SiteCreatedEvent Received ==========");
        System.out.println("[PROJECTION] Event UUID: " + event.getSiteId());
        System.out.println("[PROJECTION] Event SiteNumber: " + event.getSiteNumber());
        System.out.println("[PROJECTION] Event Name: " + event.getName());
        
        try {
            // Check if site already exists by site number or aggregate UUID
            SiteEntity existingSite = siteRepository.findBySiteNumber(event.getSiteNumber())
                .or(() -> siteRepository.findByAggregateUuid(event.getSiteId()))
                .orElse(null);
            
            if (existingSite != null) {
                System.out.println("[PROJECTION] Site already exists - updating aggregate UUID if needed");
                System.out.println("[PROJECTION] Existing site ID: " + existingSite.getId());
                System.out.println("[PROJECTION] Existing aggregate UUID: " + existingSite.getAggregateUuid());
                System.out.println("[PROJECTION] Event aggregate UUID: " + event.getSiteId());
                
                // If the existing site doesn't have an aggregate UUID, set it
                if (existingSite.getAggregateUuid() == null || existingSite.getAggregateUuid().isEmpty()) {
                    System.out.println("[PROJECTION] Updating existing site with aggregate UUID: " + event.getSiteId());
                    existingSite.setAggregateUuid(event.getSiteId());
                    siteRepository.save(existingSite);
                    System.out.println("[PROJECTION] Aggregate UUID updated successfully");
                } else {
                    System.out.println("[PROJECTION] Site already has aggregate UUID, no update needed");
                }
                
                // Store the mapping from UUID to site number for future lookups
                uuidToSiteNumber.put(event.getSiteId(), event.getSiteNumber());
                System.out.println("[PROJECTION] ========== SiteCreatedEvent Processing Complete (Existing Site) ==========");
                return;
            }
            
            // Create new site entity
            SiteEntity site = new SiteEntity();
            // Don't set ID - let database auto-generate it
            // But do set the aggregate UUID for Axon integration
            site.setAggregateUuid(event.getSiteId());
            site.setName(event.getName());
            site.setSiteNumber(event.getSiteNumber());
            
            System.out.println("[PROJECTION] Creating new SiteEntity with UUID: " + event.getSiteId() + ", name: " + event.getName() + ", siteNumber: " + event.getSiteNumber());
            
            // Set organization if provided
            if (event.getOrganizationId() != null) {
                System.out.println("[PROJECTION] Setting organization ID: " + event.getOrganizationId());
                organizationRepository.findById(event.getOrganizationId()).ifPresent(site::setOrganization);
            }
            
            site.setAddressLine1(event.getAddressLine1());
            site.setAddressLine2(event.getAddressLine2());
            site.setCity(event.getCity());
            site.setState(event.getState());
            site.setPostalCode(event.getPostalCode());
            site.setCountry(event.getCountry());
            site.setPhone(event.getPhone());
            site.setEmail(event.getEmail());
            site.setStatus(SiteStatus.pending);
            
            System.out.println("[PROJECTION] About to save new SiteEntity to database...");
            
            SiteEntity savedSite = siteRepository.saveAndFlush(site);
            
            System.out.println("[PROJECTION] SUCCESS: New site saved with DB ID: " + savedSite.getId());
            System.out.println("[PROJECTION] Saved site number: " + savedSite.getSiteNumber());
            System.out.println("[PROJECTION] Saved site name: " + savedSite.getName());
            
            // Store the mapping from UUID to site number for future lookups
            uuidToSiteNumber.put(event.getSiteId(), event.getSiteNumber());
            
            System.out.println("[PROJECTION] UUID-to-SiteNumber mapping stored: " + event.getSiteId() + " -> " + event.getSiteNumber());
            System.out.println("[PROJECTION] ========== SiteCreatedEvent Processing Complete (New Site) ==========");
            
        } catch (Exception e) {
            System.out.println("[PROJECTION] ERROR: Failed to process SiteCreatedEvent!");
            System.out.println("[PROJECTION] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process SiteCreatedEvent: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Site Updated Event
     * Updates the site information in the read model
     */
    @EventHandler
    @Transactional
    public void on(SiteUpdatedEvent event) {
        System.out.println("[PROJECTION] ========== SiteUpdatedEvent Received ==========");
        System.out.println("[PROJECTION] Event UUID: " + event.getSiteId());
        System.out.println("[PROJECTION] Event SiteNumber: " + event.getSiteNumber());
        System.out.println("[PROJECTION] Event Name: " + event.getName());
        
        try {
            // Find site by aggregate UUID
            SiteEntity site = siteRepository.findByAggregateUuid(event.getSiteId())
                .orElseThrow(() -> new IllegalStateException("Site not found with aggregate UUID: " + event.getSiteId()));
            
            System.out.println("[PROJECTION] Found site: " + site.getName() + " (" + site.getSiteNumber() + ")");
            System.out.println("[PROJECTION] Database ID: " + site.getId());
            
            // Update site fields
            site.setName(event.getName());
            site.setSiteNumber(event.getSiteNumber());
            
            // Update organization if provided
            if (event.getOrganizationId() != null) {
                System.out.println("[PROJECTION] Updating organization ID: " + event.getOrganizationId());
                organizationRepository.findById(event.getOrganizationId()).ifPresent(site::setOrganization);
            }
            
            site.setAddressLine1(event.getAddressLine1());
            site.setAddressLine2(event.getAddressLine2());
            site.setCity(event.getCity());
            site.setState(event.getState());
            site.setPostalCode(event.getPostalCode());
            site.setCountry(event.getCountry());
            site.setPhone(event.getPhone());
            site.setEmail(event.getEmail());
            // Note: Status is not updated here, only through activation/deactivation events
            
            System.out.println("[PROJECTION] About to save updated SiteEntity to database...");
            
            SiteEntity savedSite = siteRepository.saveAndFlush(site);
            
            System.out.println("[PROJECTION] SUCCESS: Site updated with DB ID: " + savedSite.getId());
            System.out.println("[PROJECTION] Updated site number: " + savedSite.getSiteNumber());
            System.out.println("[PROJECTION] Updated site name: " + savedSite.getName());
            
            // Update the mapping from UUID to site number
            uuidToSiteNumber.put(event.getSiteId(), event.getSiteNumber());
            
            System.out.println("[PROJECTION] ========== SiteUpdatedEvent Processing Complete ==========");
            
        } catch (Exception e) {
            System.out.println("[PROJECTION] ERROR: Failed to process SiteUpdatedEvent!");
            System.out.println("[PROJECTION] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process SiteUpdatedEvent: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Site Activated Event
     * Updates the site status to active
     */
    @EventHandler
    public void on(SiteActivatedEvent event) {
        System.out.println("[PROJECTION] ========== SiteActivatedEvent Received ===========");
        System.out.println("[PROJECTION] Event Site ID (UUID): " + event.getSiteId());
        System.out.println("[PROJECTION] Event User ID: " + event.getUserId());
        System.out.println("[PROJECTION] Event Reason: " + event.getReason());
        
        try {
            // Find site by aggregate UUID
            SiteEntity site = siteRepository.findByAggregateUuid(event.getSiteId())
                .orElseThrow(() -> new IllegalStateException("Site not found with aggregate UUID: " + event.getSiteId()));
            
            System.out.println("[PROJECTION] Found site: " + site.getName() + " (" + site.getSiteNumber() + ")");
            System.out.println("[PROJECTION] Current status: " + site.getStatus());
            
            // Update site status to active
            site.setStatus(SiteStatus.active);
            
            System.out.println("[PROJECTION] About to save site with new status: ACTIVE");
            siteRepository.saveAndFlush(site);
            
            System.out.println("[PROJECTION] Site activation completed successfully!");
            System.out.println("[PROJECTION] ========== SiteActivatedEvent Processing Complete ===========");
            
        } catch (Exception e) {
            System.out.println("[PROJECTION] ERROR: Failed to process SiteActivatedEvent!");
            System.out.println("[PROJECTION] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process SiteActivatedEvent: " + e.getMessage(), e);
        }
    }

    /**
     * Handle User Assigned to Site Event
     * Creates the user-site assignment record
     */
    @EventHandler
    public void on(UserAssignedToSiteEvent event) {
        // Fetch the entities
        UserEntity user = usersRepository.findById(event.getUserId())
            .orElseThrow(() -> new IllegalStateException("User not found: " + event.getUserId()));
        
        // Find site by aggregate UUID
        SiteEntity site = siteRepository.findByAggregateUuid(event.getSiteId())
            .orElseThrow(() -> new IllegalStateException("Site not found with aggregate UUID: " + event.getSiteId()));
            
        RoleEntity role = roleRepository.findById(event.getRoleId())
            .orElseThrow(() -> new IllegalStateException("Role not found: " + event.getRoleId()));
        
        // Create assignment
        UserSiteAssignmentEntity assignment = new UserSiteAssignmentEntity();
        assignment.setUser(user);
        assignment.setSite(site);
        assignment.setRoleCode(role.getName()); // Using name as code since there's no separate code field
        assignment.setRoleName(role.getName());
        assignment.setStatus(UserSiteAssignmentEntity.AssignmentStatus.ACTIVE);
        
        userSiteAssignmentRepository.save(assignment);
    }
}