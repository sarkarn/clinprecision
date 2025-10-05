-- =====================================================
-- Remove Obsolete Document Management Database Objects
-- =====================================================
-- Created: 2024
-- Purpose: Clean up stored procedures, functions, and views
--          that have been replaced by DDD/CQRS implementation
--
-- IMPORTANT: Create a backup before running this script!
--           mysqldump clinprecisiondb > backup_before_cleanup.sql
-- =====================================================

USE clinprecisiondb;

-- =====================================================
-- Step 1: Drop Views (must be done before dropping functions they depend on)
-- =====================================================

-- Drop formatted documents view (uses FormatFileSize function)
DROP VIEW IF EXISTS v_study_documents_formatted;
-- Replaced by: StudyDocumentQueryService.mapToDto() + formatFileSize()

-- Drop documents with users view
DROP VIEW IF EXISTS v_study_documents_with_users;
-- Replaced by: StudyDocumentQueryService.findByStudy() returns DocumentDTO with all needed info

-- =====================================================
-- Step 2: Drop Stored Procedures
-- =====================================================

-- Drop document deletion procedure
DROP PROCEDURE IF EXISTS DeleteStudyDocument;
-- Replaced by: StudyDocumentCommandService.deleteDocument() 
--              + DeleteStudyDocumentCommand
--              + StudyDocumentAuditProjection (automatic audit logging)

-- =====================================================
-- Step 3: Drop Functions
-- =====================================================

-- Drop file size formatting function
DROP FUNCTION IF EXISTS FormatFileSize;
-- Replaced by: StudyDocumentQueryService.formatFileSize() method in Java

-- =====================================================
-- Step 4: Revoke Permissions (cleanup)
-- =====================================================

-- Note: These REVOKE statements may fail if permissions were never granted
-- or if the user doesn't exist. That's OK - they're just cleanup.

-- Revoke permissions on dropped procedure
REVOKE EXECUTE ON PROCEDURE DeleteStudyDocument FROM 'clinprecadmin'@'localhost';

-- Revoke permissions on dropped function
REVOKE EXECUTE ON FUNCTION FormatFileSize FROM 'clinprecadmin'@'localhost';

-- Revoke permissions on dropped views
REVOKE SELECT ON v_study_documents_with_users FROM 'clinprecadmin'@'localhost';
REVOKE SELECT ON v_study_documents_formatted FROM 'clinprecadmin'@'localhost';

-- =====================================================
-- Step 5: Verify Permissions on Tables (should still exist)
-- =====================================================

-- These tables are still used by JPA repositories, so permissions should remain
-- Just showing for verification purposes - NO ACTION NEEDED

-- GRANT SELECT, INSERT, UPDATE, DELETE ON study_documents TO 'clinprecadmin'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON study_document_audit TO 'clinprecadmin'@'localhost';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if document-related procedures still exist (should return empty)
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'clinprecisiondb' 
  AND ROUTINE_NAME IN ('DeleteStudyDocument', 'FormatFileSize')
ORDER BY ROUTINE_NAME;

-- Check if document-related views still exist (should return empty)
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = 'clinprecisiondb' 
  AND TABLE_NAME IN ('v_study_documents_with_users', 'v_study_documents_formatted')
ORDER BY TABLE_NAME;

-- Verify tables still exist (should return 2 rows)
SELECT TABLE_NAME, TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'clinprecisiondb'
  AND TABLE_NAME IN ('study_documents', 'study_document_audit')
ORDER BY TABLE_NAME;

-- =====================================================
-- NOTES:
-- =====================================================
-- The following database objects are STILL NEEDED and should NOT be removed:
-- - study_documents table (used by StudyDocumentRepository)
-- - study_document_audit table (used by StudyDocumentAuditRepository)
-- - All tables used by Axon Event Store
-- - All form_data related triggers (used by form data management)
-- - All study_versions/study_amendments triggers (used by protocol versioning)
-- - All study design progress procedures (used by study design wizard)
-- - All study overview views (used by dashboard)
-- - All code_lists audit triggers (used by code list management)
-- - get_study_database_build_summary procedure (used by database builds)
-- =====================================================

-- Success message
SELECT 'Obsolete document management database objects removed successfully!' AS message;
SELECT 'Run verification queries above to confirm removal.' AS next_step;
