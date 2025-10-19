package com.clinprecision.clinopsservice.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * UI display configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UIConfig {
    
    /** Placeholder text */
    private String placeholder;
    
    /** Help text or tooltip */
    private String helpText;
    
    /** Units of measurement */
    private String units;
    
    /** Position of units relative to value */
    private String unitsPosition; // prefix, suffix
    
    /** Options for radio/dropdown fields (static options) */
    private List<FieldOption> options;
    
    /** Option source configuration for dynamic options */
    private OptionSource optionSource;
    
    /** Label for checkbox fields */
    private String checkboxLabel;
    
    /** Default field value */
    private Object defaultValue;
    
    /** Whether field is read-only */
    private Boolean readOnly;
    
    /** Whether field is hidden */
    private Boolean hidden;
    
    /** Conditional display rules */
    private ConditionalDisplay conditionalDisplay;
    
    /**
     * Field option for radio/dropdown
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldOption {
        /** Option value */
        private String value;
        
        /** Display label */
        private String label;
        
        /** Option description */
        private String description;
        
        /** Display order */
        private Integer order;
        
        /** Coded value for standards */
        private String codingValue;
        
        /** Coding system (e.g., HL7) */
        private String codingSystem;
    }
    
    /**
     * Conditional display configuration
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConditionalDisplay {
        /** Field ID to check */
        private String field;
        
        /** Comparison operator */
        private String operator; // equals, notEquals, greaterThan, lessThan, contains, notContains
        
        /** Value to compare against */
        private Object value;
    }
    
    /**
     * Option source configuration for dynamic select lists
     * Specifies where options should be loaded from
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionSource {
        /** Source type */
        private SourceType type;
        
        /** Code list category (for CODE_LIST type) */
        private String category;
        
        /** API endpoint (for API type) */
        private String endpoint;
        
        /** Query parameters for API (for API type) */
        private String queryParams;
        
        /** Value field name in response */
        private String valueField; // default: "value"
        
        /** Label field name in response */
        private String labelField; // default: "label"
        
        /** Filter criteria */
        private String filter;
        
        /** Whether to cache results */
        private Boolean cacheable; // default: true
        
        /** Cache duration in seconds */
        private Integer cacheDuration; // default: 3600
    }
    
    /**
     * Source type enumeration
     */
    public enum SourceType {
        /** Static options defined in options array */
        STATIC,
        
        /** Load from centralized code list service */
        CODE_LIST,
        
        /** Load from API endpoint */
        API,
        
        /** Load from study-specific data (sites, investigators, etc.) */
        STUDY_DATA,
        
        /** Load from external standard (MedDRA, ICD-10, etc.) */
        EXTERNAL_STANDARD
    }
}
