package com.clinprecision.siteservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for activating a site for a specific study
 */
public class ActivateSiteForStudyDto {
    
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    @NotBlank(message = "Reason is required for audit compliance")
    private String reason;

    // Constructors
    public ActivateSiteForStudyDto() {}

    public ActivateSiteForStudyDto(Long studyId, String reason) {
        this.studyId = studyId;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
