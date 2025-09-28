package com.clinprecision.adminservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for activating a site for a specific study
 */
public class ActivateSiteForStudyDto {
    
    @NotNull(message = "Study ID is required")
    private String studyId;
    
    @NotBlank(message = "Reason is required for audit compliance")
    private String reason;

    // Constructors
    public ActivateSiteForStudyDto() {}

    public ActivateSiteForStudyDto(String studyId, String reason) {
        this.studyId = studyId;
        this.reason = reason;
    }

    // Getters and Setters
    public String getStudyId() { return studyId; }
    public void setStudyId(String studyId) { this.studyId = studyId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}