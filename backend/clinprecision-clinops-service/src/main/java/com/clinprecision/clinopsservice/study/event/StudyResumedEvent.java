package com.clinprecision.clinopsservice.study.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event emitted when a suspended study is resumed
 */
@Value
@Builder
public class StudyResumedEvent {
    
    UUID studyAggregateUuid;
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



