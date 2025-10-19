package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a form was assigned to a visit
 */
@Data
@Builder
public class FormAssignedToVisitEvent {
    
    private final UUID studyDesignId;
    private final UUID assignmentId;
    private final UUID visitId;
    private final UUID formId;
    private final Boolean isRequired;
    private final Boolean isConditional;
    private final String conditionalLogic;
    private final Integer displayOrder;
    private final String instructions;
    private final Long assignedBy;
    private final LocalDateTime occurredAt;
    
    public static FormAssignedToVisitEvent from(UUID studyDesignId, UUID assignmentId, 
                                                UUID visitId, UUID formId, Boolean isRequired,
                                                Boolean isConditional, String conditionalLogic,
                                                Integer displayOrder, String instructions, Long assignedBy) {
        return FormAssignedToVisitEvent.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .visitId(visitId)
            .formId(formId)
            .isRequired(isRequired)
            .isConditional(isConditional)
            .conditionalLogic(conditionalLogic)
            .displayOrder(displayOrder)
            .instructions(instructions)
            .assignedBy(assignedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
