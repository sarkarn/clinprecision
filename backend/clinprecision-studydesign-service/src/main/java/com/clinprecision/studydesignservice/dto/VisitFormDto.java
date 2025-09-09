package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for VisitFormEntity
 * Represents the association between a visit definition and a form
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VisitFormDto {
    
    private Long id;
    private Long visitDefinitionId;
    private Long formId;
    private String displayName;
    private Integer displayOrder;
    private boolean isRequired;
    private boolean isRepeatable;
    private Integer maxOccurrences;
    private String conditionalLogic;
    private String metadata;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    
    // Include nested DTOs for related entities
    private FormDto form;
    private FormVersionDto activeFormVersion;
}
