package com.clinprecision.common.dto.studydesign;


import com.clinprecision.common.entity.studydesign.StudyVersionEntity;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

/**
 * Data Transfer Object for updating study versions
 */
public class StudyVersionUpdateRequestDto {
    
    @JsonProperty("status")
    private StudyVersionEntity.VersionStatus status;
    
    @JsonProperty("amendmentReason")
    private String amendmentReason;
    
    private String description;
    
    @JsonProperty("effectiveDate")
    private LocalDate effectiveDate;
    
    @JsonProperty("additionalNotes")
    private String additionalNotes;
    
    @JsonProperty("changesSummary")
    private String changesSummary;
    
    @JsonProperty("impactAssessment")
    private String impactAssessment;
    
    @JsonProperty("protocolChanges")
    private String protocolChanges;
    
    @JsonProperty("icfChanges")
    private String icfChanges;
    
    @JsonProperty("regulatorySubmissions")
    private String regulatorySubmissions;
    
    @JsonProperty("reviewComments")
    private String reviewComments;
    
    @JsonProperty("approvedBy")
    private Long approvedBy;
    
    @JsonProperty("metadata")
    private String metadata;
    
    // Default constructor
    public StudyVersionUpdateRequestDto() {}
    
    // Getters and Setters
    public StudyVersionEntity.VersionStatus getStatus() {
        return status;
    }
    
    public void setStatus(StudyVersionEntity.VersionStatus status) {
        this.status = status;
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
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
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
    
    public Long getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}