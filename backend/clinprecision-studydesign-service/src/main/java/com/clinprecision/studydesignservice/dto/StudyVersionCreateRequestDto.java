package com.clinprecision.studydesignservice.dto;

import com.clinprecision.studydesignservice.entity.StudyVersionEntity;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Data Transfer Object for creating study versions
 */
public class StudyVersionCreateRequestDto {
    
    @NotNull(message = "Amendment type is required")
    @JsonProperty("amendmentType")
    private StudyVersionEntity.AmendmentType amendmentType;
    
    @NotBlank(message = "Amendment reason is required")
    @JsonProperty("reason")
    private String amendmentReason;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @JsonProperty("effectiveDate")
    private LocalDate effectiveDate;
    
    @JsonProperty("notifyStakeholders")
    private Boolean notifyStakeholders = true;
    
    @JsonProperty("requiresRegulatory")
    private Boolean requiresRegulatoryApproval = false;
    
    @JsonProperty("notes")
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
    
    @JsonProperty("metadata")
    private String metadata;
    
    // Frontend compatibility fields
    @JsonProperty("currentVersion")
    private String currentVersion; // Not used in backend logic, just for frontend compatibility
    
    // Default constructor
    public StudyVersionCreateRequestDto() {}
    
    // Getters and Setters
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
    
    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }
    
    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
    
    public Boolean getNotifyStakeholders() {
        return notifyStakeholders;
    }
    
    public void setNotifyStakeholders(Boolean notifyStakeholders) {
        this.notifyStakeholders = notifyStakeholders;
    }
    
    public Boolean getRequiresRegulatoryApproval() {
        return requiresRegulatoryApproval;
    }
    
    public void setRequiresRegulatoryApproval(Boolean requiresRegulatoryApproval) {
        this.requiresRegulatoryApproval = requiresRegulatoryApproval;
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
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public String getCurrentVersion() {
        return currentVersion;
    }
    
    public void setCurrentVersion(String currentVersion) {
        this.currentVersion = currentVersion;
    }
}