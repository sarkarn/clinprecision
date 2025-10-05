package com.clinprecision.clinopsservice.protocolversion.domain.events;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Version Activated
 * 
 * Domain event representing that a protocol version became active.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class VersionActivatedEvent {
    
    UUID versionId;
    UUID previousActiveVersionUuid;
    String activationReason;
    Long activatedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event
     */
    public static VersionActivatedEvent from(UUID versionId,
                                            UUID previousActiveVersionUuid,
                                            String activationReason,
                                            Long activatedBy) {
        return VersionActivatedEvent.builder()
            .versionId(versionId)
            .previousActiveVersionUuid(previousActiveVersionUuid)
            .activationReason(activationReason)
            .activatedBy(activatedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
