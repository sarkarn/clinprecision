package com.clinprecision.clinopsservice.studydesign.design.domain.events;

import com.clinprecision.clinopsservice.studydesign.design.model.VisitType;
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
    private final UUID studyAggregateId;
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
    
    public static VisitDefinedEvent from(UUID studyDesignId, UUID studyAggregateId, UUID visitId, String name,
                                        String description, Integer timepoint, Integer windowBefore,
                                        Integer windowAfter, VisitType visitType, Boolean isRequired,
                                        Integer sequenceNumber, UUID armId, Long definedBy) {
        Long actor = definedBy != null ? definedBy : 1L;

        return VisitDefinedEvent.builder()
            .studyDesignId(studyDesignId)
            .studyAggregateId(studyAggregateId)
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
            .definedBy(actor)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
