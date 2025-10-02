package com.clinprecision.datacaptureservice.patientenrollment.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

/**
 * Command to confirm patient eligibility for study enrollment
 * Follows established patterns from CreateUserCommand
 */
@Getter
@Builder
@ToString
public class ConfirmEligibilityCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Enrollment ID is required")
    private final UUID enrollmentId;
    
    @NotNull(message = "Eligible flag is required")
    private final Boolean eligible;
    
    private final String ineligibilityReason;
    
    @NotBlank(message = "Confirmed by is required")
    private final String confirmedBy;

    @Override
    public void validate() {
        super.validate();
        
        // Business rule: If patient is ineligible, reason must be provided
        if (Boolean.FALSE.equals(eligible) && 
            (ineligibilityReason == null || ineligibilityReason.trim().isEmpty())) {
            throw new IllegalArgumentException("Ineligibility reason is required when patient is not eligible");
        }
    }
    
    public boolean isPatientEligible() {
        return Boolean.TRUE.equals(eligible);
    }
    
    public boolean hasIneligibilityReason() {
        return ineligibilityReason != null && !ineligibilityReason.trim().isEmpty();
    }
}
