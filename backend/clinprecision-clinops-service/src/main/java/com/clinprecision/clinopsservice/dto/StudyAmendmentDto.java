package com.clinprecision.clinopsservice.dto;


import com.clinprecision.clinopsservice.entity.StudyAmendmentEntity;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.AmendmentType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Study Amendment responses
 */
public class StudyAmendmentDto {
    
    private Long id;
    
    @JsonProperty("studyVersionId")
    private Long studyVersionId;
    
    @JsonProperty("amendmentNumber")
    private Integer amendmentNumber;
    
    private String title;
    
    private String description;
    
    @JsonProperty("amendmentType")
    private AmendmentType amendmentType;
    
    private String reason;
    
    @JsonProperty("sectionAffected")
    private String sectionAffected;
    
    @JsonProperty("changeDetails")
    private String changeDetails;
    
    private String justification;
    
    @JsonProperty("impactOnSubjects")
    private Boolean impactOnSubjects;
    
    @JsonProperty("requiresConsentUpdate")
    private Boolean requiresConsentUpdate;
    
    @JsonProperty("requiresRegulatoryNotification")
    private Boolean requiresRegulatoryNotification;
    
    @JsonProperty("status")
    private StudyAmendmentEntity.AmendmentStatus status;
    
    @JsonProperty("submittedBy")
    private Long submittedBy;
    
    @JsonProperty("submittedDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedDate;
    
    @JsonProperty("reviewedBy")
    private Long reviewedBy;
    
    @JsonProperty("reviewedDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reviewedDate;
    
    @JsonProperty("approvedBy")
    private Long approvedBy;
    
    @JsonProperty("approvedDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime approvedDate;
    
    @JsonProperty("reviewComments")
    private String reviewComments;
    
    @JsonProperty("createdBy")
    private Long createdBy;
    
    @JsonProperty("createdDate")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;
    
    @JsonProperty("updatedAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonProperty("metadata")
    private String metadata;
    
    // Default constructor
    public StudyAmendmentDto() {}
    
    // Constructor from entity
    public StudyAmendmentDto(StudyAmendmentEntity entity) {
        this.id = entity.getId();
        this.studyVersionId = entity.getStudyVersionId();
        this.amendmentNumber = entity.getAmendmentNumber();
        this.title = entity.getTitle();
        this.description = entity.getDescription();
        this.amendmentType = entity.getAmendmentType();
        this.reason = entity.getReason();
        this.sectionAffected = entity.getSectionAffected();
        this.changeDetails = entity.getChangeDetails();
        this.justification = entity.getJustification();
        this.impactOnSubjects = entity.getImpactOnSubjects();
        this.requiresConsentUpdate = entity.getRequiresConsentUpdate();
        this.requiresRegulatoryNotification = entity.getRequiresRegulatoryNotification();
        this.status = entity.getStatus();
        this.submittedBy = entity.getSubmittedBy();
        this.submittedDate = entity.getSubmittedDate();
        this.reviewedBy = entity.getReviewedBy();
        this.reviewedDate = entity.getReviewedDate();
        this.approvedBy = entity.getApprovedBy();
        this.approvedDate = entity.getApprovedDate();
        this.reviewComments = entity.getReviewComments();
        this.createdBy = entity.getCreatedBy();
        this.createdDate = entity.getCreatedDate();
        this.updatedAt = entity.getUpdatedAt();
        this.metadata = entity.getMetadata();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getStudyVersionId() {
        return studyVersionId;
    }
    
    public void setStudyVersionId(Long studyVersionId) {
        this.studyVersionId = studyVersionId;
    }
    
    public Integer getAmendmentNumber() {
        return amendmentNumber;
    }
    
    public void setAmendmentNumber(Integer amendmentNumber) {
        this.amendmentNumber = amendmentNumber;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public AmendmentType getAmendmentType() {
        return amendmentType;
    }
    
    public void setAmendmentType(AmendmentType amendmentType) {
        this.amendmentType = amendmentType;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getSectionAffected() {
        return sectionAffected;
    }
    
    public void setSectionAffected(String sectionAffected) {
        this.sectionAffected = sectionAffected;
    }
    
    public String getChangeDetails() {
        return changeDetails;
    }
    
    public void setChangeDetails(String changeDetails) {
        this.changeDetails = changeDetails;
    }
    
    public String getJustification() {
        return justification;
    }
    
    public void setJustification(String justification) {
        this.justification = justification;
    }
    
    public Boolean getImpactOnSubjects() {
        return impactOnSubjects;
    }
    
    public void setImpactOnSubjects(Boolean impactOnSubjects) {
        this.impactOnSubjects = impactOnSubjects;
    }
    
    public Boolean getRequiresConsentUpdate() {
        return requiresConsentUpdate;
    }
    
    public void setRequiresConsentUpdate(Boolean requiresConsentUpdate) {
        this.requiresConsentUpdate = requiresConsentUpdate;
    }
    
    public Boolean getRequiresRegulatoryNotification() {
        return requiresRegulatoryNotification;
    }
    
    public void setRequiresRegulatoryNotification(Boolean requiresRegulatoryNotification) {
        this.requiresRegulatoryNotification = requiresRegulatoryNotification;
    }
    
    public StudyAmendmentEntity.AmendmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(StudyAmendmentEntity.AmendmentStatus status) {
        this.status = status;
    }
    
    public Long getSubmittedBy() {
        return submittedBy;
    }
    
    public void setSubmittedBy(Long submittedBy) {
        this.submittedBy = submittedBy;
    }
    
    public LocalDateTime getSubmittedDate() {
        return submittedDate;
    }
    
    public void setSubmittedDate(LocalDateTime submittedDate) {
        this.submittedDate = submittedDate;
    }
    
    public Long getReviewedBy() {
        return reviewedBy;
    }
    
    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
    
    public LocalDateTime getReviewedDate() {
        return reviewedDate;
    }
    
    public void setReviewedDate(LocalDateTime reviewedDate) {
        this.reviewedDate = reviewedDate;
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
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
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
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}


