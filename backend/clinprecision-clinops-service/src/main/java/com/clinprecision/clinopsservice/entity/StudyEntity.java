package com.clinprecision.clinopsservice.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Study Entity - Maps to studies table
 * Represents a clinical research study
 * 
 * DDD Enhancement: Added aggregateUuid field for event sourcing integration
 */
@Entity
@Table(name = "studies")
public class StudyEntity {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyEntity.class);
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * DDD Aggregate UUID - Links to event-sourced StudyAggregate
     * This is the true identifier in DDD architecture
     * Legacy 'id' field maintained for backward compatibility
     */
    @Column(name = "aggregate_uuid", unique = true, nullable = true, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID aggregateUuid;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "sponsor", length = 255)
    private String sponsor;
    
    @Column(name = "protocol_number", length = 100)
    private String protocolNumber;
    
    @Column(name = "version", length = 20)
    private String version = "1.0";
    
    @Column(name = "is_latest_version")
    private Boolean isLatestVersion = true;
    
    @Column(name = "parent_version_id", length = 36)
    private String parentVersionId;
    
    @Column(name = "version_notes", columnDefinition = "TEXT")
    private String versionNotes;
    
    @Column(name = "is_locked")
    private Boolean isLocked = false;
    
    @Column(name = "indication", length = 500)
    private String indication;
    
    @Column(name = "study_type", length = 50)
    private String studyType = "INTERVENTIONAL";
    
    @Column(name = "principal_investigator", length = 255)
    private String principalInvestigator;
    
    @Column(name = "sites")
    private Integer sites = 0;
    
    @Column(name = "planned_subjects")
    private Integer plannedSubjects = 0;
    
    @Column(name = "enrolled_subjects")
    private Integer enrolledSubjects = 0;
    
    @Column(name = "target_enrollment")
    private Integer targetEnrollment = 0;
    
    @Column(name = "primary_objective", columnDefinition = "TEXT")
    private String primaryObjective;
    
    @Column(name = "amendments")
    private Integer amendments = 0;
    
    @Column(name = "modified_by")
    private Long modifiedBy;
    
    // Additional fields for Study Overview Dashboard
    @Column(name = "therapeutic_area", length = 255)
    private String therapeuticArea;
    
    @Column(name = "study_coordinator", length = 255)
    private String studyCoordinator;
    
    @Column(name = "active_sites")
    private Integer activeSites = 0;
    
    @Column(name = "screened_subjects")
    private Integer screenedSubjects = 0;
    
    @Column(name = "randomized_subjects")
    private Integer randomizedSubjects = 0;
    
    @Column(name = "completed_subjects")
    private Integer completedSubjects = 0;
    
    @Column(name = "withdrawn_subjects")
    private Integer withdrawnSubjects = 0;
    
    // TODO: Uncomment when column added to database
    // @Column(name = "estimated_completion")
    // private LocalDate estimatedCompletion;
    
    @Column(name = "primary_endpoint", columnDefinition = "TEXT")
    private String primaryEndpoint;
    
    @Column(name = "secondary_endpoints", columnDefinition = "JSON")
    private String secondaryEndpoints;
    
    @Column(name = "inclusion_criteria", columnDefinition = "JSON")
    private String inclusionCriteria;
    
    @Column(name = "exclusion_criteria", columnDefinition = "JSON")
    private String exclusionCriteria;
    
    @Column(name = "timeline", columnDefinition = "JSON")
    private String timeline;
    
    // Study metrics
    @Column(name = "enrollment_rate")
    private Double enrollmentRate;
    
    @Column(name = "screening_success_rate")
    private Double screeningSuccessRate;
    
    // TODO: Add these columns to database schema if needed
    // @Column(name = "retention_rate")
    // private Double retentionRate;
    
    // @Column(name = "compliance_rate")
    // private Double complianceRate;
    
    // @Column(name = "query_rate")
    // private Double queryRate;
    
    // Recent activities (JSON array as string)
    @Column(name = "recent_activities", columnDefinition = "JSON")
    private String recentActivities;
    
    // Foreign key relationships to lookup tables
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_status_id", referencedColumnName = "id")
    private StudyStatusEntity studyStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regulatory_status_id", referencedColumnName = "id")
    private RegulatoryStatusEntity regulatoryStatus;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_phase_id", referencedColumnName = "id")
    private StudyPhaseEntity studyPhase;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One-to-many relationship with organization studies
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<OrganizationStudyEntity> organizationStudies = new ArrayList<>();
    
    // One-to-many relationship with form definitions
    @OneToMany(mappedBy = "study", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("study-forms")
    private List<FormDefinitionEntity> formDefinitions = new ArrayList<>();
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        logger.info("🟢 @PrePersist - Study {} being created, status: {}", 
                    name, 
                    studyStatus != null ? studyStatus.getCode() + " (id:" + studyStatus.getId() + ")" : "NULL");
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (version == null) {
            version = "1.0";
        }
        if (isLatestVersion == null) {
            isLatestVersion = true;
        }
        if (isLocked == null) {
            isLocked = false;
        }
        // Initialize with default "DRAFT" status if no status is set
        if (studyStatus == null) {
            // Note: This would need to be set by the service layer with actual lookup table reference
            // studyStatus = defaultDraftStatus; 
            logger.warn("🔴 Study {} has NULL status during @PrePersist!", name);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        logger.info("🔵 @PreUpdate - Study {} (id:{}) being updated, status: {}", 
                    name, 
                    id,
                    studyStatus != null ? studyStatus.getCode() + " (id:" + studyStatus.getId() + ")" : "NULL");
        
        if (studyStatus == null) {
            logger.error("🚨 CRITICAL @PreUpdate - Study {} (id:{}) status is NULL! This will write NULL to database!", 
                        name, id);
            // Print stack trace to see what triggered this update
            try {
                throw new RuntimeException("Stack trace for NULL status during @PreUpdate");
            } catch (Exception e) {
                logger.error("Call stack for NULL status update:", e);
            }
        }
        
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public StudyEntity() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSponsor() {
        return sponsor;
    }
    
    public void setSponsor(String sponsor) {
        this.sponsor = sponsor;
    }
    
    public String getProtocolNumber() {
        return protocolNumber;
    }
    
    public void setProtocolNumber(String protocolNumber) {
        this.protocolNumber = protocolNumber;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public Boolean getIsLatestVersion() {
        return isLatestVersion;
    }
    
    public void setIsLatestVersion(Boolean isLatestVersion) {
        this.isLatestVersion = isLatestVersion;
    }
    
    public String getParentVersionId() {
        return parentVersionId;
    }
    
    public void setParentVersionId(String parentVersionId) {
        this.parentVersionId = parentVersionId;
    }
    
    public String getVersionNotes() {
        return versionNotes;
    }
    
    public void setVersionNotes(String versionNotes) {
        this.versionNotes = versionNotes;
    }
    
    public Boolean getIsLocked() {
        return isLocked;
    }
    
    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }
    
    public StudyStatusEntity getStudyStatus() {
        return studyStatus;
    }
    
    public void setStudyStatus(StudyStatusEntity studyStatus) {
        this.studyStatus = studyStatus;
    }
    
    public StudyPhaseEntity getStudyPhase() {
        return studyPhase;
    }
    
    public void setStudyPhase(StudyPhaseEntity studyPhase) {
        this.studyPhase = studyPhase;
    }
    
    public RegulatoryStatusEntity getRegulatoryStatus() {
        return regulatoryStatus;
    }
    
    public void setRegulatoryStatus(RegulatoryStatusEntity regulatoryStatus) {
        this.regulatoryStatus = regulatoryStatus;
    }
    
    public String getIndication() {
        return indication;
    }
    
    public void setIndication(String indication) {
        this.indication = indication;
    }
    
    public String getStudyType() {
        return studyType;
    }
    
    public void setStudyType(String studyType) {
        this.studyType = studyType;
    }
    
    public String getPrincipalInvestigator() {
        return principalInvestigator;
    }
    
    public void setPrincipalInvestigator(String principalInvestigator) {
        this.principalInvestigator = principalInvestigator;
    }
    
    public Integer getSites() {
        return sites;
    }
    
    public void setSites(Integer sites) {
        this.sites = sites;
    }
    
    public Integer getPlannedSubjects() {
        return plannedSubjects;
    }
    
    public void setPlannedSubjects(Integer plannedSubjects) {
        this.plannedSubjects = plannedSubjects;
    }
    
    public Integer getEnrolledSubjects() {
        return enrolledSubjects;
    }
    
    public void setEnrolledSubjects(Integer enrolledSubjects) {
        this.enrolledSubjects = enrolledSubjects;
    }
    
    public Integer getTargetEnrollment() {
        return targetEnrollment;
    }
    
    public void setTargetEnrollment(Integer targetEnrollment) {
        this.targetEnrollment = targetEnrollment;
    }
    
    public String getPrimaryObjective() {
        return primaryObjective;
    }
    
    public void setPrimaryObjective(String primaryObjective) {
        this.primaryObjective = primaryObjective;
    }
    
    public Integer getAmendments() {
        return amendments;
    }
    
    public void setAmendments(Integer amendments) {
        this.amendments = amendments;
    }
    
    public Long getModifiedBy() {
        return modifiedBy;
    }
    
    public void setModifiedBy(Long modifiedBy) {
        this.modifiedBy = modifiedBy;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrganizationStudyEntity> getOrganizationStudies() {
        return organizationStudies;
    }
    
    public void setOrganizationStudies(List<OrganizationStudyEntity> organizationStudies) {
        this.organizationStudies = organizationStudies;
    }
    
    public List<FormDefinitionEntity> getFormDefinitions() {
        return formDefinitions;
    }
    
    public void setFormDefinitions(List<FormDefinitionEntity> formDefinitions) {
        this.formDefinitions = formDefinitions;
    }
    
    // Helper method to add organization study
    public void addOrganizationStudy(OrganizationStudyEntity organizationStudy) {
        organizationStudies.add(organizationStudy);
        organizationStudy.setStudy(this);
    }
    
    // Helper method to remove organization study
    public void removeOrganizationStudy(OrganizationStudyEntity organizationStudy) {
        organizationStudies.remove(organizationStudy);
        organizationStudy.setStudy(null);
    }
    
    // Helper method to add form definition
    public void addFormDefinition(FormDefinitionEntity formDefinition) {
        formDefinitions.add(formDefinition);
        formDefinition.setStudy(this);
    }
    
    // Helper method to remove form definition
    public void removeFormDefinition(FormDefinitionEntity formDefinition) {
        formDefinitions.remove(formDefinition);
        formDefinition.setStudy(null);
    }
    
    // Getters and Setters for new overview fields
    public String getTherapeuticArea() {
        return therapeuticArea;
    }
    
    public void setTherapeuticArea(String therapeuticArea) {
        this.therapeuticArea = therapeuticArea;
    }
    
    public String getStudyCoordinator() {
        return studyCoordinator;
    }
    
    public void setStudyCoordinator(String studyCoordinator) {
        this.studyCoordinator = studyCoordinator;
    }
    
    public Integer getActiveSites() {
        return activeSites;
    }
    
    public void setActiveSites(Integer activeSites) {
        this.activeSites = activeSites;
    }
    
    public Integer getScreenedSubjects() {
        return screenedSubjects;
    }
    
    public void setScreenedSubjects(Integer screenedSubjects) {
        this.screenedSubjects = screenedSubjects;
    }
    
    public Integer getRandomizedSubjects() {
        return randomizedSubjects;
    }
    
    public void setRandomizedSubjects(Integer randomizedSubjects) {
        this.randomizedSubjects = randomizedSubjects;
    }
    
    public Integer getCompletedSubjects() {
        return completedSubjects;
    }
    
    public void setCompletedSubjects(Integer completedSubjects) {
        this.completedSubjects = completedSubjects;
    }
    
    public Integer getWithdrawnSubjects() {
        return withdrawnSubjects;
    }
    
    public void setWithdrawnSubjects(Integer withdrawnSubjects) {
        this.withdrawnSubjects = withdrawnSubjects;
    }
    
    // TODO: Uncomment when column added to database
    // public LocalDate getEstimatedCompletion() {
    //     return estimatedCompletion;
    // }
    
    // public void setEstimatedCompletion(LocalDate estimatedCompletion) {
    //     this.estimatedCompletion = estimatedCompletion;
    // }
    
    public String getPrimaryEndpoint() {
        return primaryEndpoint;
    }
    
    public void setPrimaryEndpoint(String primaryEndpoint) {
        this.primaryEndpoint = primaryEndpoint;
    }
    
    public String getSecondaryEndpoints() {
        return secondaryEndpoints;
    }
    
    public void setSecondaryEndpoints(String secondaryEndpoints) {
        this.secondaryEndpoints = secondaryEndpoints;
    }
    
    public String getInclusionCriteria() {
        return inclusionCriteria;
    }
    
    public void setInclusionCriteria(String inclusionCriteria) {
        this.inclusionCriteria = inclusionCriteria;
    }
    
    public String getExclusionCriteria() {
        return exclusionCriteria;
    }
    
    public void setExclusionCriteria(String exclusionCriteria) {
        this.exclusionCriteria = exclusionCriteria;
    }
    
    public String getTimeline() {
        return timeline;
    }
    
    public void setTimeline(String timeline) {
        this.timeline = timeline;
    }
    
    public Double getEnrollmentRate() {
        return enrollmentRate;
    }
    
    public void setEnrollmentRate(Double enrollmentRate) {
        this.enrollmentRate = enrollmentRate;
    }
    
    public Double getScreeningSuccessRate() {
        return screeningSuccessRate;
    }
    
    public void setScreeningSuccessRate(Double screeningSuccessRate) {
        this.screeningSuccessRate = screeningSuccessRate;
    }
    
    // TODO: Uncomment when columns added to database
    // public Double getRetentionRate() {
    //     return retentionRate;
    // }
    
    // public void setRetentionRate(Double retentionRate) {
    //     this.retentionRate = retentionRate;
    // }
    
    // public Double getComplianceRate() {
    //     return complianceRate;
    // }
    
    // public void setComplianceRate(Double complianceRate) {
    //     this.complianceRate = complianceRate;
    // }
    
    // public Double getQueryRate() {
    //     return queryRate;
    // }
    
    // public void setQueryRate(Double queryRate) {
    //     this.queryRate = queryRate;
    // }
    
    public String getRecentActivities() {
        return recentActivities;
    }
    
    public void setRecentActivities(String recentActivities) {
        this.recentActivities = recentActivities;
    }
    
    /**
     * Get aggregate UUID (DDD identifier)
     * @return UUID linking to event-sourced aggregate
     */
    public UUID getAggregateUuid() {
        return aggregateUuid;
    }
    
    /**
     * Set aggregate UUID (DDD identifier)
     * @param aggregateUuid UUID from event-sourced aggregate
     */
    public void setAggregateUuid(UUID aggregateUuid) {
        this.aggregateUuid = aggregateUuid;
    }
}



