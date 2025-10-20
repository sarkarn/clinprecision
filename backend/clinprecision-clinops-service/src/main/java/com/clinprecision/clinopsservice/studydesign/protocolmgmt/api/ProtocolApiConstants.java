package com.clinprecision.clinopsservice.studydesign.protocolmgmt.api;

/**
 * Protocol Management API Constants
 * 
 * <p>Centralized URL definitions for protocol version endpoints.</p>
 * 
 * <p><b>URL Refactoring (October 2025):</b> Migrating from /api/protocol-versions/* 
 * to DDD-aligned /api/v1/study-design/protocol-versions/* structure.</p>
 * 
 * <p><b>Deprecation Timeline:</b></p>
 * <ul>
 *   <li>Old URLs: Deprecated but functional (backward compatible)</li>
 *   <li>Sunset Date: April 19, 2026</li>
 *   <li>New URLs: Recommended for all new development</li>
 * </ul>
 * 
 * @see com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller.ProtocolVersionCommandController
 * @see com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller.ProtocolVersionQueryController
 * @see com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller.ProtocolVersionBridgeController
 * @since October 2025
 */
public final class ProtocolApiConstants {
    
    // ==================== Base Paths ====================
    
    /**
     * Base path for all v1 study design APIs
     */
    public static final String API_V1_BASE = "/api/v1/study-design";
    
    /**
     * NEW base path for protocol version endpoints (RECOMMENDED)
     * Example: /api/v1/study-design/protocol-versions
     */
    public static final String PROTOCOL_VERSIONS_PATH = API_V1_BASE + "/protocol-versions";
    
    /**
     * Base path for study-centric protocol version endpoints
     * Example: /api/v1/study-design/studies/{studyUuid}/protocol-versions
     */
    public static final String STUDIES_PATH = API_V1_BASE + "/studies";
    
    /**
     * LEGACY base path for protocol versions (DEPRECATED)
     * ⚠️ DO NOT USE IN NEW CODE
     */
    public static final String LEGACY_PROTOCOL_VERSIONS = "/api/protocol-versions";
    
    /**
     * LEGACY base path for study versions bridge (DEPRECATED)
     * ⚠️ DO NOT USE IN NEW CODE
     */
    public static final String LEGACY_STUDY_VERSIONS = "/api/study-versions";
    
    // ==================== Resource Paths ====================
    
    /**
     * Individual protocol version by ID
     * Pattern: /protocol-versions/{id}
     */
    public static final String BY_ID = "/{id}";
    
    /**
     * Protocol versions for a specific study
     * Pattern: /studies/{studyUuid}/protocol-versions
     */
    public static final String BY_STUDY = "/{studyUuid}/protocol-versions";
    
    /**
     * Active protocol version for a study
     * Pattern: /studies/{studyUuid}/protocol-versions/active
     */
    public static final String BY_STUDY_ACTIVE = "/{studyUuid}/protocol-versions/active";
    
    /**
     * Check if protocol version exists
     * Pattern: /studies/{studyUuid}/protocol-versions/{versionNumber}/exists
     */
    public static final String BY_STUDY_VERSION_EXISTS = "/{studyUuid}/protocol-versions/{versionNumber}/exists";
    
    /**
     * Count protocol versions with filters
     * Pattern: /studies/{studyUuid}/protocol-versions/count
     */
    public static final String BY_STUDY_COUNT = "/{studyUuid}/protocol-versions/count";
    
    /**
     * Protocol version by database ID (legacy compatibility)
     * Pattern: /protocol-versions/by-database-id/{id}
     */
    public static final String BY_DATABASE_ID = "/by-database-id/{id}";
    
    // ==================== Action Paths ====================
    
    /**
     * Change protocol version status
     * Pattern: /protocol-versions/{id}/status
     */
    public static final String STATUS = "/{id}/status";
    
    /**
     * Approve protocol version (lifecycle action)
     * Pattern: /protocol-versions/{id}/lifecycle/approve
     */
    public static final String LIFECYCLE_APPROVE = "/{id}/lifecycle/approve";
    
