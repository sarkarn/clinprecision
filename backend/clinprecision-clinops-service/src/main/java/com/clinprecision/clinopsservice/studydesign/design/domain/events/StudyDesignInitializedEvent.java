package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating study design aggregate was initialized
 */
@Data
@Builder
public class StudyDesignInitializedEvent {
    
    private final UUID studyDesignId;
    private final UUID studyAggregateUuid;
    private final String studyName;
    private final Long createdBy;
    private final LocalDateTime occurredAt;
    
    public static StudyDesignInitializedEvent from(UUID studyDesignId, 
                                                   UUID studyAggregateUuid,
                                                   String studyName, 
                                                   Long createdBy) {
        return StudyDesignInitializedEvent.builder()
            .studyDesignId(studyDesignId)
            .studyAggregateUuid(studyAggregateUuid)
            .studyName(studyName)
            .createdBy(createdBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
