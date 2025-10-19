package com.clinprecision.clinopsservice.studydesign.design.domain.commands;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitType;
import lombok.Builder;
import lombok.Data;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to update visit details
 */
@Data
@Builder
public class UpdateVisitCommand {
    
    @TargetAggregateIdentifier
    private final UUID studyDesignId;
    
    private final UUID visitId;
    
    private final String name;
    
    private final String description;
    
    private final Integer timepoint;
    
    private final Integer windowBefore;
    
    private final Integer windowAfter;
    
    private final VisitType visitType; // BUGFIX: Added visitType field
    
    private final Boolean isRequired;
    
    private final Long updatedBy;
}
