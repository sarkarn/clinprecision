package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for StudyArmEntity
 * Represents a study arm/group in a clinical research study
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyArmDto {
    
    private Long id;
    private Long studyId;
    private String name;
    private String description;
    private String armType;
    private Integer targetEnrollment;
    private String randomizationRatio;
    private String conditionalLogic;
    private String metadata;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
}
