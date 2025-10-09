package com.clinprecision.clinopsservice.patientenrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for eligibility confirmation requests
 * Maps to ConfirmEligibilityCommand fields
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmEligibilityDto {

    @NotNull(message = "Eligible flag is required")
    private Boolean eligible;
    
    private String ineligibilityReason;
}



