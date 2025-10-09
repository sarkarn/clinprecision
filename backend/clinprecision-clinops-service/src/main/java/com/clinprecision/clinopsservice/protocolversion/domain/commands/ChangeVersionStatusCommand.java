package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Change Protocol Version Status
 * 
 * Explicit command for status changes - REPLACES DATABASE TRIGGERS!
 * All status changes MUST go through this command.
 * 
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class ChangeVersionStatusCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    VersionStatus newStatus;
    String reason;
    Long userId;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (newStatus == null) {
            throw new IllegalArgumentException("New status is required");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        // Business rule: Reason required for all status changes
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required for status change");
        }
        
        // Business rule: Reason length validation
        if (reason.length() > 500) {
            throw new IllegalArgumentException("Reason cannot exceed 500 characters");
        }
    }
}



