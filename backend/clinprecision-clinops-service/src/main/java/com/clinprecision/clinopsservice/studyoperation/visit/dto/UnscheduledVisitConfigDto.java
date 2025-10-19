package com.clinprecision.clinopsservice.studyoperation.visit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO for unscheduled visit configuration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnscheduledVisitConfigDto {

    private Long id;

    @NotBlank(message = "Visit code is required")
    @Size(max = 50, message = "Visit code must be 50 characters or less")
    @Pattern(regexp = "^[A-Z_]+$", message = "Visit code must contain only uppercase letters and underscores")
    private String visitCode;

    @NotBlank(message = "Visit name is required")
    @Size(max = 100, message = "Visit name must be 100 characters or less")
    private String visitName;

    @Size(max = 1000, message = "Description must be 1000 characters or less")
    private String description;

    @NotNull(message = "Visit order is required")
    private Integer visitOrder;

    private Boolean isEnabled;

    // Audit fields (read-only)
    private String createdBy;
    private String updatedBy;
    private String createdAt;
    private String updatedAt;
}
