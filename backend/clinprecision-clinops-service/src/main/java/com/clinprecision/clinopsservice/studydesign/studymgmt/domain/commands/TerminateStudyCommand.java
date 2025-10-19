package com.clinprecision.clinopsservice.studydesign.studymgmt.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to terminate a study
 * Can be executed from ACTIVE or SUSPENDED status
 * Marks the study as TERMINATED (terminal state)
 */
@Value
@Builder
public class TerminateStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    String reason; // Reason for termination (required)
    
    // Audit
    UUID userId;
    String userName;
}



