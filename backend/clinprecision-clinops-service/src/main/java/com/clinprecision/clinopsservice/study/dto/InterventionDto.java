package com.clinprecision.clinopsservice.study.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for intervention data
 * Used in study arm requests/responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionDto {
    
    private Long id;
    private String name;
    private String description;
    private String type; // DRUG, DEVICE, PROCEDURE, BEHAVIORAL, OTHER
    private String dosage;
    private String frequency;
    private String route;
}