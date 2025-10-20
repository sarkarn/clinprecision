package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyStatusCode;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Event emitted when a new study is created
 * Contains all initial study data
 */
@Value
@Builder
public class StudyCreatedEvent {
    
    UUID studyAggregateUuid;
    
    // Organization
    Long organizationId;
    
    // Core study fields
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
    
    // Initial status
    StudyStatusCode initialStatus;
    Long studyStatusId;
    Long regulatoryStatusId;
    Long studyPhaseId;
    
    // Study versioning
    String version; // Default "1.0"
    Boolean isLatestVersion; // Default true
    Boolean isLocked; // Default false
    
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



