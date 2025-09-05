package com.clinprecision.studydesignservice.entity;

import com.vladmihalcea.hibernate.type.json.JsonStringType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "form_definitions")
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonStringType.class)
public class FormDefinition {

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

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private FormStatus status = FormStatus.DRAFT;

    @Column(name = "template_id")
    private String templateId;

    @Type(type = "json")
    @Column(name = "fields", columnDefinition = "json", nullable = false)
    private List<FormField> fields;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum FormStatus {
        DRAFT, APPROVED, RETIRED
    }
}