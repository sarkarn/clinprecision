package com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for defining a visit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefineVisitDefinitionRequest {
    
    private String name;
    private String description;
    private Integer timepoint;
    private Integer windowBefore;
    private Integer windowAfter;
    private String visitType; // VisitType enum as string
    private Boolean isRequired;
    private Integer sequenceNumber;
    private UUID armId; // Optional for arm-specific visits
    private Long definedBy;
}
