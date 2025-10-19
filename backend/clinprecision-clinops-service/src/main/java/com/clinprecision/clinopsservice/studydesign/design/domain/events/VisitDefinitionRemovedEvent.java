package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a visit was removed from the schedule
 */
@Data
@Builder
public class VisitRemovedEvent {
    
    private final UUID studyDesignId;
    private final UUID visitId;
    private final String reason;
    private final Long removedBy;
    private final LocalDateTime occurredAt;
    
    public static VisitRemovedEvent from(UUID studyDesignId, UUID visitId, 
                                        String reason, Long removedBy) {
        return VisitRemovedEvent.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .reason(reason)
            .removedBy(removedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
