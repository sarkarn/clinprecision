package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionNumber;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command: Create Protocol Version
 * 
 * Represents the intent to create a new protocol version.
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class CreateProtocolVersionCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    UUID studyAggregateUuid;
    VersionNumber versionNumber;
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
    LocalDate submissionDate;
    String notes;



    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (studyAggregateUuid == null) {
            throw new IllegalArgumentException("Study aggregate UUID is required");
        }
        if (versionNumber == null) {
            throw new IllegalArgumentException("Version number is required");
        }
        if (createdBy == null) {
            throw new IllegalArgumentException("Created by user ID is required");
        }
        
        // Business rule: If amendment type is specified, amendment reason is required
        if (amendmentType != null && (amendmentReason == null || amendmentReason.trim().isEmpty())) {
            throw new IllegalArgumentException("Amendment reason is required when amendment type is specified");
        }
        
        // Business rule: Major/Safety amendments must require regulatory approval
        if (amendmentType != null && amendmentType.requiresRegulatoryApproval()) {
            if (requiresRegulatoryApproval == null || !requiresRegulatoryApproval) {
                throw new IllegalArgumentException(
                    amendmentType + " amendments must require regulatory approval");
            }
        }
    }
}



