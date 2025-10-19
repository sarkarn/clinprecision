package com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event emitted when a patient's status changes
 * 
 * Status transitions:
 * - REGISTERED → SCREENING (patient starts screening process)
 * - SCREENING → ENROLLED (patient passes screening and enrolls)
 * - ENROLLED → ACTIVE (patient starts receiving treatment)
 * - ACTIVE → COMPLETED (patient completes study)
 * - ANY → WITHDRAWN (patient withdraws from study)
 * 
 * Follows established ClinPrecision event patterns
 */
@Getter
@Builder
@ToString
public class PatientStatusChangedEvent {

    /**
     * Patient aggregate UUID
     */
    private final UUID patientId;
    
    /**
     * Previous status
     */
    private final String previousStatus;
    
    /**
     * New status
     */
    private final String newStatus;
    
    /**
     * Reason for status change
     */
    private final String reason;
    
    /**
     * User who changed the status
     */
    private final String changedBy;
    
    /**
     * Timestamp when status changed
     */
    private final LocalDateTime changedAt;
    
    /**
     * Optional: Related enrollment ID if status change is enrollment-specific
     */
    private final UUID enrollmentId;
    
    /**
     * Optional: Additional context or notes
     */
    private final String notes;
    
    /**
     * Check if this is a valid status transition
     */
    public boolean isValidTransition() {
        // Define valid transitions
        if ("REGISTERED".equals(previousStatus) && "SCREENING".equals(newStatus)) return true;
        if ("SCREENING".equals(previousStatus) && "ENROLLED".equals(newStatus)) return true;
        if ("ENROLLED".equals(previousStatus) && "ACTIVE".equals(newStatus)) return true;
        if ("ACTIVE".equals(previousStatus) && "COMPLETED".equals(newStatus)) return true;
        if ("WITHDRAWN".equals(newStatus)) return true; // Can withdraw from any status
        
        return false;
    }
    
    /**
     * Get display message for this status change
     */
    public String getDisplayMessage() {
        return String.format("Patient status changed from %s to %s", previousStatus, newStatus);
    }
}
