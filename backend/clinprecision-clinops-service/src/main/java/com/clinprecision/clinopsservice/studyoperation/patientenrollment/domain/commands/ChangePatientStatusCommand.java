package com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands;

import com.clinprecision.axon.command.BaseCommand;
import org.axonframework.modelling.command.TargetAggregateIdentifier;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.UUID;

/**
 * Command to change a patient's status
 * 
 * Valid status transitions:
 * - REGISTERED → SCREENING
 * - SCREENING → ENROLLED
 * - ENROLLED → ACTIVE
 * - ACTIVE → COMPLETED
 * - ANY → WITHDRAWN
 * 
 * Follows established ClinPrecision command patterns
 */
@Getter
@Builder
@ToString
public class ChangePatientStatusCommand extends BaseCommand {

    @TargetAggregateIdentifier
    @NotNull(message = "Patient ID is required")
    private final UUID patientId;
    
    @NotBlank(message = "New status is required")
    private final String newStatus;
    
    @NotBlank(message = "Reason is required")
    private final String reason;
    
    @NotBlank(message = "Changed by is required")
    private final String changedBy;
    
    /**
     * Optional: Related enrollment ID if status change is enrollment-specific
     */
    private final UUID enrollmentId;
    
    /**
     * Optional: Additional notes
     */
    private final String notes;

    /**
     * Optional: Identifier of related record stored in another service (e.g. form submission)
     * Propagated to the event/history layer for traceability
     */
    private final String relatedRecordId;

    @Override
    public void validate() {
        super.validate();
        
        // Validate status is one of the valid values
        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException(
                "Invalid status: " + newStatus + ". Must be one of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN"
            );
        }
        
        if (reason != null && reason.trim().length() < 3) {
            throw new IllegalArgumentException("Reason must be at least 3 characters long");
        }
    }
    
    private boolean isValidStatus(String status) {
        if (status == null) return false;
        String upperStatus = status.toUpperCase();
        return "REGISTERED".equals(upperStatus) ||
               "SCREENING".equals(upperStatus) ||
               "ENROLLED".equals(upperStatus) ||
               "ACTIVE".equals(upperStatus) ||
               "COMPLETED".equals(upperStatus) ||
               "WITHDRAWN".equals(upperStatus);
    }
}
