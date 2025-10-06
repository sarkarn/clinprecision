package com.clinprecision.clinopsservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity for Study Randomization Strategy
 * Maps to study_randomization_strategies table
 * 
 * Represents randomization strategy data for study arms using normalized approach
 * for zero technical debt instead of JSON columns.
 */
@Entity
@Table(name = "study_randomization_strategies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyRandomizationStrategyEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_arm_id", nullable = false)
    private Long studyArmId;
    
    // Randomization strategy fields
    @Column(name = "type", nullable = false, length = 100)
    private String type; // SIMPLE, BLOCK, STRATIFIED, ADAPTIVE, etc.
    
    @Column(name = "ratio", length = 50)
    private String ratio; // e.g., "1:1", "2:1:1", "3:2"
    
    @Column(name = "block_size")
    private Integer blockSize; // For block randomization
    
    @Column(name = "stratification_factors", columnDefinition = "TEXT")
    private String stratificationFactors; // Comma-separated factors
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Additional notes
    
    // Audit fields
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(name = "created_by", nullable = false)
    private String createdBy;
    
    @Column(name = "updated_by", nullable = false)
    private String updatedBy;
    
    // JPA lifecycle hooks
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Relationship mapping (optional - for JPA navigation)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_arm_id", insertable = false, updatable = false)
    private StudyArmEntity studyArm;
}