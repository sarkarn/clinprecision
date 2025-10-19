package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event emitted when a study is withdrawn
 * Terminal state - no further transitions allowed
 */
@Value
@Builder
public class StudyWithdrawnEvent {
    
    UUID studyAggregateUuid;
    
    String reason; // Reason for withdrawal
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



