package com.clinprecision.siteservice.site.command;

import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * Command to assign a user to a clinical trial site
 * Critical for regulatory compliance and access control
 */
public class AssignUserToSiteCommand {
    
    @TargetAggregateIdentifier
    private final String siteId;
    private final Long userId;
    private final Long roleId;
    private final String assignedBy;
    private final String reason;
    
    public AssignUserToSiteCommand(String siteId, Long userId, Long roleId, 
                                  String assignedBy, String reason) {
        this.siteId = siteId;
        this.userId = userId;
        this.roleId = roleId;
        this.assignedBy = assignedBy;
        this.reason = reason;
    }

    public String getSiteId() { return siteId; }
    public Long getUserId() { return userId; }
    public Long getRoleId() { return roleId; }
    public String getAssignedBy() { return assignedBy; }
    public String getReason() { return reason; }
}
