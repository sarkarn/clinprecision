package com.clinprecision.clinopsservice.studydesign.studymgmt.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command: Update Study Details
 * 
 * Represents the intent to update study details (not status).
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class UpdateStudyDetailsCommand {
    
    @TargetAggregateIdentifier
    UUID studyId;
    
    String name;
    String description;
    String indication;
    String studyType;
    String principalInvestigator;
    Integer plannedSubjects;
    Integer plannedSites;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    Long updatedBy;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (studyId == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (updatedBy == null) {
            throw new IllegalArgumentException("Updated by user ID is required");
        }
        
        // Business rule: At least one field must be provided for update
        if (name == null && description == null && indication == null && 
            studyType == null && principalInvestigator == null && 
            plannedSubjects == null && plannedSites == null && 
            plannedStartDate == null && plannedEndDate == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
        
        // Business rule: If name provided, it cannot be empty
        if (name != null && name.trim().isEmpty()) {
            throw new IllegalArgumentException("Study name cannot be empty");
        }
        
        // Business rule: Planned subjects must be positive
        if (plannedSubjects != null && plannedSubjects <= 0) {
            throw new IllegalArgumentException("Planned subjects must be a positive number");
        }
        
        // Business rule: Planned sites must be positive
        if (plannedSites != null && plannedSites <= 0) {
            throw new IllegalArgumentException("Planned sites must be a positive number");
        }
    }
}
