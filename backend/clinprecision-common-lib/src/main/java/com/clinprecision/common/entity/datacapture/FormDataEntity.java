package com.clinprecision.common.entity.datacapture;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "form_data")
@NoArgsConstructor
@AllArgsConstructor
public class FormDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "subject_visit_id", nullable = false)
    private Long subjectVisitId;

    @Column(name = "form_definition_id", nullable = false)
    private Long formDefinitionId;

    @Column(name = "form_version", nullable = false)
    private String formVersion;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private FormDataStatus status = FormDataStatus.NOT_STARTED;

    @Column(name = "data", columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> data;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "signed_by")
    private Long signedBy;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    public enum FormDataStatus {
        NOT_STARTED, INCOMPLETE, COMPLETE, SIGNED, LOCKED
    }
}