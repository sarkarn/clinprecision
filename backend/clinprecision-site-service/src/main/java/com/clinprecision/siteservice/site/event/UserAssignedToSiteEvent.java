package com.clinprecision.siteservice.site.event;

import java.time.LocalDateTime;

/**
 * Domain event fired when a user is assigned to a clinical trial site
 * Essential for access control and regulatory compliance
 */
public class UserAssignedToSiteEvent {
    
    private final String siteId;
    private final Long userId;
    private final Long roleId;
    private final String assignedBy;
    private final String reason;
    private final LocalDateTime timestamp;
    
    public UserAssignedToSiteEvent(String siteId, Long userId, Long roleId, 
                                  String assignedBy, String reason) {
        this.siteId = siteId;
        this.userId = userId;
        this.roleId = roleId;
        this.assignedBy = assignedBy;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    public String getSiteId() { return siteId; }
    public Long getUserId() { return userId; }
    public Long getRoleId() { return roleId; }
    public String getAssignedBy() { return assignedBy; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
