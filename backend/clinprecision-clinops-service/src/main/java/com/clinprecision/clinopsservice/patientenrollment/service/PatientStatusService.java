package com.clinprecision.clinopsservice.patientenrollment.service;

import com.clinprecision.clinopsservice.patientenrollment.domain.commands.ChangePatientStatusCommand;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatusHistoryEntity;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientStatusHistoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Patient Status Management Service
 * 
 * <p>Orchestrates patient status changes and history tracking following CQRS/Event Sourcing patterns.
 * This service handles both command (write) and query (read) operations for patient status lifecycle.</p>
 * 
 * <p><b>Command Operations (Write):</b></p>
 * <ul>
 *   <li>changePatientStatus() - Dispatch status change commands to aggregate</li>
 *   <li>validateStatusTransition() - Business rule validation before command</li>
 * </ul>
 * 
 * <p><b>Query Operations (Read):</b></p>
 * <ul>
 *   <li>getPatientStatusHistory() - Complete audit trail for a patient</li>
 *   <li>getCurrentPatientStatus() - Most recent status details</li>
 *   <li>getStatusTransitionSummary() - Analytics aggregations</li>
 *   <li>findPatientsInStatus() - Filter by status</li>
 *   <li>findPatientsStuckInStatus() - Identify bottlenecks</li>
 * </ul>
 * 
 * <p><b>Architecture Flow:</b></p>
 * <pre>
 * UI/Controller → PatientStatusService → CommandGateway → PatientAggregate
 *                                              ↓
 *                                      PatientStatusChangedEvent
 *                                              ↓
 *                                   PatientEnrollmentProjector
 *                                              ↓
 *                         [patients, patient_status_history tables]
 *                                              ↓
 *                                   PatientStatusService (Query)
 * </pre>
 * 
 * <p><b>Status Lifecycle:</b></p>
 * <ul>
 *   <li>REGISTERED → SCREENING (screening visit scheduled)</li>
 *   <li>SCREENING → ENROLLED (passed eligibility)</li>
 *   <li>ENROLLED → ACTIVE (treatment started)</li>
 *   <li>ACTIVE → COMPLETED (study completed)</li>
 *   <li>ANY → WITHDRAWN (patient withdrawal)</li>
 * </ul>
 * 
 * @see ChangePatientStatusCommand
 * @see PatientStatusHistoryEntity
 * @see PatientStatus
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientStatusService {

    private final CommandGateway commandGateway;
    private final PatientRepository patientRepository;
    private final PatientStatusHistoryRepository statusHistoryRepository;

    // ==================== Command Operations (Write) ====================

    /**
     * Change patient status with validation and command dispatch
     * 
     * <p>This method orchestrates the status change process:</p>
     * <ol>
     *   <li>Validates patient exists</li>
     *   <li>Validates status transition is allowed</li>
     *   <li>Sends ChangePatientStatusCommand to aggregate</li>
     *   <li>Waits for command completion</li>
     *   <li>Waits for projection (status history record)</li>
     *   <li>Returns updated status history</li>
     * </ol>
     * 
     * @param patientId Database ID of the patient
     * @param newStatus Target status to transition to
     * @param reason Required reason for the status change
     * @param changedBy User performing the status change
     * @param notes Optional additional context
     * @return The created status history record
     * @throws IllegalArgumentException if validation fails
     * @throws RuntimeException if command processing fails
     */
    public PatientStatusHistoryEntity changePatientStatus(
            Long patientId,
            PatientStatus newStatus,
            String reason,
            String changedBy,
            String notes
    ) {
        log.info("Changing patient status: patientId={}, newStatus={}, changedBy={}", 
            patientId, newStatus, changedBy);
        
        // Validate inputs
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        if (newStatus == null) {
            throw new IllegalArgumentException("New status is required");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required for status change");
        }
        if (changedBy == null || changedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("changedBy is required");
        }
        
        // Find patient entity
        PatientEntity patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
        
        UUID patientUuid = UUID.fromString(patient.getAggregateUuid());
        PatientStatus currentStatus = patient.getStatus();
        
        log.info("Current patient status: {} → {}", currentStatus, newStatus);
        
        // Validate status transition
        validateStatusTransition(currentStatus, newStatus);
        
        // Create and send command
        ChangePatientStatusCommand command = ChangePatientStatusCommand.builder()
                .patientId(patientUuid)
                .newStatus(newStatus.name())
                .reason(reason)
                .changedBy(changedBy)
                .notes(notes)
                .build();
        
        log.info("Sending ChangePatientStatusCommand: {}", command);
        
        try {
            // Send command and wait for completion
            CompletableFuture<Object> future = commandGateway.send(command);
            Object result = future.join(); // Wait for command to be processed
            
            log.info("ChangePatientStatusCommand processed successfully: {}", result);
            
        } catch (Exception e) {
            log.error("Failed to process ChangePatientStatusCommand: {}", e.getMessage(), e);
            throw new RuntimeException("Status change failed: " + e.getMessage(), e);
        }
        
        // Wait for projection to complete
        log.info("Waiting for status history projection...");
        PatientStatusHistoryEntity history = waitForStatusHistoryProjection(
            patient.getId(), 
            currentStatus, 
            newStatus, 
            5000 // 5 second timeout
        );
        
        if (history == null) {
            log.error("Status history projection not found after timeout");
            throw new RuntimeException("Status changed but projection not found. Please check event processing.");
        }
        
        log.info("Status history projection found: id={}, {} → {}", 
            history.getId(), currentStatus, newStatus);
        
        return history;
    }

    /**
     * Change patient status with enrollment context
     * 
     * <p>Variant of changePatientStatus() that includes enrollment ID for enrollment-specific
     * status changes. This is useful when a patient's status change is tied to a specific
     * study enrollment.</p>
     * 
     * @param patientId Database ID of the patient
     * @param enrollmentId Database ID of the enrollment (optional)
     * @param newStatus Target status to transition to
     * @param reason Required reason for the status change
     * @param changedBy User performing the status change
     * @param notes Optional additional context
     * @return The created status history record
     */
    public PatientStatusHistoryEntity changePatientStatus(
            Long patientId,
            Long enrollmentId,
            PatientStatus newStatus,
            String reason,
            String changedBy,
            String notes
    ) {
        log.info("Changing patient status with enrollment context: patientId={}, enrollmentId={}, newStatus={}", 
            patientId, enrollmentId, newStatus);
        
        // For now, just call the main method
        // In future, we could include enrollmentId in the command
        return changePatientStatus(patientId, newStatus, reason, changedBy, notes);
    }

    /**
     * Validate status transition follows business rules
     * 
     * <p>Validates that the requested status transition is allowed according to
     * the patient status lifecycle rules.</p>
     * 
     * <p><b>Valid Transitions:</b></p>
     * <ul>
     *   <li>REGISTERED → SCREENING, WITHDRAWN</li>
     *   <li>SCREENING → ENROLLED, WITHDRAWN</li>
     *   <li>ENROLLED → ACTIVE, WITHDRAWN</li>
     *   <li>ACTIVE → COMPLETED, WITHDRAWN</li>
     *   <li>COMPLETED → (none - terminal)</li>
     *   <li>WITHDRAWN → (none - terminal)</li>
     * </ul>
     * 
     * @param currentStatus Current patient status
     * @param newStatus Target status
     * @throws IllegalArgumentException if transition is not allowed
     */
    public void validateStatusTransition(PatientStatus currentStatus, PatientStatus newStatus) {
        log.debug("Validating status transition: {} → {}", currentStatus, newStatus);
        
        if (currentStatus == null) {
            throw new IllegalArgumentException("Current status is null");
        }
        if (newStatus == null) {
            throw new IllegalArgumentException("New status is null");
        }
        
        // Same status is a no-op
        if (currentStatus == newStatus) {
            throw new IllegalArgumentException(
                String.format("Patient is already in %s status", currentStatus)
            );
        }
        
        // Terminal statuses cannot transition
        if (currentStatus.isTerminal()) {
            throw new IllegalArgumentException(
                String.format("Cannot change status from terminal status %s", currentStatus)
            );
        }
        
        // Can always withdraw from non-terminal status
        if (newStatus == PatientStatus.WITHDRAWN) {
            return; // Always valid
        }
        
        // Validate specific transitions
        boolean isValid = false;
        switch (currentStatus) {
            case REGISTERED:
                isValid = (newStatus == PatientStatus.SCREENING);
                break;
            case SCREENING:
                isValid = (newStatus == PatientStatus.ENROLLED);
                break;
            case ENROLLED:
                isValid = (newStatus == PatientStatus.ACTIVE);
                break;
            case ACTIVE:
                isValid = (newStatus == PatientStatus.COMPLETED);
                break;
            default:
                isValid = false;
        }
        
        if (!isValid) {
            throw new IllegalArgumentException(
                String.format(
                    "Invalid status transition: %s → %s. Valid transitions from %s: %s",
                    currentStatus,
                    newStatus,
                    currentStatus,
                    getValidTransitionsString(currentStatus)
                )
            );
        }
        
        log.debug("Status transition validated successfully: {} → {}", currentStatus, newStatus);
    }

    /**
     * Get valid transitions for a given status as a formatted string
     * 
     * @param status Current status
     * @return Comma-separated list of valid target statuses
     */
    private String getValidTransitionsString(PatientStatus status) {
        switch (status) {
            case REGISTERED:
                return "SCREENING, WITHDRAWN";
            case SCREENING:
                return "ENROLLED, WITHDRAWN";
            case ENROLLED:
                return "ACTIVE, WITHDRAWN";
            case ACTIVE:
                return "COMPLETED, WITHDRAWN";
            case COMPLETED:
            case WITHDRAWN:
                return "(none - terminal status)";
            default:
                return "UNKNOWN";
        }
    }

    /**
     * Wait for status history projection with retry logic
     * 
     * @param patientId Patient database ID
     * @param previousStatus Previous status (for matching)
     * @param newStatus New status (for matching)
     * @param timeoutMs Maximum time to wait in milliseconds
     * @return Status history entity when found, null if timeout
     */
    private PatientStatusHistoryEntity waitForStatusHistoryProjection(
            Long patientId,
            PatientStatus previousStatus,
            PatientStatus newStatus,
            long timeoutMs
    ) {
        long startTime = System.currentTimeMillis();
        long delay = 50; // Start with 50ms delay
        int attempts = 0;
        
        log.info("Waiting for status history projection: patient={}, {} → {}", 
            patientId, previousStatus, newStatus);
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            try {
                attempts++;
                
                // Find most recent status change for this patient
                Optional<PatientStatusHistoryEntity> historyOpt = 
                    statusHistoryRepository.findMostRecentByPatientId(patientId);
                
                if (historyOpt.isPresent()) {
                    PatientStatusHistoryEntity history = historyOpt.get();
                    
                    // Check if this is the expected status change
                    if (history.getPreviousStatus() == previousStatus && 
                        history.getNewStatus() == newStatus) {
                        
                        log.info("Status history projection found after {}ms and {} attempts", 
                            System.currentTimeMillis() - startTime, attempts);
                        return history;
                    }
                }
                
                log.debug("Status history not found yet, attempt {}, waiting {}ms", attempts, delay);
                
                // Wait before retrying
                Thread.sleep(delay);
                
                // Exponential backoff up to 500ms
                delay = Math.min(delay * 2, 500);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for status history projection", e);
            }
        }
        
        log.warn("Status history projection not found after {}ms and {} attempts", timeoutMs, attempts);
        return null;
    }

    // ==================== Query Operations (Read) ====================

    /**
     * Get complete status history for a patient
     * 
     * <p>Returns all status transitions for a patient ordered chronologically
     * (newest first). Useful for displaying audit trail in UI.</p>
     * 
     * @param patientId Patient database ID
     * @return List of status history records ordered by changed_at DESC
     */
    @Transactional(readOnly = true)
    public List<PatientStatusHistoryEntity> getPatientStatusHistory(Long patientId) {
        log.info("Fetching status history for patient: {}", patientId);
        
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        
        List<PatientStatusHistoryEntity> history = 
            statusHistoryRepository.findByPatientIdOrderByChangedAtDesc(patientId);
        
        log.info("Found {} status changes for patient {}", history.size(), patientId);
        return history;
    }

    /**
     * Get current patient status details
     * 
     * <p>Returns the most recent status change record for a patient.
     * Provides more context than just the status enum value.</p>
     * 
     * @param patientId Patient database ID
     * @return Most recent status history record
     * @throws IllegalArgumentException if patient not found or has no status history
     */
    @Transactional(readOnly = true)
    public PatientStatusHistoryEntity getCurrentPatientStatus(Long patientId) {
        log.info("Fetching current status for patient: {}", patientId);
        
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        
        return statusHistoryRepository.findMostRecentByPatientId(patientId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "No status history found for patient: " + patientId
                ));
    }

    /**
     * Get status transition summary statistics
     * 
     * <p>Returns aggregated data on status transitions across all patients.
     * Useful for dashboard analytics and identifying common transition patterns.</p>
     * 
     * @return List of transition summaries with counts
     */
    @Transactional(readOnly = true)
    public List<PatientStatusHistoryRepository.StatusTransitionSummary> getStatusTransitionSummary() {
        log.info("Fetching status transition summary");
        
        List<PatientStatusHistoryRepository.StatusTransitionSummary> summary = 
            statusHistoryRepository.getStatusTransitionSummary();
        
        log.info("Found {} transition types", summary.size());
        return summary;
    }

    /**
     * Find all patients currently in a specific status
     * 
     * @param status The status to filter by
     * @return List of status history records (most recent per patient)
     */
    @Transactional(readOnly = true)
    public List<PatientStatusHistoryEntity> findPatientsInStatus(PatientStatus status) {
        log.info("Finding patients in status: {}", status);
        
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        
        return statusHistoryRepository.findByNewStatusOrderByChangedAtDesc(status);
    }

    /**
     * Find patients stuck in a status for more than specified days
     * 
     * <p>Identifies potential bottlenecks in patient flow. For example,
     * patients in SCREENING for more than 14 days might need attention.</p>
     * 
     * @param status The status to check
     * @param days Number of days threshold
     * @return List of patient IDs that have been in status longer than threshold
     */
    @Transactional(readOnly = true)
    public List<Long> findPatientsStuckInStatus(PatientStatus status, int days) {
        log.info("Finding patients stuck in {} for more than {} days", status, days);
        
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (days < 0) {
            throw new IllegalArgumentException("Days must be positive");
        }
        
        List<Long> patientIds = statusHistoryRepository.findPatientsInStatusLongerThan(status, days);
        
        log.info("Found {} patients stuck in {} for more than {} days", 
            patientIds.size(), status, days);
        
        return patientIds;
    }

    /**
     * Count total status changes for a patient
     * 
     * @param patientId Patient database ID
     * @return Number of status changes
     */
    @Transactional(readOnly = true)
    public long countStatusChanges(Long patientId) {
        log.debug("Counting status changes for patient: {}", patientId);
        
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        
        return statusHistoryRepository.countByPatientId(patientId);
    }

    /**
     * Get status changes within a date range
     * 
     * <p>Useful for audit reports and compliance reviews.</p>
     * 
     * @param startDate Start of date range (inclusive)
     * @param endDate End of date range (inclusive)
     * @return List of status changes in the date range
     */
    @Transactional(readOnly = true)
    public List<PatientStatusHistoryEntity> getStatusChangesByDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        log.info("Fetching status changes between {} and {}", startDate, endDate);
        
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start and end dates are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        List<PatientStatusHistoryEntity> changes = 
            statusHistoryRepository.findByChangedAtBetween(startDate, endDate);
        
        log.info("Found {} status changes in date range", changes.size());
        return changes;
    }

    /**
     * Get status changes by a specific user
     * 
     * <p>Useful for user activity audits and identifying who made changes.</p>
     * 
     * @param changedBy User identifier (email or username)
     * @return List of status changes by this user
     */
    @Transactional(readOnly = true)
    public List<PatientStatusHistoryEntity> getStatusChangesByUser(String changedBy) {
        log.info("Fetching status changes by user: {}", changedBy);
        
        if (changedBy == null || changedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("changedBy is required");
        }
        
        return statusHistoryRepository.findByChangedByOrderByChangedAtDesc(changedBy);
    }

    /**
     * Get average days between status changes for a patient
     * 
     * <p>Helps identify fast or slow patient progression through the lifecycle.</p>
     * 
     * @param patientId Patient database ID
     * @return Average days between changes, or null if insufficient data
     */
    @Transactional(readOnly = true)
    public Double getAverageDaysBetweenChanges(Long patientId) {
        log.debug("Calculating average days between changes for patient: {}", patientId);
        
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        
        return statusHistoryRepository.getAverageDaysBetweenChanges(patientId);
    }

    // ==================== Utility Methods ====================

    /**
     * Check if patient exists
     * 
     * @param patientId Patient database ID
     * @return true if patient exists
     */
    @Transactional(readOnly = true)
    public boolean patientExists(Long patientId) {
        if (patientId == null) {
            return false;
        }
        return patientRepository.existsById(patientId);
    }

    /**
     * Get patient entity (for internal use)
     * 
     * @param patientId Patient database ID
     * @return Patient entity
     * @throws IllegalArgumentException if patient not found
     */
    @Transactional(readOnly = true)
    public PatientEntity getPatientEntity(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
    }
    
    /**
     * Get valid status transitions from a given status
     * Returns list of statuses that can be transitioned to
     * 
     * Used by UI to populate valid status options
     * 
     * @param currentStatus Current patient status
     * @return List of valid target statuses
     */
    public List<PatientStatus> getValidTransitions(PatientStatus currentStatus) {
        if (currentStatus == null) {
            return List.of(); // No current status = no transitions
        }
        
        // Terminal statuses cannot transition anywhere
        if (currentStatus.isTerminal()) {
            return List.of();
        }
        
        // Can always transition to WITHDRAWN from non-terminal status
        List<PatientStatus> transitions = new java.util.ArrayList<>();
        transitions.add(PatientStatus.WITHDRAWN);
        
        // Add status-specific valid transitions
        switch (currentStatus) {
            case REGISTERED:
                transitions.add(PatientStatus.SCREENING);
                break;
            case SCREENING:
                transitions.add(PatientStatus.ENROLLED);
                break;
            case ENROLLED:
                transitions.add(PatientStatus.ACTIVE);
                break;
            case ACTIVE:
                transitions.add(PatientStatus.COMPLETED);
                break;
            default:
                // WITHDRAWN and COMPLETED already handled by isTerminal() check
                break;
        }
        
        return transitions;
    }
}
