package com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * FormSubmissionResponse - DTO for form submission API response
 * 
 * Returned by REST API after successful form submission.
 * Contains:
 * - Unique identifier for the submission (formDataId)
 * - Database record ID
 * - Submission metadata
 * 
 * Example JSON response:
 * {
 *   "formDataId": "550e8400-e29b-41d4-a716-446655440000",
 *   "recordId": 123,
 *   "studyId": 1,
 *   "formId": 5,
 *   "subjectId": null,
 *   "status": "SUBMITTED",
 *   "submittedAt": "2025-10-12T14:30:00",
 *   "submittedBy": 42,
 *   "version": 1,
 *   "message": "Form submitted successfully"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionResponse {

    /**
     * Unique identifier for this form submission
     * UUID from event sourcing aggregate
     * Use this to track the submission in event store
     */
    private UUID formDataId;

    /**
     * Database record ID
     * Auto-generated primary key from study_form_data table
     * Use this for database queries
     */
    private Long recordId;

    /**
     * Study context
     */
    private Long studyId;

    /**
     * Form definition reference
     */
    private Long formId;

    /**
     * Subject reference (NULL for screening forms)
     */
    private Long subjectId;

    /**
     * Visit reference (NULL for non-visit forms)
     */
    private Long visitId;

    /**
     * Form status
     */
    private String status;

    /**
     * Submission timestamp
     */
    private LocalDateTime submittedAt;

    /**
     * User who submitted
     */
    private Long submittedBy;

    /**
     * Version number (for optimistic locking)
     */
    private Integer version;

    /**
     * Response message
     * Example: "Form submitted successfully"
     */
    private String message;

    /**
     * Optional: Related record reference
     */
    private String relatedRecordId;

    /**
     * Helper: Create success response
     */
    public static FormSubmissionResponse success(UUID formDataId, Long recordId, Long studyId, 
                                                 Long formId, Long subjectId, String status) {
        return FormSubmissionResponse.builder()
            .formDataId(formDataId)
            .recordId(recordId)
            .studyId(studyId)
            .formId(formId)
            .subjectId(subjectId)
            .status(status)
            .submittedAt(LocalDateTime.now())
            .version(1)
            .message("Form submitted successfully")
            .build();
    }

    /**
     * Helper: Create error response
     */
    public static FormSubmissionResponse error(String message) {
        return FormSubmissionResponse.builder()
            .message(message)
            .submittedAt(LocalDateTime.now())
            .build();
    }
}
