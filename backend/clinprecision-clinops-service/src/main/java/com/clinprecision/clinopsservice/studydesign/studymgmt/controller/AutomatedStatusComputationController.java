package com.clinprecision.clinopsservice.studydesign.studymgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.studymgmt.api.StudyApiConstants;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.AutomatedStatusComputationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
 * 
 * <p>Provides endpoints for managing and monitoring automated status computation.
 * This controller handles status computation triggers, analytics, and system health monitoring.</p>
 * 
 * <h3>⚠️ URL MIGRATION IN PROGRESS (October 2025)</h3>
 * 
 * <p><b>Old URLs (Deprecated - Will be removed April 19, 2026):</b></p>
 * <ul>
 *   <li>POST /api/v1/studies/status/automated/{studyId}/compute</li>
 *   <li>POST /api/v1/studies/status/automated/batch-compute</li>
 *   <li>GET /api/v1/studies/status/automated/{studyId}/history</li>
 *   <li>GET /api/v1/studies/status/automated/recent-changes</li>
 *   <li>GET /api/v1/studies/status/automated/frequent-changes</li>
 *   <li>GET /api/v1/studies/status/automated/errors</li>
 *   <li>GET /api/v1/studies/status/automated/system-health</li>
 *   <li>POST /api/v1/studies/status/automated/{studyId}/refresh</li>
 *   <li>GET /api/v1/studies/status/automated/statistics</li>
 * </ul>
 * 
 * <p><b>New URLs (Recommended - Use these for new integrations):</b></p>
 * <ul>
 *   <li>POST /api/v1/study-design/studies/{studyId}/status/compute</li>
 *   <li>POST /api/v1/study-design/studies/status/batch-compute</li>
 *   <li>GET /api/v1/study-design/studies/{studyId}/status/history</li>
 *   <li>GET /api/v1/study-design/analytics/status-changes</li>
 *   <li>GET /api/v1/study-design/analytics/frequent-status-changes</li>
 *   <li>GET /api/v1/study-design/analytics/status-errors</li>
 *   <li>GET /api/v1/study-design/health/status-computation</li>
 *   <li>POST /api/v1/study-design/studies/{studyId}/status/refresh</li>
 *   <li>GET /api/v1/study-design/analytics/status-statistics</li>
 * </ul>
 * 
 * <p><b>Migration Timeline:</b></p>
 * <ol>
 *   <li><b>Phase 1 (Now - Dec 2025):</b> Both old and new URLs supported. Deprecation headers sent for old URLs.</li>
 *   <li><b>Phase 2 (Jan - Mar 2026):</b> Update all frontend and API consumers to use new URLs.</li>
 *   <li><b>Phase 3 (April 19, 2026):</b> Old URLs removed. Only new URLs supported.</li>
 * </ol>
 * 
 * @version 1.0 (URL Refactoring - October 2025)
 * @author ClinPrecision Development Team
 */
@RestController
public class AutomatedStatusComputationController {

    private static final Logger logger = LoggerFactory.getLogger(AutomatedStatusComputationController.class);

    private final AutomatedStatusComputationService automatedStatusComputationService;

    public AutomatedStatusComputationController(AutomatedStatusComputationService automatedStatusComputationService) {
        this.automatedStatusComputationService = automatedStatusComputationService;
    }

