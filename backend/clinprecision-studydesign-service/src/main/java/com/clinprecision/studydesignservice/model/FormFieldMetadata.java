package com.clinprecision.studydesignservice.model;


import com.clinprecision.studydesignservice.entity.FormFieldMetadataEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;
import java.util.Map;

/**
 * DTO for transferring form field metadata between layers.
 * Includes validation constraints for API requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldMetadata {

    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "Variable name must be uppercase and follow SDTM naming conventions")
    private String variableName;

    private String dataType;

    private boolean required;

    @Pattern(regexp = "^[A-Z]{2}\\.[A-Z0-9_]+$", message = "SDTM mapping must follow domain.variable format")
    private String sdtmMapping;

    private String source;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    // Quality control flags
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

    // For select/radio/checkbox fields
    @Valid
    private List<FieldOption> options;

    // Validation rules
    @Valid
    private List<ValidationRule> validationRules;

    /**
     * DTO for field options
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldOption {
        @NotBlank(message = "Option value is required")
        private String value;

        @NotBlank(message = "Option label is required")
        private String label;

        private String code;
    }

    /**
     * DTO for validation rules
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationRule {
        @NotBlank(message = "Rule type is required")
        private String type;

        private String expression;

        @NotBlank(message = "Error message is required")
        private String message;

        private Map<String, Object> parameters;
    }

    /**
     * Convert entity to DTO
     */
    public static FormFieldMetadata fromEntity(FormFieldMetadataEntity entity) {
        if (entity == null) {
            return null;
        }

        FormFieldMetadata dto = new FormFieldMetadata();
        dto.setVariableName(entity.getVariableName());
        dto.setDataType(entity.getDataType());
        dto.setRequired(entity.isRequired());
        dto.setSdtmMapping(entity.getSdtmMapping());
        dto.setSource(entity.getSource());
        dto.setDescription(entity.getDescription());

        // Quality control flags
        dto.setSdvRequired(entity.isSdvRequired());
        dto.setMedicalReview(entity.isMedicalReview());
        dto.setDataReview(entity.isDataReview());
        dto.setCriticalDataPoint(entity.isCriticalDataPoint());

        // Type-specific metadata
        dto.setMaxLength(entity.getMaxLength());
        dto.setCodingRequired(entity.getCodingRequired());
        dto.setCodingDictionary(entity.getCodingDictionary());
        dto.setUnits(entity.getUnits());
        dto.setFormat(entity.getFormat());
        dto.setMinValue(entity.getMinValue());
        dto.setMaxValue(entity.getMaxValue());
        dto.setAllowPartialDate(entity.getAllowPartialDate());
        dto.setQualifierField(entity.getQualifierField());

        // Convert options and validation rules if they exist
        if (entity.getOptions() != null) {
            dto.setOptions(entity.getOptions().stream()
                    .map(option -> new FormFieldMetadata.FieldOption(
                            option.getValue(),
                            option.getLabel(),
                            option.getCode()
                    ))
                    .toList());
        }

        if (entity.getValidationRules() != null) {
            dto.setValidationRules(entity.getValidationRules().stream()
                    .map(rule -> new FormFieldMetadata.ValidationRule(
                            rule.getType(),
                            rule.getExpression(),
                            rule.getMessage(),
                            rule.getParameters()
                    ))
                    .toList());
        }

        return dto;
    }

    /**
     * Convert DTO to entity
     */
    public FormFieldMetadataEntity toEntity() {
        FormFieldMetadataEntity entity = new FormFieldMetadataEntity();
        entity.setVariableName(this.variableName);
        entity.setDataType(this.dataType);
        entity.setRequired(this.required);
        entity.setSdtmMapping(this.sdtmMapping);
        entity.setSource(this.source);
        entity.setDescription(this.description);

        // Quality control flags
        entity.setSdvRequired(this.sdvRequired);
        entity.setMedicalReview(this.medicalReview);
        entity.setDataReview(this.dataReview);
        entity.setCriticalDataPoint(this.criticalDataPoint);

        // Type-specific metadata
        entity.setMaxLength(this.maxLength);
        entity.setCodingRequired(this.codingRequired);
        entity.setCodingDictionary(this.codingDictionary);
        entity.setUnits(this.units);
        entity.setFormat(this.format);
        entity.setMinValue(this.minValue);
        entity.setMaxValue(this.maxValue);
        entity.setAllowPartialDate(this.allowPartialDate);
        entity.setQualifierField(this.qualifierField);

        // Convert options and validation rules if they exist
        if (this.options != null) {
            entity.setOptions(this.options.stream()
                    .map(option -> new FormFieldMetadataEntity.FieldOptionEntity(
                            option.getValue(),
                            option.getLabel(),
                            option.getCode()
                    ))
                    .toList());
        }

        if (this.validationRules != null) {
            entity.setValidationRules(this.validationRules.stream()
                    .map(rule -> new FormFieldMetadataEntity.ValidationRuleEntity(
                            rule.getType(),
                            rule.getExpression(),
                            rule.getMessage(),
                            rule.getParameters()
                    ))
                    .toList());
        }

        return entity;
    }
}