package com.clinprecision.clinopsservice.studydesign.design.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to initialize a new Study Design aggregate
 * 
 * Creates the aggregate root for study design management.
 * This links the design to a specific study (via studyAggregateUuid).
 */
@Data
@Builder
public class InitializeStudyDesignCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID studyAggregateUuid;  // Link to Study aggregate
    
    private final String studyName;
    
    private final Long createdBy;
}
