package com.clinprecision.clinopsservice.studydesign.studymgmt.api;

/**
 * API URL constants for Study Management endpoints
 * 
 * <p>Centralizes all URL paths for Study Management module to support
 * the API refactoring effort. Maintains both old (deprecated) and new
 * URL paths to enable backward compatibility during migration.</p>
 * 
 * <p><b>Migration Timeline:</b></p>
 * <ul>
 *   <li>Phase 1 (Oct 2025 - Apr 2026): Both old and new URLs work</li>
 *   <li>Phase 2 (Apr 2026 - Oct 2026): Sunset warnings</li>
 *   <li>Phase 3 (Oct 2026+): Old URLs removed</li>
 * </ul>
 * 
 * <p><b>URL Structure:</b></p>
 * <ul>
 *   <li>Old: {@code /api/studies/*}</li>
 *   <li>New: {@code /api/v1/study-design/studies/*}</li>
 * </ul>
 * 
 * @author ClinPrecision Development Team
 * @since 1.0.0 (October 2025 - API Refactoring)
 */
public final class StudyApiConstants {
    
    // ============================================================================
    // BASE PATHS
    // ============================================================================
    
    /**
     * Old base path for study endpoints (DEPRECATED)
     * @deprecated Use {@link #NEW_BASE_PATH} instead. Will be removed in v2.0.0
     */
    @Deprecated(since = "1.0.0", forRemoval = true)
    public static final String OLD_BASE_PATH = "/api/studies";
    
    /**
     * New base path for study endpoints (following bounded context pattern)
     */
    public static final String NEW_BASE_PATH = "/api/v1/study-design/studies";
    
    /**
     * Base path for study analytics endpoints
     */
    public static final String ANALYTICS_BASE_PATH = "/api/v1/study-design/analytics";
    
    /**
     * Base path for study metadata endpoints
     */
    public static final String METADATA_BASE_PATH = "/api/v1/study-design/metadata";
    
    /**
     * Base path for study health check endpoints
     */
    public static final String HEALTH_BASE_PATH = "/api/v1/study-design/health";
    
    // ============================================================================
    // STUDY COMMAND ENDPOINTS (CREATE, UPDATE, DELETE)
    // ============================================================================
    
