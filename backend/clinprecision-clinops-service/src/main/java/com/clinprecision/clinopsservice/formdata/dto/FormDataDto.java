package com.clinprecision.clinopsservice.formdata.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * FormDataDto - DTO for retrieving form data via API
 * 
 * Used for GET requests to retrieve existing form submissions.
 * Contains complete form data including all fields and metadata.
 * 
 * Example JSON response:
 * {
 *   "id": 123,
 *   "aggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
 *   "studyId": 1,
 *   "formId": 5,
 *   "subjectId": 1001,
 *   "visitId": null,
 *   "siteId": 10,
 *   "formData": {
 *     "eligibility_age": true,
 *     "eligibility_diagnosis": true,
 *     "screening_date": "2025-10-12",
 *     "assessor_name": "Dr. Sarah Chen"
 *   },
 *   "status": "SUBMITTED",
 *   "version": 1,
 *   "isLocked": false,
 *   "createdAt": "2025-10-12T14:30:00",
 *   "updatedAt": "2025-10-12T14:30:00",
 *   "createdBy": 42,
 *   "updatedBy": 42,
 *   "relatedRecordId": "uuid-of-status-change"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormDataDto {

    /**
     * Database record ID
     */
    private Long id;

    /**
     * UUID from event sourcing
     */
    private String aggregateUuid;

    /**
     * Study context
     */
    private Long studyId;

    /**
     * Form definition
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
     * Site reference
     */
    private Long siteId;

    /**
     * Complete form data as JSON
     * All field values preserved as submitted
     */
    private Map<String, Object> formData;

    /**
     * Form status: DRAFT, SUBMITTED, LOCKED
     */
    private String status;

    /**
     * Version for optimistic locking
     */
    private Integer version;

    /**
     * Lock status (database lock)
     */
    private Boolean isLocked;

    /**
     * Audit timestamps
     */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Audit users
     */
    private Long createdBy;
    private Long updatedBy;

    /**
     * Related record reference
     */
    private String relatedRecordId;

    /**
     * Helper methods for frontend
     */
    public boolean isScreeningForm() {
        return subjectId == null;
    }

    public boolean isVisitForm() {
        return visitId != null;
    }

    public boolean isSubmitted() {
        return "SUBMITTED".equals(status) || "LOCKED".equals(status);
    }

    public boolean isDraft() {
        return "DRAFT".equals(status);
    }

    public int getFieldCount() {
        return formData != null ? formData.size() : 0;
    }

    public Object getFieldValue(String fieldName) {
        return formData != null ? formData.get(fieldName) : null;
    }

    public boolean hasField(String fieldName) {
        return formData != null && formData.containsKey(fieldName);
    }
}
