package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * User Access Request DTO
 * 
 * Common DTO for user access provisioning requests across microservices.
 * Used in Phase 1.1 Study Database Build workflow for user role assignment
 * and site-specific access provisioning.
 */
@Data
@Builder
public class UserAccessRequest {
    
    /**
     * Study identifier for which access is being provisioned
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    /**
     * User requesting the access provisioning
     */
    @NotNull(message = "Requested by is required")
    private String requestedBy;
    
    /**
     * List of user role assignments for the study
     */
    @NotEmpty(message = "User role assignments are required")
    private List<UserRoleAssignment> userRoleAssignments;
    
    /**
     * List of site-specific permissions
     */
    private List<SitePermission> sitePermissions;
    
    /**
     * Additional configuration parameters
     */
    private java.util.Map<String, Object> additionalConfiguration;
    
    /**
     * User Role Assignment nested class
     */
    @Data
    @Builder
    public static class UserRoleAssignment {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotEmpty(message = "Roles are required")
        private List<String> roles;
        
        /**
         * User details for reference
         */
        private String userName;
        private String userEmail;
    }
    
    /**
     * Site Permission nested class
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
        
        /**
         * Site details for reference
         */
        private String siteName;
        private String siteCode;
    }
}