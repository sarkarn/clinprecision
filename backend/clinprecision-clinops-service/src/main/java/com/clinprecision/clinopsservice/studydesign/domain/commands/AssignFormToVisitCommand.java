package com.clinprecision.clinopsservice.studydesign.domain.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to assign a form to a visit
 */
@Data
@Builder
public class AssignFormToVisitCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID assignmentId;   // Pre-generated assignment ID
    
    private final UUID visitId;
    
    private final UUID formId;
    
    private final Boolean isRequired;
    
    private final Boolean isConditional;
    
    private final String conditionalLogic;
    
    private final Integer displayOrder;
    
    private final String instructions;
    
    private final Long assignedBy;
}
