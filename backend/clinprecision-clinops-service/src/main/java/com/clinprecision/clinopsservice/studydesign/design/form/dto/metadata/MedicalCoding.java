package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Medical coding configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicalCoding {
    
    /** Medical dictionary to use */
    private String dictionary; // MedDRA, WHODrug, ICD-10, ICD-11, SNOMED-CT
    
    /** Dictionary version */
    private String version;
    
    /** MedDRA coding level */
    private String level; // PT, LLT, HLT, HLGT, SOC
    
    /** Enable automatic coding */
    private Boolean autoCode;
    
    /** Coding is required */
    private Boolean codeRequired;
    
    /** Allow multiple codes */
    private Boolean allowMultipleCodes;
    
    /** Coding query configuration */
    private CodingQuery codingQuery;
    
    /**
     * Coding query configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodingQuery {
        /** Auto-generate query for coding issues */
        private Boolean autoGenerateQuery;
        
        /** Threshold for auto-query generation */
        private String queryThreshold; // low, medium, high
    }
}
