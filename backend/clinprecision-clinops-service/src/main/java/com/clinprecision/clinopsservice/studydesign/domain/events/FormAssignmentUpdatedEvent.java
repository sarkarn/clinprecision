package com.clinprecision.clinopsservice.studydesign.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating form assignment details were updated
 */
@Data
@Builder
public class FormAssignmentUpdatedEvent {
    
    private final UUID studyDesignId;
    private final UUID assignmentId;
    private final Boolean isRequired;
    private final Boolean isConditional;
    private final String conditionalLogic;
    private final String instructions;
    private final Long updatedBy;
    private final LocalDateTime occurredAt;
    
    public static FormAssignmentUpdatedEvent from(UUID studyDesignId, UUID assignmentId,
                                                  Boolean isRequired, Boolean isConditional,
                                                  String conditionalLogic, String instructions,
                                                  Long updatedBy) {
        return FormAssignmentUpdatedEvent.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .isRequired(isRequired)
            .isConditional(isConditional)
            .conditionalLogic(conditionalLogic)
            .instructions(instructions)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
