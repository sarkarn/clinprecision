package com.clinprecision.clinopsservice.patientenrollment.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command to register a new patient in the system
 * Follows established patterns from CreateUserCommand
 */
@Getter
@Builder
@ToString
public class RegisterPatientCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Patient ID is required")
    private final UUID patientId;
    
    @NotBlank(message = "First name is required")
    private final String firstName;
    
    private final String middleName;
    
    @NotBlank(message = "Last name is required") 
    private final String lastName;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private final LocalDate dateOfBirth;
    
    @NotBlank(message = "Gender is required")
    private final String gender;
    
    private final String phoneNumber;
    
    @Email(message = "Email must be valid")
    private final String email;
    
    @NotBlank(message = "Created by is required")
    private final String createdBy;

    @Override
    public void validate() {
        super.validate();
        
        if (firstName != null && firstName.trim().length() < 2) {
            throw new IllegalArgumentException("First name must be at least 2 characters long");
        }
        
        if (lastName != null && lastName.trim().length() < 2) {
            throw new IllegalArgumentException("Last name must be at least 2 characters long");
        }
        
        if (dateOfBirth != null) {
            LocalDate eighteenYearsAgo = LocalDate.now().minusYears(18);
            if (dateOfBirth.isAfter(eighteenYearsAgo)) {
                throw new IllegalArgumentException("Patient must be at least 18 years old");
            }
        }
        
        if (phoneNumber != null && !phoneNumber.trim().isEmpty() && phoneNumber.length() < 10) {
            throw new IllegalArgumentException("Phone number must be at least 10 characters long");
        }
    }
    
    public String getFullName() {
        StringBuilder fullName = new StringBuilder(firstName);
        if (middleName != null && !middleName.trim().isEmpty()) {
            fullName.append(" ").append(middleName);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }
    
    public int getAge() {
        if (dateOfBirth == null) return 0;
        return dateOfBirth.until(LocalDate.now()).getYears();
    }
    
    public boolean hasContactInfo() {
        return (phoneNumber != null && !phoneNumber.trim().isEmpty()) ||
               (email != null && !email.trim().isEmpty());
    }
}



