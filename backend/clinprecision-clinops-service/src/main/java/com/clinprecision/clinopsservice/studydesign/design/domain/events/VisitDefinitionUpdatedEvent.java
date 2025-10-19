package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import com.clinprecision.clinopsservice.studydesign.design.model.VisitType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating visit details were updated
 */
@Data
@Builder
public class VisitDefinitionUpdatedEvent {
    
    private final UUID studyDesignId;
    private final UUID visitId;
    private final String name;
    private final String description;
    private final Integer timepoint;
    private final Integer windowBefore;
    private final Integer windowAfter;
    private final VisitType visitType; // BUGFIX: Added visitType field
    private final Boolean isRequired;
    private final Long updatedBy;
    private final LocalDateTime occurredAt;
    
    public static VisitDefinitionUpdatedEvent from(UUID studyDesignId, UUID visitId, String name,
                                                   String description, Integer timepoint, Integer windowBefore,
                                                   Integer windowAfter, VisitType visitType, Boolean isRequired, Long updatedBy) {
        return VisitDefinitionUpdatedEvent.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .name(name)
            .description(description)
            .timepoint(timepoint)
            .windowBefore(windowBefore)
            .windowAfter(windowAfter)
            .visitType(visitType) // BUGFIX: Added visitType
            .isRequired(isRequired)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
