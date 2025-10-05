package com.clinprecision.clinopsservice.study.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for suspending a study
 * 
 * This DTO represents the HTTP request body for POST /api/studies/{uuid}/suspend
 * Requires a reason for audit trail purposes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuspendStudyRequestDto {
    
    @NotBlank(message = "Reason is required for suspending a study")
    private String reason;
}
