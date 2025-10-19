package com.clinprecision.clinopsservice.studydesign.studymgmt.service;



import com.clinprecision.clinopsservice.studydesign.studymgmt.repository.StudyRepository;
import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing automated study status computation triggers
 * Provides programmatic access to database triggers and status computation procedures
 */
@Service
@Transactional
public class AutomatedStatusComputationService {

    private static final Logger logger = LoggerFactory.getLogger(AutomatedStatusComputationService.class);

    private final JdbcTemplate jdbcTemplate;
    private final StudyRepository studyRepository;

    public AutomatedStatusComputationService(JdbcTemplate jdbcTemplate, StudyRepository studyRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.studyRepository = studyRepository;
    }

    /**
     * Manually trigger status computation for a specific study
     * This calls the database stored procedure to compute and update study status
     */
    public StatusComputationResult manuallyComputeStudyStatus(Long studyId, String reason) {
        logger.info("Manually computing status for study: {} - reason: {}", studyId, reason);
        
        try {
            long startTime = System.currentTimeMillis();
            
            // Call the stored procedure
            jdbcTemplate.update("CALL ManuallyComputeStudyStatus(?, ?)", studyId, reason);
            
            long endTime = System.currentTimeMillis();
            long computationTime = endTime - startTime;
            
            // Get the latest computation result
            Optional<StatusComputationLog> latestLog = getLatestComputationLog(studyId);
            
            if (latestLog.isPresent()) {
                StatusComputationLog log = latestLog.get();
                logger.info("Status computation completed for study: {} - old status: {} - new status: {} - result: {} - time: {}ms", 
                           studyId, log.getOldStatusCode(), log.getNewStatusCode(), log.getComputationResult(), computationTime);
                
                return new StatusComputationResult(
                    true, 
                    log.getOldStatusCode(), 
                    log.getNewStatusCode(), 
                    log.getComputationResult(),
                    computationTime,
                    null
                );
            } else {
                logger.warn("No computation log found after manual computation for study: {}", studyId);
                return new StatusComputationResult(false, null, null, "NO_LOG", computationTime, "No computation log found");
            }
            
        } catch (Exception e) {
            logger.error("Error during manual status computation for study: {}", studyId, e);
            return new StatusComputationResult(false, null, null, "ERROR", 0, e.getMessage());
        }
    }

    /**
     * Trigger status computation for all studies in the system
     * Useful for batch processing or system maintenance
     */
    public BatchComputationResult batchComputeAllStudyStatuses() {
        logger.info("Starting batch computation of all study statuses");
        
        try {
            long startTime = System.currentTimeMillis();
            
            // Call the batch stored procedure
            List<Map<String, Object>> result = jdbcTemplate.queryForList("CALL BatchComputeAllStudyStatuses()");
            
            long endTime = System.currentTimeMillis();
            long totalTime = endTime - startTime;
            
            String resultMessage = "Unknown";
            if (!result.isEmpty() && result.get(0).containsKey("result")) {
                resultMessage = (String) result.get(0).get("result");
            }
            
            logger.info("Batch computation completed: {} - time: {}ms", resultMessage, totalTime);
            
            return new BatchComputationResult(true, resultMessage, totalTime, null);
            
        } catch (Exception e) {
            logger.error("Error during batch status computation", e);
            return new BatchComputationResult(false, "Error: " + e.getMessage(), 0, e.getMessage());
        }
    }

    /**
     * Get status computation history for a specific study
     */
    public List<StatusComputationLog> getStudyStatusComputationHistory(Long studyId, Integer limit) {
        logger.debug("Retrieving status computation history for study: {} - limit: {}", studyId, limit);
        
        try {
            String sql = """
                SELECT 
                    id, study_id, trigger_source, old_status_code, new_status_code,
                    computation_result, trigger_details, error_message, created_at
                FROM study_status_computation_log
                WHERE study_id = ?
                ORDER BY created_at DESC
                LIMIT ?
                """;
            
            return jdbcTemplate.query(sql, 
                (rs, rowNum) -> new StatusComputationLog(
                    rs.getLong("id"),
                    rs.getLong("study_id"),
                    rs.getString("trigger_source"),
                    rs.getString("old_status_code"),
                    rs.getString("new_status_code"),
                    rs.getString("computation_result"),
                    rs.getString("trigger_details"),
                    rs.getString("error_message"),
                    rs.getTimestamp("created_at").toLocalDateTime()
                ),
                studyId, 
                limit != null ? limit : 50
            );
            
        } catch (Exception e) {
            logger.error("Error retrieving computation history for study: {}", studyId, e);
            return List.of();
        }
    }

