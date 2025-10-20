package com.clinprecision.clinopsservice.studydesign.design.api;

/**
 * Study Design Management API Constants
 * 
 * Centralized URL definitions for study design, arms, form bindings, form definitions, and form templates.
 * Supports dual URL structure for backward compatibility during DDD migration.
 * 
 * URL Migration Patterns:
 * - Old: /api/clinops/study-design/*        → New: /api/v1/study-design/designs/*
 * - Old: /api/arms/*                        → New: /api/v1/study-design/arms/*
 * - Old: /api/form-bindings/*               → New: /api/v1/study-design/form-bindings/*
 * - Old: /api/form-definitions/*            → New: /api/v1/study-design/form-definitions/*
 * - Old: /api/form-templates/*              → New: /api/v1/study-design/form-templates/*
 * 
 * Deprecation Timeline:
 * - Current Date: October 19, 2025
 * - Sunset Date: April 19, 2026 (6 months)
 * 
 * @author DDD Migration Team
 * @version 1.0
 * @since October 2025 - Module 1.3 Study Design Management
 */
public class StudyDesignApiConstants {
    
    // ==================== BASE PATHS ====================
    
    /**
     * Base path for all v1 study design APIs
     */
    public static final String API_V1_BASE = "/api/v1/study-design";
    
    /**
     * New DDD-aligned base path for study design operations
     * Path: /api/v1/study-design/designs
     */
    public static final String DESIGNS_PATH = API_V1_BASE + "/designs";
    
    /**
     * New DDD-aligned base path for study arm operations
     * Path: /api/v1/study-design/arms
     */
    public static final String ARMS_PATH = API_V1_BASE + "/arms";
    
    /**
     * New DDD-aligned base path for form binding operations
     * Path: /api/v1/study-design/form-bindings
     */
    public static final String FORM_BINDINGS_PATH = API_V1_BASE + "/form-bindings";
    
    /**
     * New DDD-aligned base path for form definition operations
     * Path: /api/v1/study-design/form-definitions
     */
    public static final String FORM_DEFINITIONS_PATH = API_V1_BASE + "/form-definitions";
    
    /**
     * New DDD-aligned base path for form template operations
     * Path: /api/v1/study-design/form-templates
     */
    public static final String FORM_TEMPLATES_PATH = API_V1_BASE + "/form-templates";
    
    /**
     * New DDD-aligned base path for document management operations
     * Path: /api/v1/study-design/documents
     */
    public static final String DOCUMENTS_PATH = API_V1_BASE + "/documents";
    
    /**
     * New DDD-aligned base path for metadata management operations
     * Path: /api/v1/study-design/metadata/codelists
     */
    public static final String METADATA_CODELISTS_PATH = API_V1_BASE + "/metadata/codelists";
    
    /**
     * Study-centric base path (bridge pattern)
     * Path: /api/v1/study-design/studies
     */
    public static final String STUDIES_PATH = API_V1_BASE + "/studies";
    
    // ==================== LEGACY BASE PATHS (DEPRECATED) ====================
    
    /**
     * Legacy base path for study design operations
     * @deprecated Use {@link #DESIGNS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_CLINOPS_STUDY_DESIGN = "/api/clinops/study-design";
    
    /**
     * Legacy base path for arm operations
     * @deprecated Use {@link #ARMS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_ARMS = "/api/arms";
    
    /**
     * Legacy base path for form binding operations
     * @deprecated Use {@link #FORM_BINDINGS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_FORM_BINDINGS = "/api/form-bindings";
    
    /**
     * Legacy base path for form definition operations
     * @deprecated Use {@link #FORM_DEFINITIONS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_FORM_DEFINITIONS = "/api/form-definitions";
    
    /**
     * Legacy base path for form template operations
     * @deprecated Use {@link #FORM_TEMPLATES_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_FORM_TEMPLATES = "/api/form-templates";
    
    /**
     * Legacy base path for document management operations
     * @deprecated Use {@link #DOCUMENTS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_DOCUMENTS = "/api/v1/documents";
    
    /**
     * Legacy base path for metadata management operations (admin codelists)
     * @deprecated Use {@link #METADATA_CODELISTS_PATH} instead. Will be removed on April 19, 2026.
     */
    @Deprecated
    public static final String LEGACY_ADMIN_CODELISTS = "/api/admin/codelists";
    
    // ==================== STUDY DESIGN ENDPOINT PATHS ====================
    
    /**
     * Get/Update/Delete specific study design
     * Path: /{studyDesignId}
     */
    public static final String BY_ID = "/{studyDesignId}";
    
    /**
     * Study arms collection
     * Path: /{studyDesignId}/arms
     */
    public static final String ARMS = "/{studyDesignId}/arms";
    
    /**
     * Specific study arm
     * Path: /{studyDesignId}/arms/{armId}
     */
    public static final String ARM_BY_ID = "/{studyDesignId}/arms/{armId}";
    
    /**
     * Visit definitions collection
     * Path: /{studyDesignId}/visits
     */
    public static final String VISITS = "/{studyDesignId}/visits";
    
