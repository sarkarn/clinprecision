package com.clinprecision.datacaptureservice.dto.database;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Database Build Result DTO
 * 
 * Contains the results of a database build operation including:
 * - Build status and timing
 * - Validation results
 * - Error and warning details
 * - Next steps for activation
 */
@Data
@Builder
public class DatabaseBuildResult {
    
    private Long studyId;
    
    private String buildRequestId;
    
    private String buildStatus; // IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    
    private LocalDateTime buildStartTime;
    
    private LocalDateTime buildEndTime;
    
    private DatabaseValidationResult validationResult;
    
    private String message;
    
    private List<String> errors;
    
    private List<String> warnings;
    
    private List<String> nextSteps;
    
    private DatabaseBuildMetrics buildMetrics;
    
    /**
     * Build performance metrics
     */
    @Data
    @Builder
    public static class DatabaseBuildMetrics {
        private Long totalBuildTimeMs;
        private Integer tablesCreated;
        private Integer indexesCreated;
        private Integer triggersCreated;
        private Integer validationRulesCreated;
        private Integer formsConfigured;
        private String estimatedCapacity;
    }
}