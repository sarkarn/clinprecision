package com.clinprecision.studydesignservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for transferring form data between layers.
 * Represents data collected using a specific form definition version.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormData {

    private String id;
    private String subjectId;
    private String subjectVisitId;
    private String formDefinitionId;
    private String formVersion;
    private FormDataStatus status = FormDataStatus.NOT_STARTED;
    private Object data;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long signedBy;
    private LocalDateTime signedAt;
    private boolean usesLatestFormVersion = true;
    private String entryReason;
    private String formVersionUsed;

    public enum FormDataStatus {
        NOT_STARTED, INCOMPLETE, COMPLETE, SIGNED, LOCKED, SUPERSEDED
    }
}
