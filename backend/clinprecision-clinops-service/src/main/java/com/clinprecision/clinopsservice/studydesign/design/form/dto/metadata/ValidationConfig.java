package com.clinprecision.clinopsservice.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Validation configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidationConfig {
    
    /** Whether the field is required */
    private Boolean required;
    
    /** Expected data type */
    private String type; // string, integer, decimal, date, datetime, time, email, phone, url
    
    /** Minimum string length */
    private Integer minLength;
    
    /** Maximum string length */
    private Integer maxLength;
    
    /** Minimum numeric value */
    private Double minValue;
    
    /** Maximum numeric value */
    private Double maxValue;
    
    /** Regular expression pattern */
    private String pattern;
    
    /** Human-readable pattern description */
    private String patternDescription;
    
    /** Number of decimal places allowed */
    private Integer decimalPlaces;
    
    /** Whether negative numbers are allowed */
    private Boolean allowNegative;
    
    /** Custom validation rules */
    private List<CustomValidationRule> customRules;
    
    /** Conditional validation rules */
    private List<ConditionalValidation> conditionalValidation;
    
    /**
     * Custom validation rule
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomValidationRule {
        /** Unique rule identifier */
        private String ruleId;
        
        /** Type of validation rule */
        private String ruleType; // range, consistency, format, business
        
        /** JavaScript expression to evaluate */
        private String expression;
        
        /** Error message to display */
        private String errorMessage;
        
        /** Severity level */
        private String severity; // error, warning, info
    }
    
    /**
     * Conditional validation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConditionalValidation {
        /** JavaScript condition expression */
        private String condition;
        
        /** Validation rules to apply when condition is true */
        private ValidationConfig rules;
    }
}
