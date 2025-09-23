package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.service.AutomatedStatusComputationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Automated Study Status Computation Triggers
 * Provides endpoints for managing and monitoring automated status computation
 */
@RestController
@RequestMapping("/api/v1/studies/status/automated")
public class AutomatedStatusComputationController {

    private static final Logger logger = LoggerFactory.getLogger(AutomatedStatusComputationController.class);

    private final AutomatedStatusComputationService automatedStatusComputationService;

    public AutomatedStatusComputationController(AutomatedStatusComputationService automatedStatusComputationService) {
        this.automatedStatusComputationService = automatedStatusComputationService;
    }

    /**
     * Manually trigger status computation for a specific study
     */
    @PostMapping("/{studyId}/compute")
    public ResponseEntity<Map<String, Object>> manuallyComputeStatus(
            @PathVariable Long studyId,
            @RequestParam(defaultValue = "Manual trigger via API") String reason) {
        
        logger.info("Manual status computation requested for study: {} - reason: {}", studyId, reason);
        
        try {
            AutomatedStatusComputationService.StatusComputationResult result = 
                automatedStatusComputationService.manuallyComputeStudyStatus(studyId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("studyId", studyId);
            response.put("success", result.isSuccess());
            response.put("oldStatusCode", result.getOldStatusCode());
            response.put("newStatusCode", result.getNewStatusCode());
            response.put("statusChanged", result.isStatusChanged());
            response.put("computationResult", result.getComputationResult());
            response.put("computationTimeMs", result.getComputationTimeMs());
            response.put("errorMessage", result.getErrorMessage());
            response.put("timestamp", LocalDateTime.now());
            
            if (result.isSuccess()) {
                logger.info("Manual status computation completed for study: {} - status changed: {}", 
                           studyId, result.isStatusChanged());
                return ResponseEntity.ok(response);
            } else {
                logger.error("Manual status computation failed for study: {} - error: {}", 
                            studyId, result.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error during manual status computation for study: {}", studyId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("studyId", studyId);
            errorResponse.put("success", false);
            errorResponse.put("error", "Computation error: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Trigger batch computation for all studies
     */
    @PostMapping("/batch-compute")
    public ResponseEntity<Map<String, Object>> batchComputeAllStatuses() {
        logger.info("Batch status computation requested for all studies");
        
        try {
            AutomatedStatusComputationService.BatchComputationResult result = 
                automatedStatusComputationService.batchComputeAllStudyStatuses();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isSuccess());
            response.put("resultMessage", result.getResultMessage());
            response.put("totalTimeMs", result.getTotalTimeMs());
            response.put("errorMessage", result.getErrorMessage());
            response.put("timestamp", LocalDateTime.now());
            
            if (result.isSuccess()) {
                logger.info("Batch status computation completed: {}", result.getResultMessage());
                return ResponseEntity.ok(response);
            } else {
                logger.error("Batch status computation failed: {}", result.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error during batch status computation", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Batch computation error: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get status computation history for a specific study
     */
    @GetMapping("/{studyId}/history")
    public ResponseEntity<Map<String, Object>> getComputationHistory(
            @PathVariable Long studyId,
            @RequestParam(defaultValue = "20") Integer limit) {
        
        logger.debug("Status computation history requested for study: {} - limit: {}", studyId, limit);
        
        try {
            List<AutomatedStatusComputationService.StatusComputationLog> history = 
                automatedStatusComputationService.getStudyStatusComputationHistory(studyId, limit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("studyId", studyId);
            response.put("history", history);
            response.put("totalEntries", history.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving computation history for study: {}", studyId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("studyId", studyId);
            errorResponse.put("error", "Error retrieving history: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get recent status changes across all studies
     */
    @GetMapping("/recent-changes")
    public ResponseEntity<Map<String, Object>> getRecentStatusChanges(
            @RequestParam(defaultValue = "7") Integer days) {
        
        logger.debug("Recent status changes requested for last {} days", days);
        
        try {
            List<Map<String, Object>> recentChanges = 
                automatedStatusComputationService.getRecentStatusChanges(days);
            
            Map<String, Object> response = new HashMap<>();
            response.put("days", days);
            response.put("changes", recentChanges);
            response.put("totalChanges", recentChanges.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving recent status changes", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving recent changes: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get studies with frequent status changes
     */
    @GetMapping("/frequent-changes")
    public ResponseEntity<Map<String, Object>> getFrequentStatusChanges(
            @RequestParam(defaultValue = "30") Integer days,
            @RequestParam(defaultValue = "5") Integer minChanges) {
        
        logger.debug("Frequent status changes requested - days: {} - min changes: {}", days, minChanges);
        
        try {
            List<Map<String, Object>> frequentChanges = 
                automatedStatusComputationService.getStudiesWithFrequentStatusChanges(days, minChanges);
            
            Map<String, Object> response = new HashMap<>();
            response.put("days", days);
            response.put("minChanges", minChanges);
            response.put("studies", frequentChanges);
            response.put("totalStudies", frequentChanges.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving studies with frequent status changes", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving frequent changes: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get recent status computation errors
     */
    @GetMapping("/errors")
    public ResponseEntity<Map<String, Object>> getComputationErrors(
            @RequestParam(defaultValue = "7") Integer days) {
        
        logger.debug("Status computation errors requested for last {} days", days);
        
        try {
            List<Map<String, Object>> errors = 
                automatedStatusComputationService.getStatusComputationErrors(days);
            
            Map<String, Object> response = new HashMap<>();
            response.put("days", days);
            response.put("errors", errors);
            response.put("totalErrors", errors.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving status computation errors", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving computation errors: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Check the health of the trigger system
     */
    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> checkSystemHealth() {
        logger.debug("Trigger system health check requested");
        
        try {
            AutomatedStatusComputationService.TriggerSystemHealth health = 
                automatedStatusComputationService.checkTriggerSystemHealth();
            
            Map<String, Object> response = new HashMap<>();
            response.put("healthy", health.isHealthy());
            response.put("recentComputations", health.getRecentComputations());
            response.put("recentErrors", health.getRecentErrors());
            response.put("errorRate", health.getErrorRate());
            response.put("versionsTriggersExist", health.isVersionsTriggersExist());
            response.put("amendmentsTriggersExist", health.isAmendmentsTriggersExist());
            response.put("proceduresExist", health.isProceduresExist());
            response.put("timestamp", LocalDateTime.now());
            
            // Provide detailed status information
            Map<String, Object> details = new HashMap<>();
            details.put("triggerStatus", health.isVersionsTriggersExist() && health.isAmendmentsTriggersExist() ? "ACTIVE" : "MISSING");
            details.put("procedureStatus", health.isProceduresExist() ? "ACTIVE" : "MISSING");
            details.put("errorRateStatus", health.getErrorRate() < 10 ? "GOOD" : "HIGH");
            details.put("activityStatus", health.getRecentComputations() > 0 ? "ACTIVE" : "IDLE");
            response.put("details", details);
            
            if (health.isHealthy()) {
                logger.info("Trigger system health check: HEALTHY");
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Trigger system health check: UNHEALTHY - triggers exist: {} - procedures exist: {} - error rate: {}%", 
                           health.isVersionsTriggersExist() && health.isAmendmentsTriggersExist(),
                           health.isProceduresExist(), 
                           health.getErrorRate());
                return ResponseEntity.ok(response); // Still return 200 but with unhealthy status
            }
            
        } catch (Exception e) {
            logger.error("Error checking trigger system health", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("healthy", false);
            errorResponse.put("error", "Health check error: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Force refresh of study status (useful for fixing sync issues)
     */
    @PostMapping("/{studyId}/refresh")
    public ResponseEntity<Map<String, Object>> refreshStudyStatus(
            @PathVariable Long studyId) {
        
        logger.info("Status refresh requested for study: {}", studyId);
        
        try {
            AutomatedStatusComputationService.RefreshResult result = 
                automatedStatusComputationService.refreshStudyStatusSync(studyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("studyId", studyId);
            response.put("success", result.isSuccess());
            response.put("oldStatusCode", result.getOldStatusCode());
            response.put("newStatusCode", result.getNewStatusCode());
            response.put("statusChanged", result.isStatusChanged());
            response.put("computationTimeMs", result.getComputationTimeMs());
            response.put("errorMessage", result.getErrorMessage());
            response.put("timestamp", LocalDateTime.now());
            
            if (result.isSuccess()) {
                logger.info("Status refresh completed for study: {} - status changed: {}", 
                           studyId, result.isStatusChanged());
                return ResponseEntity.ok(response);
            } else {
                logger.error("Status refresh failed for study: {} - error: {}", 
                            studyId, result.getErrorMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error during status refresh for study: {}", studyId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("studyId", studyId);
            errorResponse.put("success", false);
            errorResponse.put("error", "Refresh error: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get system statistics about automated computations
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics(
            @RequestParam(defaultValue = "30") Integer days) {
        
        logger.debug("System statistics requested for last {} days", days);
        
        try {
            // Get various statistics from the service
            List<Map<String, Object>> recentChanges = automatedStatusComputationService.getRecentStatusChanges(days);
            List<Map<String, Object>> errors = automatedStatusComputationService.getStatusComputationErrors(days);
            List<Map<String, Object>> frequentChanges = automatedStatusComputationService.getStudiesWithFrequentStatusChanges(days, 3);
            AutomatedStatusComputationService.TriggerSystemHealth health = automatedStatusComputationService.checkTriggerSystemHealth();
            
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("period", days + " days");
            statistics.put("totalStatusChanges", recentChanges.size());
            statistics.put("totalErrors", errors.size());
            statistics.put("studiesWithFrequentChanges", frequentChanges.size());
            statistics.put("systemHealth", health.isHealthy() ? "HEALTHY" : "UNHEALTHY");
            statistics.put("errorRate", health.getErrorRate());
            statistics.put("recentActivity", health.getRecentComputations());
            
            // Calculate success rate
            double successRate = health.getRecentComputations() > 0 ? 
                ((double) (health.getRecentComputations() - health.getRecentErrors()) / health.getRecentComputations() * 100) : 100.0;
            statistics.put("successRate", successRate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("statistics", statistics);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving system statistics", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error retrieving statistics: " + e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}