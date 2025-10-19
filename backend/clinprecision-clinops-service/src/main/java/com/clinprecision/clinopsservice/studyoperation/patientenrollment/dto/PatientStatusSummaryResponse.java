package com.clinprecision.clinopsservice.patientenrollment.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for comprehensive patient status summary
 * 
 * Combines current status with complete history for detailed patient view
 * Used for patient detail pages and status overview
 * 
 * Example Response:
 * <pre>
 * {
 *   "patientId": 123,
 *   "patientName": "John Doe",
 *   "patientNumber": "P-2025-001",
 *   "currentStatus": "ACTIVE",
 *   "currentStatusSince": "2025-10-12T10:30:00",
 *   "daysInCurrentStatus": 5,
 *   "totalStatusChanges": 4,
 *   "statusHistory": [...]
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientStatusSummaryResponse {

    /**
     * Patient database ID
     */
    private Long patientId;
    
    /**
     * Patient's full name
     */
    private String patientName;
    
    /**
     * Patient's screening/patient number
     */
    private String patientNumber;
    
    /**
     * Current status
     * One of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     */
    private String currentStatus;
    
    /**
     * When the patient entered current status
     */
    private LocalDateTime currentStatusSince;
    
    /**
     * Number of days patient has been in current status
     */
    private Long daysInCurrentStatus;
    
    /**
     * Total number of status changes in patient's history
     */
    private Long totalStatusChanges;
    
    /**
     * Flag indicating if patient is in a terminal status
     */
    private boolean terminalStatus;
    
    /**
     * Complete status history ordered chronologically (newest first)
     */
    private List<PatientStatusHistoryResponse> statusHistory;
    
    /**
     * Average days between status changes
     * Indicates patient progression speed
     */
    private Double averageDaysBetweenChanges;
    
    /**
     * Most recent status change reason
     */
    private String lastChangeReason;
    
    /**
     * User who made most recent status change
     */
    private String lastChangedBy;
}
