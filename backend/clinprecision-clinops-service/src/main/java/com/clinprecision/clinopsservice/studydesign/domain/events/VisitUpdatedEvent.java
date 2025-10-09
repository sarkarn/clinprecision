package com.clinprecision.clinopsservice.studydesign.domain.events;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating visit details were updated
 */
@Data
@Builder
public class VisitUpdatedEvent {
    
    private final UUID studyDesignId;
    private final UUID visitId;
    private final String name;
    private final String description;
    private final Integer timepoint;
    private final Integer windowBefore;
    private final Integer windowAfter;
    private final Boolean isRequired;
    private final Long updatedBy;
    private final LocalDateTime occurredAt;
    
    public static VisitUpdatedEvent from(UUID studyDesignId, UUID visitId, String name,
                                        String description, Integer timepoint, Integer windowBefore,
                                        Integer windowAfter, Boolean isRequired, Long updatedBy) {
        return VisitUpdatedEvent.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .name(name)
            .description(description)
            .timepoint(timepoint)
            .windowBefore(windowBefore)
            .windowAfter(windowAfter)
            .isRequired(isRequired)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
