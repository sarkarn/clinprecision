package com.clinprecision.clinopsservice.visit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for unscheduled visit type information
 * Used to avoid circular reference issues when serializing VisitDefinitionEntity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnscheduledVisitTypeDto {
    
    private Long id;
    private String name;
    private String description;
    private String visitCode;
    private Integer visitOrder;
    private Boolean isRequired;
    
}
