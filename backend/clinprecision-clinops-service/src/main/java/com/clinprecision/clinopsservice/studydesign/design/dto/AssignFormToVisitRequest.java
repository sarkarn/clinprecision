package com.clinprecision.clinopsservice.studydesign.design.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for assigning a form to a visit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignFormToVisitRequest {
    
    private UUID visitId;
    private UUID formId;
    private Boolean isRequired;
    private Boolean isConditional;
    private String conditionalLogic;
    private Integer displayOrder;
    private String instructions;
    private Long assignedBy;
}
