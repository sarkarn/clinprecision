package com.clinprecision.common.dto.clinops;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for study response
 * Matches the expected frontend response structure
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private String sponsor;
    private String protocolNumber;
    private String version;
    private Boolean isLatestVersion;
    private String parentVersionId;
    private String versionNotes;
    private Boolean isLocked;
    private String indication;
    private String studyType;
    private String principalInvestigator;
    private Integer sites;
    private Integer plannedSubjects;
    private Integer enrolledSubjects;
    private Integer targetEnrollment;
    private String primaryObjective;
    private Integer amendments;
    private Long modifiedBy;
    
    // Additional fields for Study Overview Dashboard
    private String title; // Alias for name (for frontend compatibility)
    private String protocol; // Alias for protocolNumber
    private String versionStatus; // Status of current version (DRAFT, APPROVED, etc.)
    private String therapeuticArea; // Medical specialty/therapeutic area
    private String studyCoordinator; // Study coordinator name
    private Integer activeSites; // Number of active sites
    private Integer screenedSubjects; // Number of screened subjects
    private Integer randomizedSubjects; // Number of randomized subjects  
    private Integer completedSubjects; // Number of completed subjects
    private Integer withdrawnSubjects; // Number of withdrawn subjects
    private LocalDate estimatedCompletion; // Estimated study completion date
    private String primaryEndpoint; // Primary endpoint description
    private String secondaryEndpoints; // Secondary endpoints (JSON array as string)
    private String inclusionCriteria; // Inclusion criteria (JSON array as string)
    private String exclusionCriteria; // Exclusion criteria (JSON array as string)
    private String timeline; // Study timeline information (JSON object as string)
    
    // Study metrics
    private Double enrollmentRate; // Enrollment rate percentage
    private Double screeningSuccessRate; // Screening success rate percentage
    private Double retentionRate; // Subject retention rate percentage
    private Double complianceRate; // Protocol compliance rate percentage
    private Double queryRate; // Data query rate percentage
    
    // Recent activities (JSON array as string)
    private String recentActivities;
    
    // Simplified status fields (using strings instead of nested DTOs to avoid dependencies)
    private String studyStatus;
    private String regulatoryStatus;
    private String studyPhase;
    
    // Timeline fields
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    
    // Legacy fields for backward compatibility (deprecated)
    private String status;
    private String phase;
    @Deprecated
    private LocalDate startDate;
    @Deprecated
    private LocalDate endDate;
    private String metadata;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public StudyResponseDto() {}
    
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
    
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
    }
    
    public String getStudyStatus() {
        return studyStatus;
    }
    
    public void setStudyStatus(String studyStatus) {
        this.studyStatus = studyStatus;
    }
    
    public String getRegulatoryStatus() {
        return regulatoryStatus;
    }
    
    public void setRegulatoryStatus(String regulatoryStatus) {
        this.regulatoryStatus = regulatoryStatus;
    }
    
    public String getStudyPhase() {
        return studyPhase;
    }
    
    public void setStudyPhase(String studyPhase) {
        this.studyPhase = studyPhase;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
    
    public LocalDate getPlannedStartDate() {
        return plannedStartDate;
    }
    
    public void setPlannedStartDate(LocalDate plannedStartDate) {
        this.plannedStartDate = plannedStartDate;
    }
    
    public LocalDate getPlannedEndDate() {
        return plannedEndDate;
    }
    
    public void setPlannedEndDate(LocalDate plannedEndDate) {
        this.plannedEndDate = plannedEndDate;
    }
    
    @Deprecated
    public LocalDate getStartDate() {
        return startDate;
    }
    
    @Deprecated
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    @Deprecated
    public LocalDate getEndDate() {
        return endDate;
    }
    
    @Deprecated
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
    

    
    // Getters and Setters for new overview fields
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getProtocol() {
        return protocol;
    }
    
    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }
    
    public String getVersionStatus() {
        return versionStatus;
    }
    
    public void setVersionStatus(String versionStatus) {
        this.versionStatus = versionStatus;
    }
    
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
    
    public LocalDate getEstimatedCompletion() {
        return estimatedCompletion;
    }
    
    public void setEstimatedCompletion(LocalDate estimatedCompletion) {
        this.estimatedCompletion = estimatedCompletion;
    }
    
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
    
    public Double getRetentionRate() {
        return retentionRate;
    }
    
    public void setRetentionRate(Double retentionRate) {
        this.retentionRate = retentionRate;
    }
    
    public Double getComplianceRate() {
        return complianceRate;
    }
    
    public void setComplianceRate(Double complianceRate) {
        this.complianceRate = complianceRate;
    }
    
    public Double getQueryRate() {
        return queryRate;
    }
    
    public void setQueryRate(Double queryRate) {
        this.queryRate = queryRate;
    }
    
    public String getRecentActivities() {
        return recentActivities;
    }
    
    public void setRecentActivities(String recentActivities) {
        this.recentActivities = recentActivities;
    }
}
