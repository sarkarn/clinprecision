package com.clinprecision.clinopsservice.studydesign.studymgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for randomization strategy data
 * Used in study arm requests/responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RandomizationStrategyDto {
    
    private String type; // SIMPLE, BLOCK, STRATIFIED, ADAPTIVE
    private String ratio; // e.g., "1:1", "2:1", "1:1:1"
    private Integer blockSize;
    private String stratificationFactors;
    private String notes;
}