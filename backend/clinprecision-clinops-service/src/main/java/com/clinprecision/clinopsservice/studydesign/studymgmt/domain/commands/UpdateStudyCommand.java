package com.clinprecision.clinopsservice.studydesign.studymgmt.domain.commands;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyOrganizationAssociation;
import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Command to update study details
 * Only allows updates when study status permits modifications
 */
@Value
@Builder
public class UpdateStudyCommand {
    
    @TargetAggregateIdentifier
    UUID studyAggregateUuid;
    
    // Organization
    Long organizationId;
    
    // Core study fields (all optional - only update what's provided)
    String name;
    String description;
    String sponsor;
    String protocolNumber;
    String indication;
    String studyType;
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
    
    // Lookup table IDs
    Long studyPhaseId;
    Long regulatoryStatusId;
    Long studyStatusId;
    
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
    List<StudyOrganizationAssociation> organizationAssociations;
    String metadata;
    
    // Audit
    UUID userId;
    String userName;
}



