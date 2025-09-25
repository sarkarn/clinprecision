package com.clinprecision.datacaptureservice.controller;

import com.clinprecision.datacaptureservice.dto.workflow.StudyActivationWorkflowRequest;
import com.clinprecision.datacaptureservice.dto.workflow.StudyActivationWorkflowResult;
import com.clinprecision.datacaptureservice.service.workflow.StudyActivationWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Phase 1.1 Study Activation Workflow Controller
 * 
 * REST API endpoints for Phase 1.1 study activation workflow:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 * 
 * This controller orchestrates the complete study activation process
 * as defined in the Clinical Data Capture implementation plan.
 */
@RestController
@RequestMapping("/api/v1/datacapture/workflow/phase1")
@RequiredArgsConstructor
@Slf4j
@Validated
public class StudyActivationWorkflowController {
    
    private final StudyActivationWorkflowService workflowService;
    
    /**
     * Execute Phase 1.1 Study Activation Workflow
     * 
     * Orchestrates the complete workflow:
     * 1. Database Configuration based on study design
     * 2. User Access Setup and role provisioning
     * 3. Site Customization and Training
     * 4. Site Activation
     * 
     * @param request Phase 1.1 workflow execution request
     * @return Phase1WorkflowResult with execution status
     */
    @PostMapping("/execute")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StudyActivationWorkflowResult> executePhase1Workflow(@Valid @RequestBody StudyActivationWorkflowRequest request) {
        log.info("Received Phase 1.1 workflow execution request for study: {}", request.getStudyId());
        
        try {
            StudyActivationWorkflowResult result = workflowService.executePhase1Workflow(request);
            
            if ("COMPLETED".equals(result.getWorkflowStatus())) {
                return ResponseEntity.ok(result);
            } else if ("FAILED".equals(result.getWorkflowStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            } else {
                return ResponseEntity.accepted().body(result);
            }
            
        } catch (Exception e) {
            log.error("Phase 1.1 workflow execution failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            
            StudyActivationWorkflowResult errorResult = StudyActivationWorkflowResult.builder()
                    .studyId(request.getStudyId())
                    .workflowStatus("FAILED")
                    .message("Workflow execution failed: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }
    
    /**
     * Get Phase 1.1 workflow status
     * 
     * @param studyId Study identifier
     * @return Current workflow status and progress
     */
    @GetMapping("/status/{studyId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<StudyActivationWorkflowResult> getWorkflowStatus(@PathVariable Long studyId) {
        log.info("Received workflow status request for study: {}", studyId);
        
        try {
            StudyActivationWorkflowResult result = workflowService.getWorkflowStatus(studyId);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Failed to get workflow status for study {}: {}", studyId, e.getMessage(), e);
            
            StudyActivationWorkflowResult errorResult = StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus("UNKNOWN")
                    .message("Failed to retrieve workflow status: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }
    
    /**
     * Cancel Phase 1.1 workflow execution
     * 
     * @param studyId Study identifier
     * @return Cancellation result with rollback status
     */
    @PostMapping("/cancel/{studyId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<StudyActivationWorkflowResult> cancelWorkflow(@PathVariable Long studyId) {
        log.info("Received workflow cancellation request for study: {}", studyId);
        
        try {
            StudyActivationWorkflowResult result = workflowService.cancelWorkflow(studyId);
            
            if ("CANCELLED".equals(result.getWorkflowStatus())) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to cancel workflow for study {}: {}", studyId, e.getMessage(), e);
            
            StudyActivationWorkflowResult errorResult = StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus("CANCEL_FAILED")
                    .message("Workflow cancellation failed: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }
    
    /**
     * Get workflow execution metrics and statistics
     * 
     * @return Workflow performance metrics
     */
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<Object> getWorkflowMetrics() {
        log.info("Received workflow metrics request");
        
        try {
            // Implementation would retrieve workflow metrics and statistics
            // This is a placeholder for the complete implementation
            
            return ResponseEntity.ok("Phase 1.1 workflow metrics");
            
        } catch (Exception e) {
            log.error("Failed to get workflow metrics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve workflow metrics");
        }
    }
    
    /**
     * Health check endpoint for Phase 1.1 workflow service
     * 
     * @return Service health status
     */
    @GetMapping("/health")
    public ResponseEntity<Object> healthCheck() {
        log.debug("Phase 1.1 workflow health check requested");
        
        try {
            // Basic health check - could be enhanced with dependency checks
            return ResponseEntity.ok(java.util.Map.of(
                "status", "UP",
                "service", "Phase 1.1 Study Activation Workflow",
                "timestamp", java.time.LocalDateTime.now(),
                "version", "1.0.0"
            ));
            
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                java.util.Map.of(
                    "status", "DOWN",
                    "error", e.getMessage(),
                    "timestamp", java.time.LocalDateTime.now()
                )
            );
        }
    }
}