package com.clinprecision.clinopsservice.studydesign.design.entity;

import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Design Progress Entity - Maps to study_design_progress table
 * Tracks the progress of different design phases for a study
 */
@Entity
@Table(name = "study_design_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"study_id", "phase"}))
public class DesignProgressEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "phase", nullable = false, length = 50)
    private String phase;
    
    @Column(name = "completed", nullable = false)
    private Boolean completed = false;
    
    @Column(name = "percentage", nullable = false)
    private Integer percentage = 0;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    // Many-to-one relationship with StudyEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", referencedColumnName = "id", insertable = false, updatable = false)
    private StudyEntity study;
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (completed == null) {
            completed = false;
        }
        if (percentage == null) {
            percentage = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public DesignProgressEntity() {}
    
    // Constructor with required fields
    public DesignProgressEntity(Long studyId, String phase) {
        this.studyId = studyId;
        this.phase = phase;
        this.completed = false;
        this.percentage = 0;
    }
    
    // Constructor with all main fields
    public DesignProgressEntity(Long studyId, String phase, Boolean completed, Integer percentage) {
        this.studyId = studyId;
        this.phase = phase;
        this.completed = completed;
        this.percentage = percentage;
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
    
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
    }
    
    public Boolean getCompleted() {
        return completed;
    }
    
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
    
    public Integer getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public StudyEntity getStudy() {
        return study;
    }
    
    public void setStudy(StudyEntity study) {
        this.study = study;
    }
    
    @Override
    public String toString() {
        return "DesignProgressEntity{" +
                "id=" + id +
                ", studyId=" + studyId +
                ", phase='" + phase + '\'' +
                ", completed=" + completed +
                ", percentage=" + percentage +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


