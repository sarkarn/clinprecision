package com.clinprecision.clinopsservice.studydatabase.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Study Database Build Entity - Read model for study database builds
 * 
 * This entity represents the read-side projection of StudyDatabaseBuildAggregate
 * following CQRS pattern. Maps to study_database_builds table.
 * 
 * Follows established ClinPrecision patterns with aggregate_uuid mapping.
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

    /**
     * Aggregate UUID from Axon Framework - links to event-sourced aggregate
     */
    @Column(name = "aggregate_uuid", unique = true, nullable = false)
    private String aggregateUuid;

    /**
     * Human-readable build request identifier
     */
    @Column(name = "build_request_id", unique = true, nullable = false)
    private String buildRequestId;

    /**
     * Study ID this build is for
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Study name for display purposes
     */
    @Column(name = "study_name")
    private String studyName;

    /**
     * Study protocol identifier
     */
    @Column(name = "study_protocol")
    private String studyProtocol;

    /**
     * Current status of the build
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "build_status", nullable = false)
    @Builder.Default
    private StudyDatabaseBuildStatus buildStatus = StudyDatabaseBuildStatus.IN_PROGRESS;

    /**
     * When the build started
     */
    @Column(name = "build_start_time")
    private LocalDateTime buildStartTime;

    /**
     * When the build completed/failed/cancelled
     */
    @Column(name = "build_end_time")
    private LocalDateTime buildEndTime;

    /**
     * User ID who requested the build
     */
    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    /**
     * Build configuration as JSON
     */
    @Column(name = "build_configuration", columnDefinition = "LONGTEXT")
    private String buildConfiguration;

    /**
     * Validation results as JSON
     */
    @Column(name = "validation_results", columnDefinition = "LONGTEXT")
    private String validationResults;

    /**
     * Error details if build failed
     */
    @Column(name = "error_details", columnDefinition = "LONGTEXT")
    private String errorDetails;

    /**
     * Number of database tables created
     */
    @Column(name = "tables_created")
    @Builder.Default
    private Integer tablesCreated = 0;

    /**
     * Number of indexes created
     */
    @Column(name = "indexes_created")
    @Builder.Default
    private Integer indexesCreated = 0;

    /**
     * Number of triggers created
     */
    @Column(name = "triggers_created")
    @Builder.Default
    private Integer triggersCreated = 0;

    /**
     * Number of forms configured
     */
    @Column(name = "forms_configured")
    @Builder.Default
    private Integer formsConfigured = 0;

    /**
     * Number of validation rules created
     */
    @Column(name = "validation_rules_created")
    @Builder.Default
    private Integer validationRulesCreated = 0;

    /**
     * User who cancelled the build (if cancelled)
     */
    @Column(name = "cancelled_by")
    private String cancelledBy;

    /**
     * When the build was cancelled
     */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /**
     * Reason for cancellation
     */
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    /**
     * Validation status (PASSED, FAILED, WARNING)
     */
    @Column(name = "validation_status")
    private String validationStatus;

    /**
     * When validation was completed
     */
    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    /**
     * User who performed validation
     */
    @Column(name = "validated_by")
    private String validatedBy;

    /**
     * Entity creation timestamp
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Entity last update timestamp
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Convenience method to check if build is in progress
     */
    public boolean isInProgress() {
        return buildStatus == StudyDatabaseBuildStatus.IN_PROGRESS;
    }

    /**
     * Convenience method to check if build is completed
     */
    public boolean isCompleted() {
        return buildStatus == StudyDatabaseBuildStatus.COMPLETED;
    }

    /**
     * Convenience method to check if build failed
     */
    public boolean isFailed() {
        return buildStatus == StudyDatabaseBuildStatus.FAILED;
    }

    /**
     * Convenience method to check if build was cancelled
     */
    public boolean isCancelled() {
        return buildStatus == StudyDatabaseBuildStatus.CANCELLED;
    }

    /**
     * Convenience method to check if build is finished (not in progress)
     */
    public boolean isFinished() {
        return buildStatus != StudyDatabaseBuildStatus.IN_PROGRESS;
    }

    /**
     * Calculate build duration in seconds
     */
    public Long getBuildDurationSeconds() {
        if (buildStartTime == null || buildEndTime == null) {
            return null;
        }
        return java.time.Duration.between(buildStartTime, buildEndTime).getSeconds();
    }
}
