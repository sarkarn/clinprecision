package com.clinprecision.studydesignservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * DTO for Visit Form association data transfer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitFormDto {

    private Long id;

    @NotNull(message = "Visit definition ID is required")
    private Long visitDefinitionId;

    @NotNull(message = "Form definition ID is required")
    private Long formDefinitionId;

    @Builder.Default
    private Boolean isRequired = true;

    @Builder.Default
    private Boolean isConditional = false;

    private String conditionalLogic; // JSON or string expression for conditional forms

    @Min(value = 1, message = "Display order must be positive")
    @Builder.Default
    private Integer displayOrder = 1;

    private String instructions; // Specific instructions for this form in this visit

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Populated when we need form details
    private String formName;
    private String formDescription;
    private String formVersion;

    // Populated when we need visit details
    private String visitName;
    private Integer visitTimepoint;
}

/**
 * Request DTO for creating/updating visit-form associations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class VisitFormRequestDto {

    @NotNull(message = "Visit definition ID is required")
    private Long visitDefinitionId;

    @NotNull(message = "Form definition ID is required")
    private Long formDefinitionId;

    @Builder.Default
    private Boolean isRequired = true;

    @Builder.Default
    private Boolean isConditional = false;

    private String conditionalLogic;

    @Min(value = 1, message = "Display order must be positive")
    @Builder.Default
    private Integer displayOrder = 1;

    private String instructions;
}