    /**
     * Specific visit definition
     * Path: /{studyDesignId}/visits/{visitId}
     */
    public static final String VISIT_BY_ID = "/{studyDesignId}/visits/{visitId}";
    
    /**
     * General (non-arm-specific) visits
     * Path: /{studyDesignId}/visits/general
     */
    public static final String GENERAL_VISITS = "/{studyDesignId}/visits/general";
    
    /**
     * Form assignments collection
     * Path: /{studyDesignId}/form-assignments
     */
    public static final String FORM_ASSIGNMENTS = "/{studyDesignId}/form-assignments";
    
    /**
     * Specific form assignment
     * Path: /{studyDesignId}/form-assignments/{assignmentId}
     */
    public static final String FORM_ASSIGNMENT_BY_ID = "/{studyDesignId}/form-assignments/{assignmentId}";
    
    /**
     * Design progress
     * Path: /{studyDesignId}/design-progress
     */
    public static final String DESIGN_PROGRESS = "/{studyDesignId}/design-progress";
    
    /**
     * Initialize design progress
     * Path: /{studyDesignId}/design-progress/initialize
     */
    public static final String DESIGN_PROGRESS_INIT = "/{studyDesignId}/design-progress/initialize";
    
    // ==================== BRIDGE ENDPOINTS (STUDY-CENTRIC) ====================
    
    /**
     * Study visits (bridge pattern with auto-initialization)
     * Path: /studies/{studyId}/visits
     */
    public static final String STUDY_VISITS = "/studies/{studyId}/visits";
    
    /**
     * Specific study visit (bridge pattern)
     * Path: /studies/{studyId}/visits/{visitId}
     */
    public static final String STUDY_VISIT_BY_ID = "/studies/{studyId}/visits/{visitId}";
    
    /**
     * Study arms (bridge pattern with auto-initialization)
     * Path: /studies/{studyId}/arms
     */
    public static final String STUDY_ARMS = "/studies/{studyId}/arms";
    
    // ==================== ARM ENDPOINT PATHS ====================
    
    /**
     * Specific arm (bridge pattern - by arm ID only)
     * Path: /{armId}
     */
    public static final String ARM_ID = "/{armId}";
    
    // ==================== FORM BINDING ENDPOINT PATHS ====================
    
    /**
     * Specific form binding (bridge pattern - by binding ID only)
     * Path: /{bindingId}
     */
    public static final String BINDING_ID = "/{bindingId}";
    
    // ==================== FORM DEFINITION ENDPOINT PATHS ====================
    
    /**
     * Specific form definition
     * Path: /{id}
     */
    public static final String FORM_DEF_BY_ID = "/{id}";
    
    /**
     * Form definitions by study
     * Path: /study/{studyId}
     */
    public static final String FORM_DEF_BY_STUDY = "/study/{studyId}";
    
    /**
     * Form definitions by template
     * Path: /template/{templateId}
     */
    public static final String FORM_DEF_BY_TEMPLATE = "/template/{templateId}";
    
    /**
     * Create form definition from template
     * Path: /from-template
     */
    public static final String FORM_DEF_FROM_TEMPLATE = "/from-template";
    
    /**
     * Get outdated form definitions
     * Path: /outdated-templates
     */
    public static final String FORM_DEF_OUTDATED = "/outdated-templates";
    
    /**
     * Search form definitions within a study
     * Path: /study/{studyId}/search
     */
    public static final String FORM_DEF_SEARCH = "/study/{studyId}/search";
    
    /**
     * Count form definitions in a study
     * Path: /study/{studyId}/count
     */
    public static final String FORM_DEF_COUNT = "/study/{studyId}/count";
    
    /**
     * Template usage count
     * Path: /template/{templateId}/usage-count
     */
    public static final String FORM_DEF_TEMPLATE_USAGE = "/template/{templateId}/usage-count";
    
    // Form Definition Lifecycle Actions
    
    /**
     * Lock form definition
     * Path: /{id}/lifecycle/lock
     */
    public static final String FORM_DEF_LOCK = "/{id}/lifecycle/lock";
    
    /**
     * Unlock form definition
     * Path: /{id}/lifecycle/unlock
     */
    public static final String FORM_DEF_UNLOCK = "/{id}/lifecycle/unlock";
    
    /**
     * Approve form definition
     * Path: /{id}/lifecycle/approve
     */
    public static final String FORM_DEF_APPROVE = "/{id}/lifecycle/approve";
    
    /**
     * Retire form definition
     * Path: /{id}/lifecycle/retire
     */
    public static final String FORM_DEF_RETIRE = "/{id}/lifecycle/retire";
    
    // ==================== FORM TEMPLATE ENDPOINT PATHS ====================
    
    /**
     * Specific form template
     * Path: /{id}
     */
    public static final String TEMPLATE_BY_ID = "/{id}";
    
    /**
     * Increment template usage
     * Path: /{templateId}/increment-usage
     */
    public static final String TEMPLATE_INCREMENT_USAGE = "/{templateId}/increment-usage";
    
