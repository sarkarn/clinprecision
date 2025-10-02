package com.clinprecision.datacaptureservice.studydatabase.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Event fired when a study database build fails
 * 
 * This immutable event captures the failure of a database build process.
 * Part of the Event Sourcing pattern for complete audit trail.
 * 
 * Compliance: FDA 21 CFR Part 11 - Electronic records and signatures
 */
@Getter
@Builder
@ToString
public class StudyDatabaseBuildFailedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final LocalDateTime failedAt;
    private final String errorMessage;
    private final List<String> validationErrors;
    private final String buildPhase; // Which phase failed (e.g., "VALIDATION", "FORM_SETUP", "PERFORMANCE_OPTIMIZATION")
    private final String exceptionType; // Type of exception that caused failure
}
