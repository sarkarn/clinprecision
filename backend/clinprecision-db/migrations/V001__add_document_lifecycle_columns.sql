-- ============================================================================
-- Migration: Add Document Lifecycle Columns to study_documents table
-- Date: 2025-10-05
-- Purpose: Add columns for document approval, archival, supersession, and deletion tracking
-- Related to: Phase 4 cleanup - User ID standardization (all user IDs are BIGINT)
-- ============================================================================

-- Add approved_by and approved_at columns
ALTER TABLE study_documents
    ADD COLUMN approved_by BIGINT NULL COMMENT 'User ID who approved the document (NULL for DRAFT)',
    ADD COLUMN approved_at TIMESTAMP NULL COMMENT 'Timestamp when document was approved';

-- Add archived_by and archived_at columns
ALTER TABLE study_documents
    ADD COLUMN archived_by BIGINT NULL COMMENT 'User ID who archived the document',
    ADD COLUMN archived_at TIMESTAMP NULL COMMENT 'Timestamp when document was archived';

-- Add superseded_by_document_id column
ALTER TABLE study_documents
    ADD COLUMN superseded_by_document_id VARCHAR(36) NULL COMMENT 'UUID of document that supersedes this one';

-- Add is_deleted flag for soft deletes
ALTER TABLE study_documents
    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Soft delete flag (only DRAFT documents can be deleted)';

-- Add foreign key constraints
ALTER TABLE study_documents
    ADD CONSTRAINT fk_study_documents_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_study_documents_archived_by FOREIGN KEY (archived_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_study_documents_approved_by ON study_documents(approved_by);
CREATE INDEX idx_study_documents_archived_by ON study_documents(archived_by);
CREATE INDEX idx_study_documents_approved_at ON study_documents(approved_at);
CREATE INDEX idx_study_documents_is_deleted ON study_documents(is_deleted);

-- ============================================================================
-- Verification Queries (run these after migration to verify)
-- ============================================================================
-- SELECT COUNT(*) FROM study_documents WHERE approved_by IS NOT NULL;
-- SELECT COUNT(*) FROM study_documents WHERE archived_by IS NOT NULL;
-- SELECT COUNT(*) FROM study_documents WHERE is_deleted = TRUE;
-- DESCRIBE study_documents;
