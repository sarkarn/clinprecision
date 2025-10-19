package com.clinprecision.clinopsservice.studyoperation.patientenrollment.dto;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity.PatientStatusHistoryEntity;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for patient status history responses
 * 
 * Represents a single status change event in the patient's journey
 * Used for audit trail display and status history queries
 * 
 * Maps from PatientStatusHistoryEntity to API response format
 * 
 * @see PatientStatusHistoryEntity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientStatusHistoryResponse {

    /**
     * Database ID of the status history record
     */
    private Long id;
    
    /**
     * Patient database ID this status change applies to
     */
    private Long patientId;
    
    /**
     * Patient's full name for display
     */
    private String patientName;
    
    /**
     * Patient's screening/patient number for identification
     */
    private String patientNumber;
    
    /**
     * Optional enrollment ID if status change is tied to specific enrollment
     */
    private Long enrollmentId;
    
    /**
     * Study ID if status change is enrollment-specific
     */
    private Long studyId;
    
    /**
     * Study name for display
     */
    private String studyName;
    
    /**
     * Previous status before this change
     * One of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     * Null for initial registration
     */
    private String previousStatus;
    
    /**
     * New status after this change
     * One of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     */
    private String newStatus;
    
    /**
     * Reason for the status change
     * Required field providing business context
     */
    private String reason;
    
    /**
     * User who initiated the status change
     * Typically email address or user ID
     */
    private String changedBy;
    
    /**
     * Timestamp when the status change occurred
     */
    private LocalDateTime changedAt;
    
    /**
     * Optional additional notes or context
     */
    private String notes;
    
    /**
     * Event sourcing event ID for idempotency tracking
     * Links to domain_event_entry table
     */
    private String eventId;
    
    /**
     * Duration in days since previous status change
     * Null for first status change
     */
    private Long daysSincePreviousChange;
    
    /**
     * Human-readable description of the status transition
     * Example: "Registered → Screening: Screening visit scheduled"
     */
    private String statusChangeDescription;
    
    /**
     * Flag indicating if this is a terminal status (COMPLETED or WITHDRAWN)
     */
    private boolean terminalStatus;
    
    /**
     * Flag indicating if this is the patient's current status
     */
    private boolean currentStatus;
}
