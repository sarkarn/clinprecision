package com.clinprecision.siteservice.site.command;

import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * Command to activate a clinical trial site
 * Site activation is now independent of study context.
 * Regulatory compliance requires documented activation process.
 */
public class ActivateSiteCommand {
    
    @TargetAggregateIdentifier
    private final String siteId;
    private final String userId;
    private final String reason;
    
    public ActivateSiteCommand(String siteId, String userId, String reason) {
        this.siteId = siteId;
        this.userId = userId;
        this.reason = reason;
    }

    public String getSiteId() { return siteId; }
    public String getUserId() { return userId; }
    public String getReason() { return reason; }
}
