package com.clinprecision.adminservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for activating a clinical trial site
 */
public class ActivateSiteDto {
    
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    @NotBlank(message = "Reason for activation is required for audit compliance")
    private String reason;

    // Constructors
    public ActivateSiteDto() {}

    public ActivateSiteDto(Long studyId, String reason) {
        this.studyId = studyId;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}