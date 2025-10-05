package com.clinprecision.clinopsservice.protocolversion.domain.events;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Version Approved
 * 
 * Domain event representing that a protocol version was approved.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class VersionApprovedEvent {
    
    UUID versionId;
    Long approvedBy;
    LocalDateTime approvedDate;
    LocalDate effectiveDate;
    String approvalComments;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event
     */
    public static VersionApprovedEvent from(UUID versionId,
                                           Long approvedBy,
                                           LocalDateTime approvedDate,
                                           LocalDate effectiveDate,
                                           String approvalComments) {
        return VersionApprovedEvent.builder()
            .versionId(versionId)
            .approvedBy(approvedBy)
            .approvedDate(approvedDate != null ? approvedDate : LocalDateTime.now())
            .effectiveDate(effectiveDate)
            .approvalComments(approvalComments)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
