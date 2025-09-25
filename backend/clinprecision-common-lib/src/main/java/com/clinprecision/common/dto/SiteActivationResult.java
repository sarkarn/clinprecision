package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Site Activation Result DTO
 * 
 * Common DTO for site activation results across microservices.
 * Used in Phase 1.1 Study Database Build workflow to return the status
 * of site activation operations.
 */
@Data
@Builder
public class SiteActivationResult {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Site identifier
     */
    private Long siteId;
    
    /**
     * Activation status
     */
    private String activationStatus;
    
    /**
     * Activation timestamp
     */
    private LocalDateTime activationTime;
    
    /**
     * Descriptive message about the activation
     */
    private String message;
    
    /**
     * Site customization details
     */
    private Map<String, Object> customizationDetails;
    
    /**
     * Error details if activation failed
     */
    private String errorDetails;
    
    /**
     * List of activated features
     */
    private List<String> activatedFeatures;
    
    /**
     * Enumeration for common activation statuses
     */
    public enum ActivationStatus {
        ACTIVE("ACTIVE"),
        INACTIVE("INACTIVE"),
        CUSTOMIZED("CUSTOMIZED"),
        PENDING("PENDING"),
        FAILED("FAILED");
        
        private final String value;
        
        ActivationStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}