package com.clinprecision.clinopsservice.studydesign.domain.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to update form assignment details
 */
@Data
@Builder
public class UpdateFormAssignmentCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID assignmentId;
    
    private final Boolean isRequired;
    
    private final Boolean isConditional;
    
    private final String conditionalLogic;
    
    private final String instructions;
    
    private final Long updatedBy;
}
