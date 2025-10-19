package com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * StudyFormData Entity - Read model for form submissions
 * 
 * Represents the current state of a form submission in the study_form_data table.
 * This is updated by FormDataProjector when FormDataSubmittedEvent is processed.
 * 
 * Table: study_form_data
 * Purpose: Electronic Data Capture (EDC) - stores all CRF data
 * 
 * Relationship with Event Store:
 * - Event Store: Immutable history (FormDataSubmittedEvent, FormDataUpdatedEvent, etc.)
 * - This Table: Current state (latest version) for queries and reporting
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - All changes tracked via study_form_data_audit table
 * - Audit trail includes who, what, when
 * - Locked forms cannot be modified (enforced in aggregate)
 * 
 * JSON Storage:
 * - form_data column stores complete form responses as JSON
 * - Allows flexible schema per form definition
 * - Supports dynamic forms without schema changes
 * 
 * Example form_data for screening assessment:
 * {
 *   "eligibility_age": true,
 *   "eligibility_diagnosis": true,
 *   "eligibility_exclusions": false,
 *   "eligibility_consent": true,
 *   "screening_date": "2025-10-12",
 *   "assessor_name": "Dr. Sarah Chen",
 *   "notes": "Subject meets all inclusion criteria"
 * }
 */
@Entity
@Table(name = "study_form_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyFormDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * UUID from event sourcing aggregate
     * Links to FormDataAggregate identifier
     */
    @Column(name = "aggregate_uuid", unique = true)
    private String aggregateUuid;

    /**
     * Study this form belongs to
     * Foreign key to studies table
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Form definition reference
     * Foreign key to study_forms table
     */
    @Column(name = "form_id", nullable = false)
    private Long formId;

    /**
     * Subject who completed the form
     * Foreign key to patients table
     * NULL for screening forms (pre-enrollment)
     */
    @Column(name = "subject_id")
    private Long subjectId;

    /**
     * Visit this form belongs to
     * Foreign key to visit_instances table
     * NULL for non-visit forms (screening, enrollment, unscheduled)
     */
    @Column(name = "visit_id")
    private Long visitId;

    /**
     * Site that collected this data
     * Foreign key to sites table
     * Important for multi-site studies
     */
    @Column(name = "site_id")
    private Long siteId;

    /**
     * Study database build reference
     * Foreign key to study_database_builds table
     * Tracks which protocol/form definition version was used for this submission
     * 
     * CRITICAL for data integrity and compliance:
     * - Links form data to specific protocol version
     * - Enables correct form structure retrieval for display/validation
     * - Required for historical data reconstruction
     * - Supports protocol amendments without breaking existing data
     * 
     * Example scenarios:
     * - Build 1: Demographics has 10 fields (age 18-65)
     * - Build 2: Demographics has 12 fields (age 18-85)
     * - This field tracks which version patient filled out
     */
    @Column(name = "build_id")
    private Long buildId;

    /**
     * Form status
     * - DRAFT: Working copy, not official record
     * - SUBMITTED: Official submission, part of regulatory record
     * - LOCKED: Database locked, cannot be modified
     */
    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    /**
     * Complete form data as JSON
     * Stores all field values as key-value pairs
     * 
     * Using @JdbcTypeCode(SqlTypes.JSON) for proper JSON handling in PostgreSQL
     * This ensures:
     * - Proper JSON storage and retrieval
     * - Query support using JSON operators in native queries
     * - Automatic serialization/deserialization
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "form_data", columnDefinition = "json", nullable = false)
    private Map<String, Object> formData;

    /**
     * Version number for optimistic locking
     * Increments with each update to detect concurrent modifications
     * Prevents lost updates in multi-user environment
     */
    @Version
    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    /**
     * Indicates if this form is locked (database lock applied)
     * Once locked, form cannot be edited
     * Used in database lock workflow
     */
    @Column(name = "is_locked")
    @Builder.Default
    private Boolean isLocked = false;

    /**
     * Audit fields
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    /**
     * Optional: Link to related records
     * Examples:
     * - UUID of patient status change (for screening forms)
     * - Query ID if this submission resolves a query
     * - SDV record ID if this is source verified
     */
    @Column(name = "related_record_id")
    private String relatedRecordId;

    /**
     * Field completion tracking
     * Helps monitor form completion progress
     */
    @Column(name = "total_fields")
    private Integer totalFields;

    @Column(name = "completed_fields")
    private Integer completedFields;

    @Column(name = "required_fields")
    private Integer requiredFields;

    @Column(name = "completed_required_fields")
    private Integer completedRequiredFields;

    /**
     * JPA lifecycle callbacks
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.version == null) {
            this.version = 1;
        }
        if (this.isLocked == null) {
            this.isLocked = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Business logic helpers
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

    /**
     * Get a specific field value from form data
     */
    public Object getFieldValue(String fieldName) {
        return formData != null ? formData.get(fieldName) : null;
    }

    /**
     * Check if a specific field exists
     */
    public boolean hasField(String fieldName) {
        return formData != null && formData.containsKey(fieldName);
    }
}
