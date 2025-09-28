package com.clinprecision.adminservice.site.event;

import java.time.LocalDateTime;

/**
 * Domain event fired when a clinical trial site is activated
 * Critical for regulatory compliance and study initiation
 */
public class SiteActivatedEvent {
    
    private final String siteId;
    private final Long studyId;
    private final String userId;
    private final String reason;
    private final LocalDateTime timestamp;
    
    public SiteActivatedEvent(String siteId, Long studyId, String userId, String reason) {
        this.siteId = siteId;
        this.studyId = studyId;
        this.userId = userId;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    public String getSiteId() { return siteId; }
    public Long getStudyId() { return studyId; }
    public String getUserId() { return userId; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
}