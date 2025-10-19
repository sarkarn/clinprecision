package com.clinprecision.clinopsservice.studydesign.design.commands;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ArmType;
import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to add a study arm to the study design
 */
@Data
@Builder
public class AddStudyArmCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID armId;          // Pre-generated arm ID
    
    private final String name;
    
    private final String description;
    
    private final ArmType type;
    
    private final Integer sequenceNumber;
    
    private final Integer plannedSubjects;
    
    private final Long addedBy;
}
