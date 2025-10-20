package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;

/**
 * Event emitted when a new study is created
 * Contains all initial study data
 */
@Value
@Builder
public class StudyCreatedEvent {
    
    UUID studyAggregateUuid;
    
    // Core study fields
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
    Long organizationId;
    String metadata;
    List<OrganizationAssociationUpdate> organizations;
    
    // Timeline
    LocalDate startDate;
    LocalDate endDate;
    LocalDate estimatedCompletion;
    
    // Initial status
    StudyStatusCode initialStatus;
    Long studyStatusId;
    Long regulatoryStatusId;
    Long studyPhaseId;
    
    // Study versioning
    String version; // Default "1.0"
    Boolean isLatestVersion; // Default true
    Boolean isLocked; // Default false
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



