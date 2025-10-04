package com.clinprecision.siteservice.site.event;

import java.time.LocalDateTime;

/**
 * Domain event fired when a clinical trial site is activated
 * Site activation is now independent of study context.
 * Critical for regulatory compliance and study initiation.
 */
public class SiteActivatedEvent {
    
    private final String siteId;
    private final String userId;
    private final String reason;
    private final LocalDateTime timestamp;
    
    public SiteActivatedEvent(String siteId, String userId, String reason) {
        this.siteId = siteId;
        this.userId = userId;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    public String getSiteId() { return siteId; }
    public String getUserId() { return userId; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
