package com.clinprecision.clinopsservice.studydatabase.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * Data Transfer Object for completing study database build
 * Maps to CompleteStudyDatabaseBuildCommand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteStudyDatabaseBuildRequestDto {

    @NotNull(message = "Build request ID is required")
    private String buildRequestId;

    @NotNull(message = "Forms configured count is required")
    @Min(value = 0, message = "Forms configured must be non-negative")
    private Integer formsConfigured;

    @NotNull(message = "Validation rules count is required")
    @Min(value = 0, message = "Validation rules must be non-negative")
    private Integer validationRulesSetup;

    /**
     * Validation result data
     */
    @NotNull(message = "Validation result is required")
    private ValidationResultDto validationResult;

    /**
     * Build metrics (optional)
     * Examples:
     * - "tablesCreated": 10
     * - "indexesCreated": 25
     * - "triggersCreated": 5
     * - "durationSeconds": 120
     */
    private Map<String, Object> buildMetrics;

    /**
     * Nested DTO for validation results
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationResultDto {
        
        @NotNull(message = "Validation status is required")
        private Boolean isValid;

        @NotBlank(message = "Overall assessment is required")
        private String overallAssessment;

        @NotBlank(message = "Compliance status is required")
        private String complianceStatus;

        private Integer performanceScore;
    }
}



