package com.clinprecision.studydesignservice.dto;

import com.clinprecision.studydesignservice.entity.StudyVersionEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Study Version responses
 */
public class StudyVersionDto {
    
    private Long id;
    
    @JsonProperty("studyId")
    private Long studyId;
    
    @JsonProperty("version")
    private String versionNumber;
    
    @JsonProperty("status")
    private StudyVersionEntity.VersionStatus status;
    
    @JsonProperty("amendmentType")
    private StudyVersionEntity.AmendmentType amendmentType;
    
    @JsonProperty("amendmentReason")
    private String amendmentReason;
    
    private String description;
    
    @JsonProperty("changesSummary")
    private String changesSummary;
    
    @JsonProperty("impactAssessment")
    private String impactAssessment;
    
    @JsonProperty("previousVersionId")
    private Long previousVersionId;
    
    @JsonProperty("createdBy")
    private Long createdBy;
    
    @JsonProperty("createdDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;
    
    @JsonProperty("approvedBy")
    private Long approvedBy;
    
    @JsonProperty("approvedDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime approvedDate;
    
    @JsonProperty("effectiveDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveDate;
    
    @JsonProperty("requiresRegulatoryApproval")
    private Boolean requiresRegulatoryApproval;
    
    @JsonProperty("notifyStakeholders")
    private Boolean notifyStakeholders;
    
    @JsonProperty("additionalNotes")
    private String additionalNotes;
    
    @JsonProperty("protocolChanges")
    private String protocolChanges;
    
    @JsonProperty("icfChanges")
    private String icfChanges;
    
    @JsonProperty("regulatorySubmissions")
    private String regulatorySubmissions;
    
    @JsonProperty("reviewComments")
    private String reviewComments;
    
    @JsonProperty("metadata")
    private String metadata;
    
    @JsonProperty("updatedAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonProperty("amendments")
    private List<StudyAmendmentDto> amendments;
    
    // Helper fields for frontend compatibility
    @JsonProperty("reason")
    public String getReason() {
        return amendmentReason;
    }
    
    @JsonProperty("notes")
    public String getNotes() {
        return additionalNotes;
    }
    
    // Default constructor
    public StudyVersionDto() {}
    
    // Constructor from entity
    public StudyVersionDto(StudyVersionEntity entity) {
        this.id = entity.getId();
        this.studyId = entity.getStudyId();
        this.versionNumber = entity.getVersionNumber();
        this.status = entity.getStatus();
        this.amendmentType = entity.getAmendmentType();
        this.amendmentReason = entity.getAmendmentReason();
        this.description = entity.getDescription();
        this.changesSummary = entity.getChangesSummary();
        this.impactAssessment = entity.getImpactAssessment();
        this.previousVersionId = entity.getPreviousVersionId();
        this.createdBy = entity.getCreatedBy();
        this.createdDate = entity.getCreatedDate();
        this.approvedBy = entity.getApprovedBy();
        this.approvedDate = entity.getApprovedDate();
        this.effectiveDate = entity.getEffectiveDate();
        this.requiresRegulatoryApproval = entity.getRequiresRegulatoryApproval();
        this.notifyStakeholders = entity.getNotifyStakeholders();
        this.additionalNotes = entity.getAdditionalNotes();
        this.protocolChanges = entity.getProtocolChanges();
        this.icfChanges = entity.getIcfChanges();
        this.regulatorySubmissions = entity.getRegulatorySubmissions();
        this.reviewComments = entity.getReviewComments();
        this.metadata = entity.getMetadata();
        this.updatedAt = entity.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getStudyId() {
        return studyId;
    }
    
    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }
    
    public String getVersionNumber() {
        return versionNumber;
    }
    
    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }
    
    public StudyVersionEntity.VersionStatus getStatus() {
        return status;
    }
    
    public void setStatus(StudyVersionEntity.VersionStatus status) {
        this.status = status;
    }
    
    public StudyVersionEntity.AmendmentType getAmendmentType() {
        return amendmentType;
    }
    
    public void setAmendmentType(StudyVersionEntity.AmendmentType amendmentType) {
        this.amendmentType = amendmentType;
    }
    
    public String getAmendmentReason() {
        return amendmentReason;
    }
    
    public void setAmendmentReason(String amendmentReason) {
        this.amendmentReason = amendmentReason;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getChangesSummary() {
        return changesSummary;
    }
    
    public void setChangesSummary(String changesSummary) {
        this.changesSummary = changesSummary;
    }
    
    public String getImpactAssessment() {
        return impactAssessment;
    }
    
    public void setImpactAssessment(String impactAssessment) {
        this.impactAssessment = impactAssessment;
    }
    
    public Long getPreviousVersionId() {
        return previousVersionId;
    }
    
    public void setPreviousVersionId(Long previousVersionId) {
        this.previousVersionId = previousVersionId;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    public Long getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public LocalDateTime getApprovedDate() {
        return approvedDate;
    }
    
    public void setApprovedDate(LocalDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public Boolean getRequiresRegulatoryApproval() {
        return requiresRegulatoryApproval;
    }
    
    public void setRequiresRegulatoryApproval(Boolean requiresRegulatoryApproval) {
        this.requiresRegulatoryApproval = requiresRegulatoryApproval;
    }
    
    public Boolean getNotifyStakeholders() {
        return notifyStakeholders;
    }
    
    public void setNotifyStakeholders(Boolean notifyStakeholders) {
        this.notifyStakeholders = notifyStakeholders;
    }
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
    
    public String getProtocolChanges() {
        return protocolChanges;
    }
    
    public void setProtocolChanges(String protocolChanges) {
        this.protocolChanges = protocolChanges;
    }
    
    public String getIcfChanges() {
        return icfChanges;
    }
    
    public void setIcfChanges(String icfChanges) {
        this.icfChanges = icfChanges;
    }
    
    public String getRegulatorySubmissions() {
        return regulatorySubmissions;
    }
    
    public void setRegulatorySubmissions(String regulatorySubmissions) {
        this.regulatorySubmissions = regulatorySubmissions;
    }
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<StudyAmendmentDto> getAmendments() {
        return amendments;
    }
    
    public void setAmendments(List<StudyAmendmentDto> amendments) {
        this.amendments = amendments;
    }
}