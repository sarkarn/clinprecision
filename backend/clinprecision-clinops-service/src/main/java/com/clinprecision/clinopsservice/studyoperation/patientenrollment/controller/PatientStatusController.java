package com.clinprecision.clinopsservice.patientenrollment.controller;

import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.patientenrollment.dto.ChangePatientStatusRequest;
import com.clinprecision.clinopsservice.patientenrollment.dto.PatientStatusHistoryResponse;
import com.clinprecision.clinopsservice.patientenrollment.dto.PatientStatusSummaryResponse;
import com.clinprecision.clinopsservice.patientenrollment.dto.StatusTransitionSummaryResponse;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatusHistoryEntity;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientStatusHistoryRepository;
import com.clinprecision.clinopsservice.patientenrollment.service.PatientStatusService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API Controller for Patient Status Management
 * 
 * Provides endpoints for:
 * - Changing patient status (write operations)
 * - Querying status history (read operations)
 * - Status analytics and reporting
 * 
 * Follows established ClinPrecision patterns:
 * - Uses Long IDs in external API endpoints
 * - Returns standardized DTO responses
 * - Implements comprehensive error handling
 * - Provides detailed logging
 * 
 * Base Path: /api/v1/patients
 * 
 * Architecture:
 * <pre>
 * Controller → Service → CommandGateway → Aggregate → Event → Projector → Repository
 *           ↘ Service → Repository (for queries)
 * </pre>
 * 
 * @see PatientStatusService
 * @see PatientStatusHistoryEntity
 */
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientStatusController {

    private final PatientStatusService patientStatusService;
    private final PatientRepository patientRepository;
    private final PatientStatusHistoryRepository patientStatusHistoryRepository;

    /**
     * Change patient status
     * 
     * POST /api/v1/patients/{patientId}/status
     * 
     * Request Body:
     * <pre>
     * {
     *   "newStatus": "SCREENING",
     *   "reason": "Screening visit scheduled for Oct 15",
     *   "changedBy": "coordinator@example.com",
     *   "notes": "Patient confirmed availability",
     *   "enrollmentId": 123 (optional)
     * }
     * </pre>
     * 
     * Response: PatientStatusHistoryResponse (201 CREATED)
     * 
     * Validation:
     * - Patient must exist
     * - Status transition must be valid
     * - Reason and changedBy are required
     * - Cannot change terminal status
     * 
     * @param patientId Database ID of the patient
     * @param request Status change details
     * @return Created status history record
     */
    @PostMapping("/{patientId}/status")
    public ResponseEntity<PatientStatusHistoryResponse> changePatientStatus(
            @PathVariable Long patientId,
            @Valid @RequestBody ChangePatientStatusRequest request) {
        
        log.info("API Request: Change patient {} status to {} (reason: {})", 
                 patientId, request.getNewStatus(), request.getReason());
        
        try {
            // Parse and validate status
            PatientStatus newStatus = PatientStatus.valueOf(request.getNewStatus().toUpperCase());
            
            // Call service layer with or without enrollment ID
            PatientStatusHistoryEntity history;
            if (request.getEnrollmentId() != null) {
                history = patientStatusService.changePatientStatus(
                    patientId,
                    request.getEnrollmentId(),
                    newStatus,
                    request.getReason(),
                    request.getChangedBy(),
                    request.getNotes()
                );
            } else {
                history = patientStatusService.changePatientStatus(
                    patientId,
                    newStatus,
                    request.getReason(),
                    request.getChangedBy(),
                    request.getNotes()
                );
            }
            
            // Convert to response DTO
            PatientStatusHistoryResponse response = mapToHistoryResponse(history, true);
            
            log.info("API Response: Patient {} status changed to {} (history ID: {})", 
                     patientId, newStatus, history.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status change request for patient {}: {}", patientId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error changing patient {} status: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to change patient status: " + e.getMessage(), e);
        }
    }

    /**
     * Get complete status history for a patient
     * 
     * GET /api/v1/patients/{patientId}/status/history
     * 
     * Returns: List of status changes ordered chronologically (newest first)
     * 
     * @param patientId Database ID of the patient
     * @return List of status history records
     */
    @GetMapping("/{patientId}/status/history")
    public ResponseEntity<List<PatientStatusHistoryResponse>> getPatientStatusHistory(
            @PathVariable Long patientId) {
        
        log.info("API Request: Get status history for patient {}", patientId);
        
        try {
            List<PatientStatusHistoryEntity> history = 
                patientStatusService.getPatientStatusHistory(patientId);
            
            // Convert to response DTOs, mark first as current
            List<PatientStatusHistoryResponse> responses = history.stream()
                .map(h -> mapToHistoryResponse(h, history.indexOf(h) == 0))
                .collect(Collectors.toList());
            
            log.info("API Response: Found {} status changes for patient {}", 
                     responses.size(), patientId);
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error retrieving status history for patient {}: {}", 
                     patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve status history", e);
        }
    }

    /**
     * Get current patient status
     * 
     * GET /api/v1/patients/{patientId}/status/current
     * 
     * Returns: Most recent status change with full context
     * 
     * @param patientId Database ID of the patient
     * @return Current status details
     */
    @GetMapping("/{patientId}/status/current")
    public ResponseEntity<PatientStatusHistoryResponse> getCurrentPatientStatus(
            @PathVariable Long patientId) {
        
        log.info("API Request: Get current status for patient {}", patientId);
        
        try {
            PatientStatusHistoryEntity current = 
                patientStatusService.getCurrentPatientStatus(patientId);
            
            if (current == null) {
                log.warn("No status history found for patient {}", patientId);
                return ResponseEntity.notFound().build();
            }
            
            PatientStatusHistoryResponse response = mapToHistoryResponse(current, true);
            
            log.info("API Response: Patient {} current status is {}", 
                     patientId, response.getNewStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving current status for patient {}: {}", 
                     patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve current status", e);
        }
    }

    /**
     * Get comprehensive status summary for a patient
     * 
     * GET /api/v1/patients/{patientId}/status/summary
     * 
     * Returns: Current status + complete history + analytics
     * 
     * @param patientId Database ID of the patient
     * @return Complete status summary
     */
    @GetMapping("/{patientId}/status/summary")
    public ResponseEntity<PatientStatusSummaryResponse> getPatientStatusSummary(
            @PathVariable Long patientId) {
        
        log.info("API Request: Get status summary for patient {}", patientId);
        
        try {
            // Get current status
            PatientStatusHistoryEntity current = 
                patientStatusService.getCurrentPatientStatus(patientId);
            
            if (current == null) {
                log.warn("No status history found for patient {}", patientId);
                return ResponseEntity.notFound().build();
            }
            
            // Get complete history
            List<PatientStatusHistoryEntity> history = 
                patientStatusService.getPatientStatusHistory(patientId);
            
            // Get patient entity
            PatientEntity patient = current.getPatient();
            
            // Calculate days in current status
            long daysInCurrentStatus = ChronoUnit.DAYS.between(
                current.getChangedAt(), 
                LocalDateTime.now()
            );
            
            // Get average days between changes
            Double avgDays = patientStatusService.getAverageDaysBetweenChanges(patientId);
            
            // Build summary response
            PatientStatusSummaryResponse summary = PatientStatusSummaryResponse.builder()
                .patientId(patientId)
                .patientName(patient.getFullName())
                .patientNumber(patient.getPatientNumber())
                .currentStatus(current.getNewStatus().name())
                .currentStatusSince(current.getChangedAt())
                .daysInCurrentStatus(daysInCurrentStatus)
                .totalStatusChanges((long) history.size())
                .terminalStatus(current.getNewStatus().isTerminal())
                .averageDaysBetweenChanges(avgDays)
                .lastChangeReason(current.getReason())
                .lastChangedBy(current.getChangedBy())
                .statusHistory(history.stream()
                    .map(h -> mapToHistoryResponse(h, h.equals(current)))
                    .collect(Collectors.toList()))
                .build();
            
            log.info("API Response: Patient {} summary - status: {}, {} changes, {} days in current status", 
                     patientId, summary.getCurrentStatus(), summary.getTotalStatusChanges(), 
                     daysInCurrentStatus);
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            log.error("Error retrieving status summary for patient {}: {}", 
                     patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve status summary", e);
        }
    }

    /**
     * Get status transition summary (analytics)
     * 
     * GET /api/v1/patients/status/transitions/summary
     * 
     * Returns: Aggregated statistics on status transitions across all patients
     * 
     * Used for:
     * - Dashboards
     * - Conversion rate analysis
     * - Bottleneck identification
     * 
     * @return List of transition summaries
     */
    @GetMapping("/status/transitions/summary")
    public ResponseEntity<List<StatusTransitionSummaryResponse>> getStatusTransitionSummary() {
        
        log.info("API Request: Get status transition summary");
        
        try {
            List<PatientStatusHistoryRepository.StatusTransitionSummary> summaries = 
                patientStatusService.getStatusTransitionSummary();
            
            // Convert to response DTOs
            List<StatusTransitionSummaryResponse> responses = summaries.stream()
                .map(s -> StatusTransitionSummaryResponse.builder()
                    .previousStatus(s.getPreviousStatus() != null ? s.getPreviousStatus().name() : null)
                    .newStatus(s.getNewStatus().name())
                    .transitionCount(s.getTransitionCount())
                    .uniquePatientCount(s.getTransitionCount()) // Use transition count as proxy
                    .transitionLabel(String.format("%s → %s", 
                        s.getPreviousStatus() != null ? s.getPreviousStatus().name() : "INITIAL",
                        s.getNewStatus().name()))
                    .build())
                .collect(Collectors.toList());
            
            log.info("API Response: Found {} distinct status transitions", responses.size());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error retrieving status transition summary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve transition summary", e);
        }
    }

    /**
     * Find patients currently in a specific status
     * 
     * GET /api/v1/patients/status/{status}/patients
     * 
     * Example: GET /api/v1/patients/status/SCREENING/patients
     * 
     * @param status Status to filter by (REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN)
     * @return List of patients in the specified status
     */
    @GetMapping("/status/{status}/patients")
    public ResponseEntity<List<PatientStatusHistoryResponse>> findPatientsInStatus(
            @PathVariable String status) {
        
        log.info("API Request: Find patients in status {}", status);
        
        try {
            PatientStatus patientStatus = PatientStatus.valueOf(status.toUpperCase());
            
            List<PatientStatusHistoryEntity> patients = 
                patientStatusService.findPatientsInStatus(patientStatus);
            
            // Convert to response DTOs
            List<PatientStatusHistoryResponse> responses = patients.stream()
                .map(p -> mapToHistoryResponse(p, true))
                .collect(Collectors.toList());
            
            log.info("API Response: Found {} patients in status {}", responses.size(), status);
            
            return ResponseEntity.ok(responses);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value: {}", status);
            throw new IllegalArgumentException("Invalid status: " + status + 
                ". Must be one of: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN");
        } catch (Exception e) {
            log.error("Error finding patients in status {}: {}", status, e.getMessage(), e);
            throw new RuntimeException("Failed to find patients in status", e);
        }
    }

    /**
     * Find patients stuck in a status (bottleneck detection)
     * 
     * GET /api/v1/patients/status/{status}/stuck?days={days}
     * 
     * Example: GET /api/v1/patients/status/SCREENING/stuck?days=14
     * 
     * Returns: List of patient IDs who have been in the specified status 
     *          longer than the threshold
     * 
     * Used for:
     * - Quality assurance (identify delays)
     * - Resource allocation (patients needing attention)
     * - Compliance monitoring (regulatory timelines)
     * 
     * @param status Status to check
     * @param days Threshold in days
     * @return List of stuck patient IDs
     */
    @GetMapping("/status/{status}/stuck")
    public ResponseEntity<List<Long>> findPatientsStuckInStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "14") int days) {
        
        log.info("API Request: Find patients stuck in status {} for more than {} days", 
                 status, days);
        
        try {
            PatientStatus patientStatus = PatientStatus.valueOf(status.toUpperCase());
            
            List<Long> stuckPatientIds = 
                patientStatusService.findPatientsStuckInStatus(patientStatus, days);
            
            log.info("API Response: Found {} patients stuck in status {} for more than {} days", 
                     stuckPatientIds.size(), status, days);
            
            return ResponseEntity.ok(stuckPatientIds);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value: {}", status);
            throw new IllegalArgumentException("Invalid status: " + status);
        } catch (Exception e) {
            log.error("Error finding stuck patients in status {}: {}", 
                     status, e.getMessage(), e);
            throw new RuntimeException("Failed to find stuck patients", e);
        }
    }

    /**
     * Get status changes by date range
     * 
     * GET /api/v1/patients/status/changes?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
     * 
     * Used for:
     * - Compliance reports
     * - Quarterly/annual audits
     * - Activity tracking
     * 
     * @param startDate Start of date range (ISO format)
     * @param endDate End of date range (ISO format)
     * @return List of status changes in date range
     */
    @GetMapping("/status/changes")
    public ResponseEntity<List<PatientStatusHistoryResponse>> getStatusChangesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("API Request: Get status changes between {} and {}", startDate, endDate);
        
        try {
            List<PatientStatusHistoryEntity> changes = 
                patientStatusService.getStatusChangesByDateRange(startDate, endDate);
            
            // Convert to response DTOs
            List<PatientStatusHistoryResponse> responses = changes.stream()
                .map(c -> mapToHistoryResponse(c, false))
                .collect(Collectors.toList());
            
            log.info("API Response: Found {} status changes between {} and {}", 
                     responses.size(), startDate, endDate);
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error retrieving status changes by date range: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve status changes", e);
        }
    }

    /**
     * Get status changes by user (audit trail)
     * 
     * GET /api/v1/patients/status/changes/by-user?user=coordinator@example.com
     * 
     * Used for:
     * - User activity reports
     * - Training assessment
     * - Compliance audits
     * 
     * @param user User identifier (email or user ID)
     * @return List of status changes made by the user
     */
    @GetMapping("/status/changes/by-user")
    public ResponseEntity<List<PatientStatusHistoryResponse>> getStatusChangesByUser(
            @RequestParam String user) {
        
        log.info("API Request: Get status changes by user {}", user);
        
        try {
            List<PatientStatusHistoryEntity> changes = 
                patientStatusService.getStatusChangesByUser(user);
            
            // Convert to response DTOs
            List<PatientStatusHistoryResponse> responses = changes.stream()
                .map(c -> mapToHistoryResponse(c, false))
                .collect(Collectors.toList());
            
            log.info("API Response: Found {} status changes by user {}", 
                     responses.size(), user);
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("Error retrieving status changes by user {}: {}", 
                     user, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve status changes", e);
        }
    }

    /**
     * Get patient status change count
     * 
     * GET /api/v1/patients/{patientId}/status/count
     * 
     * Returns: Total number of status changes for a patient
     * 
     * @param patientId Database ID of the patient
     * @return Status change count
     */
    @GetMapping("/{patientId}/status/count")
    public ResponseEntity<Long> getPatientStatusChangeCount(@PathVariable Long patientId) {
        
        log.info("API Request: Get status change count for patient {}", patientId);
        
        try {
            long count = patientStatusService.countStatusChanges(patientId);
            
            log.info("API Response: Patient {} has {} status changes", patientId, count);
            
            return ResponseEntity.ok(count);
            
        } catch (Exception e) {
            log.error("Error counting status changes for patient {}: {}", 
                     patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to count status changes", e);
        }
    }

    /**
     * Get available status transitions for a patient
     * 
     * GET /api/v1/patients/{patientId}/status/valid-transitions
     * 
     * Returns: List of statuses the patient can transition to from current status
     * 
     * Used for:
     * - UI form validation
     * - Dropdown population
     * - Business rule display
     * 
     * @param patientId Database ID of the patient
     * @return List of valid target statuses
     */
    @GetMapping("/{patientId}/status/valid-transitions")
    public ResponseEntity<List<String>> getValidStatusTransitions(@PathVariable Long patientId) {
        
        log.info("API Request: Get valid status transitions for patient {}", patientId);
        
        try {
            // Try to get current status from status history
            PatientStatus currentStatus;
            
            try {
                PatientStatusHistoryEntity current = 
                    patientStatusService.getCurrentPatientStatus(patientId);
                currentStatus = current.getNewStatus();
            } catch (IllegalArgumentException e) {
                // No status history - fallback to patient table status
                log.info("No status history found for patient {}, using patient table status", patientId);
                
                PatientEntity patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
                
                currentStatus = patient.getStatus();
                log.info("Patient {} current status from patient table: {}", patientId, currentStatus);
            }
            
            // Get valid transitions from service
            List<PatientStatus> validTransitions = 
                patientStatusService.getValidTransitions(currentStatus);
            
            // Convert to strings
            List<String> transitions = validTransitions.stream()
                .map(PatientStatus::name)
                .collect(Collectors.toList());
            
            log.info("API Response: Patient {} can transition from {} to: {}", 
                     patientId, currentStatus, transitions);
            
            return ResponseEntity.ok(transitions);
            
        } catch (Exception e) {
            log.error("Error retrieving valid transitions for patient {}: {}", 
                     patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve valid transitions", e);
        }
    }

    /**
     * Health check endpoint
     * 
     * GET /api/v1/patients/status/health
     * 
     * @return Service status
     */
    @GetMapping("/status/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Patient Status Service is healthy");
    }

    // ==================== Helper Methods ====================

    /**
     * Map PatientStatusHistoryEntity to PatientStatusHistoryResponse DTO
     * 
     * @param entity Status history entity
     * @param isCurrent Whether this is the patient's current status
     * @return Response DTO
     */
    private PatientStatusHistoryResponse mapToHistoryResponse(
            PatientStatusHistoryEntity entity, 
            boolean isCurrent) {
        
        PatientEntity patient = entity.getPatient();
        PatientEnrollmentEntity enrollment = entity.getEnrollment();
        
        return PatientStatusHistoryResponse.builder()
            .id(entity.getId())
            .patientId(entity.getPatientId())
            .patientName(patient != null ? patient.getFullName() : null)
            .patientNumber(patient != null ? patient.getPatientNumber() : null)
            .enrollmentId(entity.getEnrollmentId())
            .studyId(enrollment != null ? enrollment.getStudyId() : null)
            .studyName(enrollment != null ? "Study " + enrollment.getStudyId() : null) // StudyName not in entity
            .previousStatus(entity.getPreviousStatus() != null ? 
                entity.getPreviousStatus().name() : null)
            .newStatus(entity.getNewStatus().name())
            .reason(entity.getReason())
            .changedBy(entity.getChangedBy())
            .changedAt(entity.getChangedAt())
            .notes(entity.getNotes())
            .eventId(entity.getEventId())
            .daysSincePreviousChange(null) // Requires previous change entity, calculate in service if needed
            .statusChangeDescription(entity.getStatusChangeDescription())
            .terminalStatus(entity.getNewStatus().isTerminal())
            .currentStatus(isCurrent)
            .build();
    }
}
