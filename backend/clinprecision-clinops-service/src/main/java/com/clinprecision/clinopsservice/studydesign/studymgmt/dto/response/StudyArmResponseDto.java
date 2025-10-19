package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response;


import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.InterventionDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.RandomizationStrategyDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for study arm queries
 * Backward-compatible with frontend expectations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyArmResponseDto {
    
    private Long id;                    // Legacy numeric ID
    private UUID armUuid;               // Event sourcing UUID
    private UUID aggregateUuid;         // StudyDesign aggregate UUID
    private String name;
    private String description;
    private String type;
    private Integer sequence;
    private Integer plannedSubjects;
    private Long studyId;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Intervention information - structured data
    private List<InterventionDto> interventions;
    
    // Randomization strategy - structured data
    private RandomizationStrategyDto randomizationStrategy;
}
