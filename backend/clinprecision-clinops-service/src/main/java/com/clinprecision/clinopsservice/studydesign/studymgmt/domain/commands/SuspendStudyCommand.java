package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to suspend an active study
 * Can only be executed when study is in ACTIVE status
 */
@Value
@Builder
public class SuspendStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    String reason; // Reason for suspension (required)
    
    // Audit
    UUID userId;
    String userName;
}



