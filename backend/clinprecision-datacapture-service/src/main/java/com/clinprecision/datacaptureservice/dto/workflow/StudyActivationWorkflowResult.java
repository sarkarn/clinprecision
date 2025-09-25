package com.clinprecision.datacaptureservice.dto.workflow;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Phase 1.1 Study Activation Workflow Result DTO
 * 
 * Contains the results of Phase 1.1 study activation workflow execution:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 */
@Data
@Builder
public class StudyActivationWorkflowResult {
    
    /**
     * Study identifier
     */
    private Long studyId;
    
    /**
     * Overall workflow status
     */
    private String workflowStatus;
    
    /**
     * Start time of the workflow
     */
    private java.time.LocalDateTime workflowStartTime;
    
    /**
     * End time of the workflow
     */
    private java.time.LocalDateTime workflowEndTime;
    
    /**
     * Status of each phase
     */
    private PhaseResults phaseResults;
    
    /**
     * Error details if workflow failed
     */
    private String errorMessage;
    
    /**
     * Number of successful operations
     */
    private int successfulOperations;
    
    /**
     * Number of failed operations
     */
    private int failedOperations;
    
    /**
     * List of operations that were rolled back
     */
    private List<String> rolledBackOperations;
    
    /**
     * List of completed phases
     */
    private List<String> completedPhases;
    
    /**
     * List of error messages
     */
    private List<String> errors;
    
    /**
     * Workflow result message
     */
    private String message;
    
    /**
     * Total number of sites activated
     */
    private Integer totalSitesActivated;
    
    /**
     * Workflow Status Enum
     */
    public enum WorkflowStatus {
        SUCCESS,
        PARTIAL_SUCCESS,
        FAILED,
        IN_PROGRESS,
        ROLLED_BACK
    }
    
    /**
     * Phase Results Container
     */
    @Data
    @Builder
    public static class PhaseResults {
        private PhaseResult phase1DatabaseSetup;
        private PhaseResult phase2UserAccess;
        private PhaseResult phase3SiteTraining;
        private PhaseResult phase4SiteActivation;
    }
    
    /**
     * Individual Phase Result
     */
    @Data
    @Builder
    public static class PhaseResult {
        private String phaseName;
        private PhaseStatus status;
        private String message;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
        private List<OperationResult> operations;
        private String errorDetails;
    }
    
    /**
     * Operation Result within a phase
     */
    @Data
    @Builder
    public static class OperationResult {
        private String operationName;
        private OperationStatus status;
        private String message;
        private Map<String, Object> resultData;
        private String errorDetails;
    }
    
    /**
     * Phase Status Enum
     */
    public enum PhaseStatus {
        SUCCESS,
        FAILED,
        SKIPPED,
        IN_PROGRESS,
        ROLLED_BACK
    }
    
    /**
     * Operation Status Enum
     */
    public enum OperationStatus {
        SUCCESS,
        FAILED,
        SKIPPED,
        IN_PROGRESS,
        ROLLED_BACK
    }
}