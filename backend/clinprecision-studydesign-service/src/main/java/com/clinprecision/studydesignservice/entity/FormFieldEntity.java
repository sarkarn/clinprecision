package com.clinprecision.studydesignservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormField {

    private String type;
    private String label;
    private String width;
    private int widthPercent;
    private String height;
    private FieldMetadata metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldMetadata {
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
        private Integer maxLength;
        private Boolean codingRequired;
        private String codingDictionary;
        private String units;
        private String format;
        private Double minValue;
        private Double maxValue;
        private Boolean allowPartialDate;
        private String qualifierField;

        // For select/radio fields
        private Map<String, String>[] options;
    }
}