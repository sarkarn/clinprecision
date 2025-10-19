package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a study arm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudyArmRequest {
    
    private String name;
    private String description;
    private Integer plannedSubjects;
    private Long updatedBy;
}
