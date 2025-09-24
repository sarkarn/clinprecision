package com.clinprecision.datacaptureservice.dto.workflow;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Workflow Status DTO for monitoring workflow execution
 */
@Data
@Builder
public class WorkflowStatus {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Current workflow status
     */
    private Status status;
    
    /**
     * Current phase being executed
     */
    private String currentPhase;
    
    /**
     * Progress percentage (0-100)
     */
    private int progressPercentage;
    
    /**
     * Status message
     */
    private String message;
    
    /**
     * Workflow start time
     */
    private LocalDateTime startTime;
    
    /**
     * Last updated time
     */
    private LocalDateTime lastUpdated;
    
    /**
     * Estimated completion time (if available)
     */
    private LocalDateTime estimatedCompletion;
    
    /**
     * Additional status details
     */
    private Map<String, Object> details;
    
    /**
     * Error information (if applicable)
     */
    private String errorDetails;
    
    /**
     * Status enumeration
     */
    public enum Status {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        CANCELLED,
        ROLLED_BACK
    }
}