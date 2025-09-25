package com.clinprecision.common.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * UserStudyRole entity based on BRIDG/HL7 FHIR/CDISC standards.
 * Represents the role of a user in a specific study.
 */
@Entity
@Table(name = "user_study_roles", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "study_id", "role_id", "site_id"}))
public class UserStudyRoleEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "site_id")
    private Long siteId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for derived status - not stored in database but calculated from dates
    public enum RoleStatus {
        ACTIVE,    // start_date <= now <= end_date (or end_date is null)
        INACTIVE,  // end_date < now
        PENDING    // start_date > now
    }
    
    /**
     * Calculate the current status based on start and end dates
     */
    public RoleStatus getStatus() {
        LocalDate now = LocalDate.now();
        
        if (startDate.isAfter(now)) {
            return RoleStatus.PENDING;
        }
        
        if (endDate != null && endDate.isBefore(now)) {
            return RoleStatus.INACTIVE;
        }
        
        return RoleStatus.ACTIVE;
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }
    
    public RoleEntity getRole() {
        return role;
    }

    public void setRole(RoleEntity role) {
        this.role = role;
    }

    public Long getStudyId() {
        return studyId;
    }

    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }
    
    public Long getSiteId() {
        return siteId;
    }

    public void setSiteId(Long siteId) {
        this.siteId = siteId;
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
}
