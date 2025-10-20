package com.clinprecision.clinopsservice.studyoperation.visit.api;

/**
 * API Constants for Study Operations endpoints.
 * 
 * <p>This class centralizes all URL paths for study operations REST APIs,
 * including visit configuration and operational endpoints.</p>
 * 
 * <p><b>URL Structure:</b></p>
 * <pre>
 * /api/v1/study-operations/
 *   ├── visit-config/
 *   │   └── unscheduled     (UnscheduledVisitConfigController)
 *   ├── data-capture/       (Future: DataCaptureController)
 *   └── enrollment/         (Future: PatientEnrollmentController)
 * </pre>
 * 
 * @since 1.0
 * @version 1.0 (October 2025 - Initial URL standardization)
 */
public final class StudyOperationsApiConstants {

    private StudyOperationsApiConstants() {
        // Prevent instantiation
    }

    // ============================================================
    // Base Paths
    // ============================================================

    /**
     * Base path for all v1 Study Operations APIs
     */
    public static final String API_V1_BASE = "/api/v1/study-operations";

    // ============================================================
    // Visit Configuration Paths
    // ============================================================

    /**
     * Path for unscheduled visit configuration management.
     * 
     * <p>Manages system-wide unscheduled visit types (Discontinuation, AE, Safety, etc.)
     * that are automatically created during study builds.</p>
     * 
     * <p><b>New URL:</b> /api/v1/study-operations/visit-config/unscheduled</p>
     * 
     * @since 1.0
     */
    public static final String VISIT_CONFIG_UNSCHEDULED_PATH = API_V1_BASE + "/visit-config/unscheduled";

    /**
     * Legacy path for unscheduled visit configuration.
     * 
     * <p><b>Deprecated:</b> Use {@link #VISIT_CONFIG_UNSCHEDULED_PATH} instead.</p>
     * <p><b>Old URL:</b> /api/clinops/unscheduled-visit-config</p>
     * <p><b>Sunset Date:</b> April 2026 (6 months from migration)</p>
     * 
     * @deprecated Use {@link #VISIT_CONFIG_UNSCHEDULED_PATH} instead.
     *             This legacy path is maintained for backward compatibility only.
     * @since 1.0
     */
    @Deprecated
    public static final String LEGACY_CLINOPS_UNSCHEDULED_VISIT_CONFIG = "/api/clinops/unscheduled-visit-config";

    // ============================================================
    // Future Paths (Placeholders)
    // ============================================================

    // Uncomment when migrating data capture endpoints
    // public static final String DATA_CAPTURE_PATH = API_V1_BASE + "/data-capture";

    // Uncomment when migrating patient enrollment endpoints
    // public static final String ENROLLMENT_PATH = API_V1_BASE + "/enrollment";
}
