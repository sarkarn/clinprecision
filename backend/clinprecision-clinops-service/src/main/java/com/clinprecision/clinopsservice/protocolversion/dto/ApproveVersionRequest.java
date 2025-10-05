package com.clinprecision.clinopsservice.protocolversion.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for approving a protocol version
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveVersionRequest {

    @NotNull(message = "Approver user ID is required")
    private Long approvedBy;

    private LocalDate approvedDate;

    private LocalDate effectiveDate;

    @Size(max = 1000, message = "Approval comments cannot exceed 1000 characters")
    private String approvalComments;
}