    /**
     * Get the latest computation log entry for a study
     */
    public Optional<StatusComputationLog> getLatestComputationLog(Long studyId) {
        List<StatusComputationLog> history = getStudyStatusComputationHistory(studyId, 1);
        return history.isEmpty() ? Optional.empty() : Optional.of(history.get(0));
    }

    /**
     * Get recent status changes across all studies
     */
    public List<Map<String, Object>> getRecentStatusChanges(Integer days) {
        logger.debug("Retrieving recent status changes for last {} days", days);
        
        try {
            String sql = """
                SELECT 
                    l.id, l.study_id, l.trigger_source, l.old_status_code, l.new_status_code,
                    l.computation_result, l.trigger_details, l.created_at,
                    s.name as study_name, s.protocol_number,
                    old_ss.name as old_status_name, new_ss.name as new_status_name
                FROM study_status_computation_log l
                JOIN studies s ON l.study_id = s.id
                LEFT JOIN study_status old_ss ON l.old_status_code = old_ss.code
                LEFT JOIN study_status new_ss ON l.new_status_code = new_ss.code
                WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                  AND l.computation_result = 'SUCCESS'
                ORDER BY l.created_at DESC
                LIMIT 100
                """;
            
            return jdbcTemplate.queryForList(sql, days != null ? days : 7);
            
        } catch (Exception e) {
            logger.error("Error retrieving recent status changes", e);
            return List.of();
        }
    }

    /**
     * Get studies with frequent status changes (potential issues)
     */
    public List<Map<String, Object>> getStudiesWithFrequentStatusChanges(Integer days, Integer minChanges) {
        logger.debug("Retrieving studies with frequent status changes - days: {} - min changes: {}", days, minChanges);
        
        try {
            String sql = """
                SELECT 
                    l.study_id, s.name as study_name, s.protocol_number,
                    COUNT(*) as change_count,
                    MAX(l.created_at) as last_change,
                    COUNT(DISTINCT l.new_status_code) as unique_statuses
                FROM study_status_computation_log l
                JOIN studies s ON l.study_id = s.id
                WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                  AND l.computation_result = 'SUCCESS'
                GROUP BY l.study_id, s.name, s.protocol_number
                HAVING change_count >= ?
                ORDER BY change_count DESC
                LIMIT 50
                """;
            
            return jdbcTemplate.queryForList(sql, 
                days != null ? days : 30, 
                minChanges != null ? minChanges : 5
            );
            
        } catch (Exception e) {
            logger.error("Error retrieving studies with frequent status changes", e);
            return List.of();
        }
    }

    /**
     * Get recent status computation errors
     */
    public List<Map<String, Object>> getStatusComputationErrors(Integer days) {
        logger.debug("Retrieving status computation errors for last {} days", days);
        
        try {
            String sql = """
                SELECT 
                    l.id, l.study_id, l.trigger_source, l.error_message, l.created_at,
                    s.name as study_name, s.protocol_number
                FROM study_status_computation_log l
                JOIN studies s ON l.study_id = s.id
                WHERE l.computation_result = 'ERROR'
                  AND l.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY l.created_at DESC
                LIMIT 100
                """;
            
            return jdbcTemplate.queryForList(sql, days != null ? days : 7);
            
        } catch (Exception e) {
            logger.error("Error retrieving status computation errors", e);
            return List.of();
        }
    }

