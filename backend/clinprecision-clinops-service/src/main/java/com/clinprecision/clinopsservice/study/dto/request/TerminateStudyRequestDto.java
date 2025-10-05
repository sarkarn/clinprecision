package com.clinprecision.clinopsservice.study.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for terminating a study
 * 
 * This DTO represents the HTTP request body for POST /api/studies/{uuid}/terminate
 * Requires a reason for audit trail purposes
 * Termination is a terminal state - study cannot be modified after this
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TerminateStudyRequestDto {
    
    @NotBlank(message = "Reason is required for terminating a study")
    private String reason;
}
