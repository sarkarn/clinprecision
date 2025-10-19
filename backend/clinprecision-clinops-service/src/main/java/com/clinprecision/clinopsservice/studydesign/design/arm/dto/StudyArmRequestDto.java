package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request;


import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.InterventionDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.RandomizationStrategyDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating/updating study arms
 * Bridge pattern DTO for backward compatibility
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyArmRequestDto {
    
    @NotBlank(message = "Arm name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Arm type is required")
    private String type; // TREATMENT, PLACEBO, CONTROL, ACTIVE_COMPARATOR
    
    @NotNull(message = "Sequence is required")
    @Positive(message = "Sequence must be positive")
    private Integer sequence;
    
    private Integer plannedSubjects;
    
    // Intervention information - structured data
    private List<InterventionDto> interventions;
    
    // Randomization strategy - structured data
    private RandomizationStrategyDto randomizationStrategy;
}
