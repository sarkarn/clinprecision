package com.clinprecision.common.entity.clinops;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Study Phase Entity - Maps to study_phase lookup table
 * Represents the clinical trial phase of a study
 */
@Entity
@Table(name = "study_phase")
public class StudyPhaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code", length = 100, nullable = false, unique = true)
    private String code;
    
    @Column(name = "name", length = 50, nullable = false, unique = true)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "typical_duration_months")
    private Integer typicalDurationMonths;
    
    @Column(name = "typical_patient_count_min")
    private Integer typicalPatientCountMin;
    
    @Column(name = "typical_patient_count_max")
    private Integer typicalPatientCountMax;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "phase_category", nullable = false)
    private PhaseCategory phaseCategory;
    
    @Column(name = "requires_ide")
    private Boolean requiresIde = false;
    
    @Column(name = "requires_ind")
    private Boolean requiresInd = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for phase categories
    public enum PhaseCategory {
        PRECLINICAL,
        EARLY_PHASE,
        EFFICACY,
        REGISTRATION,
        POST_MARKET
    }
    
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
    public StudyPhaseEntity() {}
    
    // Constructor with required fields
    public StudyPhaseEntity(String code, String name, Integer displayOrder, PhaseCategory phaseCategory) {
        this.code = code;
        this.name = name;
        this.displayOrder = displayOrder;
        this.phaseCategory = phaseCategory;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getTypicalDurationMonths() {
        return typicalDurationMonths;
    }
    
    public void setTypicalDurationMonths(Integer typicalDurationMonths) {
        this.typicalDurationMonths = typicalDurationMonths;
    }
    
    public Integer getTypicalPatientCountMin() {
        return typicalPatientCountMin;
    }
    
    public void setTypicalPatientCountMin(Integer typicalPatientCountMin) {
        this.typicalPatientCountMin = typicalPatientCountMin;
    }
    
    public Integer getTypicalPatientCountMax() {
        return typicalPatientCountMax;
    }
    
    public void setTypicalPatientCountMax(Integer typicalPatientCountMax) {
        this.typicalPatientCountMax = typicalPatientCountMax;
    }
    
    public PhaseCategory getPhaseCategory() {
        return phaseCategory;
    }
    
    public void setPhaseCategory(PhaseCategory phaseCategory) {
        this.phaseCategory = phaseCategory;
    }
    
    public Boolean getRequiresIde() {
        return requiresIde;
    }
    
    public void setRequiresIde(Boolean requiresIde) {
        this.requiresIde = requiresIde;
    }
    
    public Boolean getRequiresInd() {
        return requiresInd;
    }
    
    public void setRequiresInd(Boolean requiresInd) {
        this.requiresInd = requiresInd;
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
    
    @Override
    public String toString() {
        return "StudyPhaseEntity{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", phaseCategory=" + phaseCategory +
                ", displayOrder=" + displayOrder +
                ", isActive=" + isActive +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudyPhaseEntity that = (StudyPhaseEntity) o;
        return code != null ? code.equals(that.code) : that.code == null;
    }
    
    @Override
    public int hashCode() {
        return code != null ? code.hashCode() : 0;
    }
}