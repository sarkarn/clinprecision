package com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command to update patient demographic information
 * 
 * Allows updating patient contact and demographic details while maintaining
 * complete audit trail through event sourcing.
 * 
 * Follows established ClinPrecision command patterns:
 * - Immutable with @Value
 * - Validation annotations
 * - Extends BaseCommand for common behavior
 * 
 * @see RegisterPatientCommand
 * @see ChangePatientStatusCommand
 */
@Getter
@Builder
@ToString
public class UpdatePatientDemographicsCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Patient ID is required")
    private final UUID patientId;
    
    private final String firstName;
    
    private final String middleName;
    
    private final String lastName;
    
    @Past(message = "Date of birth must be in the past")
    private final LocalDate dateOfBirth;
    
    private final String gender;
    
    private final String phoneNumber;
    
    @Email(message = "Email must be valid")
    private final String email;
    
    @NotNull(message = "Updated by is required")
    private final String updatedBy;

    @Override
    public void validate() {
        super.validate();
        
        // At least one field must be provided for update
        if (firstName == null && middleName == null && lastName == null && 
            dateOfBirth == null && gender == null && phoneNumber == null && email == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
        
        // If dateOfBirth is provided, calculate age and validate
        if (dateOfBirth != null) {
            int age = dateOfBirth.until(LocalDate.now()).getYears();
            if (age < 18) {
                throw new IllegalArgumentException("Patient must be at least 18 years old");
            }
        }
        
        // If provided, validate contact information
        if (phoneNumber != null && phoneNumber.trim().isEmpty() && 
            email != null && email.trim().isEmpty()) {
            throw new IllegalArgumentException("Patient must have either phone number or email");
        }
    }
}
