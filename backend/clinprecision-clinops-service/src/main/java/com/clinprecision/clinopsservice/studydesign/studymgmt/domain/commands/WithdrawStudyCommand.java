package com.clinprecision.clinopsservice.studydesign.studymgmt.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to withdraw a study
 * Can be executed from multiple states (before ACTIVE)
 * Marks the study as WITHDRAWN (terminal state)
 */
@Value
@Builder
public class WithdrawStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    String reason; // Reason for withdrawal (required)
    
    // Audit
    UUID userId;
    String userName;
}



