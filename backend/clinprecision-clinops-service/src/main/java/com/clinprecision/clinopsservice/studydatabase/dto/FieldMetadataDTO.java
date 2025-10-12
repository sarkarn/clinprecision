package com.clinprecision.clinopsservice.studydatabase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Field Metadata Response
 * Returns field-level clinical and regulatory metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldMetadataDTO {
    
    private Long id;
    private Long studyId;
    private Long formId;
    private String fieldName;
    private String fieldLabel;
    
    // Clinical flags
    private ClinicalFlags clinical;
    
    // Regulatory flags
    private RegulatoryFlags regulatory;
    
    // Audit trail configuration
    private AuditTrailConfig auditTrail;
    
    // Data entry configuration
    private DataEntryConfig dataEntry;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClinicalFlags {
        private Boolean sdvRequired;
        private Boolean medicalReviewRequired;
        private Boolean criticalDataPoint;
        private Boolean safetyDataPoint;
        private Boolean efficacyDataPoint;
        private Boolean dataReviewRequired;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegulatoryFlags {
        private Boolean fdaRequired;
        private Boolean emaRequired;
        private Boolean cfr21Part11;
        private Boolean gcpRequired;
        private Boolean hipaaProtected;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditTrailConfig {
        private String level;  // NONE, BASIC, FULL
        private Boolean electronicSignatureRequired;
        private Boolean reasonForChangeRequired;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataEntryConfig {
        private Boolean isDerivedField;
        private String derivationFormula;
        private Boolean isQueryEnabled;
        private Boolean isEditableAfterLock;
    }
}
