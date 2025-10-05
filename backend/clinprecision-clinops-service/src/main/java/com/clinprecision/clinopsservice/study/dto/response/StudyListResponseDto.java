package com.clinprecision.clinopsservice.study.dto.response;

import com.clinprecision.clinopsservice.study.domain.valueobjects.StudyStatusCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * List Response DTO for Study entity
 * 
 * This DTO represents a summary view of a study for list operations (GET /api/studies)
 * Contains essential fields for list views to minimize payload size
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyListResponseDto {
    
    // DDD Identity
    private UUID studyAggregateUuid;
    
    // Legacy Identity (Bridge pattern - for backward compatibility)
    private Long id;
    
    // Basic Information
    private String name;
    private String protocolNumber;
    private String sponsor;
    
    // Organizational Context
    private Long organizationId;
    private String organizationName;
    
    // Study Dates (Summary)
    private LocalDate plannedStartDate;
    private LocalDate actualStartDate;
    
    // Study Targets (Summary)
    private Integer targetEnrollment;
    private Integer currentEnrollment;
    
    // Study Classification
    private String phase;
    private String studyType;
    
    // Study Status
    private StudyStatusCode status;
}
