package com.clinprecision.studydesignservice.dto;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for VisitDefinitionEntity
 * Represents a study visit definition with its properties and associated forms
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VisitDefinitionDto {
    
    private Long id;
    private Long studyId;
    private Long armId;
    private String name;
    private Integer visitNumber;
    private String description;
    private VisitDefinitionEntity.VisitType visitType;
    private Integer windowBeforeDays;
    private Integer windowAfterDays;
    private Integer dayOffset;
    private String conditionalLogic;
    private String metadata;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    
    // Include associated study arm if available
    private StudyArmDto arm;
    
    // Include the list of forms associated with this visit
    private List<VisitFormDto> visitForms;
}
