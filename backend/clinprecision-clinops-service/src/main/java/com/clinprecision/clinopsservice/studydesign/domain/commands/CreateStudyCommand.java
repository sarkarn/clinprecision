package com.clinprecision.clinopsservice.studydesign.domain.commands;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ProtocolNumber;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.StudyPhase;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command: Create Study
 * 
 * Represents the intent to create a new clinical study.
 * Following CQRS pattern: Commands are immutable and express intent.
 */
@Value
@Builder
public class CreateStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyId;
    
    String name;
    String description;
    String sponsor;
    ProtocolNumber protocolNumber;
    StudyPhase phase;
    String indication;
    String studyType;
    String principalInvestigator;
    Integer plannedSubjects;
    Integer plannedSites;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    Long createdBy;

    /**
     * Validate command business rules
     */
    public void validate() {
        if (studyId == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Study name is required");
        }
        if (protocolNumber == null) {
            throw new IllegalArgumentException("Protocol number is required");
        }
        if (phase == null) {
            throw new IllegalArgumentException("Study phase is required");
        }
        if (sponsor == null || sponsor.trim().isEmpty()) {
            throw new IllegalArgumentException("Sponsor is required");
        }
        if (createdBy == null) {
            throw new IllegalArgumentException("Created by user ID is required");
        }
        
        // Business rule: Planned subjects must be positive
        if (plannedSubjects != null && plannedSubjects <= 0) {
            throw new IllegalArgumentException("Planned subjects must be a positive number");
        }
        
        // Business rule: Planned sites must be positive
        if (plannedSites != null && plannedSites <= 0) {
            throw new IllegalArgumentException("Planned sites must be a positive number");
        }
        
        // Business rule: Planned end date must be after start date
        if (plannedStartDate != null && plannedEndDate != null && 
            plannedEndDate.isBefore(plannedStartDate)) {
            throw new IllegalArgumentException("Planned end date must be after start date");
        }
    }
}
