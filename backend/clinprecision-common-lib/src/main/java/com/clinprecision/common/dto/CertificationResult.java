package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Certification Result DTO
 * 
 * Common DTO for certification results across microservices.
 * Used in Phase 1.1 Study Database Build workflow to return the status
 * of certification processing and issuance.
 */
@Data
@Builder
public class CertificationResult {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Site identifier (optional)
     */
    private Long siteId;
    
    /**
     * User identifier for whom certification was processed
     */
    private Long userId;
    
    /**
     * Certification identifier (if issued)
     */
    private String certificateId;
    
    /**
     * Certification status
     */
    private String certificationStatus;
    
    /**
     * Certification processing/issuance timestamp
     */
    private LocalDateTime certificationTime;
    
    /**
     * Certificate expiration date (if applicable)
     */
    private LocalDateTime expirationDate;
    
    /**
     * Descriptive message about the certification
     */
    private String message;
    
    /**
     * Assessment score achieved
     */
    private Integer assessmentScore;
    
    /**
     * Passing score required
     */
    private Integer passingScore;
    
    /**
     * Number of attempts taken
     */
    private Integer attemptNumber;
    
    /**
     * Certification type
     */
    private String certificationType;
    
    /**
     * Training modules completed for this certification
     */
    private List<String> completedModules;
    
    /**
     * Certification details
     */
    private Map<String, Object> certificationDetails;
    
    /**
     * Error details if certification failed
     */
    private String errorDetails;
    
    /**
     * Enumeration for common certification statuses
     */
    public enum CertificationStatus {
        CERTIFIED("CERTIFIED"),
        DENIED("DENIED"),
        PENDING("PENDING"),
        EXPIRED("EXPIRED"),
        REVOKED("REVOKED"),
        FAILED("FAILED");
        
        private final String value;
        
        CertificationStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}