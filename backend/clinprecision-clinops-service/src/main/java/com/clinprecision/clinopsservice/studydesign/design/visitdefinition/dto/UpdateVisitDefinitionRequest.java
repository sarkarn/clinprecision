package com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a visit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVisitDefinitionRequest {
    
    private String name;
    private String description;
    private Integer timepoint;
    private Integer windowBefore;
    private Integer windowAfter;
    private String visitType; // BUGFIX: Added visitType field
    private Boolean isRequired;
    private Long updatedBy;
}
