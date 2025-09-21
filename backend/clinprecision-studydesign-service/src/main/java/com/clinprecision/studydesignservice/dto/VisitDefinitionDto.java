package com.clinprecision.studydesignservice.dto;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity.VisitType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Visit Definition data transfer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitDefinitionDto {

    private Long id;

    @NotNull(message = "Study ID is required")
    private Long studyId;

    private Long armId; // Optional arm-specific visits

    @NotBlank(message = "Visit name is required")
    private String name;

    private String description;

    @NotNull(message = "Timepoint is required")
    private Integer timepoint; // Days from baseline

    @Min(value = 0, message = "Window before must be non-negative")
    @Builder.Default
    private Integer windowBefore = 0;

    @Min(value = 0, message = "Window after must be non-negative")
    @Builder.Default
    private Integer windowAfter = 0;

    @NotNull(message = "Visit type is required")
    @Builder.Default
    private VisitType visitType = VisitType.TREATMENT;

    @Builder.Default
    private Boolean isRequired = true;

    private Integer sequenceNumber;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Associated forms (populated when needed)
    private List<VisitFormDto> visitForms;

    // Helper method to get visit window description
    public String getWindowDescription() {
        if (windowBefore == 0 && windowAfter == 0) {
            return "Day " + timepoint;
        } else if (windowBefore.equals(windowAfter)) {
            return "Day " + timepoint + " ± " + windowBefore + " days";
        } else {
            return "Day " + (timepoint - windowBefore) + " to " + (timepoint + windowAfter);
        }
    }
}