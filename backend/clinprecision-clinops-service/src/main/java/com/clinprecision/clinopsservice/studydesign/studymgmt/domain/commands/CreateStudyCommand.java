package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;

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
    Integer targetSites;
    String primaryObjective;
    String primaryEndpoint;

    // Flexible attributes
    Long organizationId;
    String metadata;
    List<OrganizationAssociationUpdate> organizations;
    
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



