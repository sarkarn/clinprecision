package com.clinprecision.datacaptureservice.studydatabase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for cancelling study database build
 * Maps to CancelStudyDatabaseBuildCommand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelStudyDatabaseBuildRequestDto {

    @NotNull(message = "Build request ID is required")
    private String buildRequestId;

    @NotBlank(message = "Cancellation reason is required for audit trail")
    private String cancellationReason;
}
