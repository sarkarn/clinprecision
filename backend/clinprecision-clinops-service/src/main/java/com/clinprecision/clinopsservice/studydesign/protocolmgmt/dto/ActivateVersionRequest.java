package com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for activating a protocol version
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivateVersionRequest {

    private UUID previousActiveVersionUuid;

    @NotBlank(message = "Activation reason is required")
    @Size(max = 500, message = "Activation reason cannot exceed 500 characters")
    private String activationReason;

    @NotNull(message = "User ID is required")
    private Long activatedBy;
}



