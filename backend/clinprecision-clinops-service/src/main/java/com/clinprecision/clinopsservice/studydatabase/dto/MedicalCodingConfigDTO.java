package com.clinprecision.clinopsservice.studydatabase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Medical Coding Configuration Response
 * Returns medical dictionary coding configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCodingConfigDTO {
    
    private Long id;
    private Long studyId;
    private Long formId;
    private String fieldName;
    
    // Dictionary information
    private String dictionaryType;  // MedDRA, WHO_DD, SNOMED, etc.
    private String dictionaryVersion;
    
    // Coding requirements
    private Boolean codingRequired;
    
    // Auto-coding configuration
    private Boolean autoCodingEnabled;
    private Integer autoCodingThreshold;
    private Boolean manualReviewRequired;
    
    // Verbatim field
    private String verbatimFieldLabel;
    private Integer verbatimMaxLength;
    private Boolean verbatimRequired;
    
    // Coding level (MedDRA specific)
    private String codeToLevel;  // PT, LLT, HLT, HLGT, SOC
    private Boolean capturePrimarySoc;
    
    // UI configuration
    private Boolean showAllMatches;
    private Integer maxMatchesDisplayed;
    
    // Workflow configuration
    private String primaryCoderRole;
    private String secondaryCoderRole;
    private Boolean adjudicationRequired;
    private String adjudicatorRole;
    private String workflowType;  // SINGLE_CODER, DUAL_CODER, etc.
    
    // Instructions
    private String codingInstructions;
    
    private Boolean isActive;
}
