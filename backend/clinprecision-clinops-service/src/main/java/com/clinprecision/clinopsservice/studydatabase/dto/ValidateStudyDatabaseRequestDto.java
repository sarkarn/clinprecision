package com.clinprecision.clinopsservice.studydatabase.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for validating study database
 * Maps to ValidateStudyDatabaseCommand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateStudyDatabaseRequestDto {

    @NotNull(message = "Build request ID is required")
    private String buildRequestId;

    /**
     * Enable strict validation mode
     */
    @Builder.Default
    private Boolean strictValidation = false;

    /**
     * Enable compliance check (FDA 21 CFR Part 11)
     */
    @Builder.Default
    private Boolean complianceCheck = true;

    /**
     * Enable performance check
     */
    @Builder.Default
    private Boolean performanceCheck = false;
}
