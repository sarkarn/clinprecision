package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating deviation status
 * Used in PUT /api/v1/deviations/{id}/status endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeviationStatusRequest {

    @NotNull(message = "New status is required")
    private DeviationStatus newStatus;

    @NotNull(message = "User ID is required")
    private Long userId;
}
