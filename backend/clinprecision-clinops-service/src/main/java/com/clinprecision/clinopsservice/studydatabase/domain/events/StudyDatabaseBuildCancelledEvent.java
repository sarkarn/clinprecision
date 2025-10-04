package com.clinprecision.clinopsservice.studydatabase.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event fired when a study database build is cancelled
 * 
 * This immutable event captures the cancellation of a database build process.
 * Part of the Event Sourcing pattern for complete audit trail.
 * 
 * Compliance: FDA 21 CFR Part 11 - Electronic records and signatures
 */
@Getter
@Builder
@ToString
public class StudyDatabaseBuildCancelledEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final Long cancelledBy;
    private final LocalDateTime cancelledAt;
    private final String cancellationReason;
}
