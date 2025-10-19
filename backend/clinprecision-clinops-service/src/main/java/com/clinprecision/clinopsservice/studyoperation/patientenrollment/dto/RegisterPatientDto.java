package com.clinprecision.clinopsservice.studyoperation.patientenrollment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for patient registration requests
 * Maps directly to RegisterPatientCommand fields
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterPatientDto {

    @NotBlank(message = "First name is required")
    private String firstName;
    
    private String middleName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    private String phoneNumber;
    
    @Email(message = "Email must be valid")
    private String email;
}



