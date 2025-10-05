-- V003: Fix study_versions table to match ProtocolVersionEntity (DDD implementation)
-- This aligns the database with the DDD/CQRS read model

-- Drop the aggregate_uuid column if it exists (we'll recreate it with correct type)
ALTER TABLE study_versions DROP COLUMN IF EXISTS aggregate_uuid;

-- Add/modify columns to match ProtocolVersionEntity
ALTER TABLE study_versions
    -- CRITICAL: aggregate_uuid must be BINARY(16) for UUID type
    ADD COLUMN aggregate_uuid BINARY(16) NULL UNIQUE COMMENT 'UUID linking to event-sourced aggregate',
    
    -- Add DDD-specific column for study aggregate UUID
    ADD COLUMN study_aggregate_uuid BINARY(16) NULL COMMENT 'Link to parent Study aggregate (UUID-based, DDD)',
    
    -- Add approval_comments field
    ADD COLUMN approval_comments TEXT NULL COMMENT 'Comments from approval process',
    
    -- Add previous_active_version_uuid for DDD version tracking
    ADD COLUMN previous_active_version_uuid BINARY(16) NULL COMMENT 'UUID of previous active version',
    
    -- Add submission_date (different from created_date)
    ADD COLUMN submission_date DATE NULL COMMENT 'Date when version was submitted',
    
    -- Add withdrawal fields
    ADD COLUMN withdrawal_reason TEXT NULL COMMENT 'Reason for withdrawal if applicable',
    ADD COLUMN withdrawn_by BIGINT NULL COMMENT 'User ID who withdrew the version',
    
    -- Rename notes column if it doesn't exist (ProtocolVersionEntity uses 'notes' not 'additional_notes')
    ADD COLUMN notes TEXT NULL COMMENT 'General notes about this version',
    
    -- Add created_at and updated_at if they don't exist
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp';

-- Drop old columns that don't match ProtocolVersionEntity
ALTER TABLE study_versions
    DROP COLUMN IF EXISTS amendment_reason,
    DROP COLUMN IF EXISTS previous_version_id,
    DROP COLUMN IF EXISTS created_by,
    DROP COLUMN IF EXISTS created_date,
    DROP COLUMN IF EXISTS approved_date,
    DROP COLUMN IF EXISTS notify_stakeholders,
    DROP COLUMN IF EXISTS additional_notes,
    DROP COLUMN IF EXISTS regulatory_submissions,
    DROP COLUMN IF EXISTS review_comments,
    DROP COLUMN IF EXISTS metadata;

-- Modify existing columns to match ProtocolVersionEntity types
ALTER TABLE study_versions
    MODIFY COLUMN study_id BIGINT NULL COMMENT 'LEGACY: Link to parent Study entity (deprecated)',
    MODIFY COLUMN status VARCHAR(50) NOT NULL COMMENT 'Version status',
    MODIFY COLUMN amendment_type VARCHAR(50) NULL COMMENT 'Type of amendment',
    MODIFY COLUMN protocol_changes TEXT NULL COMMENT 'Protocol changes description',
    MODIFY COLUMN icf_changes TEXT NULL COMMENT 'ICF changes description',
    MODIFY COLUMN approved_by BIGINT NULL COMMENT 'User ID who approved',
    MODIFY COLUMN approval_date DATE NULL COMMENT 'Date of approval';

-- Create indexes for performance
CREATE INDEX idx_study_versions_aggregate_uuid ON study_versions(aggregate_uuid);
CREATE INDEX idx_study_versions_study_aggregate_uuid ON study_versions(study_aggregate_uuid);
CREATE INDEX idx_study_versions_previous_active_version_uuid ON study_versions(previous_active_version_uuid);
CREATE INDEX idx_study_versions_withdrawn_by ON study_versions(withdrawn_by);
CREATE INDEX idx_study_versions_submission_date ON study_versions(submission_date);

-- Add foreign key constraints
ALTER TABLE study_versions
    ADD CONSTRAINT fk_study_versions_withdrawn_by 
        FOREIGN KEY (withdrawn_by) REFERENCES users(id) ON DELETE SET NULL;

-- Note: approved_by FK should already exist from previous migration
-- Note: study_id FK should already exist

COMMIT;
