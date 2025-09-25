package com.clinprecision.datacaptureservice.controller;

import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildRequest;
import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildResult;
import com.clinprecision.datacaptureservice.dto.database.DatabaseValidationResult;
import com.clinprecision.datacaptureservice.service.database.StudyDatabaseBuildService;
import com.clinprecision.datacaptureservice.service.database.DatabaseValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;



/**
 * Study Database Build Controller
 * 
 * REST API endpoints for study database build operations including:
 * - Database build initiation
 * - Build status monitoring
 * - Database validation
 * - Build history and metrics
 * 
 * Implements Phase 1.1 of EDC implementation:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 */
@RestController
@RequestMapping("/api/v1/datacapture/database")
@RequiredArgsConstructor
@Slf4j
@Validated
public class StudyDatabaseBuildController {
    
    private final StudyDatabaseBuildService databaseBuildService;
    private final DatabaseValidationService databaseValidationService;
    
    /**
     * Initiate database build for a study
     * 
     * @param request Database build request with study configuration
     * @return DatabaseBuildResult with build status and details
     */
    @PostMapping("/build")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<DatabaseBuildResult> buildStudyDatabase(@Valid @RequestBody DatabaseBuildRequest request) {
        log.info("Received database build request for study: {}", request.getStudyId());
        
        try {
            DatabaseBuildResult result = databaseBuildService.buildStudyDatabase(request);
            
            if ("COMPLETED".equals(result.getBuildStatus())) {
                return ResponseEntity.ok(result);
            } else if ("FAILED".equals(result.getBuildStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            } else {
                return ResponseEntity.accepted().body(result);
            }
            
        } catch (Exception e) {
            log.error("Database build failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            
            DatabaseBuildResult errorResult = DatabaseBuildResult.builder()
                    .studyId(request.getStudyId())
                    .buildStatus("FAILED")
                    .message("Database build failed: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }
    
    /**
     * Validate database setup for a study
     * 
     * @param studyId The study ID to validate
     * @return DatabaseValidationResult with validation status and details
     */
    @GetMapping("/validate/{studyId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<DatabaseValidationResult> validateStudyDatabase(@PathVariable Long studyId) {
        log.info("Received database validation request for study: {}", studyId);
        
        try {
            DatabaseValidationResult result = databaseValidationService.validateStudyDatabase(studyId);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Database validation failed for study {}: {}", studyId, e.getMessage(), e);
            
            DatabaseValidationResult errorResult = DatabaseValidationResult.builder()
                    .studyId(studyId)
                    .isValid(false)
                    .overallAssessment("Validation failed: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult);
        }
    }
    
    /**
     * Get database build status
     * 
     * @param buildRequestId The build request ID
     * @return DatabaseBuildResult with current status
     */
    @GetMapping("/build/status/{buildRequestId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<DatabaseBuildResult> getBuildStatus(@PathVariable String buildRequestId) {
        log.info("Received build status request for: {}", buildRequestId);
        
        // Implementation would retrieve build status from repository
        // This is a placeholder for the complete implementation
        
        return ResponseEntity.ok(DatabaseBuildResult.builder()
                .buildRequestId(buildRequestId)
                .buildStatus("IN_PROGRESS")
                .message("Build status retrieved successfully")
                .build());
    }
    
    /**
     * Get database build history for a study
     * 
     * @param studyId The study ID
     * @return List of database build results
     */
    @GetMapping("/build/history/{studyId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<?> getBuildHistory(@PathVariable Long studyId) {
        log.info("Received build history request for study: {}", studyId);
        
        // Implementation would retrieve build history from repository
        // This is a placeholder for the complete implementation
        
        return ResponseEntity.ok("Build history for study " + studyId);
    }
    
    /**
     * Cancel an ongoing database build
     * 
     * @param buildRequestId The build request ID to cancel
     * @return Cancellation result
     */
    @PostMapping("/build/cancel/{buildRequestId}")
    @PreAuthorize("hasRole('STUDY_MANAGER') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<DatabaseBuildResult> cancelBuild(@PathVariable String buildRequestId) {
        log.info("Received build cancellation request for: {}", buildRequestId);
        
        // Implementation would cancel the ongoing build
        // This is a placeholder for the complete implementation
        
        return ResponseEntity.ok(DatabaseBuildResult.builder()
                .buildRequestId(buildRequestId)
                .buildStatus("CANCELLED")
                .message("Build cancelled successfully")
                .build());
    }
    
    /**
     * Get database build metrics and statistics
     * 
     * @return Build metrics and performance statistics
     */
    @GetMapping("/build/metrics")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('DATA_MANAGER')")
    public ResponseEntity<?> getBuildMetrics() {
        log.info("Received build metrics request");
        
        // Implementation would retrieve build metrics and statistics
        // This is a placeholder for the complete implementation
        
        return ResponseEntity.ok("Database build metrics");
    }
}