-- ========================================================
-- DROP ALL BUSINESS LOGIC FROM DATABASE (Complete Cleanup)
-- ========================================================
-- 
-- Purpose: Remove ALL business logic from MySQL database
-- Context: CQRS/Event Sourcing + Traditional Services handle all business rules in Java
-- Date: October 4, 2025
--
-- IMPORTANT: 
-- - Only run this if you're using CQRS/Event Sourcing OR traditional Java services
-- - These procedures/triggers are NOT needed when aggregates/services handle business logic
-- - This is a COMPLETE cleanup including document management AND protocol versioning
--
-- ========================================================

USE clinprecisiondb;

-- ========================================================
-- SECTION 1: STATUS COMPUTATION PROCEDURES (Business Logic)
-- ========================================================
-- Replaced by: StudyDesignAggregate state management in Java

DROP PROCEDURE IF EXISTS ComputeAndUpdateStudyStatus;
DROP PROCEDURE IF EXISTS DetermineStudyStatusFromVersions;
DROP PROCEDURE IF EXISTS LogStudyStatusChange;
DROP PROCEDURE IF EXISTS ManuallyComputeStudyStatus;
DROP PROCEDURE IF EXISTS BatchComputeAllStudyStatuses;
DROP PROCEDURE IF EXISTS GetStudyStatusComputationHistory;

-- ========================================================
-- SECTION 2: PROTOCOL VERSION PROCEDURES (Business Logic)
-- ========================================================
-- Replaced by: 
--   - ProtocolVersionAggregate (DDD approach) OR
--   - StudyVersionService.createVersion() / activateVersion() (Traditional approach)

DROP PROCEDURE IF EXISTS CreateStudyVersion;
DROP PROCEDURE IF EXISTS ActivateStudyVersion;

-- ========================================================
-- SECTION 3: DOCUMENT MANAGEMENT PROCEDURES (Business Logic)
-- ========================================================
-- Replaced by: StudyDocumentCommandService / StudyDocumentQueryService

DROP PROCEDURE IF EXISTS DeleteStudyDocument;

-- ========================================================
-- SECTION 4: STATUS COMPUTATION TRIGGERS (Business Logic)
-- ========================================================
-- Replaced by: Event handlers in projection layer (explicit, not hidden)

-- Version-related triggers
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_delete;

-- Amendment-related triggers
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_delete;

-- ========================================================
-- SECTION 5: VERSION MANAGEMENT TRIGGERS (Business Logic)
-- ========================================================
-- Replaced by: Explicit business logic in services/aggregates

-- Amendment auto-numbering (business rule - should be in Java)
DROP TRIGGER IF EXISTS trg_amendment_number_auto_increment;

-- Amendment count update (business rule - should be in Java)
DROP TRIGGER IF EXISTS trg_update_study_amendment_count_insert;
DROP TRIGGER IF EXISTS trg_update_study_amendment_count_delete;

-- ========================================================
-- SECTION 6: PROTOCOL VERSION VIEWS (Query Helpers)
-- ========================================================
-- Replaced by: JPA repository queries + REST API endpoints

DROP VIEW IF EXISTS active_study_versions;
DROP VIEW IF EXISTS study_version_history;
DROP VIEW IF EXISTS pending_regulatory_approvals;

-- ========================================================
-- SECTION 7: DOCUMENT MANAGEMENT VIEWS (Query Helpers)
-- ========================================================
-- Replaced by: StudyDocumentQueryService methods

DROP VIEW IF EXISTS v_study_documents_with_users;
DROP VIEW IF EXISTS v_study_documents_formatted;

-- ========================================================
-- SECTION 8: STATUS COMPUTATION VIEWS (Query Helpers)
-- ========================================================
-- Replaced by: Service layer queries + event store

DROP VIEW IF EXISTS recent_status_changes;
DROP VIEW IF EXISTS studies_frequent_status_changes;
DROP VIEW IF EXISTS status_computation_errors;

-- ========================================================
-- SECTION 9: DOCUMENT MANAGEMENT FUNCTIONS (Business Logic)
-- ========================================================
-- Replaced by: Java utility methods

DROP FUNCTION IF EXISTS FormatFileSize;

-- ========================================================
-- SECTION 10: VALIDATION FUNCTIONS (Business Logic)
-- ========================================================
-- Replaced by: Aggregate command validation

DROP FUNCTION IF EXISTS is_study_database_ready;

