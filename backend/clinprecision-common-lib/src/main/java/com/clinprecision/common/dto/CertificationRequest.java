package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Certification Request DTO
 * 
 * Common DTO for certification requests across microservices.
 * Used in Phase 1.1 Study Database Build workflow for processing
 * personnel certification requests and assessments.
 */
@Data
@Builder
public class CertificationRequest {
    
    /**
     * Study identifier for which certification is being requested
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    /**
     * Site identifier (optional, for site-specific certification)
     */
    private Long siteId;
    
    /**
     * User requesting certification
     */
    @NotNull(message = "User ID is required")
    private Long userId;
    
    /**
     * User making the certification request
     */
    @NotNull(message = "Requested by is required")
    private String requestedBy;
    
    /**
     * Type of certification being requested
     */
    @NotNull(message = "Certification type is required")
    private CertificationType certificationType;
    
    /**
     * Training modules completed by the user
     */
    private List<String> completedTrainingModules;
    
    /**
     * User's current qualifications and roles
     */
    private List<String> userRoles;
    
    /**
     * Previous certification history
     */
    private List<String> previousCertifications;
    
    /**
     * Assessment requirements for this certification
     */
    private AssessmentRequirements assessmentRequirements;
    
    /**
     * Request timestamp
     */
    private LocalDateTime requestTime;
    
    /**
     * Preferred assessment scheduling
     */
    private AssessmentSchedule preferredSchedule;
    
    /**
     * Additional certification parameters
     */
    private Map<String, Object> additionalParameters;
    
    /**
     * Certification Type enumeration
     */
    public enum CertificationType {
        PROTOCOL_CERTIFICATION,
        SYSTEM_CERTIFICATION,
        REGULATORY_CERTIFICATION,
        SAFETY_CERTIFICATION,
        QUALITY_CERTIFICATION,
        PRINCIPAL_INVESTIGATOR_CERTIFICATION,
        STUDY_COORDINATOR_CERTIFICATION,
        DATA_ENTRY_CERTIFICATION
    }
    
    /**
     * Assessment Requirements nested class
     */
    @Data
    @Builder
    public static class AssessmentRequirements {
        private Integer passingScore;
        private Integer maxAttempts;
        private Integer timelimitMinutes;
        private List<String> assessmentModules;
        private boolean practicalAssessmentRequired;
        private Map<String, Object> customRequirements;
    }
    
    /**
     * Assessment Schedule nested class
     */
    @Data
    @Builder
    public static class AssessmentSchedule {
        private LocalDateTime preferredAssessmentDate;
        private List<String> preferredTimeSlots;
        private String timezone;
        private boolean flexibleScheduling;
        private Map<String, Object> schedulePreferences;
    }
}