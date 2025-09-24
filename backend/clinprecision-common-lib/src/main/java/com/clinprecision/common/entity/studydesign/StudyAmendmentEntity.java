package com.clinprecision.common.entity.studydesign;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Study Amendment Entity - Maps to study_amendments table
 * Represents individual amendments within a study version
 */
@Entity
@Table(name = "study_amendments")
public class StudyAmendmentEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_version_id", nullable = false)
    private Long studyVersionId;
    
    @Column(name = "amendment_number", nullable = false)
    private Integer amendmentNumber;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "amendment_type", nullable = false, length = 20)
    private StudyVersionEntity.AmendmentType amendmentType;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "section_affected", length = 100)
    private String sectionAffected;
    
    @Column(name = "change_details", columnDefinition = "TEXT")
    private String changeDetails;
    
    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;
    
    @Column(name = "impact_on_subjects")
    private Boolean impactOnSubjects = false;
    
    @Column(name = "requires_consent_update")
    private Boolean requiresConsentUpdate = false;
    
    @Column(name = "requires_regulatory_notification")
    private Boolean requiresRegulatoryNotification = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AmendmentStatus status = AmendmentStatus.DRAFT;
    
    @Column(name = "submitted_by")
    private Long submittedBy;
    
    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    
    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_date")
    private LocalDateTime approvedDate;
    
    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;
    
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    // Reference to the parent study version
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_version_id", insertable = false, updatable = false)
    @JsonBackReference
    private StudyVersionEntity studyVersion;
    
    /**
     * Enum for amendment status
     */
    public enum AmendmentStatus {
        DRAFT("Draft", "Amendment is being drafted"),
        SUBMITTED("Submitted", "Amendment has been submitted for review"),
        UNDER_REVIEW("Under Review", "Amendment is under review"),
        APPROVED("Approved", "Amendment has been approved"),
        IMPLEMENTED("Implemented", "Amendment has been implemented"),
        REJECTED("Rejected", "Amendment has been rejected"),
        WITHDRAWN("Withdrawn", "Amendment has been withdrawn");
        
        private final String label;
        private final String description;
        
        AmendmentStatus(String label, String description) {
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
            status = AmendmentStatus.DRAFT;
        }
        if (impactOnSubjects == null) {
            impactOnSubjects = false;
        }
        if (requiresConsentUpdate == null) {
            requiresConsentUpdate = false;
        }
        if (requiresRegulatoryNotification == null) {
            requiresRegulatoryNotification = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public StudyAmendmentEntity() {}
    
    // Constructor with required fields
    public StudyAmendmentEntity(Long studyVersionId, String title, StudyVersionEntity.AmendmentType amendmentType, Long createdBy) {
        this.studyVersionId = studyVersionId;
        this.title = title;
        this.amendmentType = amendmentType;
        this.createdBy = createdBy;
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
    
    public StudyVersionEntity.AmendmentType getAmendmentType() {
        return amendmentType;
    }
    
    public void setAmendmentType(StudyVersionEntity.AmendmentType amendmentType) {
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
    
    public AmendmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(AmendmentStatus status) {
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
    
    public StudyVersionEntity getStudyVersion() {
        return studyVersion;
    }
    
    public void setStudyVersion(StudyVersionEntity studyVersion) {
        this.studyVersion = studyVersion;
    }
    
    // Helper methods
    public boolean isDraft() {
        return status == AmendmentStatus.DRAFT;
    }
    
    public boolean isApproved() {
        return status == AmendmentStatus.APPROVED;
    }
    
    public boolean canBeEdited() {
        return status == AmendmentStatus.DRAFT || status == AmendmentStatus.UNDER_REVIEW;
    }
    
    public boolean canBeSubmitted() {
        return status == AmendmentStatus.DRAFT;
    }
}