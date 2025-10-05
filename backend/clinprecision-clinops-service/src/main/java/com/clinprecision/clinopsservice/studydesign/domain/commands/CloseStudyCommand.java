package com.clinprecision.clinopsservice.studydesign.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command: Close Study
 * 
 * Represents the intent to close a study (transition to terminal state).
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class CloseStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyId;
    
    ClosureReason closureReason;
    String closureNotes;
    Long closedBy;

    /**
     * Study closure reasons
     */
    public enum ClosureReason {
        COMPLETED("Study completed successfully"),
        TERMINATED_SAFETY("Study terminated due to safety concerns"),
        TERMINATED_FUTILITY("Study terminated due to futility"),
        TERMINATED_ENROLLMENT("Study terminated due to enrollment issues"),
        TERMINATED_SPONSOR("Study terminated by sponsor decision"),
        WITHDRAWN("Study withdrawn before approval");

        private final String description;

        ClosureReason(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * Validate command business rules
     */
    public void validate() {
        if (studyId == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (closureReason == null) {
            throw new IllegalArgumentException("Closure reason is required");
        }
        if (closedBy == null) {
            throw new IllegalArgumentException("Closed by user ID is required");
        }
        
        // Business rule: Closure notes are required for terminated studies
        if (closureReason != ClosureReason.COMPLETED && 
            (closureNotes == null || closureNotes.trim().isEmpty())) {
            throw new IllegalArgumentException(
                "Closure notes are required when study is not completed normally");
        }
    }
}
