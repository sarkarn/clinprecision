package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for form assignment
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormAssignmentResponse {
    
    private UUID assignmentId;
    private UUID visitId;
    private UUID formId;
    private Boolean isRequired;
    private Boolean isConditional;
    private String conditionalLogic;
    private Integer displayOrder;
    private String instructions;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
