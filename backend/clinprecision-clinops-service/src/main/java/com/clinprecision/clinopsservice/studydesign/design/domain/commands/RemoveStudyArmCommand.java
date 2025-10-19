package com.clinprecision.clinopsservice.studydesign.design.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to remove a study arm from the design
 */
@Data
@Builder
public class RemoveStudyArmCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID armId;
    
    private final String reason;
    
    private final Long removedBy;
}