    /**
     * Check if automated triggers are working correctly
     * Returns system health information about the trigger system
     */
    public TriggerSystemHealth checkTriggerSystemHealth() {
        logger.debug("Checking trigger system health");
        
        try {
            // Check recent activity
            Integer recentComputationsResult = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM study_status_computation_log WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
                Integer.class
            );
            int recentComputations = recentComputationsResult != null ? recentComputationsResult : 0;
            
            // Check error rate
            Integer recentErrorsResult = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM study_status_computation_log WHERE computation_result = 'ERROR' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
                Integer.class
            );
            int recentErrors = recentErrorsResult != null ? recentErrorsResult : 0;
            
            // Check trigger existence
            boolean versionsTriggersExist = checkTriggerExists("trg_compute_study_status_on_version_change");
            boolean amendmentsTriggersExist = checkTriggerExists("trg_compute_study_status_on_amendment_change");
            
            // Check stored procedures
            boolean proceduresExist = checkProcedureExists("ComputeAndUpdateStudyStatus");
            
            double errorRate = recentComputations > 0 ? (double) recentErrors / recentComputations * 100 : 0;
            
            boolean isHealthy = versionsTriggersExist && amendmentsTriggersExist && proceduresExist && errorRate < 10;
            
            return new TriggerSystemHealth(
                isHealthy,
                recentComputations,
                recentErrors,
                errorRate,
                versionsTriggersExist,
                amendmentsTriggersExist,
                proceduresExist
            );
            
        } catch (Exception e) {
            logger.error("Error checking trigger system health", e);
            return new TriggerSystemHealth(false, 0, 0, 100.0, false, false, false);
        }
    }

    /**
     * Force refresh of study status for studies that may have gotten out of sync
     */
    public RefreshResult refreshStudyStatusSync(Long studyId) {
        logger.info("Forcing status refresh for study: {}", studyId);
        
        try {
            // Get current study
            StudyEntity study = studyRepository.findById(studyId)
                .orElseThrow(() -> new RuntimeException("Study not found: " + studyId));
            
            String oldStatusCode = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
            
            // Trigger manual computation
            StatusComputationResult result = manuallyComputeStudyStatus(studyId, "Force refresh - sync correction");
            
            if (result.isSuccess()) {
                boolean statusChanged = !java.util.Objects.equals(oldStatusCode, result.getNewStatusCode());
                
                return new RefreshResult(
                    true,
                    oldStatusCode,
                    result.getNewStatusCode(),
                    statusChanged,
                    result.getComputationTimeMs(),
                    null
                );
            } else {
                return new RefreshResult(false, oldStatusCode, null, false, 0, result.getErrorMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error refreshing study status sync for study: {}", studyId, e);
            return new RefreshResult(false, null, null, false, 0, e.getMessage());
        }
    }

    // Helper methods

    private boolean checkTriggerExists(String triggerName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_NAME = ? AND TRIGGER_SCHEMA = DATABASE()",
                Integer.class,
                triggerName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            logger.debug("Error checking trigger existence: {}", triggerName, e);
            return false;
        }
    }

    private boolean checkProcedureExists(String procedureName) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.ROUTINES WHERE ROUTINE_NAME = ? AND ROUTINE_SCHEMA = DATABASE() AND ROUTINE_TYPE = 'PROCEDURE'",
                Integer.class,
                procedureName
            );
            return count != null && count > 0;
        } catch (Exception e) {
            logger.debug("Error checking procedure existence: {}", procedureName, e);
            return false;
        }
    }

    // =====================================================
    // Result classes
    // =====================================================

    public static class StatusComputationResult {
        private final boolean success;
        private final String oldStatusCode;
        private final String newStatusCode;
        private final String computationResult;
        private final long computationTimeMs;
        private final String errorMessage;

        public StatusComputationResult(boolean success, String oldStatusCode, String newStatusCode, 
                                     String computationResult, long computationTimeMs, String errorMessage) {
            this.success = success;
            this.oldStatusCode = oldStatusCode;
            this.newStatusCode = newStatusCode;
            this.computationResult = computationResult;
            this.computationTimeMs = computationTimeMs;
            this.errorMessage = errorMessage;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getOldStatusCode() { return oldStatusCode; }
        public String getNewStatusCode() { return newStatusCode; }
        public String getComputationResult() { return computationResult; }
        public long getComputationTimeMs() { return computationTimeMs; }
        public String getErrorMessage() { return errorMessage; }
        public boolean isStatusChanged() { 
            return !java.util.Objects.equals(oldStatusCode, newStatusCode); 
        }
    }

    public static class BatchComputationResult {
        private final boolean success;
        private final String resultMessage;
        private final long totalTimeMs;
        private final String errorMessage;

        public BatchComputationResult(boolean success, String resultMessage, long totalTimeMs, String errorMessage) {
            this.success = success;
            this.resultMessage = resultMessage;
            this.totalTimeMs = totalTimeMs;
            this.errorMessage = errorMessage;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getResultMessage() { return resultMessage; }
        public long getTotalTimeMs() { return totalTimeMs; }
        public String getErrorMessage() { return errorMessage; }
    }

    public static class StatusComputationLog {
        private final Long id;
        private final Long studyId;
        private final String triggerSource;
        private final String oldStatusCode;
        private final String newStatusCode;
        private final String computationResult;
        private final String triggerDetails;
        private final String errorMessage;
        private final LocalDateTime createdAt;

        public StatusComputationLog(Long id, Long studyId, String triggerSource, String oldStatusCode, 
                                  String newStatusCode, String computationResult, String triggerDetails, 
                                  String errorMessage, LocalDateTime createdAt) {
            this.id = id;
            this.studyId = studyId;
            this.triggerSource = triggerSource;
            this.oldStatusCode = oldStatusCode;
            this.newStatusCode = newStatusCode;
            this.computationResult = computationResult;
            this.triggerDetails = triggerDetails;
            this.errorMessage = errorMessage;
            this.createdAt = createdAt;
        }

        // Getters
        public Long getId() { return id; }
        public Long getStudyId() { return studyId; }
        public String getTriggerSource() { return triggerSource; }
        public String getOldStatusCode() { return oldStatusCode; }
        public String getNewStatusCode() { return newStatusCode; }
        public String getComputationResult() { return computationResult; }
        public String getTriggerDetails() { return triggerDetails; }
        public String getErrorMessage() { return errorMessage; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class TriggerSystemHealth {
        private final boolean healthy;
        private final int recentComputations;
        private final int recentErrors;
        private final double errorRate;
        private final boolean versionsTriggersExist;
        private final boolean amendmentsTriggersExist;
        private final boolean proceduresExist;

        public TriggerSystemHealth(boolean healthy, int recentComputations, int recentErrors, double errorRate,
                                 boolean versionsTriggersExist, boolean amendmentsTriggersExist, boolean proceduresExist) {
            this.healthy = healthy;
            this.recentComputations = recentComputations;
            this.recentErrors = recentErrors;
            this.errorRate = errorRate;
            this.versionsTriggersExist = versionsTriggersExist;
            this.amendmentsTriggersExist = amendmentsTriggersExist;
            this.proceduresExist = proceduresExist;
        }

        // Getters
        public boolean isHealthy() { return healthy; }
        public int getRecentComputations() { return recentComputations; }
        public int getRecentErrors() { return recentErrors; }
        public double getErrorRate() { return errorRate; }
        public boolean isVersionsTriggersExist() { return versionsTriggersExist; }
        public boolean isAmendmentsTriggersExist() { return amendmentsTriggersExist; }
        public boolean isProceduresExist() { return proceduresExist; }
    }

    public static class RefreshResult {
        private final boolean success;
        private final String oldStatusCode;
        private final String newStatusCode;
        private final boolean statusChanged;
        private final long computationTimeMs;
        private final String errorMessage;

        public RefreshResult(boolean success, String oldStatusCode, String newStatusCode, 
                           boolean statusChanged, long computationTimeMs, String errorMessage) {
            this.success = success;
            this.oldStatusCode = oldStatusCode;
            this.newStatusCode = newStatusCode;
            this.statusChanged = statusChanged;
            this.computationTimeMs = computationTimeMs;
            this.errorMessage = errorMessage;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getOldStatusCode() { return oldStatusCode; }
        public String getNewStatusCode() { return newStatusCode; }
        public boolean isStatusChanged() { return statusChanged; }
        public long getComputationTimeMs() { return computationTimeMs; }
        public String getErrorMessage() { return errorMessage; }
    }
}



