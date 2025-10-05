package com.clinprecision.clinopsservice.protocolversion.dto;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for changing version status
 * REPLACES DATABASE TRIGGERS with explicit API call!
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeStatusRequest {

    @NotNull(message = "New status is required")
    private VersionStatus newStatus;

    @NotBlank(message = "Reason for status change is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    @NotNull(message = "User ID is required")
    private Long userId;
}
