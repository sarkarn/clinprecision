package com.clinprecision.datacaptureservice.patientenrollment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for patient enrollment requests
 * Maps to EnrollPatientCommand fields - uses Long IDs which are mapped to UUIDs internally
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollPatientDto {

    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    @NotNull(message = "Site ID is required")
    private Long siteId;
    
    @NotBlank(message = "Screening number is required")
    private String screeningNumber;
    
    private LocalDate enrollmentDate;
}