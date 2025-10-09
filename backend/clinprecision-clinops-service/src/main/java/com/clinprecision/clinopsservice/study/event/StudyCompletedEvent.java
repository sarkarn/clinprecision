package com.clinprecision.clinopsservice.study.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Event emitted when a study is completed
 * Terminal state - no further transitions allowed
 */
@Value
@Builder
public class StudyCompletedEvent {
    
    UUID studyAggregateUuid;
    
    LocalDate completionDate;
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



