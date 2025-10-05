package com.clinprecision.clinopsservice.studydesign.domain.events;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event indicating a visit was defined in the study schedule
 */
@Data
@Builder
public class VisitDefinedEvent {
    
    private final UUID studyDesignId;
    private final UUID visitId;
    private final String name;
    private final String description;
    private final Integer timepoint;
    private final Integer windowBefore;
    private final Integer windowAfter;
    private final VisitType visitType;
    private final Boolean isRequired;
    private final Integer sequenceNumber;
    private final UUID armId;
    private final Long definedBy;
    private final LocalDateTime occurredAt;
    
    public static VisitDefinedEvent from(UUID studyDesignId, UUID visitId, String name,
                                        String description, Integer timepoint, Integer windowBefore,
                                        Integer windowAfter, VisitType visitType, Boolean isRequired,
                                        Integer sequenceNumber, UUID armId, Long definedBy) {
        return VisitDefinedEvent.builder()
            .studyDesignId(studyDesignId)
            .visitId(visitId)
            .name(name)
            .description(description)
            .timepoint(timepoint)
            .windowBefore(windowBefore)
            .windowAfter(windowAfter)
            .visitType(visitType)
            .isRequired(isRequired)
            .sequenceNumber(sequenceNumber)
            .armId(armId)
            .definedBy(definedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
