package com.clinprecision.clinopsservice.studydatabase.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Event fired when a study database build is completed successfully
 * 
 * This immutable event captures the successful completion of a database build.
 * Part of the Event Sourcing pattern for complete audit trail.
 * 
 * Compliance: FDA 21 CFR Part 11 - Electronic records and signatures
 */
@Getter
@Builder
@ToString
public class StudyDatabaseBuildCompletedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final Long completedBy;
    private final LocalDateTime completedAt;
    private final LocalDateTime startedAt; // For duration calculation
    private final ValidationResultData validationResult;
    private final int formsConfigured;
    private final int validationRulesSetup;
    private final Map<String, Object> buildMetrics;
    private final String message;
    
    /**
     * Validation Result Data embedded in the event
     */
    @Getter
    @Builder
    @ToString
    public static class ValidationResultData {
        private final boolean isValid;
        private final String overallAssessment;
        private final String complianceStatus;
        private final Integer performanceScore;
    }
}
