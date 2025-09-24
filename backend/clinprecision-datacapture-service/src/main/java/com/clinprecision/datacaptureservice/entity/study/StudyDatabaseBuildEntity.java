package com.clinprecision.datacaptureservice.entity.study;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Study Database Build Entity
 * 
 * Tracks the database build process for clinical studies including:
 * - Build status and timing
 * - Configuration details
 * - Validation results
 * - Error tracking
 */
@Entity
@Table(name = "study_database_builds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyDatabaseBuildEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "build_request_id", unique = true, nullable = false)
    private String buildRequestId;
    
    @Column(name = "build_status", nullable = false)
    private String buildStatus; // IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    
    @Column(name = "build_start_time")
    private LocalDateTime buildStartTime;
    
    @Column(name = "build_end_time")
    private LocalDateTime buildEndTime;
    
    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;
    
    @Lob
    @Column(name = "build_configuration")
    private String buildConfiguration;
    
    @Lob
    @Column(name = "validation_results")
    private String validationResults;
    
    @Lob
    @Column(name = "error_details")
    private String errorDetails;
    
    @Column(name = "tables_created")
    private Integer tablesCreated;
    
    @Column(name = "indexes_created")
    private Integer indexesCreated;
    
    @Column(name = "triggers_created")
    private Integer triggersCreated;
    
    @Column(name = "forms_configured")
    private Integer formsConfigured;
    
    @Column(name = "validation_rules_created")
    private Integer validationRulesCreated;
    
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
}