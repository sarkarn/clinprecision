package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.events;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Study Details Updated
 * 
 * Domain event representing that study details have been updated.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class StudyDetailsUpdatedEvent {
    
    UUID studyId;
    String name;
    String description;
    String indication;
    String studyType;
    String principalInvestigator;
    Integer plannedSubjects;
    Integer plannedSites;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    Long updatedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event from command
     */
    public static StudyDetailsUpdatedEvent from(UUID studyId,
                                                String name,
                                                String description,
                                                String indication,
                                                String studyType,
                                                String principalInvestigator,
                                                Integer plannedSubjects,
                                                Integer plannedSites,
                                                LocalDate plannedStartDate,
                                                LocalDate plannedEndDate,
                                                Long updatedBy) {
        return StudyDetailsUpdatedEvent.builder()
            .studyId(studyId)
            .name(name)
            .description(description)
            .indication(indication)
            .studyType(studyType)
            .principalInvestigator(principalInvestigator)
            .plannedSubjects(plannedSubjects)
            .plannedSites(plannedSites)
            .plannedStartDate(plannedStartDate)
            .plannedEndDate(plannedEndDate)
            .updatedBy(updatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
