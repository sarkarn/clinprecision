package com.clinprecision.common.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SiteStudy entity based on BRIDG/HL7 FHIR/CDISC standards.
 * Represents the relationship between a site and a study.
 */
@Entity
@Table(name = "site_studies",
        uniqueConstraints = @UniqueConstraint(columnNames = {"site_id", "study_id"}))
public class SiteStudyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private SiteEntity site;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "site_study_id")
    private String siteStudyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SiteStudyStatus status = SiteStudyStatus.PENDING;

    @Column(name = "activation_date")
    private LocalDateTime activationDate;

    @Column(name = "deactivation_date")
    private LocalDateTime deactivationDate;

    @Column(name = "subject_enrollment_cap")
    private Integer subjectEnrollmentCap;

    @Column(name = "subject_enrollment_count")
    private Integer subjectEnrollmentCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SiteStudyStatus {
        PENDING, ACTIVE, INACTIVE, CLOSED, SUSPENDED
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SiteEntity getSite() {
        return site;
    }

    public void setSite(SiteEntity site) {
        this.site = site;
    }

    public Long getStudyId() {
        return studyId;
    }

    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }

    public String getSiteStudyId() {
        return siteStudyId;
    }

    public void setSiteStudyId(String siteStudyId) {
        this.siteStudyId = siteStudyId;
    }

    public SiteStudyStatus getStatus() {
        return status;
    }

    public void setStatus(SiteStudyStatus status) {
        this.status = status;
    }

    public LocalDateTime getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(LocalDateTime activationDate) {
        this.activationDate = activationDate;
    }

    public LocalDateTime getDeactivationDate() {
        return deactivationDate;
    }

    public void setDeactivationDate(LocalDateTime deactivationDate) {
        this.deactivationDate = deactivationDate;
    }

    public Integer getSubjectEnrollmentCap() {
        return subjectEnrollmentCap;
    }

    public void setSubjectEnrollmentCap(Integer subjectEnrollmentCap) {
        this.subjectEnrollmentCap = subjectEnrollmentCap;
    }

    public Integer getSubjectEnrollmentCount() {
        return subjectEnrollmentCount;
    }

    public void setSubjectEnrollmentCount(Integer subjectEnrollmentCount) {
        this.subjectEnrollmentCount = subjectEnrollmentCount;
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
}