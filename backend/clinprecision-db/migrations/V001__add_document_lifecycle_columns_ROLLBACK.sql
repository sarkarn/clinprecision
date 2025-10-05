-- ============================================================================
-- ROLLBACK Migration: Remove Document Lifecycle Columns from study_documents
-- Date: 2025-10-05
-- Purpose: Rollback V001__add_document_lifecycle_columns.sql if needed
-- WARNING: This will permanently delete data in these columns!
-- ============================================================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_study_documents_is_deleted ON study_documents;
DROP INDEX IF EXISTS idx_study_documents_approved_at ON study_documents;
DROP INDEX IF EXISTS idx_study_documents_archived_by ON study_documents;
DROP INDEX IF EXISTS idx_study_documents_approved_by ON study_documents;

-- Drop foreign key constraints
ALTER TABLE study_documents DROP FOREIGN KEY IF EXISTS fk_study_documents_archived_by;
ALTER TABLE study_documents DROP FOREIGN KEY IF EXISTS fk_study_documents_approved_by;

-- Drop columns
ALTER TABLE study_documents DROP COLUMN IF EXISTS is_deleted;
ALTER TABLE study_documents DROP COLUMN IF EXISTS superseded_by_document_id;
ALTER TABLE study_documents DROP COLUMN IF EXISTS archived_at;
ALTER TABLE study_documents DROP COLUMN IF EXISTS archived_by;
ALTER TABLE study_documents DROP COLUMN IF EXISTS approved_at;
ALTER TABLE study_documents DROP COLUMN IF EXISTS approved_by;

-- ============================================================================
-- Verification Query (run this after rollback to verify)
-- ============================================================================
-- DESCRIBE study_documents;
