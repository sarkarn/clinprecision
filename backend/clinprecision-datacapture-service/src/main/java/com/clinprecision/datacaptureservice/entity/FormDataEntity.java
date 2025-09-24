package com.clinprecision.datacaptureservice.entity;

import com.vladmihalcea.hibernate.type.json.JsonStringType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;



import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "form_data")
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonStringType.class)
public class FormDataEntity {

    @Id
    @Column(name = "id")
    private String id = UUID.randomUUID().toString();

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "subject_visit_id", nullable = false)
    private String subjectVisitId;

    @Column(name = "form_definition_id", nullable = false)
    private String formDefinitionId;

    @Column(name = "form_version", nullable = false)
    private String formVersion;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private FormDataStatus status = FormDataStatus.NOT_STARTED;

    @Type(type = "json")
    @Column(name = "data", columnDefinition = "json")
    private Map<String, Object> data;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "signed_by")
    private String signedBy;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    public enum FormDataStatus {
        NOT_STARTED, INCOMPLETE, COMPLETE, SIGNED, LOCKED
    }
}