package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.events;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Version Status Changed
 * 
 * CRITICAL: Explicit record of version status change (replaces trigger audit log!)
 * Provides complete audit trail for FDA 21 CFR Part 11 compliance.
 * 
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class VersionStatusChangedEvent {
    
    UUID versionId;
    VersionStatus oldStatus;
    VersionStatus newStatus;
    String reason;
    Long changedBy;
    LocalDateTime occurredAt;

    /**
     * Factory method to create event with timestamp
     */
    public static VersionStatusChangedEvent from(UUID versionId,
                                                 VersionStatus oldStatus,
                                                 VersionStatus newStatus,
                                                 String reason,
                                                 Long changedBy) {
        return VersionStatusChangedEvent.builder()
            .versionId(versionId)
            .oldStatus(oldStatus)
            .newStatus(newStatus)
            .reason(reason)
            .changedBy(changedBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}