    /**
     * Search form templates
     * Path: /search
     */
    public static final String TEMPLATE_SEARCH = "/search";
    
    /**
     * Template statistics
     * Path: /stats
     */
    public static final String TEMPLATE_STATS = "/stats";
    
    // Form Template Lifecycle Actions
    
    /**
     * Publish form template
     * Path: /{id}/lifecycle/publish
     */
    public static final String TEMPLATE_PUBLISH = "/{id}/lifecycle/publish";
    
    /**
     * Archive form template
     * Path: /{id}/lifecycle/archive
     */
    public static final String TEMPLATE_ARCHIVE = "/{id}/lifecycle/archive";
    
    // ==================== DEPRECATION METADATA ====================
    
    /**
     * Sunset date for deprecated endpoints (6 months from now)
     * Format: RFC 7231 (HTTP Date)
     */
    public static final String SUNSET_DATE = "2026-04-19";
    
    /**
     * Deprecation message for old endpoints
     */
    public static final String DEPRECATION_MESSAGE = 
        "This endpoint is deprecated. Please migrate to /api/v1/study-design/* endpoints. " +
        "See deprecation headers for new URL.";
    
    // ==================== UTILITY METHODS ====================
    
    /**
     * Build canonical URL for a study design resource
     * 
     * @param studyDesignId Study design aggregate UUID
     * @return Canonical URL: /api/v1/study-design/designs/{studyDesignId}
     */
    public static String buildStudyDesignUrl(java.util.UUID studyDesignId) {
        return DESIGNS_PATH + "/" + studyDesignId;
    }
    
    /**
     * Build canonical URL for a study arm
     * 
     * @param armId Arm UUID
     * @return Canonical URL: /api/v1/study-design/arms/{armId}
     */
    public static String buildArmUrl(java.util.UUID armId) {
        return ARMS_PATH + "/" + armId;
    }
    
    /**
     * Build canonical URL for a form binding
     * 
     * @param bindingId Binding UUID
     * @return Canonical URL: /api/v1/study-design/form-bindings/{bindingId}
     */
    public static String buildFormBindingUrl(java.util.UUID bindingId) {
        return FORM_BINDINGS_PATH + "/" + bindingId;
    }
    
    /**
     * Check if a request URI uses deprecated URL pattern
     * 
     * @param requestUri The incoming request URI
     * @return true if URL is deprecated, false otherwise
     */
    public static boolean isDeprecatedUrl(String requestUri) {
        if (requestUri == null || requestUri.isEmpty()) {
            return false;
        }
        
        return requestUri.startsWith(LEGACY_CLINOPS_STUDY_DESIGN) ||
               requestUri.startsWith(LEGACY_ARMS) ||
               requestUri.startsWith(LEGACY_FORM_BINDINGS) ||
               requestUri.startsWith(LEGACY_FORM_DEFINITIONS) ||
               requestUri.startsWith(LEGACY_FORM_TEMPLATES);
    }
    
    /**
     * Get the new URL equivalent for a deprecated URL
     * Converts old URL patterns to new DDD-aligned patterns
     * 
     * @param oldUrl The deprecated URL
     * @return The new equivalent URL, or null if oldUrl is null
     */
    public static String getNewUrlEquivalent(String oldUrl) {
        if (oldUrl == null || oldUrl.isEmpty()) {
            return null;
        }
        
        return oldUrl
            .replace(LEGACY_CLINOPS_STUDY_DESIGN, DESIGNS_PATH)
            .replace(LEGACY_ARMS, ARMS_PATH)
            .replace(LEGACY_FORM_BINDINGS, FORM_BINDINGS_PATH)
            .replace(LEGACY_FORM_DEFINITIONS, FORM_DEFINITIONS_PATH)
            .replace(LEGACY_FORM_TEMPLATES, FORM_TEMPLATES_PATH);
    }
    
    /**
     * Determine which legacy base path a URL uses
     * 
     * @param requestUri The incoming request URI
     * @return The legacy base path identifier, or null if not deprecated
     */
    public static String getLegacyBasePath(String requestUri) {
        if (requestUri == null || requestUri.isEmpty()) {
            return null;
        }
        
        if (requestUri.startsWith(LEGACY_CLINOPS_STUDY_DESIGN)) {
            return "LEGACY_CLINOPS_STUDY_DESIGN";
        } else if (requestUri.startsWith(LEGACY_ARMS)) {
            return "LEGACY_ARMS";
        } else if (requestUri.startsWith(LEGACY_FORM_BINDINGS)) {
            return "LEGACY_FORM_BINDINGS";
        } else if (requestUri.startsWith(LEGACY_FORM_DEFINITIONS)) {
            return "LEGACY_FORM_DEFINITIONS";
        } else if (requestUri.startsWith(LEGACY_FORM_TEMPLATES)) {
            return "LEGACY_FORM_TEMPLATES";
        }
        
        return null;
    }
    
    // ==================== PRIVATE CONSTRUCTOR ====================
    
    /**
     * Private constructor to prevent instantiation of utility class
     */
    private StudyDesignApiConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
}
