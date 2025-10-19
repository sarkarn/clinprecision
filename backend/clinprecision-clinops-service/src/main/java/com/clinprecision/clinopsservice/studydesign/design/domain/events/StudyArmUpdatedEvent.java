package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating study arm details were updated
 */
@Data
@Builder
public class StudyArmUpdatedEvent {
    
    private final UUID studyDesignId;
    private final UUID armId;
    private final String name;
    private final String description;
    private final Integer plannedSubjects;
    private final Long updatedBy;
    private final LocalDateTime occurredAt;
    
    public static StudyArmUpdatedEvent from(UUID studyDesignId, UUID armId, String name,
                                           String description, Integer plannedSubjects, Long updatedBy) {
        return StudyArmUpdatedEvent.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .name(name)
            .description(description)
            .plannedSubjects(plannedSubjects)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
