package com.clinprecision.clinopsservice.protocolversion.domain.events;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionNumber;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event: Protocol Version Created
 * 
 * Domain event representing that a protocol version was successfully created.
 * Following Event Sourcing pattern: Events are immutable facts (past tense).
 */
@Value
@Builder
public class ProtocolVersionCreatedEvent {
    
    UUID versionId;
    UUID studyAggregateUuid;
    VersionNumber versionNumber;
    VersionStatus initialStatus;
    String description;
    AmendmentType amendmentType;
    String amendmentReason;
    String changesSummary;
    String impactAssessment;
    UUID previousVersionUuid;
    Boolean requiresRegulatoryApproval;
    Boolean notifyStakeholders;
    String additionalNotes;
    String protocolChanges;
    String icfChanges;
    Long createdBy;
    LocalDateTime occurredAt;
    LocalDate submissionDate;
    String notes;

    /**
     * Factory method to create event
     */
    public static ProtocolVersionCreatedEvent from(UUID versionId,
                                                   UUID studyAggregateUuid,
                                                   VersionNumber versionNumber,
                                                   String description,
                                                   AmendmentType amendmentType,
                                                   String amendmentReason,
                                                   String changesSummary,
                                                   String impactAssessment,
                                                   UUID previousVersionUuid,
                                                   Boolean requiresRegulatoryApproval,
                                                   LocalDate submissionDate,
                                                   String notes,
                                                   Boolean notifyStakeholders,
                                                   String additionalNotes,
                                                   String protocolChanges,
                                                   String icfChanges,
                                                   Long createdBy) {
        return ProtocolVersionCreatedEvent.builder()
            .versionId(versionId)
            .studyAggregateUuid(studyAggregateUuid)
            .versionNumber(versionNumber)
            .initialStatus(VersionStatus.DRAFT) // Always starts as DRAFT
            .description(description)
            .amendmentType(amendmentType)
            .amendmentReason(amendmentReason)
            .changesSummary(changesSummary)
            .impactAssessment(impactAssessment)
            .previousVersionUuid(previousVersionUuid)
            .requiresRegulatoryApproval(requiresRegulatoryApproval != null ? requiresRegulatoryApproval : false)
                .submissionDate(submissionDate)
                .notes(notes)
            .notifyStakeholders(notifyStakeholders != null ? notifyStakeholders : true)
            .additionalNotes(additionalNotes)
            .protocolChanges(protocolChanges)
            .icfChanges(icfChanges)
            .createdBy(createdBy)
            .occurredAt(LocalDateTime.now())
            .build();
    }
}
