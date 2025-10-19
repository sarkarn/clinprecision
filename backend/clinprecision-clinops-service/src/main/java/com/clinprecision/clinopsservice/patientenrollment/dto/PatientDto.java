package com.clinprecision.clinopsservice.patientenrollment.dto;

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
    
    // Enrollment information (when patient is enrolled in a study)
    private Long studyId;               // Study ID if patient is enrolled
    private String studyName;           // Study name for display
    private Long enrollmentId;          // Enrollment record ID
    private String enrollmentStatus;    // Enrollment status (ENROLLED, ACTIVE, etc.)
    private LocalDate enrollmentDate;   // Date of enrollment
    private String screeningNumber;     // Study-specific screening number
    private Long siteId;               // Site association ID
    private String siteName;           // Site name for display
    
    // NOTE: Treatment arm fields removed for EDC blinding compliance
    // See: EDC_BLINDING_ARCHITECTURE_DECISION.md
    // Randomization handled by external IWRS/RTSM system
}



