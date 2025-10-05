package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a study arm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddStudyArmRequest {
    
    private String name;
    private String description;
    private String type; // ArmType enum as string
    private Integer sequenceNumber;
    private Integer plannedSubjects;
    private Long addedBy;
}
