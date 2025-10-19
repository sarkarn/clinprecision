package com.clinprecision.clinopsservice.studydesign.design.domain.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to remove a form assignment from a visit
 */
@Data
@Builder
public class RemoveFormAssignmentCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID assignmentId;
    
    private final String reason;
    
    private final Long removedBy;
}
