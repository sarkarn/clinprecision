package com.clinprecision.clinopsservice.studydatabase.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

/**
 * Command for validating a study database setup
 * 
 * Follows CQRS pattern and extends BaseCommand from clinprecision-axon-lib.
 * This command triggers comprehensive validation of the database build including:
 * - Schema validation
 * - Data integrity checks
 * - Performance assessment
 * - Compliance verification (21 CFR Part 11)
 * 
 * Business Rules:
 * - Database build must exist
 * - Build must be in IN_PROGRESS or COMPLETED status
 * - User must have STUDY_MANAGER, SYSTEM_ADMIN, or DATA_MANAGER role
 */
@Getter
@Builder
@ToString
public class ValidateStudyDatabaseCommand extends BaseCommand {
    
    @NotNull(message = "Study database build ID is required")
    private final UUID studyDatabaseBuildId;
    
    @NotNull(message = "Study ID is required")
    private final Long studyId;
    
    @NotNull(message = "Requested by user ID is required")
    private final Long requestedBy;
    
    /**
     * Enable strict validation mode (default: true)
     * Strict mode enforces all validation rules without warnings
     */
    @Builder.Default
    private final boolean strictValidation = true;
    
    /**
     * Enable compliance checks (default: true)
     * Verifies 21 CFR Part 11 compliance requirements
     */
    @Builder.Default
    private final boolean complianceCheck = true;
    
    /**
     * Enable performance checks (default: true)
     * Validates database performance metrics
     */
    @Builder.Default
    private final boolean performanceCheck = true;
    
    @Override
    public void validate() {
        super.validate();
        
        // Additional business rule validation can be added here if needed
    }
    
    /**
     * Check if any validation type is enabled
     */
    public boolean hasValidationEnabled() {
        return strictValidation || complianceCheck || performanceCheck;
    }
}
