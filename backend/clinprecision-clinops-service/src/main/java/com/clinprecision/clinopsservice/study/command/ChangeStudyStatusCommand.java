package com.clinprecision.clinopsservice.study.command;

import com.clinprecision.clinopsservice.study.domain.valueobjects.StudyStatusCode;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to change study status
 * Validates status transition rules in aggregate
 */
@Value
@Builder
public class ChangeStudyStatusCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    StudyStatusCode newStatus;
    String reason; // Optional reason for status change
    
    // Audit
    UUID userId;
    String userName;
}