    /**
     * Manually trigger status computation for a specific study
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/v1/studies/status/automated/{studyId}/compute</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{studyId}/status/compute</li>
     * </ul>
     * 
     * @param studyId The study ID
     * @param reason Reason for manual computation
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Computation result with status details
     */
    @PostMapping(value = {
        StudyApiConstants.ComputeStatus.OLD,
        StudyApiConstants.ComputeStatus.NEW
    })
    public ResponseEntity<Map<String, Object>> manuallyComputeStatus(
            @PathVariable Long studyId,
            @RequestParam(defaultValue = "Manual trigger via API") String reason,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/v1/studies/status/automated/batch-compute</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/status/batch-compute</li>
     * </ul>
     * 
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Batch computation result
     */
    @PostMapping(value = {
        StudyApiConstants.BatchComputeStatus.OLD,
        StudyApiConstants.BatchComputeStatus.NEW
    })
    public ResponseEntity<Map<String, Object>> batchComputeAllStatuses(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/{studyId}/history</li>
     *   <li>New (recommended): GET /api/v1/study-design/studies/{studyId}/status/history</li>
     * </ul>
     * 
     * @param studyId The study ID
     * @param limit Maximum number of history entries
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Computation history
     */
    @GetMapping(value = {
        StudyApiConstants.GetStatusHistory.OLD,
        StudyApiConstants.GetStatusHistory.NEW
    })
    public ResponseEntity<Map<String, Object>> getComputationHistory(
            @PathVariable Long studyId,
            @RequestParam(defaultValue = "20") Integer limit,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/recent-changes</li>
     *   <li>New (recommended): GET /api/v1/study-design/analytics/status-changes</li>
     * </ul>
     * 
     * @param days Number of days to look back
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Recent status changes
     */
    @GetMapping(value = {
        StudyApiConstants.GetRecentStatusChanges.OLD,
        StudyApiConstants.GetRecentStatusChanges.NEW
    })
    public ResponseEntity<Map<String, Object>> getRecentStatusChanges(
            @RequestParam(defaultValue = "7") Integer days,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.ANALYTICS_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/frequent-changes</li>
     *   <li>New (recommended): GET /api/v1/study-design/analytics/frequent-status-changes</li>
     * </ul>
     * 
     * @param days Number of days to analyze
     * @param minChanges Minimum number of changes to qualify
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Studies with frequent status changes
     */
    @GetMapping(value = {
        StudyApiConstants.GetFrequentStatusChanges.OLD,
        StudyApiConstants.GetFrequentStatusChanges.NEW
    })
    public ResponseEntity<Map<String, Object>> getFrequentStatusChanges(
            @RequestParam(defaultValue = "30") Integer days,
            @RequestParam(defaultValue = "5") Integer minChanges,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.ANALYTICS_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/errors</li>
     *   <li>New (recommended): GET /api/v1/study-design/analytics/status-errors</li>
     * </ul>
     * 
     * @param days Number of days to look back
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Computation errors
     */
    @GetMapping(value = {
        StudyApiConstants.GetStatusErrors.OLD,
        StudyApiConstants.GetStatusErrors.NEW
    })
    public ResponseEntity<Map<String, Object>> getComputationErrors(
            @RequestParam(defaultValue = "7") Integer days,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.ANALYTICS_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/system-health</li>
     *   <li>New (recommended): GET /api/v1/study-design/health/status-computation</li>
     * </ul>
     * 
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return System health status
     */
    @GetMapping(value = {
        StudyApiConstants.GetSystemHealth.OLD,
        StudyApiConstants.GetSystemHealth.NEW
    })
    public ResponseEntity<Map<String, Object>> checkSystemHealth(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.HEALTH_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): POST /api/v1/studies/status/automated/{studyId}/refresh</li>
     *   <li>New (recommended): POST /api/v1/study-design/studies/{studyId}/status/refresh</li>
     * </ul>
     * 
     * @param studyId The study ID
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return Refresh result
     */
    @PostMapping(value = {
        StudyApiConstants.RefreshStatus.OLD,
        StudyApiConstants.RefreshStatus.NEW
    })
    public ResponseEntity<Map<String, Object>> refreshStudyStatus(
            @PathVariable Long studyId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.NEW_BASE_PATH
        );
        
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
     * 
     * <p><b>URL Migration:</b></p>
     * <ul>
     *   <li>Old (deprecated): GET /api/v1/studies/status/automated/statistics</li>
     *   <li>New (recommended): GET /api/v1/study-design/analytics/status-statistics</li>
     * </ul>
     * 
     * @param days Number of days to analyze
     * @param httpRequest HTTP request for deprecation header detection
     * @param httpResponse HTTP response for deprecation headers
     * @return System statistics
     */
    @GetMapping(value = {
        StudyApiConstants.GetStatusStatistics.OLD,
        StudyApiConstants.GetStatusStatistics.NEW
    })
    public ResponseEntity<Map<String, Object>> getSystemStatistics(
            @RequestParam(defaultValue = "30") Integer days,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            "/api/v1/studies/status/automated",
            StudyApiConstants.ANALYTICS_BASE_PATH
        );
        
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



