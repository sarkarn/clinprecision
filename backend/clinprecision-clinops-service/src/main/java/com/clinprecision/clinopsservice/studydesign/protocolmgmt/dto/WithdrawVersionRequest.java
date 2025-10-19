package com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for withdrawing a protocol version
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawVersionRequest {

    @NotBlank(message = "Withdrawal reason is required")
    @Size(min = 10, max = 1000, message = "Withdrawal reason must be between 10 and 1000 characters")
    private String withdrawalReason;

    @NotNull(message = "User ID is required")
    private Long withdrawnBy;
}



