package com.clinprecision.adminservice.site.command;

import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * Command to activate a clinical trial site
 * Regulatory compliance requires documented activation process
 */
public class ActivateSiteCommand {
    
    @TargetAggregateIdentifier
    private final String siteId;
    private final Long studyId;
    private final String userId;
    private final String reason;
    
    public ActivateSiteCommand(String siteId, Long studyId, String userId, String reason) {
        this.siteId = siteId;
        this.studyId = studyId;
        this.userId = userId;
        this.reason = reason;
    }

    public String getSiteId() { return siteId; }
    public Long getStudyId() { return studyId; }
    public String getUserId() { return userId; }
    public String getReason() { return reason; }
}