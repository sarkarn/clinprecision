package com.clinprecision.adminservice.ui.model;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for updating study-site associations
 */
public class UpdateStudySiteAssociationDto {
    
    private Integer subjectEnrollmentCap;
    private Integer subjectEnrollmentCount;
    
    @NotBlank(message = "Reason is required for audit compliance")
    private String reason;

    // Constructors
    public UpdateStudySiteAssociationDto() {}

    public UpdateStudySiteAssociationDto(Integer subjectEnrollmentCap, Integer subjectEnrollmentCount, String reason) {
        this.subjectEnrollmentCap = subjectEnrollmentCap;
        this.subjectEnrollmentCount = subjectEnrollmentCount;
        this.reason = reason;
    }

    // Getters and Setters
    public Integer getSubjectEnrollmentCap() { return subjectEnrollmentCap; }
    public void setSubjectEnrollmentCap(Integer subjectEnrollmentCap) { this.subjectEnrollmentCap = subjectEnrollmentCap; }

    public Integer getSubjectEnrollmentCount() { return subjectEnrollmentCount; }
    public void setSubjectEnrollmentCount(Integer subjectEnrollmentCount) { this.subjectEnrollmentCount = subjectEnrollmentCount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
