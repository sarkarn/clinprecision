package com.clinprecision.clinopsservice.studydesign.domain.events;

import com.clinprecision.clinopsservice.studydesign.domain.commands.CloseStudyCommand;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Study Closed
 * 
 * Domain event representing that a study has been closed (reached terminal state).
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class StudyClosedEvent {
    
    UUID studyId;
    StudyStatus finalStatus;
    CloseStudyCommand.ClosureReason closureReason;
    String closureNotes;
    Long closedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event from command
     */
    public static StudyClosedEvent from(UUID studyId,
                                       StudyStatus finalStatus,
                                       CloseStudyCommand.ClosureReason closureReason,
                                       String closureNotes,
                                       Long closedBy) {
        return StudyClosedEvent.builder()
            .studyId(studyId)
            .finalStatus(finalStatus)
            .closureReason(closureReason)
            .closureNotes(closureNotes)
            .closedBy(closedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
