package com.clinprecision.common.entity.studydesign;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Regulatory Status Entity - Maps to regulatory_status lookup table
 * Represents the regulatory approval status of a clinical study
 */
@Entity
@Table(name = "regulatory_status")
public class RegulatoryStatusEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code", length = 100, nullable = false, unique = true)
    private String code;
    
    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "requires_documentation")
    private Boolean requiresDocumentation = false;
    
    @Column(name = "allows_enrollment")
    private Boolean allowsEnrollment = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "regulatory_category", nullable = false)
    private RegulatoryCategory regulatoryCategory;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for regulatory categories
    public enum RegulatoryCategory {
        PRE_SUBMISSION,
        SUBMITTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        WITHDRAWN
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
    public RegulatoryStatusEntity() {}
    
    // Constructor with required fields
    public RegulatoryStatusEntity(String code, String name, Integer displayOrder, RegulatoryCategory regulatoryCategory) {
        this.code = code;
        this.name = name;
        this.displayOrder = displayOrder;
        this.regulatoryCategory = regulatoryCategory;
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
    
    public Boolean getRequiresDocumentation() {
        return requiresDocumentation;
    }
    
    public void setRequiresDocumentation(Boolean requiresDocumentation) {
        this.requiresDocumentation = requiresDocumentation;
    }
    
    public Boolean getAllowsEnrollment() {
        return allowsEnrollment;
    }
    
    public void setAllowsEnrollment(Boolean allowsEnrollment) {
        this.allowsEnrollment = allowsEnrollment;
    }
    
    public RegulatoryCategory getRegulatoryCategory() {
        return regulatoryCategory;
    }
    
    public void setRegulatoryCategory(RegulatoryCategory regulatoryCategory) {
        this.regulatoryCategory = regulatoryCategory;
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
        return "RegulatoryStatusEntity{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", regulatoryCategory=" + regulatoryCategory +
                ", displayOrder=" + displayOrder +
                ", isActive=" + isActive +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RegulatoryStatusEntity that = (RegulatoryStatusEntity) o;
        return code != null ? code.equals(that.code) : that.code == null;
    }
    
    @Override
    public int hashCode() {
        return code != null ? code.hashCode() : 0;
    }
}