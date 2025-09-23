package com.clinprecision.studydesignservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Study Version Entity - Maps to study_versions table
 * Represents different versions of a clinical study protocol
 */
@Entity
@Table(name = "study_versions")
public class StudyVersionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "version_number", nullable = false, length = 20)
    private String versionNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VersionStatus status = VersionStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "amendment_type", length = 20)
    private AmendmentType amendmentType;
    
    @Column(name = "amendment_reason", columnDefinition = "TEXT")
    private String amendmentReason;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "changes_summary", columnDefinition = "TEXT")
    private String changesSummary;
    
    @Column(name = "impact_assessment", columnDefinition = "TEXT")
    private String impactAssessment;
    
    @Column(name = "previous_version_id")
    private Long previousVersionId;
    
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_date")
    private LocalDateTime approvedDate;
    
    @Column(name = "effective_date")
    private LocalDate effectiveDate;
    
    @Column(name = "requires_regulatory_approval")
    private Boolean requiresRegulatoryApproval = false;
    
    @Column(name = "notify_stakeholders")
    private Boolean notifyStakeholders = true;
    
    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;
    
    @Column(name = "protocol_changes", columnDefinition = "JSON")
    private String protocolChanges;
    
    @Column(name = "icf_changes", columnDefinition = "JSON")
    private String icfChanges;
    
    @Column(name = "regulatory_submissions", columnDefinition = "JSON")
    private String regulatorySubmissions;
    
    @Column(name = "review_comments", columnDefinition = "JSON")
    private String reviewComments;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Reference to the parent study
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", insertable = false, updatable = false)
    @JsonBackReference
    private StudyEntity study;
    
    // One-to-many relationship with amendments
    @OneToMany(mappedBy = "studyVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<StudyAmendmentEntity> amendments = new ArrayList<>();
    
    /**
     * Enum for version status
     */
    public enum VersionStatus {
        DRAFT("Draft", "In development"),
        UNDER_REVIEW("Under Review", "Under internal review"),
        SUBMITTED("Submitted", "Submitted to regulatory"),
        APPROVED("Approved", "Approved by regulatory"),
        ACTIVE("Active", "Currently active version"),
        SUPERSEDED("Superseded", "Replaced by newer version"),
        WITHDRAWN("Withdrawn", "Withdrawn/cancelled");
        
        private final String label;
        private final String description;
        
        VersionStatus(String label, String description) {
            this.label = label;
            this.description = description;
        }
        
        public String getLabel() { return label; }
        public String getDescription() { return description; }
    }
    
    /**
     * Enum for amendment type following FDA guidelines
     */
    public enum AmendmentType {
        MAJOR("Major Amendment", "Protocol changes affecting safety/efficacy"),
        MINOR("Minor Amendment", "Administrative changes"),
        SAFETY("Safety Amendment", "Safety-related changes"),
        ADMINISTRATIVE("Administrative Amendment", "Non-substantial changes");
        
        private final String label;
        private final String description;
        
        AmendmentType(String label, String description) {
            this.label = label;
            this.description = description;
        }
        
        public String getLabel() { return label; }
        public String getDescription() { return description; }
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = VersionStatus.DRAFT;
        }
        if (requiresRegulatoryApproval == null) {
            requiresRegulatoryApproval = false;
        }
        if (notifyStakeholders == null) {
            notifyStakeholders = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public StudyVersionEntity() {}
    
    // Constructor with required fields
    public StudyVersionEntity(Long studyId, String versionNumber, Long createdBy) {
        this.studyId = studyId;
        this.versionNumber = versionNumber;
        this.createdBy = createdBy;
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
    
    public VersionStatus getStatus() {
        return status;
    }
    
    public void setStatus(VersionStatus status) {
        this.status = status;
    }
    
    public AmendmentType getAmendmentType() {
        return amendmentType;
    }
    
    public void setAmendmentType(AmendmentType amendmentType) {
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
    
    public StudyEntity getStudy() {
        return study;
    }
    
    public void setStudy(StudyEntity study) {
        this.study = study;
    }
    
    public List<StudyAmendmentEntity> getAmendments() {
        return amendments;
    }
    
    public void setAmendments(List<StudyAmendmentEntity> amendments) {
        this.amendments = amendments;
    }
    
    // Helper methods
    public void addAmendment(StudyAmendmentEntity amendment) {
        amendments.add(amendment);
        amendment.setStudyVersion(this);
    }
    
    public void removeAmendment(StudyAmendmentEntity amendment) {
        amendments.remove(amendment);
        amendment.setStudyVersion(null);
    }
    
    public boolean isEditable() {
        return status == VersionStatus.DRAFT || status == VersionStatus.UNDER_REVIEW;
    }
    
    public boolean canBeSubmitted() {
        return status == VersionStatus.DRAFT || status == VersionStatus.UNDER_REVIEW;
    }
    
    public boolean isActive() {
        return status == VersionStatus.ACTIVE;
    }
}