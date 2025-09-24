package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;

/**
 * Site Activation Request DTO
 * 
 * Common DTO for site activation requests across microservices.
 * Used in Phase 1.1 Study Database Build workflow for site customization,
 * branding, form configuration, and activation processes.
 */
@Data
@Builder
public class SiteActivationRequest {
    
    /**
     * Study identifier for which site is being activated
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    /**
     * Site identifier to be activated
     */
    @NotNull(message = "Site ID is required")
    private Long siteId;
    
    /**
     * User requesting the site activation
     */
    @NotNull(message = "Requested by is required")
    private String requestedBy;
    
    /**
     * Site customization configuration
     */
    private SiteCustomization customization;
    
    /**
     * Form configurations specific to this site
     */
    private List<FormConfiguration> formConfigurations;
    
    /**
     * Workflow configurations for the site
     */
    private List<WorkflowConfiguration> workflowConfigurations;
    
    /**
     * Site personnel who need access
     */
    @NotEmpty(message = "Site personnel are required")
    private List<SitePersonnel> personnel;
    
    /**
     * Additional activation parameters
     */
    private Map<String, Object> additionalParameters;
    
    /**
     * Site Customization nested class
     */
    @Data
    @Builder
    public static class SiteCustomization {
        private String siteName;
        private String siteCode;
        private Map<String, Object> brandingConfiguration;
        private Map<String, String> languageSettings;
        private Map<String, Object> uiCustomizations;
    }
    
    /**
     * Form Configuration nested class
     */
    @Data
    @Builder
    public static class FormConfiguration {
        private Long formId;
        private String formName;
        private Map<String, Object> formSettings;
        private List<String> validationRules;
        private Map<String, Object> customFields;
    }
    
    /**
     * Workflow Configuration nested class
     */
    @Data
    @Builder
    public static class WorkflowConfiguration {
        private String workflowType;
        private String workflowName;
        private Map<String, Object> workflowSettings;
        private List<String> approvalSteps;
    }
    
    /**
     * Site Personnel nested class
     */
    @Data
    @Builder
    public static class SitePersonnel {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        private String userName;
        private String userEmail;
        
        @NotEmpty(message = "Personnel roles are required")
        private List<String> roles;
        
        private List<String> permissions;
        private Map<String, Object> personalizedSettings;
    }
}