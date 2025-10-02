package com.clinprecision.datacaptureservice.studydatabase.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * Data Transfer Object for building study database requests
 * Maps to BuildStudyDatabaseCommand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildStudyDatabaseRequestDto {

    @NotNull(message = "Study ID is required")
    @Min(value = 1, message = "Study ID must be positive")
    private Long studyId;

    @NotBlank(message = "Study name is required")
    private String studyName;

    @NotBlank(message = "Study protocol is required")
    private String studyProtocol;

    @NotNull(message = "Requested by user ID is required")
    @Min(value = 1, message = "User ID must be positive")
    private Long requestedBy;

    /**
     * Build configuration as key-value pairs
     * Examples:
     * - "formsConfigured": 10
     * - "validationRulesSetup": 50
     * - "enableAuditTrail": true
     */
    private Map<String, Object> buildConfiguration;
}
