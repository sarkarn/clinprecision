package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    
    // Lookup table references (instead of simple strings)
    private StudyStatusDto studyStatus;
    private RegulatoryStatusDto regulatoryStatus;
    private StudyPhaseDto studyPhase;
    
    // Legacy fields for backward compatibility (can be removed after frontend migration)
    @Deprecated
    private String status; // Use studyStatus instead
    @Deprecated
    private String phase; // Use studyPhase instead
    private LocalDate startDate;
    private LocalDate endDate;
    private String metadata;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrganizationStudyDto> organizations;
    
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
    
    public StudyStatusDto getStudyStatus() {
        return studyStatus;
    }
    
    public void setStudyStatus(StudyStatusDto studyStatus) {
        this.studyStatus = studyStatus;
    }
    
    public RegulatoryStatusDto getRegulatoryStatus() {
        return regulatoryStatus;
    }
    
    public void setRegulatoryStatus(RegulatoryStatusDto regulatoryStatus) {
        this.regulatoryStatus = regulatoryStatus;
    }
    
    public StudyPhaseDto getStudyPhase() {
        return studyPhase;
    }
    
    public void setStudyPhase(StudyPhaseDto studyPhase) {
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
    
    public List<OrganizationStudyDto> getOrganizations() {
        return organizations;
    }
    
    public void setOrganizations(List<OrganizationStudyDto> organizations) {
        this.organizations = organizations;
    }
}
