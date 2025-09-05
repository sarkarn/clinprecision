package com.clinprecision.studydesignservice.model;


import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormDefinition {

    private String id = UUID.randomUUID().toString();

    private String studyId;

    private String name;

    private String description;

    private String version = "1.0";

    @Enumerated(EnumType.STRING)
    private FormStatus status = FormStatus.DRAFT;

    private String templateId;

    private List<FormField> fields;

    private String createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum FormStatus {
        DRAFT, APPROVED, RETIRED
    }

    public FormDefinitionEntity toEntity() {
        FormDefinitionEntity entity = new FormDefinitionEntity();
        entity.setId(this.id);
        entity.setStudyId(this.studyId);
        entity.setName(this.name);
        entity.setDescription(this.description);
        entity.setVersion(this.version);

        if (this.status != null) {
            entity.setStatus(FormDefinitionEntity.FormStatus.valueOf(this.status.name()));
        }

        entity.setTemplateId(this.templateId);
        entity.setCreatedBy(this.createdBy);
        entity.setCreatedAt(this.createdAt);
        entity.setUpdatedAt(this.updatedAt);

        // Convert fields list using existing conversion method in FormField
        if (this.fields != null) {
            entity.setFields(this.fields.stream()
                    .map(FormField::toEntity)
                    .toList());
        }

        return entity;
    }

    public static FormDefinition fromEntity(FormDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }

        FormDefinition dto = new FormDefinition();
        dto.setId(entity.getId());
        dto.setStudyId(entity.getStudyId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setVersion(entity.getVersion());
        dto.setStatus(FormDefinition.FormStatus.valueOf(entity.getStatus().name()));
        dto.setTemplateId(entity.getTemplateId());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Convert fields list using existing conversion method in FormField
        if (entity.getFields() != null) {
            dto.setFields(entity.getFields().stream()
                    .map(FormField::fromEntity)
                    .toList());
        }

        return dto;
    }
}