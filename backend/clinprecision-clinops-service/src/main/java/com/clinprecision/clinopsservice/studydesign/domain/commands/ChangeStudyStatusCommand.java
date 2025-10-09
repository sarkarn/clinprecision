package com.clinprecision.clinopsservice.studydesign.domain.commands;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyStatus;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Change Study Status
 * 
 * Represents the intent to transition a study to a new status.
 * This replaces the automatic database trigger logic with explicit command-driven status changes.
 * 
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class ChangeStudyStatusCommand {
    
    @TargetAggregateIdentifier
    UUID studyId;
    
    StudyStatus newStatus;
    String reason;
    Long userId;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (studyId == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (newStatus == null) {
            throw new IllegalArgumentException("New status is required");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        // Business rule: Status changes require a reason (audit trail)
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required for status change");
        }
        
        if (reason.length() > 500) {
            throw new IllegalArgumentException("Reason cannot exceed 500 characters");
        }
    }
}
