package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Update Protocol Version Details
 * 
 * Updates version details (only allowed in editable states).
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class UpdateVersionDetailsCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    String description;
    String changesSummary;
    String impactAssessment;
    String additionalNotes;
    String protocolChanges;
    String icfChanges;
    Long updatedBy;
    String notes;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (updatedBy == null) {
            throw new IllegalArgumentException("Updated by user ID is required");
        }
        
        // Business rule: At least one field must be provided
        if (description == null && changesSummary == null && impactAssessment == null &&
            additionalNotes == null && protocolChanges == null && icfChanges == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
    }
}



