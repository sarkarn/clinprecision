package com.clinprecision.adminservice.site.projection;

import org.axonframework.eventhandling.EventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.clinprecision.adminservice.repository.SiteRepository;
import com.clinprecision.adminservice.repository.UserSiteAssignmentRepository;
import com.clinprecision.adminservice.repository.UsersRepository;
import com.clinprecision.adminservice.repository.RoleRepository;
import com.clinprecision.adminservice.site.event.SiteActivatedEvent;
import com.clinprecision.adminservice.site.event.SiteCreatedEvent;
import com.clinprecision.adminservice.site.event.UserAssignedToSiteEvent;
import com.clinprecision.common.entity.SiteEntity;
import com.clinprecision.common.entity.SiteEntity.SiteStatus;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserSiteAssignmentEntity;
import com.clinprecision.common.entity.UserSiteAssignmentEntity.AssignmentStatus;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Site Projection Handler - Updates read models from events
 * 
 * This creates the read-side projections from domain events.
 * Separates the write model (aggregate) from read model (entity)
 * for CQRS pattern implementation.
 */
@Component
public class SiteProjectionHandler {

    @Autowired
    private SiteRepository siteRepository;
    
    @Autowired
    private UserSiteAssignmentRepository userSiteAssignmentRepository;
    
    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    // In-memory mapping from UUID to site number (for demo purposes)
    // In production, you'd use a database table or Redis for this mapping
    private final Map<String, String> uuidToSiteNumber = new ConcurrentHashMap<>();

    /**
     * Handle Site Created Event
     * Creates the read model entity for queries
     */
    @EventHandler
    public void on(SiteCreatedEvent event) {
        System.out.println("[PROJECTION] ========== SiteCreatedEvent Received ==========");
        System.out.println("[PROJECTION] Event UUID: " + event.getSiteId());
        System.out.println("[PROJECTION] Event SiteNumber: " + event.getSiteNumber());
        System.out.println("[PROJECTION] Event Name: " + event.getName());
        
        try {
            SiteEntity site = new SiteEntity();
            // Don't set ID - let database auto-generate it
            site.setName(event.getName());
            site.setSiteNumber(event.getSiteNumber());
            
            System.out.println("[PROJECTION] Creating SiteEntity with name: " + event.getName() + ", siteNumber: " + event.getSiteNumber());
            
            // Set organization if provided
            if (event.getOrganizationId() != null) {
                System.out.println("[PROJECTION] Setting organization ID: " + event.getOrganizationId());
                // In a full implementation, we'd fetch the OrganizationEntity
                // For now, we'll create a simple organization reference
                // site.setOrganization(organizationRepository.findById(event.getOrganizationId()).orElse(null));
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
            
            System.out.println("[PROJECTION] About to save SiteEntity to database...");
            
            SiteEntity savedSite = siteRepository.save(site);
            
            System.out.println("[PROJECTION] SUCCESS: Site saved with DB ID: " + savedSite.getId());
            
            // Store the mapping from UUID to site number for future lookups
            uuidToSiteNumber.put(event.getSiteId(), event.getSiteNumber());
            
            System.out.println("[PROJECTION] UUID-to-SiteNumber mapping stored: " + event.getSiteId() + " -> " + event.getSiteNumber());
            System.out.println("[PROJECTION] ========== SiteCreatedEvent Processing Complete ==========");
            
        } catch (Exception e) {
            System.out.println("[PROJECTION] ERROR: Failed to process SiteCreatedEvent!");
            System.out.println("[PROJECTION] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process SiteCreatedEvent: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Site Activated Event
     * Updates the site status to active
     */
    @EventHandler
    public void on(SiteActivatedEvent event) {
        // Find site by site number using our UUID mapping
        String siteNumber = uuidToSiteNumber.get(event.getSiteId());
        if (siteNumber == null) {
            throw new IllegalStateException("Site UUID not found in mapping: " + event.getSiteId());
        }
        
        SiteEntity site = siteRepository.findBySiteNumber(siteNumber)
            .orElseThrow(() -> new IllegalStateException("Site not found for UUID: " + event.getSiteId()));
        
        site.setStatus(SiteStatus.active);
        siteRepository.save(site);
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
        
        // Find site by site number using our UUID mapping
        String siteNumber = uuidToSiteNumber.get(event.getSiteId());
        if (siteNumber == null) {
            throw new IllegalStateException("Site UUID not found in mapping: " + event.getSiteId());
        }
        
        SiteEntity site = siteRepository.findBySiteNumber(siteNumber)
            .orElseThrow(() -> new IllegalStateException("Site not found for UUID: " + event.getSiteId()));
            
        RoleEntity role = roleRepository.findById(event.getRoleId())
            .orElseThrow(() -> new IllegalStateException("Role not found: " + event.getRoleId()));
        
        // Create assignment
        UserSiteAssignmentEntity assignment = new UserSiteAssignmentEntity();
        assignment.setUser(user);
        assignment.setSite(site);
        assignment.setRoleCode(role.getName()); // Using name as code since there's no separate code field
        assignment.setRoleName(role.getName());
        assignment.setStatus(AssignmentStatus.ACTIVE);
        
        userSiteAssignmentRepository.save(assignment);
    }
}