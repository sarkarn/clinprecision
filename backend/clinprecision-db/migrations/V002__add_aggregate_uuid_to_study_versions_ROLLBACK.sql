-- =====================================================
-- ROLLBACK: Remove aggregate_uuid from study_versions
-- Version: V002
-- Date: 2025-10-05
-- ⚠️ WARNING: This will delete the aggregate_uuid column and its data
-- =====================================================

-- Drop index first
DROP INDEX IF EXISTS idx_study_versions_aggregate_uuid ON study_versions;

-- Remove aggregate_uuid column
ALTER TABLE study_versions
    DROP COLUMN aggregate_uuid;

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this after rollback to verify column is removed:
-- SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'study_versions' AND COLUMN_NAME = 'aggregate_uuid';
-- Expected result: 0
