package com.clinprecision.clinopsservice.studydesign.design.arm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for study arm
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyArmResponse {
    
    private UUID armId;
    private String name;
    private String description;
    private String type;
    private Integer sequenceNumber;
    private Integer plannedSubjects;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
