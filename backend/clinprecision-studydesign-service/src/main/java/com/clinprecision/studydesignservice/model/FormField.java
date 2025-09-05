package com.clinprecision.studydesignservice.model;


import com.clinprecision.studydesignservice.entity.FormFieldEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO for transferring form field data between layers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormField {

    @NotBlank(message = "Field type is required")
    private String type;

    @NotBlank(message = "Field label is required")
    private String label;

    private String width;

    @Min(value = 1, message = "Width percentage must be at least 1%")
    @Max(value = 100, message = "Width percentage cannot exceed 100%")
    private int widthPercent;

    private String height;

    @Valid
    @NotNull(message = "Field metadata is required")
    private FormFieldMetadata metadata;

    /**
     * Convert entity to DTO
     */
    public static FormField fromEntity(FormFieldEntity entity) {
        if (entity == null) {
            return null;
        }

        return FormField.builder()
                .type(entity.getType())
                .label(entity.getLabel())
                .width(entity.getWidth())
                .widthPercent(entity.getWidthPercent())
                .height(entity.getHeight())
                .metadata(FormFieldMetadata.fromEntity(entity.getMetadata()))
                .build();
    }

    /**
     * Convert DTO to entity
     */
    public FormFieldEntity toEntity() {
        FormFieldEntity entity = new FormFieldEntity();
        entity.setType(this.type);
        entity.setLabel(this.label);
        entity.setWidth(this.width);
        entity.setWidthPercent(this.widthPercent);
        entity.setHeight(this.height);

        if (this.metadata != null) {
            entity.setMetadata(this.metadata.toEntity());
        }

        return entity;
    }
}