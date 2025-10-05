-- V003: Align study_versions table with ProtocolVersionEntity (DDD)
-- Purpose: Migrate from legacy schema to DDD/CQRS schema
-- Date: 2025-10-05
-- Strategy: Keep essential data, align with ProtocolVersionEntity

-- ==============================================================================
-- STEP 1: Modify aggregate_uuid to BINARY(16) for UUID type
-- ==============================================================================

ALTER TABLE study_versions
    MODIFY COLUMN aggregate_uuid BINARY(16) NULL COMMENT 'UUID linking to event-sourced aggregate';

-- ==============================================================================
-- STEP 2: Add DDD-required columns
-- ==============================================================================

ALTER TABLE study_versions
    ADD COLUMN study_aggregate_uuid BINARY(16) NULL COMMENT 'UUID of parent Study aggregate (DDD)',
    ADD COLUMN approval_comments TEXT NULL COMMENT 'Comments from approver',
    ADD COLUMN submission_date DATE NULL COMMENT 'Date submitted for approval',
    ADD COLUMN notes TEXT NULL COMMENT 'General notes (migrated from additional_notes)',
    ADD COLUMN previous_active_version_uuid BINARY(16) NULL COMMENT 'UUID of previously active version',
    ADD COLUMN withdrawal_reason TEXT NULL COMMENT 'Reason for withdrawal',
    ADD COLUMN withdrawn_by BIGINT NULL COMMENT 'User who withdrew version',
    ADD COLUMN created_at DATETIME NULL COMMENT 'Record creation timestamp',
    ADD COLUMN updated_at DATETIME NULL COMMENT 'Record update timestamp';

-- ==============================================================================
-- STEP 3: Migrate data from legacy columns to DDD columns
-- ==============================================================================

-- Migrate created_date to created_at
UPDATE study_versions 
SET created_at = created_date 
WHERE created_at IS NULL AND created_date IS NOT NULL;

-- Set default created_at for any remaining NULL values
UPDATE study_versions 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Initialize updated_at
UPDATE study_versions 
SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP);

-- Migrate additional_notes to notes
UPDATE study_versions 
SET notes = additional_notes 
WHERE additional_notes IS NOT NULL AND (notes IS NULL OR notes = '');

-- ==============================================================================
-- STEP 4: Make required columns NOT NULL (after data migration)
-- ==============================================================================

ALTER TABLE study_versions
    MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ==============================================================================
-- STEP 5: Convert JSON columns to TEXT (DDD entity uses TEXT)
-- ==============================================================================

-- ProtocolVersionEntity expects TEXT, not JSON
ALTER TABLE study_versions
    MODIFY COLUMN protocol_changes TEXT NULL COMMENT 'Protocol changes details',
    MODIFY COLUMN icf_changes TEXT NULL COMMENT 'ICF changes details';

-- ==============================================================================
-- STEP 6: Drop legacy columns not needed in DDD
-- ==============================================================================

-- These are kept as TEXT in ProtocolVersionEntity, so don't drop
-- ALTER TABLE study_versions DROP COLUMN protocol_changes;
-- ALTER TABLE study_versions DROP COLUMN icf_changes;

-- Drop columns not used by ProtocolVersionEntity
ALTER TABLE study_versions
    DROP COLUMN IF EXISTS regulatory_submissions,
    DROP COLUMN IF EXISTS review_comments,
    DROP COLUMN IF EXISTS metadata,
    DROP COLUMN IF EXISTS notify_stakeholders,
    DROP COLUMN IF EXISTS additional_notes;

-- Keep these for backward compatibility during transition:
-- - amendment_reason (maps to description in some places)
-- - created_by, created_date (legacy audit trail)
-- - previous_version_id (BIGINT reference, until fully migrated to UUID)

-- ==============================================================================
-- STEP 7: Add foreign key constraints
-- ==============================================================================

ALTER TABLE study_versions
    ADD CONSTRAINT fk_study_versions_withdrawn_by 
        FOREIGN KEY (withdrawn_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==============================================================================
-- STEP 8: Add indexes and constraints for DDD query patterns
-- ==============================================================================

-- Add unique constraint on aggregate_uuid (event-sourced aggregate identifier)
ALTER TABLE study_versions
    ADD CONSTRAINT uk_study_versions_aggregate_uuid UNIQUE (aggregate_uuid);
CREATE INDEX IF NOT EXISTS idx_study_versions_study_aggregate_uuid ON study_versions(study_aggregate_uuid);
CREATE INDEX IF NOT EXISTS idx_study_versions_previous_active_version ON study_versions(previous_active_version_uuid);
CREATE INDEX IF NOT EXISTS idx_study_versions_withdrawn_by ON study_versions(withdrawn_by);
CREATE INDEX IF NOT EXISTS idx_study_versions_submission_date ON study_versions(submission_date);
CREATE INDEX IF NOT EXISTS idx_study_versions_created_at ON study_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_study_versions_updated_at ON study_versions(updated_at);

-- ==============================================================================
-- VERIFICATION QUERY
-- ==============================================================================

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'study_versions'
ORDER BY ORDINAL_POSITION;
