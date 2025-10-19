package com.clinprecision.clinopsservice.studydesign.design.commands;

import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to update study arm details
 */
@Data
@Builder
public class UpdateStudyArmCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID armId;
    
    private final String name;
    
    private final String description;
    
    private final Integer plannedSubjects;
    
    private final Long updatedBy;
}
