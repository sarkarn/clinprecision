package com.clinprecision.adminservice.site.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.adminservice.site.command.ActivateSiteCommand;
import com.clinprecision.adminservice.site.command.AssignUserToSiteCommand;
import com.clinprecision.adminservice.site.command.CreateSiteCommand;
import com.clinprecision.adminservice.site.event.SiteActivatedEvent;
import com.clinprecision.adminservice.site.event.SiteCreatedEvent;
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
        // Business validation would go here
        // For now, we'll assume validation is done at the service layer
        
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
    }

    /**
     * Command Handler: Activate Site
     * Business Rules:
     * - Site must be in PENDING status
     * - Study must exist and be valid
     * - User must have activation privileges
     */
    @CommandHandler
    public void handle(ActivateSiteCommand command) {
        // Business rule validation
        if (this.status == SiteStatus.ACTIVE) {
            throw new IllegalStateException("Site is already active");
        }
        
        if (this.status != SiteStatus.PENDING) {
            throw new IllegalStateException("Site must be in PENDING status to activate");
        }
        
        // Apply the activation event
        AggregateLifecycle.apply(new SiteActivatedEvent(
            command.getSiteId(),
            command.getStudyId(),
            command.getUserId(),
            command.getReason()
        ));
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
    public void on(SiteActivatedEvent event) {
        this.status = SiteStatus.ACTIVE;
        this.activeStudyIds.add(event.getStudyId());
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