package com.clinprecision.clinopsservice.studydatabase.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Study Field Metadata Entity
 * 
 * Stores clinical and regulatory metadata for individual form fields.
 * This enables field-level control of:
 * - SDV (Source Data Verification) requirements
 * - Medical review requirements
 * - Regulatory compliance (FDA, EMA, 21 CFR Part 11)
 * - Audit trail configuration
 * - Data quality flags
 * 
 * Partitioned by study_id for multi-tenant scalability.
 */
@Entity
@Table(name = "study_field_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyFieldMetadataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "form_id", nullable = false)
    private Long formId;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "field_label", length = 255)
    private String fieldLabel;

    // ===== Clinical Flags =====

    @Column(name = "sdv_required")
    @Builder.Default
    private Boolean sdvRequired = false;

    @Column(name = "medical_review_required")
    @Builder.Default
    private Boolean medicalReviewRequired = false;

    @Column(name = "data_review_required")
    @Builder.Default
    private Boolean dataReviewRequired = false;

    @Column(name = "critical_data_point")
    @Builder.Default
    private Boolean criticalDataPoint = false;

    @Column(name = "safety_data_point")
    @Builder.Default
    private Boolean safetyDataPoint = false;

    @Column(name = "efficacy_data_point")
    @Builder.Default
    private Boolean efficacyDataPoint = false;

    // ===== Regulatory Flags =====

    @Column(name = "fda_required")
    @Builder.Default
    private Boolean fdaRequired = false;

    @Column(name = "ema_required")
    @Builder.Default
    private Boolean emaRequired = false;

    @Column(name = "cfr21_part11")
    @Builder.Default
    private Boolean cfr21Part11 = false;

    @Column(name = "gcp_required")
    @Builder.Default
    private Boolean gcpRequired = false;

    @Column(name = "hipaa_protected")
    @Builder.Default
    private Boolean hipaaProtected = false;

    // ===== Audit Trail Configuration =====

    @Enumerated(EnumType.STRING)
    @Column(name = "audit_trail_level")
    @Builder.Default
    private AuditTrailLevel auditTrailLevel = AuditTrailLevel.BASIC;

    @Column(name = "electronic_signature_required")
    @Builder.Default
    private Boolean electronicSignatureRequired = false;

    @Column(name = "reason_for_change_required")
    @Builder.Default
    private Boolean reasonForChangeRequired = false;

    // ===== Validation Rules (JSON) =====

    @Column(name = "validation_rules", columnDefinition = "JSON")
    private String validationRules;

    // ===== Data Quality Flags =====

    @Column(name = "is_derived_field")
    @Builder.Default
    private Boolean isDerivedField = false;

    @Column(name = "derivation_formula", columnDefinition = "TEXT")
    private String derivationFormula;

    @Column(name = "is_query_enabled")
    @Builder.Default
    private Boolean isQueryEnabled = true;

    @Column(name = "is_editable_after_lock")
    @Builder.Default
    private Boolean isEditableAfterLock = false;

    // ===== Metadata =====

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Audit Trail Level Enum
     */
    public enum AuditTrailLevel {
        NONE,     // No audit trail
        BASIC,    // Basic audit (create, update timestamps)
        FULL,     // Full audit (all changes tracked)
        DETAILED  // Detailed audit (field-level change tracking)
    }
}
