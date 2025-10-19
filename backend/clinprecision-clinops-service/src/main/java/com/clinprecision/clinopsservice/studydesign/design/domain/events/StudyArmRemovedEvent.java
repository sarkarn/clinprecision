package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a study arm was removed
 */
@Data
@Builder
public class StudyArmRemovedEvent {
    
    private final UUID studyDesignId;
    private final UUID armId;
    private final String reason;
    private final Long removedBy;
    private final LocalDateTime occurredAt;
    
    public static StudyArmRemovedEvent from(UUID studyDesignId, UUID armId, 
                                           String reason, Long removedBy) {
        return StudyArmRemovedEvent.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .reason(reason)
            .removedBy(removedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
