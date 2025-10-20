package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for Study entity
 * 
 * This DTO represents the full study details returned from GET /api/studies/{uuid}
 * Includes both aggregate UUID (DDD) and legacy ID for backward compatibility
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyResponseDto {
    
    // DDD Identity
    private UUID studyAggregateUuid;
    
    // Legacy Identity (Bridge pattern - for backward compatibility)
    private Long id;
    
    // Basic Information
    private String name;
    private String protocolNumber;
    private String sponsor;
    private String description;
    private String primaryObjective;
    
    // Organizational Context
    private Long organizationId;
    private String organizationName;
    private List<StudyOrganizationAssociationResponseDto> organizations;
    
    // Study Dates
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    
    // Study Targets
    private Integer targetEnrollment;
    private Integer targetSites;
    
    // Study Phase and Classification
    private Long studyPhaseId;  // Study phase ID for dropdown selection
    private String phase;       // Study phase name for display
    private String studyType;
    private String therapeuticArea;
    
    // Regulatory Information
    private Long regulatoryStatusId;    // Regulatory status ID for dropdown selection
    private String regulatoryStatus;    // Regulatory status name for display
    private String indNumber;
    private String protocolVersionNumber;
    
    // Contact Information
    private String principalInvestigator;
    private String medicalMonitor;
    private String contactEmail;
    
    // Study Status
    private Long studyStatusId;         // Study status ID for dropdown selection
    private StudyStatusCode status;     // Study status code for display
    private String statusReason;
    private LocalDateTime statusChangedAt;
    private String statusChangedBy;
    
    // Audit Trail
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Metadata - JSON field containing additional flexible study data
    // Includes: fdaInd, ethicsApproval, studyCoordinator, medicalMonitor, etc.
    private String metadata;
}



