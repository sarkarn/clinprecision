package com.clinprecision.clinopsservice.studydatabase.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing CDISC CDASH/SDTM mappings for study form fields.
 * 
 * This entity stores the mapping between clinical data collection fields (CDASH)
 * and their corresponding SDTM (Study Data Tabulation Model) variables required
 * for regulatory submissions to FDA/EMA.
 * 
 * CDASH (Clinical Data Acquisition Standards Harmonization) is the CDISC standard
 * for designing case report forms. SDTM is the standard for organizing and formatting
 * data for regulatory submissions.
 */
@Entity
@Table(name = "study_cdash_mappings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCdashMappingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Study ID this mapping belongs to
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Form ID this mapping belongs to
     */
    @Column(name = "form_id", nullable = false)
    private Long formId;

    /**
     * Field name in the form definition
     */
    @Column(name = "field_name", nullable = false, length = 255)
    private String fieldName;

    /**
     * CDASH domain (e.g., 'VS' for Vital Signs, 'AE' for Adverse Events)
     */
    @Column(name = "cdash_domain", length = 8)
    private String cdashDomain;

    /**
     * CDASH variable name (e.g., 'SYSBP' for systolic blood pressure)
     */
    @Column(name = "cdash_variable", length = 50)
    private String cdashVariable;

    /**
     * CDASH variable label (human-readable description)
     */
    @Column(name = "cdash_label", length = 255)
    private String cdashLabel;

    /**
     * SDTM domain for regulatory submission (e.g., 'VS', 'LB', 'AE')
     */
    @Column(name = "sdtm_domain", length = 8)
    private String sdtmDomain;

    /**
     * SDTM variable name (e.g., 'VSORRES' for original result)
     */
    @Column(name = "sdtm_variable", length = 50)
    private String sdtmVariable;

    /**
     * SDTM variable label
     */
    @Column(name = "sdtm_label", length = 255)
    private String sdtmLabel;

    /**
     * SDTM data type (e.g., 'Char', 'Num', 'Date', 'DateTime')
     */
    @Column(name = "sdtm_datatype", length = 20)
    private String sdtmDatatype;

    /**
     * SDTM variable length (for character types)
     */
    @Column(name = "sdtm_length")
    private Integer sdtmLength;

    /**
     * CDISC controlled terminology code (if applicable)
     */
    @Column(name = "cdisc_terminology_code", length = 50)
    private String cdiscTerminologyCode;

    /**
     * Codelist name for controlled terminology
     */
    @Column(name = "codelist_name", length = 100)
    private String codelistName;

    /**
     * Codelist version
     */
    @Column(name = "codelist_version", length = 20)
    private String codelistVersion;

    /**
     * Data origin (COLLECTED, DERIVED, ASSIGNED, PROTOCOL)
     */
    @Column(name = "data_origin", length = 20)
    @Builder.Default
    private String dataOrigin = "COLLECTED";

    /**
     * Transformation rule for converting collected data to SDTM format.
     * Stored as text to support complex logic or expressions.
     */
    @Column(name = "transformation_rule", columnDefinition = "TEXT")
    private String transformationRule;

    /**
     * Unit conversion rule (e.g., "cm to m: divide by 100")
     */
    @Column(name = "unit_conversion_rule", columnDefinition = "TEXT")
    private String unitConversionRule;

    /**
     * Comments or notes about this mapping
     */
    @Column(name = "mapping_notes", columnDefinition = "TEXT")
    private String mappingNotes;

    /**
     * Whether this mapping is active
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
