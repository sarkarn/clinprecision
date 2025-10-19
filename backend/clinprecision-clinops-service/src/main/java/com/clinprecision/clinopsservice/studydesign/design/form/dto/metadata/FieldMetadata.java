package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete field metadata structure
 * Mirrors the JSON schema definition
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FieldMetadata {
    
    /** Validation rules for field values */
    private ValidationConfig validation;
    
    /** UI display configuration */
    private UIConfig ui;
    
    /** Clinical significance flags */
    private ClinicalFlags clinical;
    
    /** CDASH standard mapping */
    private CdashMapping cdash;
    
    /** SDTM standard mapping */
    private SdtmMapping sdtm;
    
    /** Medical coding configuration */
    private MedicalCoding coding;
    
    /** Data quality rules */
    private DataQualityRules dataQuality;
    
    /** Regulatory compliance metadata */
    private RegulatoryMetadata regulatory;
    
    /** Audit trail configuration */
    private AuditConfig audit;
    
    /** Data entry configuration */
    private DataEntryConfig dataEntry;
    
    /** Export configuration */
    private ExportConfig export;
    
    /** Query management configuration */
    private QueryConfig query;
    
    /** Detailed field description */
    private String description;
    
    /** Special instructions for data entry */
    private String implementationNotes;
    
    /** Source of the data */
    private String dataSource; // CRF, eCOA, ePRO, Lab, Device, EHR, Other
    
    /** How the data is captured */
    private String captureMethod; // manual, automated, imported, derived
}
