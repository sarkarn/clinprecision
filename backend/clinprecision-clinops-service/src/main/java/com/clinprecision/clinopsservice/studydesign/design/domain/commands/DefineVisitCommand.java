package com.clinprecision.clinopsservice.studydesign.design.commands;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitType;
import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to define a visit in the study schedule
 */
@Data
@Builder
public class DefineVisitCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID visitId;        // Pre-generated visit ID
    
    private final String name;
    
    private final String description;
    
    private final Integer timepoint;   // Days from baseline
    
    private final Integer windowBefore;
    
    private final Integer windowAfter;
    
    private final VisitType visitType;
    
    private final Boolean isRequired;
    
    private final Integer sequenceNumber;
    
    private final UUID armId;          // null if applies to all arms
    
    private final Long definedBy;
}
