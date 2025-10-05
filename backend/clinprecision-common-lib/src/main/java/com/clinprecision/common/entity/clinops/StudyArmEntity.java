package com.clinprecision.common.entity.clinops;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * StudyArm Entity - Maps to study_arms table
 * Represents a treatment arm within a clinical study
 */
@Entity
@Table(name = "study_arms")
public class StudyArmEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "aggregate_uuid", nullable = true, columnDefinition = "BINARY(16)")
    private java.util.UUID aggregateUuid; // Links to StudyDesignAggregate
    
    @Column(name = "arm_uuid", nullable = true, unique = true, columnDefinition = "BINARY(16)")
    private java.util.UUID armUuid; // UUID from event sourcing
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private StudyArmType type = StudyArmType.TREATMENT;
    
    @Column(name = "sequence_number", nullable = false)
    private Integer sequence;
    
    @Column(name = "planned_subjects")
    private Integer plannedSubjects = 0;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", insertable = false, updatable = false)
    @JsonBackReference
    private StudyEntity study;
    
    @OneToMany(mappedBy = "studyArm", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<StudyInterventionEntity> interventions = new ArrayList<>();
    
    // Soft delete fields
    @Column(name = "is_deleted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isDeleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deleted_by", length = 100)
    private String deletedBy;
    
    @Column(name = "deletion_reason", columnDefinition = "TEXT")
    private String deletionReason;
    
    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public StudyArmEntity() {}
    
    public StudyArmEntity(String name, String description, StudyArmType type, Integer sequence, 
                         Integer plannedSubjects, Long studyId) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.sequence = sequence;
        this.plannedSubjects = plannedSubjects;
        this.studyId = studyId;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public StudyArmType getType() { return type; }
    public void setType(StudyArmType type) { this.type = type; }
    
    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    
    public Integer getPlannedSubjects() { return plannedSubjects; }
    public void setPlannedSubjects(Integer plannedSubjects) { this.plannedSubjects = plannedSubjects; }
    
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }
    
    public StudyEntity getStudy() { return study; }
    public void setStudy(StudyEntity study) { this.study = study; }
    
    public List<StudyInterventionEntity> getInterventions() { return interventions; }
    public void setInterventions(List<StudyInterventionEntity> interventions) { this.interventions = interventions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    public java.util.UUID getAggregateUuid() { return aggregateUuid; }
    public void setAggregateUuid(java.util.UUID aggregateUuid) { this.aggregateUuid = aggregateUuid; }
    
    public java.util.UUID getArmUuid() { return armUuid; }
    public void setArmUuid(java.util.UUID armUuid) { this.armUuid = armUuid; }
    
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
    
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    
    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }
    
    public String getDeletionReason() { return deletionReason; }
    public void setDeletionReason(String deletionReason) { this.deletionReason = deletionReason; }
    
    // Helper methods
    public void addIntervention(StudyInterventionEntity intervention) {
        interventions.add(intervention);
        intervention.setStudyArm(this);
    }
    
    public void removeIntervention(StudyInterventionEntity intervention) {
        interventions.remove(intervention);
        intervention.setStudyArm(null);
    }
    
    @Override
    public String toString() {
        return "StudyArmEntity{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", sequence=" + sequence +
                ", plannedSubjects=" + plannedSubjects +
                ", studyId=" + studyId +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudyArmEntity)) return false;
        StudyArmEntity that = (StudyArmEntity) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}