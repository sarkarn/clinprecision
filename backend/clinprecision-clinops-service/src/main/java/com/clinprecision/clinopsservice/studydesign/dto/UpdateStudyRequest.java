package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for updating study details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudyRequest {
    
    private UUID studyId;
    private String name;
    private String description;
    private String indication;
    private String studyType;
    private String principalInvestigator;
    private Integer plannedSubjects;
    private Integer plannedSites;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private Long updatedBy;
}
