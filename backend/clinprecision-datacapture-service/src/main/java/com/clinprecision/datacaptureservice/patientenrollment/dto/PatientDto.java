package com.clinprecision.datacaptureservice.patientenrollment.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for patient information responses
 * Used for returning patient data from API queries
 * Follows established pattern with both Long ID and aggregate UUID
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {

    private Long id;                    // Database primary key
    private String aggregateUuid;       // Axon aggregate identifier
    private String patientNumber;       // Human-readable patient identifier
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String email;
    private String fullName;
    private Integer age;
    private String status;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}