package com.clinprecision.clinopsservice.studydatabase.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing data review and source data verification (SDV) records.
 * 
 * This entity tracks the review workflow for clinical data including:
 * - Source Data Verification (SDV): Verification against source documents
 * - Medical Review: Clinical review by qualified medical personnel
 * - Data Review: Quality checks by data management
 * - Safety Review: Expedited review of safety data
 * - Central Review: Independent blinded review
 * 
 * Supports FDA 21 CFR Part 11 compliance with electronic signatures and audit trails.
 */
@Entity
@Table(name = "study_form_data_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyFormDataReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Study ID this review belongs to
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Form ID being reviewed
     */
    @Column(name = "form_id", nullable = false)
    private Long formId;

    /**
     * Subject ID whose data is being reviewed
     */
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    /**
     * Visit ID (if applicable)
     */
    @Column(name = "visit_id")
    private Long visitId;

    /**
     * Field name being reviewed (null if reviewing entire form)
     */
    @Column(name = "field_name", length = 255)
    private String fieldName;

    /**
     * Review type: SDV, MEDICAL_REVIEW, DATA_REVIEW, SAFETY_REVIEW, CENTRAL_REVIEW
     */
    @Column(name = "review_type", nullable = false, length = 30)
    private String reviewType;

    /**
     * Review status: PENDING, IN_PROGRESS, COMPLETED, QUERY_RAISED, RESOLVED
     */
    @Column(name = "review_status", nullable = false, length = 20)
    @Builder.Default
    private String reviewStatus = "PENDING";

    /**
     * User ID of the reviewer
     */
    @Column(name = "reviewer_id")
    private Long reviewerId;

    /**
     * Name of the reviewer
     */
    @Column(name = "reviewer_name", length = 255)
    private String reviewerName;

    /**
     * Role of the reviewer (e.g., 'CRA', 'MEDICAL_MONITOR', 'DATA_MANAGER')
     */
    @Column(name = "reviewer_role", length = 50)
    private String reviewerRole;

    /**
     * When the review was completed
     */
    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    /**
     * Duration of review in minutes
     */
    @Column(name = "review_duration_minutes")
    private Integer reviewDurationMinutes;

    /**
     * Review outcome: PASS, FAIL, QUERY, NOT_APPLICABLE
     */
    @Column(name = "review_outcome", length = 20)
    private String reviewOutcome;

    /**
     * Whether a discrepancy was found during review
     */
    @Column(name = "discrepancy_found", nullable = false)
    @Builder.Default
    private Boolean discrepancyFound = false;

    /**
     * Description of discrepancy (if any)
     */
    @Column(name = "discrepancy_description", columnDefinition = "TEXT")
    private String discrepancyDescription;

    /**
     * Corrective action taken (if any)
     */
    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    /**
     * Query ID (if query was raised)
     */
    @Column(name = "query_id")
    private Long queryId;

    /**
     * Query status: OPEN, ANSWERED, CLOSED, CANCELLED
     */
    @Column(name = "query_status", length = 20)
    private String queryStatus;

    /**
     * Query priority: LOW, MEDIUM, HIGH, CRITICAL
     */
    @Column(name = "query_priority", length = 20)
    private String queryPriority;

    /**
     * Whether data was verified against source documents
     */
    @Column(name = "verified_against_source", nullable = false)
    @Builder.Default
    private Boolean verifiedAgainstSource = false;

    /**
     * Type of source document (e.g., 'MEDICAL_RECORD', 'LAB_REPORT', 'ECG')
     */
    @Column(name = "source_document_type", length = 100)
    private String sourceDocumentType;

    /**
     * Reference to source document (e.g., file path, document ID)
     */
    @Column(name = "source_document_reference", length = 500)
    private String sourceDocumentReference;

    /**
     * Review comments or notes
     */
    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;

    /**
     * Electronic signature for 21 CFR Part 11 compliance
     */
    @Column(name = "electronic_signature", length = 500)
    private String electronicSignature;

    /**
     * Meaning of signature (e.g., 'REVIEWED', 'APPROVED', 'VERIFIED')
     */
    @Column(name = "signature_meaning", length = 50)
    private String signatureMeaning;

    /**
     * When the signature was applied
     */
    @Column(name = "signature_date")
    private LocalDateTime signatureDate;

    /**
     * Follow-up required flag
     */
    @Column(name = "follow_up_required", nullable = false)
    @Builder.Default
    private Boolean followUpRequired = false;

    /**
     * Follow-up due date
     */
    @Column(name = "follow_up_due_date")
    private LocalDateTime followUpDueDate;

    /**
     * Whether this review is active
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Timestamp when this record was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when this record was last updated
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Pre-persist callback to set timestamps on creation
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Pre-update callback to update the timestamp on modification
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
