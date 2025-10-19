package com.clinprecision.clinopsservice.studydesign.studymgmt.dto;

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
    
    private String id; // Can be either database ID (Long as String) or temporary ID (e.g., "INT-1759775992731")
    private String name;
    private String description;
    private String type; // DRUG, DEVICE, PROCEDURE, BEHAVIORAL, OTHER
    private String dosage;
    private String frequency;
    private String route;
}