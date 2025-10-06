-- Migration: Add audit fields to visit_definitions table
-- Date: 2025-10-06
-- Description: Add created_by, updated_by, deleted_at, deleted_by, deletion_reason columns
--              to support full audit trail and soft delete functionality

USE clinprecisiondb;

-- Add audit fields to visit_definitions
ALTER TABLE visit_definitions
    ADD COLUMN created_by VARCHAR(100) NULL COMMENT 'User who created this visit definition' AFTER created_at,
    ADD COLUMN updated_by VARCHAR(100) NULL COMMENT 'User who last updated this visit definition' AFTER updated_at,
    ADD COLUMN deleted_at TIMESTAMP NULL COMMENT 'When this visit was soft deleted' AFTER is_deleted,
    ADD COLUMN deleted_by VARCHAR(100) NULL COMMENT 'User who deleted this visit definition' AFTER deleted_at,
    ADD COLUMN deletion_reason TEXT NULL COMMENT 'Reason for deleting this visit definition' AFTER deleted_by;

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'clinprecisiondb'
    AND TABLE_NAME = 'visit_definitions'
ORDER BY 
    ORDINAL_POSITION;

-- Expected output should include:
-- created_by, updated_by, deleted_at, deleted_by, deletion_reason
