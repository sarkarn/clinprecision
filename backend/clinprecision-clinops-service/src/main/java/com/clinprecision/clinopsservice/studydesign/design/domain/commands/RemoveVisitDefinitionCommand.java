package com.clinprecision.clinopsservice.studydesign.design.domain.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to remove a visit from the study schedule
 */
@Data
@Builder
public class RemoveVisitCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID visitId;
    
    private final String reason;
    
    private final Long removedBy;
}
