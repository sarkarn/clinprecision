package com.clinprecision.studydesignservice.model;


import com.clinprecision.studydesignservice.entity.FormEntity;
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

    private Long id;

    private Long studyId;

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

    public FormEntity toEntity() {
        FormEntity entity = new FormEntity();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setDescription(this.description);
        
        // Set the other fields as needed
        // Note: Some field mappings may need to change based on the FormEntity structure
        
        return entity;
    }

    public static FormDefinition fromEntity(FormEntity entity) {
        if (entity == null) {
            return null;
        }

        FormDefinition dto = new FormDefinition();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        
        // Map the other fields as needed
        // Note: Some field mappings may need to change based on the FormEntity structure
        
        return dto;
    }
}