package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command to complete a study
 * Can only be executed when study is in ACTIVE status
 * Marks the study as COMPLETED (terminal state)
 */
@Value
@Builder
public class CompleteStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    LocalDate completionDate; // Actual completion date
    
    // Audit
    UUID userId;
    String userName;
}



