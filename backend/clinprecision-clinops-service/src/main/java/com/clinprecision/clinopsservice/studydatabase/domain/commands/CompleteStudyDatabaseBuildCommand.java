package com.clinprecision.clinopsservice.studydatabase.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.Map;
import java.util.UUID;

/**
 * Command for completing a study database build
 * 
 * Follows CQRS pattern and extends BaseCommand from clinprecision-axon-lib.
 * This command marks a database build as successfully completed with validation results.
 * 
 * Business Rules:
 * - Database build must exist
 * - Build must be in IN_PROGRESS status
 * - Validation result must be successful
 * - Forms must be configured
 * - User must have STUDY_MANAGER or SYSTEM_ADMIN role
 */
@Getter
@Builder
@ToString
public class CompleteStudyDatabaseBuildCommand extends BaseCommand {
    
    @NotNull(message = "Study database build ID is required")
    private final UUID studyDatabaseBuildId;
    
    @NotNull(message = "Completed by user ID is required")
    private final Long completedBy;
    
    @NotNull(message = "Validation result is required for completion")
    private final ValidationResultData validationResult;
    
    @Min(value = 0, message = "Forms configured count must be non-negative")
    @Builder.Default
    private final int formsConfigured = 0;
    
    @Min(value = 0, message = "Validation rules setup count must be non-negative")
    @Builder.Default
    private final int validationRulesSetup = 0;
    
    /**
     * Build metrics and performance data
     */
    private final Map<String, Object> buildMetrics;
    
    @Override
    public void validate() {
        super.validate();
        
        // Business rule: Validation result must be successful for completion
        if (validationResult == null || !validationResult.isValid()) {
            throw new IllegalArgumentException(
                "Cannot complete build without successful validation result");
        }
        
        // Business rule: At least one form must be configured
        if (formsConfigured <= 0) {
            throw new IllegalArgumentException(
                "At least one form must be configured to complete the build");
        }
    }
    
    /**
     * Validation Result Data embedded in the command
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
