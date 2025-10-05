package com.clinprecision.clinopsservice.studydesign.domain.events;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Study Status Changed
 * 
 * Domain event representing that a study's status has changed.
 * This replaces the database trigger logic with explicit event-driven status management.
 * 
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class StudyStatusChangedEvent {
    
    UUID studyId;
    StudyStatus oldStatus;
    StudyStatus newStatus;
    String reason;
    Long changedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event
     */
    public static StudyStatusChangedEvent from(UUID studyId,
                                               StudyStatus oldStatus,
                                               StudyStatus newStatus,
                                               String reason,
                                               Long changedBy) {
        return StudyStatusChangedEvent.builder()
            .studyId(studyId)
            .oldStatus(oldStatus)
            .newStatus(newStatus)
            .reason(reason)
            .changedBy(changedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
