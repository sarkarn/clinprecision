package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "form_definitions")
@NoArgsConstructor
@AllArgsConstructor
public class FormDefinitionEntity {

    @Id
    @Column(name = "id")
    private String id = UUID.randomUUID().toString();

    @Column(name = "study_id", nullable = false)
    private String studyId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "version", nullable = false)
    private String version = "1.0";

    @Column(name = "is_latest_version")
    private boolean isLatestVersion = true;
    
    @Column(name = "parent_version_id")
    private String parentVersionId;
    
    @Column(name = "version_notes")
    private String versionNotes;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private FormStatus status = FormStatus.DRAFT;

    @Column(name = "template_id")
    private String templateId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fields", columnDefinition = "json", nullable = false)
    private List<FormFieldEntity> fields;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "is_locked")
    private boolean isLocked = false;

    public enum FormStatus {
        DRAFT, APPROVED, RETIRED
    }


}