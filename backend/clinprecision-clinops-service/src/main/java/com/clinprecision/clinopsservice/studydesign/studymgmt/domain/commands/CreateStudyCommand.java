package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

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
    
    // Organization
    Long organizationId;
    
    // Core study fields
    String name;
    String description;
    String sponsor;
    String protocolNumber;
    String indication;
    String studyType; // INTERVENTIONAL, OBSERVATIONAL, etc.
    String objective;
    
    // Key personnel
    String principalInvestigator;
    String studyCoordinator;
    
    // Study details
    String therapeuticArea;
    Integer plannedSubjects;
    Integer targetEnrollment;
    Integer targetSites;
    String primaryObjective;
    String primaryEndpoint;
    
    // Timeline
    LocalDate startDate;
    LocalDate endDate;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    LocalDate estimatedCompletion;
    
    // Lookup table IDs (nullable - can be set later)
    Long studyStatusId;
    Long regulatoryStatusId;
    Long studyPhaseId;
    
    // Version fields
    String version;
    Boolean isLatestVersion;
    
    // Classification fields
    String blinding;
    String randomization;
    String controlType;
    
    // Additional fields
    String notes;
    String riskLevel;
    
    // Audit
    UUID userId; // User creating the study
    String userName; // Username for audit trail
}



