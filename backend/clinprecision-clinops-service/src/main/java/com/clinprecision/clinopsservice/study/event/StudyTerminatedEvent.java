package com.clinprecision.clinopsservice.study.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event emitted when a study is terminated
 * Terminal state - no further transitions allowed
 */
@Value
@Builder
public class StudyTerminatedEvent {
    
    UUID studyAggregateUuid;
    
    String reason; // Reason for termination
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}