-- ========================================================
-- SECTION 11: RENAME LEGACY AUDIT TABLE (Keep Historical Data)
-- ========================================================
-- Don't drop - contains historical data
-- But rename to indicate it's legacy and not actively used

-- Check if table exists before renaming
SET @table_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'clinprecisiondb' 
    AND TABLE_NAME = 'study_status_computation_log'
);

SET @rename_query = IF(
    @table_exists > 0,
    'RENAME TABLE study_status_computation_log TO study_status_computation_log_legacy',
    'SELECT "Table study_status_computation_log does not exist, skipping rename" AS message'
);

PREPARE stmt FROM @rename_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================================
-- SECTION 12: REVOKE PERMISSIONS (Cleanup)
-- ========================================================
-- Note: These may fail if permissions were never granted or user doesn't exist
-- That's OK - just cleanup

-- Revoke procedure permissions
REVOKE EXECUTE ON PROCEDURE DeleteStudyDocument FROM 'clinprecadmin'@'localhost';
REVOKE EXECUTE ON PROCEDURE CreateStudyVersion FROM 'clinprecadmin'@'localhost';
REVOKE EXECUTE ON PROCEDURE ActivateStudyVersion FROM 'clinprecadmin'@'localhost';

-- Revoke function permissions
REVOKE EXECUTE ON FUNCTION FormatFileSize FROM 'clinprecadmin'@'localhost';

-- Revoke view permissions
REVOKE SELECT ON v_study_documents_with_users FROM 'clinprecadmin'@'localhost';
REVOKE SELECT ON v_study_documents_formatted FROM 'clinprecadmin'@'localhost';

-- ========================================================
-- SECTION 13: REMOVE UNUSED DASHBOARD VIEWS
-- ========================================================
-- These views are NOT used by any Java code
-- All functionality is provided by JPA repositories
-- Verified via grep search: 0 matches in Java files

DROP VIEW IF EXISTS v_study_overview_summary;
DROP VIEW IF EXISTS v_study_metrics_summary;
DROP VIEW IF EXISTS v_study_design_progress_summary;

-- ========================================================
-- SECTION 14: KEEP UTILITY PROCEDURES (Not Business Logic)
-- ========================================================
-- 
-- These are OK to keep - they're database utilities, not business rules:
-- 
-- ✅ InitializeStudyDesignProgress - Progress tracking helper (wizard state)
-- ✅ MarkPhaseCompleted - Progress helper (wizard state)
-- ✅ get_study_database_build_summary - Query helper (reporting)
-- 
-- Why keep them?
-- - They're pure database operations (not domain business logic)
-- - They help with database-specific tasks (progress tracking, reporting)
-- - They don't contain business rules (just data manipulation)
-- 
-- ========================================================

-- ========================================================
-- SECTION 15: KEEP AUDIT TRIGGERS (Not Business Logic)
-- ========================================================
-- 
-- These are OK to keep - they're audit trail, not business rules:
-- 
-- ✅ after_form_data_update - Audit history for compliance
-- ✅ after_form_data_insert - Audit history for compliance
-- ✅ code_lists_audit_insert - Audit trail for code lists
-- ✅ code_lists_audit_update - Audit trail for code lists
-- ✅ code_lists_audit_delete - Audit trail for code lists
-- 
-- Why keep them?
-- - FDA 21 CFR Part 11 compliance requires audit trails
-- - They don't contain business logic (just record-keeping)
-- - Event store handles aggregate audit, these handle form data audit
-- - Complement event sourcing for non-aggregate entities
-- 
-- ========================================================



-- ========================================================
-- VERIFICATION QUERIES
-- ========================================================

SELECT '=====================================' AS separator;
SELECT 'VERIFICATION: Remaining Database Objects' AS title;
SELECT '=====================================' AS separator;

-- Check remaining procedures
SELECT '1. REMAINING STORED PROCEDURES' AS section;
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'clinprecisiondb'
  AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

SELECT '' AS blank_line;

-- Check remaining functions
SELECT '2. REMAINING FUNCTIONS' AS section;
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'clinprecisiondb'
  AND ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

SELECT '' AS blank_line;

-- Check remaining triggers
SELECT '3. REMAINING TRIGGERS' AS section;
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'clinprecisiondb'
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;

SELECT '' AS blank_line;

-- Check remaining views
SELECT '4. REMAINING VIEWS' AS section;
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'clinprecisiondb'
ORDER BY TABLE_NAME;

