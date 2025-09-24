package com.clinprecision.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Training Result DTO
 * 
 * Common DTO for training results across microservices.
 * Used in Phase 1.1 Study Database Build workflow to return the status
 * of training plan creation and execution.
 */
@Data
@Builder
public class TrainingResult {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Site identifier (optional)
     */
    private Long siteId;
    
    /**
     * Training plan identifier
     */
    private Long trainingPlanId;
    
    /**
     * Training status
     */
    private String trainingStatus;
    
    /**
     * Training creation/completion timestamp
     */
    private LocalDateTime trainingTime;
    
    /**
     * Descriptive message about the training
     */
    private String message;
    
    /**
     * Number of participants enrolled
     */
    private Integer participantsEnrolled;
    
    /**
     * Number of participants completed
     */
    private Integer participantsCompleted;
    
    /**
     * Training modules included
     */
    private List<String> trainingModules;
    
    /**
     * Training plan details
     */
    private Map<String, Object> trainingPlanDetails;
    
    /**
     * Error details if training failed
     */
    private String errorDetails;
    
    /**
     * Enumeration for common training statuses
     */
    public enum TrainingStatus {
        PLAN_CREATED("PLAN_CREATED"),
        IN_PROGRESS("IN_PROGRESS"),
        COMPLETED("COMPLETED"),
        FAILED("FAILED"),
        CANCELLED("CANCELLED");
        
        private final String value;
        
        TrainingStatus(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}