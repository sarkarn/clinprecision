package com.clinprecision.common.entity.studydesign;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Organization Study Entity - Maps to organization_studies table
 * Represents the association between organizations and studies
 */
@Entity
@Table(name = "organization_studies")
public class OrganizationStudyEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @JsonBackReference
    private StudyEntity study;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private OrganizationRole role;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public OrganizationStudyEntity() {}
    
    // Constructor with required fields
    public OrganizationStudyEntity(Long organizationId, StudyEntity study, OrganizationRole role) {
        this.organizationId = organizationId;
        this.study = study;
        this.role = role;
        this.isPrimary = false;
    }
    
    // Constructor with isPrimary
    public OrganizationStudyEntity(Long organizationId, StudyEntity study, OrganizationRole role, Boolean isPrimary) {
        this.organizationId = organizationId;
        this.study = study;
        this.role = role;
        this.isPrimary = isPrimary != null ? isPrimary : false;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public StudyEntity getStudy() {
        return study;
    }
    
    public void setStudy(StudyEntity study) {
        this.study = study;
    }
    
    public OrganizationRole getRole() {
        return role;
    }
    
    public void setRole(OrganizationRole role) {
        this.role = role;
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
    
    public Boolean getIsPrimary() {
        return isPrimary;
    }
    
    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}
