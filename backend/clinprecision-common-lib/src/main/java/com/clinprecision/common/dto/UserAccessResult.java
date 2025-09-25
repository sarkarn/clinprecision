package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * User Access Result DTO
 * 
 * Common DTO for user access provisioning results across microservices.
 * Used in Phase 1.1 Study Database Build workflow to return the status
 * of user role assignment and site-specific access provisioning operations.
 */
@Data
@Builder
public class UserAccessResult {
    
    /**
     * Study identifier for which access was provisioned
     */
    private Long studyId;
    
    /**
     * Overall provisioning status
     */
    private String provisioningStatus;
    
    /**
     * Time when provisioning was completed
     */
    private LocalDateTime provisioningTime;
    
    /**
     * Descriptive message about the operation
     */
    private String message;
    
    /**
     * Number of users successfully provisioned
     */
    private Integer usersProvisioned;
    
    /**
     * Number of sites where permissions were configured
     */
    private Integer sitesConfigured;
    
    /**
     * List of successfully processed user assignments
     */
    private List<UserProvisioningDetail> successfulProvisions;
    
    /**
     * List of failed user assignments with error details
     */
    private List<UserProvisioningDetail> failedProvisions;
    
    /**
     * Additional result data
     */
    private Map<String, Object> additionalData;
    
    /**
     * Error details if operation failed
     */
    private String errorDetails;
    
    /**
     * User Provisioning Detail nested class
     */
    @Data
    @Builder
    public static class UserProvisioningDetail {
        private Long userId;
        private String userName;
        private List<String> assignedRoles;
        private List<String> assignedPermissions;
        private String status;
        private String message;
        private LocalDateTime processedTime;
    }
    
    /**
     * Enumeration for common provisioning statuses
     */
    public enum ProvisioningStatus {
        COMPLETED("COMPLETED"),
        PARTIAL("PARTIAL"),
        FAILED("FAILED"),
        UPDATED("UPDATED"),
        REVOKED("REVOKED"),
        IN_PROGRESS("IN_PROGRESS");
        
        private final String value;
        
        ProvisioningStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}