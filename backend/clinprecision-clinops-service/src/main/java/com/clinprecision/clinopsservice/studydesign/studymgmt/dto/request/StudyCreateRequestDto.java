package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for creating a new study via DDD aggregate
 * 
 * This DTO represents the HTTP request body for POST /api/studies
 * It will be converted to a CreateStudyCommand by StudyCommandMapper
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCreateRequestDto {
    
    // Required fields
    @NotBlank(message = "Study name is required")
    private String name;
    
    @NotNull(message = "Organization is required")
    private Long organizationId;
    
    // Optional fields - Basic Info
    private String protocolNumber;
    private String sponsor;
    private String description;
    private String objective;
    
    // Optional fields - Status & Phase
    private Long studyStatusId;
    private Long regulatoryStatusId;
    private Long studyPhaseId;
    
    // Optional fields - Dates
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    
    // Optional fields - Study Details
    private String studyType;
    private String indication;
    private String therapeuticArea;
    private String principalInvestigator;
    private String primaryObjective;
    private String primaryEndpoint;
    
    // Optional fields - Targets
    private Integer targetEnrollment;
    private Integer targetSites;
    
    // Optional fields - Version
    private String version;
    private Boolean isLatestVersion;
    
    // Optional fields - Classification
    private String blinding;
    private String randomization;
    private String controlType;
    
    // Optional fields - Additional
    private String notes;
    private String riskLevel;
    private List<StudyOrganizationAssociationRequestDto> organizations;
    private String metadata;
}



