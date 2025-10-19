package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data quality rules
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DataQualityRules {
    
    /** Range validation checks */
    private List<RangeCheck> rangeChecks;
    
    /** Data consistency rules */
    private List<ConsistencyRule> consistencyRules;
    
    /** Cross-field validation rules */
    private List<CrossFieldValidation> crossFieldValidation;
    
    /** Duplicate checking configuration */
    private DuplicateCheck duplicateCheck;
    
    /**
     * Range check configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RangeCheck {
        /** Unique check identifier */
        private String checkId;
        
        /** Range check type */
        private String type; // normal, expected, possible, critical
        
        /** Minimum value */
        private Double min;
        
        /** Maximum value */
        private Double max;
        
        /** Action to take */
        private String action; // warning, error, query, info
        
        /** Message to display */
        private String message;
    }
    
    /**
     * Consistency rule
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsistencyRule {
        /** Unique rule identifier */
        private String ruleId;
        
        /** Consistency rule type */
        private String type; // temporal, logical, anatomical
        
        /** Related field IDs */
        private List<String> relatedFields;
        
        /** Rule expression */
        private String expression;
        
        /** Error message */
        private String message;
    }
    
    /**
     * Cross-field validation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CrossFieldValidation {
        /** Unique rule identifier */
        private String ruleId;
        
        /** Related field IDs */
        private List<String> relatedFields;
        
        /** Validation expression */
        private String expression;
        
        /** Error message */
        private String message;
        
        /** Severity level */
        private String severity; // error, warning, info
    }
    
    /**
     * Duplicate check configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DuplicateCheck {
        /** Enable duplicate checking */
        private Boolean enabled;
        
        /** Scope of duplicate check */
        private String scope; // visit, subject, study
        
        /** Fields to check for duplicates */
        private List<String> fields;
    }
}
