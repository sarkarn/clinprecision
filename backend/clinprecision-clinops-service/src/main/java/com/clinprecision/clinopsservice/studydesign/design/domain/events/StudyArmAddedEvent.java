package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import com.clinprecision.clinopsservice.studydesign.design.model.ArmType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a study arm was added
 */
@Data
@Builder
public class StudyArmAddedEvent {
    
    private final UUID studyDesignId;
    private final UUID armId;
    private final String name;
    private final String description;
    private final ArmType type;
    private final Integer sequenceNumber;
    private final Integer plannedSubjects;
    private final Long addedBy;
    private final LocalDateTime occurredAt;
    
    public static StudyArmAddedEvent from(UUID studyDesignId, UUID armId, String name,
                                          String description, ArmType type, Integer sequenceNumber,
                                          Integer plannedSubjects, Long addedBy) {
        return StudyArmAddedEvent.builder()
            .studyDesignId(studyDesignId)
            .armId(armId)
            .name(name)
            .description(description)
            .type(type)
            .sequenceNumber(sequenceNumber)
            .plannedSubjects(plannedSubjects)
            .addedBy(addedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
