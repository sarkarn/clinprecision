package com.clinprecision.clinopsservice.study.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Command to create a new study
 * Initiates the study aggregate lifecycle
 */
@Value
@Builder
public class CreateStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    // Core study fields
    String name;
    String description;
    String sponsor;
    String protocolNumber;
    String indication;
    String studyType; // INTERVENTIONAL, OBSERVATIONAL, etc.
    
    // Key personnel
    String principalInvestigator;
    String studyCoordinator;
    
    // Study details
    String therapeuticArea;
    Integer plannedSubjects;
    Integer targetEnrollment;
    String primaryObjective;
    String primaryEndpoint;
    
    // Timeline
    LocalDate startDate;
    LocalDate endDate;
    LocalDate estimatedCompletion;
    
    // Lookup table IDs (nullable - can be set later)
    Long studyStatusId;
    Long regulatoryStatusId;
    Long studyPhaseId;
    
    // Audit
    UUID userId; // User creating the study
    String userName; // Username for audit trail
}
