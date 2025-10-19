package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.events;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Version Details Updated
 * 
 * Domain event representing that version details were updated.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class VersionDetailsUpdatedEvent {
    
    UUID versionId;
    String description;
    String changesSummary;
    String impactAssessment;
    String additionalNotes;
    String protocolChanges;
    String icfChanges;
    Long updatedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event
     */
    public static VersionDetailsUpdatedEvent from(UUID versionId,
                                                  String description,
                                                  String changesSummary,
                                                  String impactAssessment,
                                                  String additionalNotes,
                                                  String protocolChanges,
                                                  String icfChanges,
                                                  Long updatedBy) {
        return VersionDetailsUpdatedEvent.builder()
            .versionId(versionId)
            .description(description)
            .changesSummary(changesSummary)
            .impactAssessment(impactAssessment)
            .additionalNotes(additionalNotes)
            .protocolChanges(protocolChanges)
            .icfChanges(icfChanges)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}



