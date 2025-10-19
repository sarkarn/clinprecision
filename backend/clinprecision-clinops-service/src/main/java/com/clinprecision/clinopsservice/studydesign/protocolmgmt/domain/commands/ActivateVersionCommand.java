package com.clinprecision.clinopsservice.protocolversion.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Activate Protocol Version
 * 
 * Makes a protocol version the active version (supersedes previous active version).
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class ActivateVersionCommand {
    
    @TargetAggregateIdentifier
    UUID versionId;
    
    UUID previousActiveVersionUuid;
    String activationReason;
    Long activatedBy;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (versionId == null) {
            throw new IllegalArgumentException("Version ID is required");
        }
        if (activatedBy == null) {
            throw new IllegalArgumentException("Activated by user ID is required");
        }
        if (activationReason == null || activationReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Activation reason is required");
        }
    }
}



