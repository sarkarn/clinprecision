package com.clinprecision.clinopsservice.studydesign.studymgmt.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a new study
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudyRequest {
    
    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String phase;
    private String indication;
    private String studyType;
    private String principalInvestigator;
    private Integer plannedSubjects;
    private Integer plannedSites;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private Long createdBy;
}
