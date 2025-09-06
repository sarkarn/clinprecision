package com.clinprecision.studydesignservice.entity;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Entity class representing metadata for form fields in CRF definitions.
 * This class is serialized as part of the JSON structure in the form_definitions table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldMetadataEntity implements Serializable {

    // Basic field properties
    private String variableName;
    private String dataType;
    private boolean required;
    private String sdtmMapping;
    private String source;
    private String description;

    // Quality control flags from CRFBuilder
    private boolean sdvRequired;
    private boolean medicalReview;
    private boolean dataReview;
    private boolean criticalDataPoint;

    // Type-specific metadata
    // For text fields
    private Integer maxLength;
    private Boolean codingRequired;
    private String codingDictionary;

    // For number fields
    private String units;
    private String format;
    private Double minValue;
    private Double maxValue;

    // For date fields
    private Boolean allowPartialDate;
    private String qualifierField;

    // For select/radio/checkbox fields
    private List<FieldOptionEntity> options;

    // Validation rules
    private List<ValidationRuleEntity> validationRules;

    /**
     * Represents an option for select, radio, and checkbox fields
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldOptionEntity implements Serializable {
        private String value;
        private String label;
        private String code; // Optional standardized code (e.g., for SDTM controlled terminology)
    }

    /**
     * Represents a validation rule for a field
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationRuleEntity implements Serializable {
        private String type; // e.g., "range", "regex", "required", "custom"
        private String expression; // The rule expression or criteria
        private String message; // Error message to display
        private Map<String, Object> parameters; // Additional parameters for the rule
    }
}