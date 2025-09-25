package com.clinprecision.studydesignservice.controller;


import com.clinprecision.common.dto.studydesign.StudyResponseDto;
import com.clinprecision.studydesignservice.service.StudyService;
import com.clinprecision.studydesignservice.service.StudyStatusComputationService;
import com.clinprecision.studydesignservice.service.CrossEntityStatusValidationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Study Status Management
 * Provides endpoints for status transitions and status computation
 */
@RestController
@RequestMapping("/api/v1/studies/{studyId}/status")
public class StudyStatusController {

    private static final Logger logger = LoggerFactory.getLogger(StudyStatusController.class);

    private final StudyService studyService;

    public StudyStatusController(StudyService studyService) {
        this.studyService = studyService;
    }

    /**
     * Change study status
     */
    @PutMapping
    public ResponseEntity<StudyResponseDto> changeStudyStatus(
            @PathVariable Long studyId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Received request to change status for study {} to {}", studyId, request.get("status"));
        
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        StudyResponseDto response = studyService.changeStudyStatus(studyId, newStatus);
        return ResponseEntity.ok(response);
    }

    /**
     * Get valid next statuses for a study
     */
    @GetMapping("/transitions")
    public ResponseEntity<List<StudyStatusComputationService.StatusTransitionRecommendation>> getValidNextStatuses(
            @PathVariable Long studyId) {
        
        logger.info("Fetching valid status transitions for study {}", studyId);
        
        List<StudyStatusComputationService.StatusTransitionRecommendation> recommendations = 
            studyService.getValidNextStatuses(studyId);
        
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Check if study allows modifications
     */
    @GetMapping("/modification-allowed")
    public ResponseEntity<Map<String, Boolean>> checkModificationAllowed(
            @PathVariable Long studyId) {
        
        logger.info("Checking modification permission for study {}", studyId);
        
        boolean allowed = studyService.allowsModification(studyId);
        return ResponseEntity.ok(Map.of("allowsModification", allowed));
    }

    /**
     * Compute and update study status based on protocol versions
     */
    @PostMapping("/compute")
    public ResponseEntity<StudyResponseDto> computeAndUpdateStudyStatus(
            @PathVariable Long studyId) {
        
        logger.info("Computing and updating status for study {}", studyId);
        
        StudyResponseDto response = studyService.computeAndUpdateStudyStatus(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * Publish study (shortcut for changing status to ACTIVE)
     */
    @PostMapping("/publish")
    public ResponseEntity<StudyResponseDto> publishStudy(
            @PathVariable Long studyId) {
        
        logger.info("Publishing study {}", studyId);
        
        StudyResponseDto response = studyService.publishStudy(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * Suspend study
     */
    @PostMapping("/suspend")
    public ResponseEntity<StudyResponseDto> suspendStudy(
            @PathVariable Long studyId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Suspending study {}", studyId);
        
        String reason = request.get("reason");
        StudyResponseDto response = studyService.suspendStudy(studyId, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Resume study
     */
    @PostMapping("/resume")
    public ResponseEntity<StudyResponseDto> resumeStudy(
            @PathVariable Long studyId) {
        
        logger.info("Resuming study {}", studyId);
        
        StudyResponseDto response = studyService.resumeStudy(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete study
     */
    @PostMapping("/complete")
    public ResponseEntity<StudyResponseDto> completeStudy(
            @PathVariable Long studyId) {
        
        logger.info("Completing study {}", studyId);
        
        StudyResponseDto response = studyService.completeStudy(studyId);
        return ResponseEntity.ok(response);
    }

    /**
     * Terminate study
     */
    @PostMapping("/terminate")
    public ResponseEntity<StudyResponseDto> terminateStudy(
            @PathVariable Long studyId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Terminating study {}", studyId);
        
        String reason = request.get("reason");
        StudyResponseDto response = studyService.terminateStudy(studyId, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Withdraw study
     */
    @PostMapping("/withdraw")
    public ResponseEntity<StudyResponseDto> withdrawStudy(
            @PathVariable Long studyId,
            @RequestBody Map<String, String> request) {
        
        logger.info("Withdrawing study {}", studyId);
        
        String reason = request.get("reason");
        StudyResponseDto response = studyService.withdrawStudy(studyId, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate cross-entity dependencies for a study
     */
    @PostMapping("/validate-cross-entity")
    public ResponseEntity<Map<String, Object>> validateCrossEntity(
            @RequestParam Long studyId,
            @RequestParam(required = false) String targetStatus,
            @RequestParam(defaultValue = "validation") String operation) {
        
        logger.info("Cross-entity validation requested for study: {} - target status: {} - operation: {}", 
                   studyId, targetStatus, operation);
        
        try {
            CrossEntityStatusValidationService.CrossEntityValidationResult result = 
                studyService.validateStudyCrossEntity(studyId, targetStatus, operation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("studyId", studyId);
            response.put("targetStatus", targetStatus);
            response.put("operation", operation);
            response.put("valid", result.isValid());
            response.put("errors", result.getErrors());
            response.put("warnings", result.getWarnings());
            response.put("errorCount", result.getErrorCount());
            response.put("warningCount", result.getWarningCount());
            response.put("validationDetails", result.getValidationDetails());
            response.put("timestamp", LocalDateTime.now());
            
            if (result.isValid()) {
                logger.info("Cross-entity validation passed for study: {}", studyId);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Cross-entity validation failed for study: {} - errors: {}", studyId, result.getErrors());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error during cross-entity validation for study: {}", studyId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("studyId", studyId);
            errorResponse.put("error", "Validation error: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}