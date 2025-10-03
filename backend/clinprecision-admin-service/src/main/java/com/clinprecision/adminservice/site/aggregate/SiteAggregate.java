package com.clinprecision.adminservice.site.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.adminservice.site.command.ActivateSiteCommand;
import com.clinprecision.adminservice.site.command.AssignUserToSiteCommand;
import com.clinprecision.adminservice.site.command.CreateSiteCommand;
import com.clinprecision.adminservice.site.command.UpdateSiteCommand;
import com.clinprecision.adminservice.site.event.SiteActivatedEvent;
import com.clinprecision.adminservice.site.event.SiteCreatedEvent;
import com.clinprecision.adminservice.site.event.SiteUpdatedEvent;
import com.clinprecision.adminservice.site.event.UserAssignedToSiteEvent;

import java.util.HashSet;
import java.util.Set;

/**
 * Site Aggregate - Core domain object for clinical trial site management
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail (FDA 21 CFR Part 11 compliance)
 * - Immutable event history
 * - Regulatory compliance tracking
 * 
 * This aggregate handles the complete lifecycle of a clinical trial site
 */
@Aggregate
public class SiteAggregate {

    @AggregateIdentifier
    private String siteId;
    
    private String name;
    private String siteNumber;
    private Long organizationId;
    private SiteStatus status;
    private Set<Long> assignedUserIds;
    private Set<Long> activeStudyIds;
    
    // Required default constructor for Axon
    public SiteAggregate() {
        this.assignedUserIds = new HashSet<>();
        this.activeStudyIds = new HashSet<>();
    }

    /**
     * Command Handler: Create Site
     * Business Rules:
     * - Site number must be unique
     * - Organization must exist
     * - All required fields must be provided
     */
    @CommandHandler
    public SiteAggregate(CreateSiteCommand command) {
        System.out.println("[AGGREGATE] ========== CreateSiteCommand Received ==========");
        System.out.println("[AGGREGATE] Command UUID: " + command.getSiteId());
        System.out.println("[AGGREGATE] Command SiteNumber: " + command.getSiteNumber());
        System.out.println("[AGGREGATE] Command Name: " + command.getName());
        
        // Business validation would go here
        // For now, we'll assume validation is done at the service layer
        
        try {
            System.out.println("[AGGREGATE] About to apply SiteCreatedEvent...");
            System.out.println("[AGGREGATE] Event will be applied with UUID: " + command.getSiteId());
            System.out.println("[AGGREGATE] Event will be applied with site number: " + command.getSiteNumber());
            
            // Apply the event - this triggers the event sourcing
            AggregateLifecycle.apply(new SiteCreatedEvent(
                command.getSiteId(),
                command.getName(),
                command.getSiteNumber(),
                command.getOrganizationId(),
                command.getAddressLine1(),
                command.getAddressLine2(),
                command.getCity(),
                command.getState(),
                command.getPostalCode(),
                command.getCountry(),
                command.getPhone(),
                command.getEmail(),
                command.getUserId(),
                command.getReason()
            ));
            
            System.out.println("[AGGREGATE] SiteCreatedEvent applied successfully!");
            System.out.println("[AGGREGATE] Event should now be processed by projection handlers...");
            System.out.println("[AGGREGATE] ========== CreateSiteCommand Processing Complete ==========");
            
        } catch (Exception e) {
            System.out.println("[AGGREGATE] ERROR: Failed to apply SiteCreatedEvent!");
            System.out.println("[AGGREGATE] Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process CreateSiteCommand: " + e.getMessage(), e);
        }
    }

