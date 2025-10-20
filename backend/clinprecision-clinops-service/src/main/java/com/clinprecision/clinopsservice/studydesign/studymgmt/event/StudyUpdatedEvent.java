package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Event emitted when study details are updated
 * Contains all updated fields (nulls indicate no change)
 */
@Value
@Builder
public class StudyUpdatedEvent {
    
    UUID studyAggregateUuid;
    
    // Organization
    Long organizationId;
    
    // Core study fields (nullable - only set if changed)
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
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;
}



