package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;

/**
 * Command to update study details
 * Only allows updates when study status permits modifications
 */
@Value
@Builder
public class UpdateStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    // Core study fields (all optional - only update what's provided)
    String name;
    String description;
    String sponsor;
    String protocolNumber;
    String indication;
    String studyType;
    
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
    LocalDate estimatedCompletion;

    // Flexible attributes
    Long organizationId;
    String metadata;
    List<OrganizationAssociationUpdate> organizations;
    
    // Lookup table IDs
    Long studyPhaseId;
    Long regulatoryStatusId;
    
    // Audit
    UUID userId;
    String userName;
}



