package com.clinprecision.clinopsservice.studydatabase.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event fired when a study database validation is completed
 * 
 * This immutable event captures the completion of database validation.
 * Part of the Event Sourcing pattern for complete audit trail.
 * 
 * Compliance: FDA 21 CFR Part 11 - Electronic records and signatures
 */
@Getter
@Builder
@ToString
public class StudyDatabaseValidationCompletedEvent {
    
    private final UUID studyDatabaseBuildId;
    private final Long studyId;
    private final LocalDateTime validatedAt;
    private final ValidationResultData validationResult;
    private final Long validatedBy;
    
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
