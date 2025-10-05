-- ROLLBACK for V003: Align study_versions table with ProtocolVersionEntity (DDD)
-- Purpose: Revert DDD migration if needed
-- Date: 2025-10-05

-- ==============================================================================
-- STEP 1: Drop DDD-specific indexes and constraints
-- ==============================================================================

ALTER TABLE study_versions
    DROP INDEX IF EXISTS idx_study_versions_study_aggregate_uuid,
    DROP INDEX IF EXISTS idx_study_versions_previous_active_version,
    DROP INDEX IF EXISTS idx_study_versions_withdrawn_by,
    DROP INDEX IF EXISTS idx_study_versions_submission_date,
    DROP INDEX IF EXISTS idx_study_versions_created_at,
    DROP INDEX IF EXISTS idx_study_versions_updated_at;

ALTER TABLE study_versions
    DROP CONSTRAINT IF EXISTS uk_study_versions_aggregate_uuid;

-- ==============================================================================
-- STEP 2: Drop foreign key constraints
-- ==============================================================================

ALTER TABLE study_versions
    DROP FOREIGN KEY IF EXISTS fk_study_versions_withdrawn_by;

-- ==============================================================================
-- STEP 3: Revert aggregate_uuid to VARCHAR(36)
-- ==============================================================================

ALTER TABLE study_versions
    MODIFY COLUMN aggregate_uuid VARCHAR(36) NULL COMMENT 'UUID linking to event-sourced aggregate';

-- ==============================================================================
-- STEP 4: Drop DDD-specific columns
-- ==============================================================================

ALTER TABLE study_versions
    DROP COLUMN IF EXISTS study_aggregate_uuid,
    DROP COLUMN IF EXISTS approval_comments,
    DROP COLUMN IF EXISTS submission_date,
    DROP COLUMN IF EXISTS notes,
    DROP COLUMN IF EXISTS previous_active_version_uuid,
    DROP COLUMN IF EXISTS withdrawal_reason,
    DROP COLUMN IF EXISTS withdrawn_by,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

-- ==============================================================================
-- STEP 5: Restore JSON columns
-- ==============================================================================

ALTER TABLE study_versions
    MODIFY COLUMN protocol_changes JSON NULL COMMENT 'Protocol changes details',
    MODIFY COLUMN icf_changes JSON NULL COMMENT 'ICF changes details';

ALTER TABLE study_versions
    ADD COLUMN IF NOT EXISTS regulatory_submissions JSON NULL,
    ADD COLUMN IF NOT EXISTS review_comments JSON NULL,
    ADD COLUMN IF NOT EXISTS metadata JSON NULL,
    ADD COLUMN IF NOT EXISTS notify_stakeholders BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS additional_notes TEXT NULL;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

SELECT 'Rollback complete - verify study_versions schema' AS message;
