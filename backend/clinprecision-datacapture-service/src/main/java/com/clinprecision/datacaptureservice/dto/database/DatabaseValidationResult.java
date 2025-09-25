package com.clinprecision.datacaptureservice.dto.database;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Database Validation Result DTO
 * 
 * Contains the results of database validation operations including:
 * - Validation status and details
 * - Error and warning information
 * - Compliance check results
 * - Performance assessment results
 */
@Data
@Builder
public class DatabaseValidationResult {
    
    private boolean isValid;
    
    private Long studyId;
    
    private LocalDateTime validationTimestamp;
    
    private List<String> validationErrors;
    
    private List<String> validationWarnings;
    
    private List<String> validationSteps;
    
    private ComplianceValidationResult complianceResult;
    
    private PerformanceValidationResult performanceResult;
    
    private String overallAssessment;
    
    /**
     * Compliance validation specific results
     */
    @Data
    @Builder
    public static class ComplianceValidationResult {
        private boolean cfr21Part11Compliant;
        private boolean ichGcpCompliant;
        private boolean auditTrailEnabled;
        private boolean electronicSignatureReady;
        private List<String> complianceIssues;
    }
    
    /**
     * Performance validation specific results
     */
    @Data
    @Builder
    public static class PerformanceValidationResult {
        private boolean performanceOptimal;
        private Long averageResponseTimeMs;
        private boolean indexesOptimized;
        private String estimatedCapacity;
        private List<String> performanceRecommendations;
    }
}