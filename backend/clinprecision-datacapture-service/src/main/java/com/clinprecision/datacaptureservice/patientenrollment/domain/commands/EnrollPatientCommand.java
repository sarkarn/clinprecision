package com.clinprecision.datacaptureservice.patientenrollment.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Command to enroll a patient into a study
 * Follows established patterns from CreateUserCommand
 */
@Getter
@Builder
@ToString
public class EnrollPatientCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Enrollment ID is required")
    private final UUID enrollmentId;
    
    @NotNull(message = "Patient ID is required")
    private final UUID patientId;
    
    @NotNull(message = "Study ID is required")
    private final UUID studyId;
    
    @NotNull(message = "Site ID is required")
    private final UUID siteId;
    
    @NotBlank(message = "Screening number is required")
    private final String screeningNumber;
    
    @NotBlank(message = "Created by is required")
    private final String createdBy;

    @Override
    public void validate() {
        super.validate();
        
        if (screeningNumber != null && screeningNumber.trim().length() < 3) {
            throw new IllegalArgumentException("Screening number must be at least 3 characters long");
        }
    }
    
    public boolean isValidForEnrollment() {
        return patientId != null && studyId != null && siteId != null && 
               screeningNumber != null && !screeningNumber.trim().isEmpty();
    }
}
