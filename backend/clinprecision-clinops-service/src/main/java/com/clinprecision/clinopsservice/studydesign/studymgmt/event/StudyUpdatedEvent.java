package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;

/**
 * Event emitted when study details are updated
 * Contains all updated fields (nulls indicate no change)
 */
@Value
@Builder
public class StudyUpdatedEvent {
    
    UUID studyAggregateUuid;
    
    // Core study fields (nullable - only set if changed)
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
    Instant timestamp;
}



