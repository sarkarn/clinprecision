package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for withdrawing a study
 * 
 * This DTO represents the HTTP request body for POST /api/studies/{uuid}/withdraw
 * Requires a reason for audit trail purposes
 * Withdrawal is a terminal state - study cannot be modified after this
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawStudyRequestDto {
    
    @NotBlank(message = "Reason is required for withdrawing a study")
    private String reason;
}



