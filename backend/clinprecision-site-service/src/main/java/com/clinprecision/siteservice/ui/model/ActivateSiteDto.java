package com.clinprecision.siteservice.ui.model;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for activating a clinical trial site
 * Site activation is now independent of study context.
 * Study-site associations are managed separately via SiteStudyEntity.
 */
public class ActivateSiteDto {
    
    @NotBlank(message = "Reason for activation is required for audit compliance")
    private String reason;

    // Constructors
    public ActivateSiteDto() {}

    public ActivateSiteDto(String reason) {
        this.reason = reason;
    }

    // Getters and Setters
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
