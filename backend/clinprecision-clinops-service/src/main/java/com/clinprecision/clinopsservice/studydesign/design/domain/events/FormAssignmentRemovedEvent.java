package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a form assignment was removed from a visit
 */
@Data
@Builder
public class FormAssignmentRemovedEvent {
    
    private final UUID studyDesignId;
    private final UUID assignmentId;
    private final String reason;
    private final Long removedBy;
    private final LocalDateTime occurredAt;
    
    public static FormAssignmentRemovedEvent from(UUID studyDesignId, UUID assignmentId,
                                                  String reason, Long removedBy) {
        return FormAssignmentRemovedEvent.builder()
            .studyDesignId(studyDesignId)
            .assignmentId(assignmentId)
            .reason(reason)
            .removedBy(removedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