    /**
     * Command Handler: Activate Site
     * Business Rules:
     * - Site must be in PENDING status
     * - User must have activation privileges
     * Site activation is now independent of study context.
     */
    @CommandHandler
    public void handle(ActivateSiteCommand command) {
        System.out.println("[AGGREGATE] ========== ActivateSiteCommand Received ==========");
        System.out.println("[AGGREGATE] Command Site ID: " + command.getSiteId());
        System.out.println("[AGGREGATE] Command User ID: " + command.getUserId());
        System.out.println("[AGGREGATE] Command Reason: " + command.getReason());
        System.out.println("[AGGREGATE] Current aggregate status: " + this.status);
        
        try {
            // Business rule validation
            if (this.status == SiteStatus.ACTIVE) {
                System.out.println("[AGGREGATE] ERROR: Site is already active");
                throw new IllegalStateException("Site is already active");
            }
            
            if (this.status != SiteStatus.PENDING) {
                System.out.println("[AGGREGATE] ERROR: Site status is not PENDING, cannot activate");
                throw new IllegalStateException("Site must be in PENDING status to activate");
            }
            
            System.out.println("[AGGREGATE] About to apply SiteActivatedEvent...");
            
            // Apply the activation event (no longer includes studyId)
            AggregateLifecycle.apply(new SiteActivatedEvent(
                command.getSiteId(),
                command.getUserId(),
                command.getReason()
            ));
            
            System.out.println("[AGGREGATE] SiteActivatedEvent applied successfully!");
            System.out.println("[AGGREGATE] Event should now be processed by projection handlers...");
            System.out.println("[AGGREGATE] ========== ActivateSiteCommand Processing Complete ==========");
            
        } catch (Exception e) {
            System.out.println("[AGGREGATE] ERROR: Failed to process ActivateSiteCommand!");
            System.out.println("[AGGREGATE] Error message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Command Handler: Update Site
     * Business Rules:
     * - Site must exist
     * - Site number must remain unique if changed
     * - Organization must exist
     */
    @CommandHandler
    public void handle(UpdateSiteCommand command) {
        System.out.println("[AGGREGATE] ========== UpdateSiteCommand Received ==========");
        System.out.println("[AGGREGATE] Command Site ID: " + command.getSiteId());
        System.out.println("[AGGREGATE] Command Site Number: " + command.getSiteNumber());
        System.out.println("[AGGREGATE] Command Name: " + command.getName());
        
        try {
            System.out.println("[AGGREGATE] About to apply SiteUpdatedEvent...");
            
            // Apply the site updated event
            AggregateLifecycle.apply(new SiteUpdatedEvent(
                command.getSiteId(),
                command.getName(),
                command.getSiteNumber(),
                command.getOrganizationId(),
                command.getAddressLine1(),
                command.getAddressLine2(),
                command.getCity(),
                command.getState(),
                command.getPostalCode(),
                command.getCountry(),
                command.getPhone(),
                command.getEmail(),
                command.getUserId(),
                command.getReason()
            ));
            
            System.out.println("[AGGREGATE] SiteUpdatedEvent applied successfully!");
            System.out.println("[AGGREGATE] Event should now be processed by projection handlers...");
            System.out.println("[AGGREGATE] ========== UpdateSiteCommand Processing Complete ==========");
            
        } catch (Exception e) {
            System.out.println("[AGGREGATE] ERROR: Failed to process UpdateSiteCommand!");
            System.out.println("[AGGREGATE] Error message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Command Handler: Assign User to Site
     * Business Rules:
     * - Site must be active or pending
     * - User cannot be assigned twice with same role
     * - Role must be valid for site context
     */
    @CommandHandler
    public void handle(AssignUserToSiteCommand command) {
        // Business rule validation
        if (this.status == SiteStatus.INACTIVE || this.status == SiteStatus.SUSPENDED) {
            throw new IllegalStateException("Cannot assign users to inactive or suspended sites");
        }
        
        // Apply the user assignment event
        AggregateLifecycle.apply(new UserAssignedToSiteEvent(
            command.getSiteId(),
            command.getUserId(),
            command.getRoleId(),
            command.getAssignedBy(),
            command.getReason()
        ));
    }

    // Event Sourcing Handlers - These rebuild the aggregate state from events

    @EventSourcingHandler
    public void on(SiteCreatedEvent event) {
        this.siteId = event.getSiteId();
        this.name = event.getName();
        this.siteNumber = event.getSiteNumber();
        this.organizationId = event.getOrganizationId();
        this.status = SiteStatus.PENDING; // New sites start as pending
        this.assignedUserIds = new HashSet<>();
        this.activeStudyIds = new HashSet<>();
    }

    @EventSourcingHandler
    public void on(SiteUpdatedEvent event) {
        this.name = event.getName();
        this.siteNumber = event.getSiteNumber();
        this.organizationId = event.getOrganizationId();
        // Status is not changed during update
    }

    @EventSourcingHandler
    public void on(SiteActivatedEvent event) {
        this.status = SiteStatus.ACTIVE;
        // Note: Study-site associations are now managed separately via SiteStudyEntity
    }

    @EventSourcingHandler
    public void on(UserAssignedToSiteEvent event) {
        this.assignedUserIds.add(event.getUserId());
    }

    // Site status enum
    public enum SiteStatus {
        PENDING,
        ACTIVE, 
        INACTIVE,
        SUSPENDED
    }

    // Getters for testing and debugging
    public String getSiteId() { return siteId; }
    public String getName() { return name; }
    public String getSiteNumber() { return siteNumber; }
    public Long getOrganizationId() { return organizationId; }
    public SiteStatus getStatus() { return status; }
    public Set<Long> getAssignedUserIds() { return assignedUserIds; }
    public Set<Long> getActiveStudyIds() { return activeStudyIds; }
}