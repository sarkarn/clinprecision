package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for updating an existing study via DDD aggregate
 * 
 * This DTO represents the HTTP request body for PUT /api/studies/{uuid}
 * All fields are optional - only non-null fields will be updated
 * It will be converted to an UpdateStudyCommand by StudyCommandMapper
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyUpdateRequestDto {
    
    // Optional fields - only provided fields will be updated
    private Long organizationId;
    private String name;
    private String protocolNumber;
    private String sponsor;
    private String description;
    private String objective;
    
    // Status & Phase updates
    private Long studyStatusId;
    private Long regulatoryStatusId;
    private Long studyPhaseId;
    
    // Date updates
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    
    // Study details updates
    private String studyType;
    private String indication;
    private String therapeuticArea;
    private String principalInvestigator;
    
    // Target updates
    private Integer targetEnrollment;
    private Integer targetSites;
    
    // Version updates
    private String version;
    private Boolean isLatestVersion;
    
    // Classification updates
    private String blinding;
    private String randomization;
    private String controlType;
    
    // Additional updates
    private String notes;
    private String riskLevel;
}



