package com.clinprecision.clinopsservice.studyoperation.patientenrollment.dto;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.repository.PatientStatusHistoryRepository;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Data Transfer Object for status transition summary analytics
 * 
 * Provides aggregated statistics about status transitions across all patients
 * Used for dashboards, reports, and analytics
 * 
 * Maps from StatusTransitionSummary repository projection to API response
 * 
 * Example Response:
 * <pre>
 * {
 *   "previousStatus": "SCREENING",
 *   "newStatus": "ENROLLED",
 *   "transitionCount": 38,
 *   "uniquePatientCount": 38,
 *   "transitionLabel": "SCREENING → ENROLLED",
 *   "conversionRate": 73.08
 * }
 * </pre>
 * 
 * @see PatientStatusHistoryRepository.StatusTransitionSummary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusTransitionSummaryResponse {

    /**
     * Previous status in the transition
     * One of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     * Null for initial registrations
     */
    private String previousStatus;
    
    /**
     * New status in the transition
     * One of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     */
    private String newStatus;
    
    /**
     * Total number of times this transition has occurred
     * Includes multiple transitions for same patient if applicable
     */
    private Long transitionCount;
    
    /**
     * Number of unique patients who made this transition
     * Used to identify duplicate transitions (e.g., patient withdrawn and re-enrolled)
     */
    private Long uniquePatientCount;
    
    /**
     * Human-readable transition label
     * Example: "SCREENING → ENROLLED"
     */
    private String transitionLabel;
    
    /**
     * Conversion rate as percentage
     * Calculated as (transitionCount / total patients in previous status) * 100
     * Example: 73.08 means 73.08% of patients in SCREENING progressed to ENROLLED
     * Null if calculation not applicable
     */
    private Double conversionRate;
    
    /**
     * Average days spent in previous status before transition
     * Used to identify bottlenecks and typical progression timelines
     * Null if not calculated
     */
    private Double averageDaysInPreviousStatus;
}