    /**
     * Create study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies</li>
     *   <li>New: POST /api/v1/study-design/studies</li>
     * </ul>
     */
    public static final class CreateStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH;
        public static final String NEW = NEW_BASE_PATH;
    }
    
    /**
     * Update study endpoint
     * <ul>
     *   <li>Method: PUT</li>
     *   <li>Old: PUT /api/studies/{uuid}</li>
     *   <li>New: PUT /api/v1/study-design/studies/{uuid}</li>
     * </ul>
     */
    public static final class UpdateStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}";
    }
    
    /**
     * Update study details endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/details</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/details</li>
     * </ul>
     */
    public static final class UpdateStudyDetails {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/details";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/details";
    }
    
    /**
     * Publish study endpoint
     * <ul>
     *   <li>Method: PATCH</li>
     *   <li>Old: PATCH /api/studies/{studyId}/publish</li>
     *   <li>New: PATCH /api/v1/study-design/studies/{studyId}/publish</li>
     * </ul>
     */
    public static final class PublishStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{studyId}/publish";
        public static final String NEW = NEW_BASE_PATH + "/{studyId}/publish";
    }
    
    /**
     * Update study status endpoint
     * <ul>
     *   <li>Method: PATCH</li>
     *   <li>Old: PATCH /api/studies/{studyId}/status</li>
     *   <li>New: PATCH /api/v1/study-design/studies/{studyId}/status</li>
     * </ul>
     */
    public static final class UpdateStudyStatus {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{studyId}/status";
        public static final String NEW = NEW_BASE_PATH + "/{studyId}/status";
    }
    
    // ============================================================================
    // STUDY LIFECYCLE ENDPOINTS
    // ============================================================================
    
    /**
     * Suspend study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/suspend</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/lifecycle/suspend</li>
     * </ul>
     */
    public static final class SuspendStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/suspend";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/lifecycle/suspend";
    }
    
    /**
     * Resume study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/resume</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/lifecycle/resume</li>
     * </ul>
     */
    public static final class ResumeStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/resume";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/lifecycle/resume";
    }
    
    /**
     * Complete study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/complete</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/lifecycle/complete</li>
     * </ul>
     */
    public static final class CompleteStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/complete";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/lifecycle/complete";
    }
    
    /**
     * Terminate study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/terminate</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/lifecycle/terminate</li>
     * </ul>
     */
    public static final class TerminateStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/terminate";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/lifecycle/terminate";
    }
    
    /**
     * Withdraw study endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{uuid}/withdraw</li>
     *   <li>New: POST /api/v1/study-design/studies/{uuid}/lifecycle/withdraw</li>
     * </ul>
     */
    public static final class WithdrawStudy {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{uuid}/withdraw";
        public static final String NEW = NEW_BASE_PATH + "/{uuid}/lifecycle/withdraw";
    }
    
    // ============================================================================
    // STUDY QUERY ENDPOINTS (READ)
    // ============================================================================
    
    /**
     * List all studies endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies</li>
     *   <li>New: GET /api/v1/study-design/studies</li>
     * </ul>
     */
    public static final class ListStudies {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH;
        public static final String NEW = NEW_BASE_PATH;
    }
    
    /**
     * Get study by ID endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/{id}</li>
     *   <li>New: GET /api/v1/study-design/studies/{id}</li>
     * </ul>
     */
    public static final class GetStudyById {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}";
        public static final String NEW = NEW_BASE_PATH + "/{id}";
    }
    
    /**
     * Get study UUID by legacy ID endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/{legacyId}/uuid</li>
     *   <li>New: GET /api/v1/study-design/studies/{legacyId}/uuid</li>
     * </ul>
     */
    public static final class GetStudyUuidByLegacyId {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{legacyId}/uuid";
        public static final String NEW = NEW_BASE_PATH + "/{legacyId}/uuid";
    }
    
    /**
     * Get study overview/summary endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/{id}/overview</li>
     *   <li>New: GET /api/v1/study-design/studies/{id}/summary</li>
     * </ul>
     */
    public static final class GetStudyOverview {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}/overview";
        public static final String NEW = NEW_BASE_PATH + "/{id}/summary";
    }
    
    /**
     * Get study arms endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/{id}/arms</li>
     *   <li>New: GET /api/v1/study-design/studies/{id}/arms</li>
     * </ul>
     */
    public static final class GetStudyArms {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}/arms";
        public static final String NEW = NEW_BASE_PATH + "/{id}/arms";
    }
    
    /**
     * Search studies endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/search</li>
     *   <li>New: GET /api/v1/study-design/studies?q={query}</li>
     * </ul>
     */
    public static final class SearchStudies {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/search";
        public static final String NEW = NEW_BASE_PATH; // Use query param: ?q={query}
    }
    
    // ============================================================================
    // STUDY METADATA ENDPOINTS
    // ============================================================================
    
    /**
     * Get study statuses lookup endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/lookup/statuses</li>
     *   <li>New: GET /api/v1/study-design/metadata/study-statuses</li>
     * </ul>
     */
    public static final class GetStudyStatuses {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/lookup/statuses";
        public static final String NEW = METADATA_BASE_PATH + "/study-statuses";
    }
    
    /**
     * Get regulatory statuses lookup endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/lookup/regulatory-statuses</li>
     *   <li>New: GET /api/v1/study-design/metadata/regulatory-statuses</li>
     * </ul>
     */
    public static final class GetRegulatoryStatuses {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/lookup/regulatory-statuses";
        public static final String NEW = METADATA_BASE_PATH + "/regulatory-statuses";
    }
    
    /**
     * Get study phases lookup endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/lookup/phases</li>
     *   <li>New: GET /api/v1/study-design/metadata/study-phases</li>
     * </ul>
     */
    public static final class GetStudyPhases {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/lookup/phases";
        public static final String NEW = METADATA_BASE_PATH + "/study-phases";
    }
    
    // ============================================================================
    // STUDY ANALYTICS ENDPOINTS
    // ============================================================================
    
    /**
     * Get dashboard metrics endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/dashboard/metrics</li>
     *   <li>New: GET /api/v1/study-design/analytics/dashboard-metrics</li>
     * </ul>
     */
    public static final class GetDashboardMetrics {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/dashboard/metrics";
        public static final String NEW = ANALYTICS_BASE_PATH + "/dashboard-metrics";
    }
    
    // ============================================================================
    // STUDY DESIGN PROGRESS ENDPOINTS
    // ============================================================================
    
    /**
     * Initialize design progress endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/studies/{id}/design-progress/initialize</li>
     *   <li>New: POST /api/v1/study-design/studies/{id}/design-progress</li>
     * </ul>
     */
    public static final class InitializeDesignProgress {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}/design-progress/initialize";
        public static final String NEW = NEW_BASE_PATH + "/{id}/design-progress";
    }
    
    /**
     * Update design progress endpoint
     * <ul>
     *   <li>Method: PUT</li>
     *   <li>Old: PUT /api/studies/{id}/design-progress</li>
     *   <li>New: PUT /api/v1/study-design/studies/{id}/design-progress</li>
     * </ul>
     */
    public static final class UpdateDesignProgress {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}/design-progress";
        public static final String NEW = NEW_BASE_PATH + "/{id}/design-progress";
    }
    
    /**
     * Get design progress endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/studies/{id}/design-progress</li>
     *   <li>New: GET /api/v1/study-design/studies/{id}/design-progress</li>
     * </ul>
     */
    public static final class GetDesignProgress {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = OLD_BASE_PATH + "/{id}/design-progress";
        public static final String NEW = NEW_BASE_PATH + "/{id}/design-progress";
    }
    
    // ============================================================================
    // AUTOMATED STATUS COMPUTATION ENDPOINTS
    // ============================================================================
    
    /**
     * Compute study status endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/v1/studies/status/automated/{studyId}/compute</li>
     *   <li>New: POST /api/v1/study-design/studies/{studyId}/status/compute</li>
     * </ul>
     */
    public static final class ComputeStatus {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/{studyId}/compute";
        public static final String NEW = NEW_BASE_PATH + "/{studyId}/status/compute";
    }
    
    /**
     * Batch compute study statuses endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/v1/studies/status/automated/batch-compute</li>
     *   <li>New: POST /api/v1/study-design/studies/status/batch-compute</li>
     * </ul>
     */
    public static final class BatchComputeStatus {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/batch-compute";
        public static final String NEW = NEW_BASE_PATH + "/status/batch-compute";
    }
    
    /**
     * Get status computation history endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/{studyId}/history</li>
     *   <li>New: GET /api/v1/study-design/studies/{studyId}/status/history</li>
     * </ul>
     */
    public static final class GetStatusHistory {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/{studyId}/history";
        public static final String NEW = NEW_BASE_PATH + "/{studyId}/status/history";
    }
    
    /**
     * Refresh study status endpoint
     * <ul>
     *   <li>Method: POST</li>
     *   <li>Old: POST /api/v1/studies/status/automated/{studyId}/refresh</li>
     *   <li>New: POST /api/v1/study-design/studies/{studyId}/status/refresh</li>
     * </ul>
     */
    public static final class RefreshStatus {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/{studyId}/refresh";
        public static final String NEW = NEW_BASE_PATH + "/{studyId}/status/refresh";
    }
    
    /**
     * Get recent status changes endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/recent-changes</li>
     *   <li>New: GET /api/v1/study-design/analytics/status-changes</li>
     * </ul>
     */
    public static final class GetRecentStatusChanges {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/recent-changes";
        public static final String NEW = ANALYTICS_BASE_PATH + "/status-changes";
    }
    
    /**
     * Get frequent status changes endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/frequent-changes</li>
     *   <li>New: GET /api/v1/study-design/analytics/frequent-status-changes</li>
     * </ul>
     */
    public static final class GetFrequentStatusChanges {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/frequent-changes";
        public static final String NEW = ANALYTICS_BASE_PATH + "/frequent-status-changes";
    }
    
    /**
     * Get status computation errors endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/errors</li>
     *   <li>New: GET /api/v1/study-design/analytics/status-errors</li>
     * </ul>
     */
    public static final class GetStatusErrors {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/errors";
        public static final String NEW = ANALYTICS_BASE_PATH + "/status-errors";
    }
    
    /**
     * Get status computation statistics endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/statistics</li>
     *   <li>New: GET /api/v1/study-design/analytics/status-statistics</li>
     * </ul>
     */
    public static final class GetStatusStatistics {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/statistics";
        public static final String NEW = ANALYTICS_BASE_PATH + "/status-statistics";
    }
    
    /**
     * Get system health for status computation endpoint
     * <ul>
     *   <li>Method: GET</li>
     *   <li>Old: GET /api/v1/studies/status/automated/system-health</li>
     *   <li>New: GET /api/v1/study-design/health/status-computation</li>
     * </ul>
     */
    public static final class GetSystemHealth {
        @Deprecated(since = "1.0.0", forRemoval = true)
        public static final String OLD = "/api/v1/studies/status/automated/system-health";
        public static final String NEW = HEALTH_BASE_PATH + "/status-computation";
    }
    
    // ============================================================================
    // PRIVATE CONSTRUCTOR
    // ============================================================================
    
    /**
     * Private constructor to prevent instantiation
     */
    private StudyApiConstants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }
}
