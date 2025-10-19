package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.events;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Version Withdrawn
 * 
 * Domain event representing that a protocol version was withdrawn.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class VersionWithdrawnEvent {
    
    UUID versionId;
    String withdrawalReason;
    Long withdrawnBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event
     */
    public static VersionWithdrawnEvent from(UUID versionId,
                                            String withdrawalReason,
                                            Long withdrawnBy) {
        return VersionWithdrawnEvent.builder()
            .versionId(versionId)
            .withdrawalReason(withdrawalReason)
            .withdrawnBy(withdrawnBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}



