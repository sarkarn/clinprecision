package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a form assignment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFormAssignmentRequest {
    
    private Boolean isRequired;
    private Boolean isConditional;
    private String conditionalLogic;
    private String instructions;
    private Long updatedBy;
}
