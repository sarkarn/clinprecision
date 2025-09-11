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
    private String phase;
    private String status;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
