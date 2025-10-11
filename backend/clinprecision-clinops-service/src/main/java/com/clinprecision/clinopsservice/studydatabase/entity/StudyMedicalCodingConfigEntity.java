package com.clinprecision.clinopsservice.studydatabase.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing medical coding configuration for study form fields.
 * 
 * This entity stores configuration for medical coding dictionaries (MedDRA, WHO-DD, 
 * SNOMED, ICD-10/11, LOINC) used to code adverse events, medical history, medications,
 * procedures, and laboratory tests according to standardized terminology.
 * 
 * Medical coding is essential for:
 * - Standardized reporting to regulatory authorities (FDA, EMA)
 * - Cross-trial safety signal detection
 * - Meta-analyses and pooled safety databases
 * - Compliance with ICH E2B requirements
 */
@Entity
@Table(name = "study_medical_coding_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyMedicalCodingConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Study ID this configuration belongs to
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Form ID this configuration applies to
     */
    @Column(name = "form_id", nullable = false)
    private Long formId;

    /**
     * Field name requiring medical coding
     */
    @Column(name = "field_name", nullable = false, length = 255)
    private String fieldName;

    /**
     * Dictionary type: MedDRA, WHO_DD, SNOMED, ICD10, ICD11, LOINC, CUSTOM
     */
    @Column(name = "dictionary_type", nullable = false, length = 20)
    private String dictionaryType;

    /**
     * Dictionary version (e.g., "26.0" for MedDRA 26.0)
     */
    @Column(name = "dictionary_version", length = 20)
    private String dictionaryVersion;

    /**
     * Whether this field requires medical coding
     */
    @Column(name = "coding_required", nullable = false)
    @Builder.Default
    private Boolean codingRequired = false;

    /**
     * Whether auto-coding is enabled for this field
     */
    @Column(name = "auto_coding_enabled", nullable = false)
    @Builder.Default
    private Boolean autoCodingEnabled = false;

    /**
     * Auto-coding confidence threshold (0-100)
     * Only auto-code if confidence score exceeds this threshold
     */
    @Column(name = "auto_coding_threshold")
    @Builder.Default
    private Integer autoCodingThreshold = 80;

    /**
     * Whether manually coded terms require medical review
     */
    @Column(name = "manual_review_required", nullable = false)
    @Builder.Default
    private Boolean manualReviewRequired = false;

    /**
     * Verbatim field label (for data entry)
     */
    @Column(name = "verbatim_field_label", length = 255)
    private String verbatimFieldLabel;

    /**
     * Maximum length for verbatim text
     */
    @Column(name = "verbatim_max_length")
    private Integer verbatimMaxLength;

    /**
     * Whether verbatim text is required
     */
    @Column(name = "verbatim_required", nullable = false)
    @Builder.Default
    private Boolean verbatimRequired = true;

    /**
     * MedDRA hierarchy level to code to (PT, LLT, HLT, HLGT, SOC)
     * PT = Preferred Term (most common)
     * LLT = Lowest Level Term
     * HLT = High Level Term
     * HLGT = High Level Group Term
     * SOC = System Organ Class
     */
    @Column(name = "code_to_level", length = 10)
    private String codeToLevel;

    /**
     * Whether primary System Organ Class (SOC) should be captured
     */
    @Column(name = "capture_primary_soc", nullable = false)
    @Builder.Default
    private Boolean capturePrimarySoc = false;

    /**
     * Whether all matching codes should be displayed (true) or only top matches (false)
     */
    @Column(name = "show_all_matches", nullable = false)
    @Builder.Default
    private Boolean showAllMatches = false;

    /**
     * Maximum number of matches to display in auto-suggest
     */
    @Column(name = "max_matches_displayed")
    @Builder.Default
    private Integer maxMatchesDisplayed = 10;

    /**
     * Role required for primary coding (e.g., 'MEDICAL_CODER', 'CLINICAL_DATA_MANAGER')
     */
    @Column(name = "primary_coder_role", length = 50)
    private String primaryCoderRole;

    /**
     * Role required for secondary coding (for dual coding workflows)
     */
    @Column(name = "secondary_coder_role", length = 50)
    private String secondaryCoderRole;

    /**
     * Whether adjudication is required when coders disagree
     */
    @Column(name = "adjudication_required", nullable = false)
    @Builder.Default
    private Boolean adjudicationRequired = false;

    /**
     * Role for adjudication (e.g., 'MEDICAL_MONITOR', 'SAFETY_PHYSICIAN')
     */
    @Column(name = "adjudicator_role", length = 50)
    private String adjudicatorRole;

    /**
     * Coding workflow type: SINGLE_CODER, DUAL_CODER, AUTO_WITH_REVIEW, CENTRALIZED
     */
    @Column(name = "workflow_type", length = 30)
    @Builder.Default
    private String workflowType = "SINGLE_CODER";

    /**
     * Custom validation rules for coded values (JSON format)
     */
    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules;

    /**
     * Configuration notes or instructions for coders
     */
    @Column(name = "coding_instructions", columnDefinition = "TEXT")
    private String codingInstructions;

    /**
     * Whether this configuration is active
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
