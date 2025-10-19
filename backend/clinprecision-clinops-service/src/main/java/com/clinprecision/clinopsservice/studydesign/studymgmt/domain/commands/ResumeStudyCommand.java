package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to resume a suspended study
 * Can only be executed when study is in SUSPENDED status
 */
@Value
@Builder
public class ResumeStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    // Audit
    UUID userId;
    String userName;
}



