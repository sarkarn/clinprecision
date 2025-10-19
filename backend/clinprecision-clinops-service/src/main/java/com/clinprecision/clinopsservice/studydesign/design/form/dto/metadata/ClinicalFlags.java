package com.clinprecision.clinopsservice.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clinical significance flags
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClinicalFlags {
    
    /** Source Data Verification required */
    private Boolean sdvRequired;
    
    /** Medical review required */
    private Boolean medicalReviewRequired;
    
    /** Critical data point */
    private Boolean criticalDataPoint;
    
    /** Safety data point */
    private Boolean safetyDataPoint;
    
    /** Efficacy data point */
    private Boolean efficacyDataPoint;
    
    /** Data review required */
    private Boolean dataReviewRequired;
    
    /** Medically significant data */
    private Boolean medicallySignificant;
    
    /** Requires ongoing monitoring */
    private Boolean requiresMonitoring;
    
    /** Requires source documentation */
    private Boolean requiresSourceDocumentation;
    
    /** Allowable deviation range */
    private DeviationRange allowableDeviationRange;
    
    /**
     * Deviation range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviationRange {
        /** Lower bound of allowable deviation */
        private Double lowerBound;
        
        /** Upper bound of allowable deviation */
        private Double upperBound;
        
        /** Units for deviation (%, absolute, etc.) */
        private String units;
    }
}
