package com.clinprecision.datacaptureservice.dto.workflow;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Workflow Metrics DTO for monitoring and analytics
 */
@Data
@Builder
public class WorkflowMetrics {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Total number of workflows executed
     */
    private int totalWorkflows;
    
    /**
     * Number of successful workflows
     */
    private int successfulWorkflows;
    
    /**
     * Number of failed workflows
     */
    private int failedWorkflows;
    
    /**
     * Average execution time in seconds
     */
    private double averageExecutionTime;
    
    /**
     * Success rate percentage
     */
    private double successRate;
    
    /**
     * Phase-specific metrics
     */
    private Map<String, PhaseMetrics> phaseMetrics;
    
    /**
     * Most common failure reasons
     */
    private Map<String, Integer> failureReasons;
    
    /**
     * Phase-specific metrics
     */
    @Data
    @Builder
    public static class PhaseMetrics {
        private String phaseName;
        private int totalExecutions;
        private int successfulExecutions;
        private int failedExecutions;
        private double averageExecutionTime;
        private double successRate;
    }
}