package com.clinprecision.studydesignservice.studydatabase.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for study database build responses
 * Contains both database ID and aggregate UUID
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyDatabaseBuildDto {

    /**
     * Database auto-generated ID
     */
    private Long id;

    /**
     * Axon aggregate UUID (for event sourcing)
     */
    private String aggregateUuid;

    /**
     * Human-readable build request identifier
     */
    private String buildRequestId;

    /**
     * Study details
     */
    private Long studyId;
    private String studyName;
    private String studyProtocol;

    /**
     * Build status and timing
     */
    private String buildStatus;
    private LocalDateTime buildStartTime;
    private LocalDateTime buildEndTime;
    private Long buildDurationSeconds;

    /**
     * User tracking
     */
    private Long requestedBy;
    private String cancelledBy;
    private String validatedBy;

    /**
     * Build metrics
     */
    private Integer tablesCreated;
    private Integer indexesCreated;
    private Integer triggersCreated;
    private Integer formsConfigured;
    private Integer validationRulesCreated;

    /**
     * Validation and error information
     */
    private String validationStatus;
    private LocalDateTime validatedAt;
    private String cancellationReason;
    private String errorDetails;

    /**
     * Audit timestamps
     */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convenience flags
     */
    private Boolean inProgress;
    private Boolean completed;
    private Boolean failed;
    private Boolean cancelled;
}
