package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for study response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyResponse {
    
    private Long id;
    private UUID aggregateUuid;
    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String phase;
    private String status;
    private Integer statusId;
    private String indication;
    private String studyType;
    private String principalInvestigator;
    private Integer plannedSubjects;
    private Integer plannedSites;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private Boolean closed;
    private String closureReason;
    private String closureNotes;
    private Long closedBy;
    private LocalDateTime closedAt;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
