package com.clinprecision.clinopsservice.studydesign.studymgmt.event;

import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.OrganizationAssociationUpdate;
import com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects.StudyOrganizationAssociation;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
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

    // Legacy Axon event payloads stored organization associations under "organizations"
    List<OrganizationAssociationUpdate> organizations;

    List<StudyOrganizationAssociation> organizationAssociations;

    // Legacy metadata payload (JSON string). Retained to read historic events without failure.
    String metadata;
    
    // Audit
    UUID userId;
    String userName;
    Instant timestamp;

    public List<StudyOrganizationAssociation> getOrganizationAssociations() {
        if (organizationAssociations != null) {
            return organizationAssociations;
        }
        if (organizations == null) {
            return null;
        }
        return organizations.stream()
            .map(legacy -> StudyOrganizationAssociation.builder()
                .organizationId(legacy.getOrganizationId())
                .role(legacy.getRole())
                .isPrimary(legacy.getIsPrimary())
                .build())
            .toList();
    }
}



