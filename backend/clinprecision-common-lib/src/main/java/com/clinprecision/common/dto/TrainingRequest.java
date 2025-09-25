package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Map;

/**
 * Training Request DTO
 * 
 * Common DTO for training and certification requests across microservices.
 * Used in Phase 1.1 Study Database Build workflow for personnel training
 * plans, training sessions, and certification processes.
 */
@Data
@Builder
public class TrainingRequest {
    
    /**
     * Study identifier for which training is being conducted
     */
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    /**
     * Site identifier (optional, for site-specific training)
     */
    private Long siteId;
    
    /**
     * User requesting the training
     */
    @NotNull(message = "Requested by is required")
    private String requestedBy;
    
    /**
     * Type of training request
     */
    @NotNull(message = "Training type is required")
    private TrainingType trainingType;
    
    /**
     * Personnel to be trained
     */
    @NotEmpty(message = "Personnel list is required")
    private List<TrainingParticipant> participants;
    
    /**
     * Training modules to be included
     */
    @NotEmpty(message = "Training modules are required")
    private List<TrainingModule> trainingModules;
    
    /**
     * Training schedule preferences
     */
    private TrainingSchedule schedule;
    
    /**
     * Certification requirements
     */
    private CertificationRequirements certificationRequirements;
    
    /**
     * Additional training parameters
     */
    private Map<String, Object> additionalParameters;
    
    /**
     * Training Type enumeration
     */
    public enum TrainingType {
        INITIAL_TRAINING,
        REFRESHER_TRAINING,
        PROTOCOL_SPECIFIC,
        SYSTEM_TRAINING,
        COMPLIANCE_TRAINING,
        CERTIFICATION_TRAINING
    }
    
    /**
     * Training Participant nested class
     */
    @Data
    @Builder
    public static class TrainingParticipant {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        private String userName;
        private String userEmail;
        
        @NotEmpty(message = "Participant roles are required")
        private List<String> roles;
        
        private List<String> existingQualifications;
        private Map<String, Object> personalizedRequirements;
    }
    
    /**
     * Training Module nested class
     */
    @Data
    @Builder
    public static class TrainingModule {
        @NotNull(message = "Module ID is required")
        private Long moduleId;
        
        private String moduleName;
        private String moduleDescription;
        private Integer estimatedDurationMinutes;
        private List<String> prerequisites;
        private Map<String, Object> moduleSettings;
    }
    
    /**
     * Training Schedule nested class
     */
    @Data
    @Builder
    public static class TrainingSchedule {
        private java.time.LocalDateTime preferredStartDate;
        private java.time.LocalDateTime preferredEndDate;
        private List<String> preferredTimeSlots;
        private String timezone;
        private Map<String, Object> schedulePreferences;
    }
    
    /**
     * Certification Requirements nested class
     */
    @Data
    @Builder
    public static class CertificationRequirements {
        private boolean certificationRequired;
        private Integer passingScore;
        private Integer maxAttempts;
        private Integer certificationValidityDays;
        private List<String> certificationCriteria;
        private Map<String, Object> customRequirements;
    }
}