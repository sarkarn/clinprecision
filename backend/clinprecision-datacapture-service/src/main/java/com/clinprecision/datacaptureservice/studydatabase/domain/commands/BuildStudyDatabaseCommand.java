package com.clinprecision.datacaptureservice.studydatabase.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.Map;
import java.util.UUID;

/**
 * Command for building a study database
 * 
 * Follows CQRS pattern and extends BaseCommand from clinprecision-axon-lib.
 * This command initiates the complete database build process including:
 * - Database configuration based on study design
 * - Form definitions import
 * - Validation rules setup
 * - Performance optimization
 * - Compliance feature configuration
 * 
 * Business Rules:
 * - Study must exist and be in valid state
 * - Study design configuration must be provided
 * - Validation rules must be defined
 * - User must have STUDY_MANAGER or SYSTEM_ADMIN role
 */
@Getter
@Builder
@ToString
public class BuildStudyDatabaseCommand extends BaseCommand {
    
    @NotNull(message = "Study database build ID is required")
    private final UUID studyDatabaseBuildId;
    
    @NotNull(message = "Study ID is required")
    private final Long studyId;
    
    @NotNull(message = "Study name is required")
    @Size(min = 1, max = 255, message = "Study name must be between 1 and 255 characters")
    private final String studyName;
    
    @NotNull(message = "Study protocol is required")
    @Size(min = 1, max = 100, message = "Study protocol must be between 1 and 100 characters")
    private final String studyProtocol;
    
    @NotNull(message = "Requested by user ID is required")
    private final Long requestedBy;
    
    /**
     * Study design configuration imported from study design module
     * Must contain 'forms' key with form definitions
     */
    @Valid
    private final Map<String, Object> studyDesignConfiguration;
    
    /**
     * Validation rules configuration
     * Must contain 'rules' key with validation rule definitions
     */
    @Valid
    private final Map<String, Object> validationRules;
    
    /**
     * Site-specific customizations (optional)
     */
    private final Map<String, Object> siteCustomizations;
    
    /**
     * Performance requirements and settings (optional)
     */
    private final Map<String, Object> performanceSettings;
    
    /**
     * Compliance and audit settings (optional)
     */
    private final Map<String, Object> complianceSettings;
    
    @Override
    public void validate() {
        super.validate();
        
        // Business rule validation: Study design configuration is required
        if (studyDesignConfiguration == null || studyDesignConfiguration.isEmpty()) {
            throw new IllegalArgumentException(
                "Study design configuration is required for database build");
        }
        
        // Business rule validation: Form definitions must be present
        if (!hasFormDefinitions()) {
            throw new IllegalArgumentException(
                "Form definitions are required in study design configuration");
        }
        
        // Business rule validation: Validation rules are required
        if (validationRules == null || validationRules.isEmpty()) {
            throw new IllegalArgumentException(
                "Validation rules configuration is required for database build");
        }
        
        // Business rule validation: At least one validation rule must be defined
        if (!hasValidationRules()) {
            throw new IllegalArgumentException(
                "At least one validation rule must be defined");
        }
    }
    
    /**
     * Check if form definitions are present in study design configuration
     */
    public boolean hasFormDefinitions() {
        return studyDesignConfiguration != null && 
               studyDesignConfiguration.containsKey("forms") &&
               studyDesignConfiguration.get("forms") != null;
    }
    
    /**
     * Check if validation rules are present
     */
    public boolean hasValidationRules() {
        return validationRules != null && 
               validationRules.containsKey("rules") &&
               validationRules.get("rules") != null;
    }
    
    /**
     * Check if performance optimizations are configured
     */
    public boolean hasPerformanceOptimizations() {
        return performanceSettings != null && !performanceSettings.isEmpty();
    }
    
    /**
     * Check if site customizations are configured
     */
    public boolean hasSiteCustomizations() {
        return siteCustomizations != null && !siteCustomizations.isEmpty();
    }
    
    /**
     * Check if compliance settings are configured
     */
    public boolean hasComplianceSettings() {
        return complianceSettings != null && !complianceSettings.isEmpty();
    }
}
