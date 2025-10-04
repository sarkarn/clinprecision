package com.clinprecision.clinopsservice.studydatabase.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

/**
 * Command for cancelling an ongoing study database build
 * 
 * Follows CQRS pattern and extends BaseCommand from clinprecision-axon-lib.
 * This command cancels an in-progress database build operation.
 * 
 * Business Rules:
 * - Database build must exist
 * - Build must be in IN_PROGRESS status
 * - Cancellation reason must be provided for audit trail
 * - User must have STUDY_MANAGER or SYSTEM_ADMIN role
 */
@Getter
@Builder
@ToString
public class CancelStudyDatabaseBuildCommand extends BaseCommand {
    
    @NotNull(message = "Study database build ID is required")
    private final UUID studyDatabaseBuildId;
    
    @NotNull(message = "Requested by user ID is required")
    private final Long requestedBy;
    
    @NotNull(message = "Cancellation reason is required")
    @Size(min = 1, max = 500, message = "Cancellation reason must be between 1 and 500 characters")
    private final String cancellationReason;
    
    @Override
    public void validate() {
        super.validate();
        
        // Business rule: Cancellation reason must not be empty or just whitespace
        if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Cancellation reason is required for audit trail compliance");
        }
    }
}
