package com.clinprecision.datacaptureservice.studydatabase.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Event fired when a study database build is started
 * 
 * This immutable event captures the initiation of a database build process.
 * Part of the Event Sourcing pattern for complete audit trail.
 * 
 * Compliance: FDA 21 CFR Part 11 - Electronic records and signatures
 */
@Getter
@Builder
@ToString
public class StudyDatabaseBuildStartedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final String studyName;
    private final String studyProtocol;
    private final Long requestedBy;
    private final LocalDateTime startedAt;
    private final Map<String, Object> buildConfiguration;
    private final String buildRequestId;
}
