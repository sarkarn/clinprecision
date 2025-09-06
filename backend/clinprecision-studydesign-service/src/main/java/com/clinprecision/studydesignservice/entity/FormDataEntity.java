package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing form data entries submitted for subjects.
 * This entity maintains a direct reference to the specific form version
 * used for data collection.
 */
@Data
@Entity
@Table(name = "form_data")
@NoArgsConstructor
@AllArgsConstructor
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

    /**
     * Specific version of the form used for this data entry
     * This ensures data integrity even if the form definition is updated
     */
    @Column(name = "form_version", nullable = false)
    private String formVersion;
    
    /**
     * Status of the form data entry
     */
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private FormDataStatus status = FormDataStatus.NOT_STARTED;

    /**
     * JSON data containing the actual form data values
     * This maps to the structure defined in the form definition
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "json")
    private Object data;

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
    
    /**
     * Indicates whether this form data is linked to the latest form version
     * This flag is updated when new form versions are created
     */
    @Column(name = "uses_latest_form_version")
    private boolean usesLatestFormVersion = true;
    
    /**
     * Reason for the data entry (initial entry, correction, etc.)
     */
    @Column(name = "entry_reason")
    private String entryReason;
    
    /**
     * Audit information about the form version used
     */
    @Column(name = "form_version_used")
    private String formVersionUsed;

    public enum FormDataStatus {
        NOT_STARTED, INCOMPLETE, COMPLETE, SIGNED, LOCKED
    }
}
