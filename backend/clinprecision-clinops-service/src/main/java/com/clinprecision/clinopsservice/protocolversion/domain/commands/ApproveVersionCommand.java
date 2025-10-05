package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Command: Approve Protocol Version
 * 
 * Represents regulatory/internal approval of a protocol version.
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class ApproveVersionCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    Long approvedBy;
    LocalDateTime approvedDate;
    LocalDate effectiveDate;
    String approvalComments;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (approvedBy == null) {
            throw new IllegalArgumentException("Approved by user ID is required");
        }
        if (effectiveDate == null) {
            throw new IllegalArgumentException("Effective date is required for approval");
        }
        
        // Business rule: Effective date cannot be in the past
        if (effectiveDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Effective date cannot be in the past");
        }
    }
}
