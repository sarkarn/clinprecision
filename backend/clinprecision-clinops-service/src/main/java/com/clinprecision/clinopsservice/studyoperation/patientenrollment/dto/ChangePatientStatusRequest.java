package com.clinprecision.clinopsservice.studyoperation.patientenrollment.dto;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.service.PatientStatusService;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for patient status change requests
 * 
 * Used when changing a patient's status through the REST API
 * Maps to PatientStatusService.changePatientStatus() parameters
 * 
 * Example Usage:
 * <pre>
 * POST /api/v1/patients/123/status
 * {
 *   "newStatus": "SCREENING",
 *   "reason": "Screening visit scheduled for Oct 15",
 *   "changedBy": "coordinator@example.com",
 *   "notes": "Patient confirmed availability"
 * }
 * </pre>
 * 
 * @see PatientStatusService
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePatientStatusRequest {

    /**
     * New status to transition to
     * Must be one of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     * Validation occurs in service layer to ensure valid transitions
     */
    @NotBlank(message = "New status is required")
    private String newStatus;
    
    /**
     * Reason for the status change
     * Required for audit trail and compliance
     * 
     * Examples:
     * - "Screening visit scheduled for Oct 15"
     * - "Patient passed eligibility criteria"
     * - "First treatment visit completed"
     * - "Patient withdrew consent"
     */
    @NotBlank(message = "Reason for status change is required")
    private String reason;
    
    /**
     * User who initiated the status change
     * Typically email address or user ID
     * 
     * Examples:
     * - "coordinator@example.com"
     * - "dr.smith@example.com"
     * - "system" (for automated changes)
     */
    @NotBlank(message = "Changed by is required")
    private String changedBy;
    
    /**
     * Optional additional notes or context
     * Provides extra details beyond the required reason
     * 
     * Examples:
     * - "Patient confirmed availability via phone"
     * - "All screening lab results received"
     * - "Completed protocol visit V1"
     */
    private String notes;
    
    /**
     * Optional enrollment ID when status change is tied to specific enrollment
     * Used when patient is enrolled in multiple studies
     * If null, status change applies to patient's primary enrollment
     */
    private Long enrollmentId;

    /**
     * Optional identifier linking this status change to a related record (e.g. screening form ID)
     * Stored for traceability so downstream services can locate related data artifacts
     */
    private String relatedRecordId;
}
