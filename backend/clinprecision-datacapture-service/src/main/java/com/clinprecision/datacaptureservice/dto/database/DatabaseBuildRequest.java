package com.clinprecision.datacaptureservice.dto.database;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;


import java.util.List;
import java.util.Map;

/**
 * Database Build Request DTO
 * 
 * Contains all information needed to build a study database including:
 * - Study configuration
 * - Form definitions from study design
 * - Validation rules
 * - Performance requirements
 * - Compliance settings
 */
@Data
@Builder
public class DatabaseBuildRequest {
    
    @NotNull
    private Long studyId;
    
    @NotNull
    private String studyName;
    
    @NotNull
    private String studyProtocol;
    
    @NotNull
    private Long requestedBy;
    
    /**
     * Study design configuration imported from study design module
     */
    private Map<String, Object> studyDesignConfiguration;
    
    /**
     * Validation rules configuration
     */
    private Map<String, Object> validationRules;
    
    /**
     * Site-specific customizations
     */
    private Map<String, Object> siteCustomizations;
    
    /**
     * Performance requirements and settings
     */
    private Map<String, Object> performanceSettings;
    
    /**
     * Compliance and audit settings
     */
    private Map<String, Object> complianceSettings;
    
    /**
     * Expected number of subjects for capacity planning
     */
    private Integer expectedSubjectCount;
    
    /**
     * Expected number of sites
     */
    private Integer expectedSiteCount;
    
    /**
     * Study duration in months for planning
     */
    private Integer studyDurationMonths;
    
    /**
     * Special requirements or notes
     */
    private String specialRequirements;
    
    /**
     * Priority level for build processing
     */
    private String buildPriority;
    
    /**
     * Target go-live date
     */
    private java.time.LocalDate targetGoLiveDate;
}