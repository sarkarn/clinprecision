package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Withdraw Protocol Version
 * 
 * Withdraws/cancels a protocol version.
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class WithdrawVersionCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    String withdrawalReason;
    Long withdrawnBy;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (withdrawnBy == null) {
            throw new IllegalArgumentException("Withdrawn by user ID is required");
        }
        if (withdrawalReason == null || withdrawalReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Withdrawal reason is required");
        }
        
        // Business rule: Withdrawal reason must be detailed
        if (withdrawalReason.length() < 10) {
            throw new IllegalArgumentException("Withdrawal reason must be at least 10 characters");
        }
    }
}
