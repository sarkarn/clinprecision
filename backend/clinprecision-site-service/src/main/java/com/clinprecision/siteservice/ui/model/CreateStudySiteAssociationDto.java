package com.clinprecision.siteservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating study-site associations
 */
public class CreateStudySiteAssociationDto {
    
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    @NotBlank(message = "Reason is required for audit compliance")
    private String reason;

    // Constructors
    public CreateStudySiteAssociationDto() {}

    public CreateStudySiteAssociationDto(Long studyId, String reason) {
        this.studyId = studyId;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
