package com.clinprecision.clinopsservice.studydesign.design.dto;

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
    
    // Event-sourced UUIDs (for DDD layer)
    private UUID assignmentId;
    private UUID visitId;
    private UUID formId;
    
    // Legacy IDs (for frontend compatibility during migration)
    private Long id;                    // Binding ID (legacy PK or assignmentId hash)
    private Long visitDefinitionId;     // For matching visit.id in frontend
    private Long formDefinitionId;      // For matching form.id in frontend
    
    // Binding properties
    private Boolean isRequired;
    private Boolean isConditional;
    private String conditionalLogic;
    private Integer displayOrder;
    private String instructions;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