    /**
     * Activate protocol version (lifecycle action)
     * Pattern: /protocol-versions/{id}/lifecycle/activate
     */
    public static final String LIFECYCLE_ACTIVATE = "/{id}/lifecycle/activate";
    
    /**
     * Async protocol version creation
     * Pattern: /protocol-versions/async
     */
    public static final String ASYNC = "/async";
    
    // ==================== Deprecation Metadata ====================
    
    /**
     * Standard deprecation message for old URLs
     */
    public static final String DEPRECATION_MESSAGE = 
        "This endpoint is deprecated. Please use /api/v1/study-design/protocol-versions/* instead. " +
        "Old URLs will be removed on April 19, 2026.";
    
    /**
     * Sunset date for deprecated endpoints (RFC 8594)
     * Format: YYYY-MM-DD
     */
    public static final String SUNSET_DATE = "2026-04-19";
    
    /**
     * Link to migration documentation
     */
    public static final String MIGRATION_DOC_URL = 
        "https://docs.clinprecision.com/api/migration/protocol-versions";
    
    // ==================== Query Parameters ====================
    
    /**
     * Filter by status query parameter
     * Usage: ?status=DRAFT
     */
    public static final String QUERY_PARAM_STATUS = "status";
    
    /**
     * Include all versions (including soft-deleted)
     * Usage: ?includeAll=true
     */
    public static final String QUERY_PARAM_INCLUDE_ALL = "includeAll";
    
    // ==================== HTTP Headers ====================
    
    /**
     * Deprecation header (RFC 8594)
     */
    public static final String HEADER_DEPRECATION = "Deprecation";
    
    /**
     * Sunset header (RFC 8594)
     */
    public static final String HEADER_SUNSET = "Sunset";
    
    /**
     * Link header for alternative URL (RFC 8288)
     */
    public static final String HEADER_LINK = "Link";
    
    /**
     * Custom warning header
     */
    public static final String HEADER_WARNING = "X-API-Warn";
    
    // ==================== Private Constructor ====================
    
    /**
     * Private constructor to prevent instantiation
     */
    private ProtocolApiConstants() {
        throw new UnsupportedOperationException("ProtocolApiConstants is a utility class and cannot be instantiated");
    }
    
    // ==================== Utility Methods ====================
    
    /**
     * Build full URL for protocol version by ID
     * 
     * @param versionId the protocol version UUID
     * @return full URL path
     */
    public static String buildProtocolVersionUrl(String versionId) {
        return PROTOCOL_VERSIONS_PATH + "/" + versionId;
    }
    
    /**
     * Build full URL for study's protocol versions
     * 
     * @param studyUuid the study UUID
     * @return full URL path
     */
    public static String buildStudyProtocolVersionsUrl(String studyUuid) {
        return STUDIES_PATH + "/" + studyUuid + "/protocol-versions";
    }
    
    /**
     * Check if request is using deprecated URL
     * 
     * @param requestUri the request URI
     * @return true if using deprecated endpoint
     */
    public static boolean isDeprecatedUrl(String requestUri) {
        return requestUri != null && (
            requestUri.startsWith(LEGACY_PROTOCOL_VERSIONS) ||
            requestUri.startsWith(LEGACY_STUDY_VERSIONS)
        );
    }
    
    /**
     * Get new URL equivalent for deprecated URL
     * 
     * @param deprecatedUrl the deprecated URL
     * @return the new recommended URL
     */
    public static String getNewUrlEquivalent(String deprecatedUrl) {
        if (deprecatedUrl == null) {
            return null;
        }
        
        if (deprecatedUrl.startsWith(LEGACY_PROTOCOL_VERSIONS)) {
            return deprecatedUrl.replace(LEGACY_PROTOCOL_VERSIONS, PROTOCOL_VERSIONS_PATH);
        }
        
        if (deprecatedUrl.startsWith(LEGACY_STUDY_VERSIONS)) {
            return deprecatedUrl.replace(LEGACY_STUDY_VERSIONS, PROTOCOL_VERSIONS_PATH);
        }
        
        return deprecatedUrl;
    }
}
