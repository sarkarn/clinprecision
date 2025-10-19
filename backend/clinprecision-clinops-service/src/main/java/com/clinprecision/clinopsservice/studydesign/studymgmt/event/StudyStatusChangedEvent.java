package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event emitted when study status changes
 * Captures status transition with reason
 */
@Value
@Builder
public class StudyStatusChangedEvent {
    
    UUID studyAggregateUuid;
    
    StudyStatusCode oldStatus;
    StudyStatusCode newStatus;
    Long newStudyStatusId; // Database ID for lookup table
    
    String reason; // Optional reason for change
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



