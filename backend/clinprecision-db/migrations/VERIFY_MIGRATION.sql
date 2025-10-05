-- ============================================================================
-- Quick Test Script: Verify Migration Success
-- Date: 2025-10-05
-- Purpose: Quick validation that migration completed successfully
-- ============================================================================

-- Test 1: Check that all new columns exist
SELECT 'Test 1: Checking new columns exist...' AS test;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_documents'
  AND COLUMN_NAME IN ('approved_by', 'approved_at', 'archived_by', 'archived_at', 'superseded_by_document_id', 'is_deleted')
ORDER BY COLUMN_NAME;

-- Expected: 6 rows returned
-- approved_at, approved_by, archived_at, archived_by, is_deleted, superseded_by_document_id

-- Test 2: Verify data types are correct
SELECT 'Test 2: Verifying data types...' AS test;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'study_documents' 
              AND COLUMN_NAME = 'approved_by' 
              AND DATA_TYPE = 'bigint'
        ) THEN '✅ approved_by is BIGINT'
        ELSE '❌ ERROR: approved_by is not BIGINT'
    END AS approved_by_check;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'study_documents' 
              AND COLUMN_NAME = 'archived_by' 
              AND DATA_TYPE = 'bigint'
        ) THEN '✅ archived_by is BIGINT'
        ELSE '❌ ERROR: archived_by is not BIGINT'
    END AS archived_by_check;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'study_documents' 
              AND COLUMN_NAME = 'is_deleted' 
              AND DATA_TYPE = 'tinyint'  -- MySQL boolean is tinyint
        ) THEN '✅ is_deleted is BOOLEAN (tinyint)'
        ELSE '❌ ERROR: is_deleted is not BOOLEAN'
    END AS is_deleted_check;

-- Test 3: Check foreign key constraints
SELECT 'Test 3: Checking foreign keys...' AS test;
SELECT 
    CONSTRAINT_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_documents'
  AND CONSTRAINT_NAME IN ('fk_study_documents_approved_by', 'fk_study_documents_archived_by');

-- Expected: 2 rows returned
-- fk_study_documents_approved_by -> users(id)
-- fk_study_documents_archived_by -> users(id)

-- Test 4: Check indexes
SELECT 'Test 4: Checking indexes...' AS test;
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_documents'
  AND INDEX_NAME IN (
      'idx_study_documents_approved_by',
      'idx_study_documents_archived_by',
      'idx_study_documents_approved_at',
      'idx_study_documents_is_deleted'
  )
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Expected: 4 rows returned (one for each index)

-- Test 5: Test inserting a record with new columns
SELECT 'Test 5: Testing insert with new columns...' AS test;

-- Create test record (will be deleted at end)
INSERT INTO study_documents (
    aggregate_uuid, 
    study_id, 
    name, 
    document_type, 
    file_name, 
    file_path, 
    file_size, 
    uploaded_by,
    approved_by,
    approved_at,
    status,
    is_deleted
) 
SELECT 
    UUID() as aggregate_uuid,
    MIN(id) as study_id,
    'TEST_MIGRATION_DOCUMENT' as name,
    'PROTOCOL' as document_type,
    'test_migration.pdf' as file_name,
    '/test/migration.pdf' as file_path,
    9999 as file_size,
    MIN(u1.id) as uploaded_by,
    MIN(u2.id) as approved_by,
    NOW() as approved_at,
    'CURRENT' as status,
    FALSE as is_deleted
FROM studies
CROSS JOIN (SELECT id FROM users LIMIT 1) u1
CROSS JOIN (SELECT id FROM users LIMIT 1 OFFSET 1) u2;

-- Verify insert worked
SELECT 
    id,
    name,
    uploaded_by,
    approved_by,
    approved_at IS NOT NULL as has_approval_date,
    is_deleted
FROM study_documents
WHERE name = 'TEST_MIGRATION_DOCUMENT';

-- Test 6: Test updating approval and archival
SELECT 'Test 6: Testing update with archival...' AS test;

UPDATE study_documents
SET 
    archived_by = approved_by,
    archived_at = NOW(),
    status = 'ARCHIVED'
WHERE name = 'TEST_MIGRATION_DOCUMENT';

-- Verify update worked
SELECT 
    id,
    name,
    approved_by,
    archived_by,
    archived_at IS NOT NULL as has_archival_date,
    status
FROM study_documents
WHERE name = 'TEST_MIGRATION_DOCUMENT';

-- Test 7: Clean up test record
SELECT 'Test 7: Cleaning up test record...' AS test;

DELETE FROM study_documents 
WHERE name = 'TEST_MIGRATION_DOCUMENT';

-- Verify deletion
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Test record deleted successfully'
        ELSE '⚠️ WARNING: Test record still exists'
    END AS cleanup_status
FROM study_documents
WHERE name = 'TEST_MIGRATION_DOCUMENT';

-- Final Summary
SELECT 'MIGRATION VERIFICATION COMPLETE' AS summary;
SELECT '=====================================' AS separator;
SELECT 'If all tests passed, migration was successful!' AS result;
SELECT 'Next step: Run Java unit tests with: mvn clean test' AS next_action;
