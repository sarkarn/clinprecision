package com.clinprecision.clinopsservice.study.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event emitted when an active study is suspended
 */
@Value
@Builder
public class StudySuspendedEvent {
    
    UUID studyAggregateUuid;
    
    String reason; // Reason for suspension
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



