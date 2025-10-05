-- ========================================================
-- DROP BUSINESS LOGIC FROM DATABASE (Phase 5 Cleanup)
-- ========================================================
-- 
-- Purpose: Remove all business logic from MySQL database
-- Context: CQRS/Event Sourcing handles all business rules in Java
-- Date: October 4, 2025
--
-- IMPORTANT: Only run this if you're using CQRS/Event Sourcing
-- These procedures are NOT needed when aggregates handle business logic
--
-- ========================================================

USE clinprecisiondb;

-- ========================================================
-- 1. DROP STATUS COMPUTATION PROCEDURES
-- ========================================================

DROP PROCEDURE IF EXISTS ComputeAndUpdateStudyStatus;
DROP PROCEDURE IF EXISTS DetermineStudyStatusFromVersions;
DROP PROCEDURE IF EXISTS LogStudyStatusChange;
DROP PROCEDURE IF EXISTS ManuallyComputeStudyStatus;
DROP PROCEDURE IF EXISTS BatchComputeAllStudyStatuses;
DROP PROCEDURE IF EXISTS GetStudyStatusComputationHistory;

-- ========================================================
-- 2. DROP STUDY VERSION PROCEDURES (Business Logic)
-- ========================================================

DROP PROCEDURE IF EXISTS CreateStudyVersion;
DROP PROCEDURE IF EXISTS ActivateStudyVersion;

-- ========================================================
-- 3. DROP BUSINESS LOGIC TRIGGERS
-- ========================================================

-- Status computation triggers
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_version_delete;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_change;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_insert;
DROP TRIGGER IF EXISTS trg_compute_study_status_on_amendment_delete;

-- Amendment auto-numbering trigger
DROP TRIGGER IF EXISTS trg_amendment_number_auto_increment;

-- Amendment count update triggers
DROP TRIGGER IF EXISTS trg_update_study_amendment_count_insert;
DROP TRIGGER IF EXISTS trg_update_study_amendment_count_delete;

-- ========================================================
-- 4. DROP BUSINESS LOGIC VIEWS
-- ========================================================

DROP VIEW IF EXISTS recent_status_changes;
DROP VIEW IF EXISTS studies_frequent_status_changes;
DROP VIEW IF EXISTS status_computation_errors;

-- ========================================================
-- 5. DROP BUSINESS LOGIC FUNCTIONS
-- ========================================================

DROP FUNCTION IF EXISTS is_study_database_ready;

-- ========================================================
-- 6. RENAME LEGACY AUDIT TABLE (Keep for Historical Data)
-- ========================================================

-- Don't drop - contains historical data
-- But rename to indicate it's legacy
RENAME TABLE study_status_computation_log TO study_status_computation_log_legacy;

-- ========================================================
-- 7. KEEP UTILITY PROCEDURES (Not Business Logic)
-- ========================================================

-- These are OK to keep - they're database utilities, not business rules:
-- ✅ InitializeStudyDesignProgress - Progress tracking helper
-- ✅ MarkPhaseCompleted - Progress helper
-- ✅ DeleteStudyDocument - Secure deletion with audit
-- ✅ get_study_database_build_summary - Query helper
-- ✅ FormatFileSize - Display formatting function

-- ========================================================
-- 8. KEEP AUDIT TRIGGERS (Not Business Logic)
-- ========================================================

-- These are OK to keep - they're audit trail, not business rules:
-- ✅ after_form_data_update - Audit history
-- ✅ after_form_data_insert - Audit history
-- ✅ code_lists_audit_insert - Audit trail
-- ✅ code_lists_audit_update - Audit trail
-- ✅ code_lists_audit_delete - Audit trail

-- ========================================================
-- VERIFICATION
-- ========================================================

-- Check remaining procedures
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'clinprecisiondb'
ORDER BY ROUTINE_TYPE, ROUTINE_NAME;

-- Check remaining triggers
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'clinprecisiondb'
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;

-- Check remaining views
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'clinprecisiondb'
ORDER BY TABLE_NAME;

-- ========================================================
-- SUCCESS MESSAGE
-- ========================================================

SELECT 'Phase 5 Complete: All business logic removed from database' AS status,
       'Business rules now handled by StudyDesignAggregate in Java' AS implementation,
       'Event store provides complete audit trail' AS audit_trail;
