package com.clinprecision.common.entity.studydesign;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Intervention Entity - Maps to interventions table
 * Represents a treatment intervention within a study arm
 */
@Entity
@Table(name = "interventions")
public class StudyInterventionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private InterventionType type = InterventionType.DRUG;
    
    @Column(name = "dosage", length = 100)
    private String dosage;
    
    @Column(name = "frequency", length = 100)
    private String frequency;
    
    @Column(name = "route", length = 100)
    private String route;
    
    @Column(name = "study_arm_id", nullable = false)
    private Long studyArmId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_arm_id", insertable = false, updatable = false)
    @JsonBackReference
    private StudyArmEntity studyArm;
    
    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
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
    public StudyInterventionEntity() {}
    
    public StudyInterventionEntity(String name, String description, InterventionType type,
                                   String dosage, String frequency, String route, Long studyArmId) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.dosage = dosage;
        this.frequency = frequency;
        this.route = route;
        this.studyArmId = studyArmId;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public InterventionType getType() { return type; }
    public void setType(InterventionType type) { this.type = type; }
    
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    
    public Long getStudyArmId() { return studyArmId; }
    public void setStudyArmId(Long studyArmId) { this.studyArmId = studyArmId; }
    
    public StudyArmEntity getStudyArm() { return studyArm; }
    public void setStudyArm(StudyArmEntity studyArm) { this.studyArm = studyArm; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @Override
    public String toString() {
        return "InterventionEntity{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", dosage='" + dosage + '\'' +
                ", frequency='" + frequency + '\'' +
                ", route='" + route + '\'' +
                ", studyArmId=" + studyArmId +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudyInterventionEntity)) return false;
        StudyInterventionEntity that = (StudyInterventionEntity) o;
        return id != null && id.equals(that.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}