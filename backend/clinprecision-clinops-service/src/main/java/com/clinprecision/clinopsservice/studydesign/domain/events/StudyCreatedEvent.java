package com.clinprecision.clinopsservice.studydesign.domain.events;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ProtocolNumber;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyPhase;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Study Created
 * 
 * Domain event representing that a study was successfully created.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class StudyCreatedEvent {
    
    UUID studyId;
    String name;
    String description;
    String sponsor;
    ProtocolNumber protocolNumber;
    StudyPhase phase;
    StudyStatus initialStatus;
    String indication;
    String studyType;
    String principalInvestigator;
    Integer plannedSubjects;
    Integer plannedSites;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    Long createdBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event from command
     */
    public static StudyCreatedEvent from(UUID studyId, 
                                         String name,
                                         String description,
                                         String sponsor,
                                         ProtocolNumber protocolNumber,
                                         StudyPhase phase,
                                         String indication,
                                         String studyType,
                                         String principalInvestigator,
                                         Integer plannedSubjects,
                                         Integer plannedSites,
                                         LocalDate plannedStartDate,
                                         LocalDate plannedEndDate,
                                         Long createdBy) {
        return StudyCreatedEvent.builder()
            .studyId(studyId)
            .name(name)
            .description(description)
            .sponsor(sponsor)
            .protocolNumber(protocolNumber)
            .phase(phase)
            .initialStatus(StudyStatus.PLANNING) // Always start in PLANNING
            .indication(indication)
            .studyType(studyType)
            .principalInvestigator(principalInvestigator)
            .plannedSubjects(plannedSubjects)
            .plannedSites(plannedSites)
            .plannedStartDate(plannedStartDate)
            .plannedEndDate(plannedEndDate)
            .createdBy(createdBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
