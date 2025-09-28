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

    /**
     * Handle Site Created Event
     * Creates the read model entity for queries
     */
    @EventHandler
    public void on(SiteCreatedEvent event) {
        SiteEntity site = new SiteEntity();
        site.setId(Long.valueOf(event.getSiteId()));
        site.setName(event.getName());
        site.setSiteNumber(event.getSiteNumber());
        // Note: We'll need to fetch OrganizationEntity by ID in a real implementation
        site.setAddressLine1(event.getAddressLine1());
        site.setAddressLine2(event.getAddressLine2());
        site.setCity(event.getCity());
        site.setState(event.getState());
        site.setPostalCode(event.getPostalCode());
        site.setCountry(event.getCountry());
        site.setPhone(event.getPhone());
        site.setEmail(event.getEmail());
        site.setStatus(SiteStatus.pending);
        
        siteRepository.save(site);
    }

    /**
     * Handle Site Activated Event
     * Updates the site status to active
     */
    @EventHandler
    public void on(SiteActivatedEvent event) {
        SiteEntity site = siteRepository.findById(Long.valueOf(event.getSiteId()))
            .orElseThrow(() -> new IllegalStateException("Site not found: " + event.getSiteId()));
        
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
        
        SiteEntity site = siteRepository.findById(Long.valueOf(event.getSiteId()))
            .orElseThrow(() -> new IllegalStateException("Site not found: " + event.getSiteId()));
            
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