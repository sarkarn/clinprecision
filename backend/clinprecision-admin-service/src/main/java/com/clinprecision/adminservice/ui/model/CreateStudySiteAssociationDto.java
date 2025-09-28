package com.clinprecision.adminservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating study-site associations
 */
public class CreateStudySiteAssociationDto {
    
    @NotNull(message = "Study ID is required")
    private String studyId;
    
    @NotBlank(message = "Reason is required for audit compliance")
    private String reason;

    // Constructors
    public CreateStudySiteAssociationDto() {}

    public CreateStudySiteAssociationDto(String studyId, String reason) {
        this.studyId = studyId;
        this.reason = reason;
    }

    // Getters and Setters
    public String getStudyId() { return studyId; }
    public void setStudyId(String studyId) { this.studyId = studyId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}