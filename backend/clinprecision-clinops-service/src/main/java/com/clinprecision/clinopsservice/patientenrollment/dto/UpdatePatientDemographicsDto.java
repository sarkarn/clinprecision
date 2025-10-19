package com.clinprecision.clinopsservice.patientenrollment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for patient demographics update requests
 * 
 * All fields are optional - only provided fields will be updated.
 * Used when updating patient information through the REST API.
 * 
 * Example Usage:
 * <pre>
 * PUT /api/v1/patients/123
 * {
 *   "firstName": "Jane",
 *   "phoneNumber": "+1-555-0199",
 *   "email": "jane.updated@example.com"
 * }
 * </pre>
 * 
 * @see com.clinprecision.clinopsservice.patientenrollment.service.PatientEnrollmentService
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientDemographicsDto {

    private String firstName;
    
    private String middleName;
    
    private String lastName;
    
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    private String phoneNumber;
    
    @Email(message = "Email must be valid")
    private String email;
}