-- ========================================================
-- EXPECTED REMAINING OBJECTS (Should Still Exist)
-- ========================================================

SELECT '' AS blank_line;
SELECT '=====================================' AS separator;
SELECT 'EXPECTED REMAINING OBJECTS' AS title;
SELECT '=====================================' AS separator;

SELECT 'PROCEDURES: InitializeStudyDesignProgress, MarkPhaseCompleted, get_study_database_build_summary' AS expected;
SELECT 'FUNCTIONS: (None expected - all removed)' AS expected;
SELECT 'TRIGGERS: after_form_data_update, after_form_data_insert, code_lists_audit_* (5 total)' AS expected;
SELECT 'VIEWS: (None expected - all removed or unused)' AS expected;

-- ========================================================
-- SUCCESS MESSAGE
-- ========================================================

SELECT '' AS blank_line;
SELECT '=====================================' AS separator;
SELECT '✅ CLEANUP COMPLETE' AS status;
SELECT '=====================================' AS separator;

SELECT 'All business logic removed from database' AS result;
SELECT 'Business rules now handled by Aggregates/Services in Java' AS implementation;
SELECT 'Event store provides complete audit trail' AS audit;
SELECT 'JPA repositories provide data access' AS data_access;
SELECT 'REST API provides frontend integration' AS frontend;

SELECT '' AS blank_line;
SELECT '=====================================' AS separator;
SELECT 'WHAT WAS REMOVED' AS section;
SELECT '=====================================' AS separator;

SELECT '❌ CreateStudyVersion procedure → ✅ StudyVersionService.createVersion()' AS replacement;
SELECT '❌ ActivateStudyVersion procedure → ✅ StudyVersionService.activateVersion()' AS replacement;
SELECT '❌ DeleteStudyDocument procedure → ✅ StudyDocumentCommandService.deleteDocument()' AS replacement;
SELECT '❌ FormatFileSize function → ✅ StudyDocumentQueryService.formatFileSize()' AS replacement;
SELECT '❌ active_study_versions view → ✅ StudyVersionRepository.findByStatus(ACTIVE)' AS replacement;
SELECT '❌ pending_regulatory_approvals view → ✅ REST API query' AS replacement;
SELECT '❌ v_study_documents_* views → ✅ StudyDocumentQueryService methods' AS replacement;
SELECT '❌ Status computation triggers → ✅ Event handlers in projection layer' AS replacement;
SELECT '❌ Amendment auto-increment trigger → ✅ Service layer logic' AS replacement;

SELECT '' AS blank_line;
SELECT '=====================================' AS separator;
SELECT 'WHAT WAS KEPT (AND WHY)' AS section;
SELECT '=====================================' AS separator;

SELECT '✅ InitializeStudyDesignProgress → Database utility (not business logic)' AS kept;
SELECT '✅ MarkPhaseCompleted → Database utility (not business logic)' AS kept;
SELECT '✅ get_study_database_build_summary → Query helper (not business logic)' AS kept;
SELECT '✅ after_form_data_* triggers → Audit trail (FDA compliance)' AS kept;
SELECT '✅ code_lists_audit_* triggers → Audit trail (FDA compliance)' AS kept;
SELECT '❌ v_study_overview_summary → Removed (replaced by JPA repository queries)' AS removed;
SELECT '❌ v_study_metrics_summary → Removed (replaced by JPA repository queries)' AS removed;
SELECT '❌ v_study_design_progress_summary → Removed (replaced by JPA repository queries)' AS removed;

SELECT '' AS blank_line;
SELECT '=====================================' AS separator;
SELECT 'Phase 5 Status: ✅ COMPLETE' AS final_status;
SELECT '=====================================' AS separator;

-- ========================================================
-- INSTRUCTIONS FOR RUNNING THIS SCRIPT
-- ========================================================
-- 
-- 1. BACKUP FIRST:
--    mysqldump clinprecisiondb > backup_before_cleanup_$(date +%Y%m%d).sql
-- 
-- 2. RUN THIS SCRIPT:
--    mysql clinprecisiondb < drop_all_business_logic_complete.sql
-- 
-- 3. VERIFY:
--    Review the verification queries output
--    Ensure only expected objects remain
-- 
-- 4. TEST:
--    Run your application
--    Verify all functionality works through Java services
--    Check REST API endpoints respond correctly
-- 
-- 5. MONITOR:
--    Watch for any errors about missing procedures/views
--    If found, investigate if any legacy code still references them
-- 
-- ========================================================
