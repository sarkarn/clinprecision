package com.clinprecision.datacaptureservice.dto.workflow;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;

/**
 * Phase 1.1 Workflow Request DTO
 * 
 * Contains all information needed to execute the Phase 1.1 study activation workflow:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 */
@Data
@Builder
public class StudyActivationWorkflowRequest {
    
    /**
     * Study identifier
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    /**
     * User requesting the workflow execution
     */
    @NotNull(message = "Requested by is required")
    private String requestedBy;
    
    /**
     * Study design configuration from study design service
     */
    private Map<String, Object> studyDesignConfiguration;
    
    /**
     * Validation rules to be applied
     */
    private List<Map<String, Object>> validationRules;
    
    /**
     * User role assignments for the study
     */
    @NotEmpty(message = "User role assignments are required")
    private List<UserRoleAssignment> userRoleAssignments;
    
    /**
     * Site-specific permissions
     */
    private List<SitePermission> sitePermissions;
    
    /**
     * Sites to be activated for the study
     */
    @NotEmpty(message = "At least one site is required")
    private List<SiteConfiguration> sites;
    
    /**
     * User Role Assignment
     */
    @Data
    @Builder
    public static class UserRoleAssignment {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotEmpty(message = "Roles are required")
        private List<String> roles;
    }
    
    /**
     * Site Permission Configuration
     */
    @Data
    @Builder
    public static class SitePermission {
        @NotNull(message = "Site ID is required")
        private Long siteId;
        
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotEmpty(message = "Permissions are required")
        private List<String> permissions;
    }
    
    /**
     * Site Configuration
     */
    @Data
    @Builder
    public static class SiteConfiguration {
        @NotNull(message = "Site ID is required")
        private Long siteId;
        
        /**
         * Site customization request
         */
        private SiteCustomizationRequest customizationRequest;
        
        /**
         * Personnel at the site
         */
        @NotEmpty(message = "Site personnel are required")
        private List<Personnel> personnel;
    }
    
    /**
     * Personnel Information
     */
    @Data
    @Builder
    public static class Personnel {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotEmpty(message = "Personnel roles are required")
        private List<String> roles;
        
        private String name;
        private String email;
        private List<String> qualifications;
    }
    
    /**
     * Site Customization Request (placeholder for actual implementation)
     */
    @Data
    @Builder
    public static class SiteCustomizationRequest {
        @NotNull(message = "Site ID is required")
        private Long siteId;
        
        private Map<String, Object> brandingConfiguration;
        private List<Map<String, Object>> formConfigurations;
        private List<Map<String, Object>> validationRules;
        private Map<String, Object> workflowConfigurations;
    }
}