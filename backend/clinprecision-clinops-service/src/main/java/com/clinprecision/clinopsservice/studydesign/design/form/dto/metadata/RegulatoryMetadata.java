package com.clinprecision.clinopsservice.studydesign.design.form.dto.metadata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Regulatory compliance metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegulatoryMetadata {
    
    /** Required by FDA */
    private Boolean fdaRequired;
    
    /** Required by EMA */
    private Boolean emaRequired;
    
    /** Subject to 21 CFR Part 11 */
    private Boolean cfr21Part11;
    
    /** Required by GCP */
    private Boolean gcpRequired;
    
    /** HIPAA protected information */
    private Boolean hipaaProtected;
    
    /** PHI category */
    private String phiCategory; // identifier, demographic, dates, contact, financial, health
    
    /** Requires de-identification */
    private Boolean deidentificationRequired;
    
    /** Data retention period in years */
    private Integer retentionYears;
    
    /** Requires archiving */
    private Boolean archivingRequired;
}
