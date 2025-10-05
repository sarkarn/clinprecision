-- ==============================================================================
-- V004: Recreate study_versions table for DDD/CQRS Protocol Version Entity
-- ==============================================================================
-- This script drops and recreates the study_versions table with the complete
-- schema needed by ProtocolVersionEntity (DDD read model).
--
-- WARNING: This will DELETE all existing data in study_versions table!
-- Make sure to backup before running this migration.
-- ==============================================================================

-- ==============================================================================
-- STEP 1: Drop existing foreign key constraints that reference study_versions
-- ==============================================================================

-- Drop foreign key from study_amendments table
ALTER TABLE study_amendments 
    DROP FOREIGN KEY IF EXISTS fk_study_amendments_version_id;

-- ==============================================================================
-- STEP 2: Drop the existing study_versions table
-- ==============================================================================

DROP TABLE IF EXISTS study_versions;

-- ==============================================================================
-- STEP 3: Create the new study_versions table with complete DDD schema
-- ==============================================================================

CREATE TABLE study_versions (
    -- Primary Key (traditional BIGINT for JPA relationships)
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- ============================================================
    -- DDD/CQRS Event Sourcing Fields
    -- ============================================================
    
    -- CRITICAL: Link to event-sourced aggregate (UUID)
    -- This matches @AggregateIdentifier in ProtocolVersionAggregate
    aggregate_uuid BINARY(16) NULL COMMENT 'UUID linking to event-sourced aggregate',
    
    -- Link to parent Study aggregate (UUID-based, DDD approach)
    study_aggregate_uuid BINARY(16) NULL COMMENT 'UUID of parent Study aggregate',
    
    -- ============================================================
    -- Legacy/Transition Fields
    -- ============================================================
    
    -- LEGACY: Link to parent Study entity (Long-based ID)
    -- TODO: Remove after Study module migrated to DDD
    study_id BIGINT NULL COMMENT 'DEPRECATED: Legacy study reference',
    
    -- LEGACY: Previous version reference (Long-based ID)
    -- TODO: Migrate to UUID-based references
    previous_version_id BIGINT NULL COMMENT 'DEPRECATED: Legacy version reference',
    
    -- ============================================================
    -- Core Protocol Version Fields
    -- ============================================================
    
    version_number VARCHAR(20) NOT NULL,
    
    -- Status enum: DRAFT, UNDER_REVIEW, SUBMITTED, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN') 
        NOT NULL DEFAULT 'DRAFT',
    
    -- Amendment type: MAJOR, MINOR, SAFETY, ADMINISTRATIVE
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NULL,
    
    description TEXT NULL,
    changes_summary TEXT NULL,
    impact_assessment TEXT NULL,
    
    requires_regulatory_approval BOOLEAN DEFAULT FALSE,
    
    -- ============================================================
    -- DDD-Specific Fields (ProtocolVersionEntity)
    -- ============================================================
    
    submission_date DATE NULL COMMENT 'Date submitted for regulatory approval',
    approval_date DATE NULL COMMENT 'Date approved by regulatory authority',
    effective_date DATE NULL COMMENT 'Date version becomes effective',
    
    notes TEXT NULL COMMENT 'General notes (replaces additional_notes)',
    
    -- Protocol and ICF changes (TEXT instead of JSON for DDD)
    protocol_changes TEXT NULL COMMENT 'Description of protocol changes',
    icf_changes TEXT NULL COMMENT 'Description of informed consent changes',
    
    approved_by BIGINT NULL COMMENT 'User who approved this version',
    approval_comments TEXT NULL COMMENT 'Comments from approver',
    
    -- Previous active version reference (UUID-based for DDD)
    previous_active_version_uuid BINARY(16) NULL COMMENT 'UUID of previous active version',
    
    -- Withdrawal tracking
    withdrawal_reason TEXT NULL COMMENT 'Reason for withdrawal if withdrawn',
    withdrawn_by BIGINT NULL COMMENT 'User who withdrew this version',
    
    -- ============================================================
    -- Legacy Fields (kept for backward compatibility during transition)
    -- ============================================================
    
    amendment_reason TEXT NULL COMMENT 'LEGACY: Use description instead',
    
    -- ============================================================
    -- Audit Fields
    -- ============================================================
    
    created_by BIGINT NOT NULL COMMENT 'User who created this version',
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'LEGACY: Use created_at',
    
    -- DDD standard audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- ============================================================
    -- Constraints
    -- ============================================================
    
    -- Unique constraint on aggregate_uuid (event-sourced identifier)
    CONSTRAINT uk_study_versions_aggregate_uuid UNIQUE (aggregate_uuid),
    
    -- Unique constraint to prevent duplicate version numbers per study
    CONSTRAINT uk_study_version_number UNIQUE (study_id, version_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_versions_study_id 
        FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE,
    
    CONSTRAINT fk_study_versions_previous_version 
        FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL,
    
    CONSTRAINT fk_study_versions_created_by 
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_study_versions_approved_by 
        FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
    
    CONSTRAINT fk_study_versions_withdrawn_by 
        FOREIGN KEY (withdrawn_by) REFERENCES users (id) ON DELETE SET NULL
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Protocol Versions - DDD/CQRS Read Model for event-sourced ProtocolVersionAggregate';

-- ==============================================================================
-- STEP 4: Create indexes for optimal query performance
-- ==============================================================================

-- Basic indexes
CREATE INDEX idx_study_versions_study_id ON study_versions(study_id);
CREATE INDEX idx_study_versions_status ON study_versions(status);
CREATE INDEX idx_study_versions_version_number ON study_versions(version_number);
CREATE INDEX idx_study_versions_created_date ON study_versions(created_date);
CREATE INDEX idx_study_versions_effective_date ON study_versions(effective_date);

-- Composite indexes for common query patterns
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_status_type ON study_versions (status, amendment_type);

-- DDD-specific indexes
CREATE INDEX idx_study_versions_study_aggregate_uuid ON study_versions(study_aggregate_uuid);
CREATE INDEX idx_study_versions_previous_active_version ON study_versions(previous_active_version_uuid);
CREATE INDEX idx_study_versions_withdrawn_by ON study_versions(withdrawn_by);
CREATE INDEX idx_study_versions_submission_date ON study_versions(submission_date);
CREATE INDEX idx_study_versions_created_at ON study_versions(created_at);
CREATE INDEX idx_study_versions_updated_at ON study_versions(updated_at);

-- ==============================================================================
-- STEP 5: Restore foreign key constraint from study_amendments
-- ==============================================================================

ALTER TABLE study_amendments 
    ADD CONSTRAINT fk_study_amendments_version_id 
        FOREIGN KEY (study_version_id) REFERENCES study_versions (id) ON DELETE CASCADE;

-- ==============================================================================
-- VERIFICATION QUERIES (run these manually to verify)
-- ==============================================================================

-- Check table structure
-- DESC study_versions;

-- Check aggregate_uuid type (should be binary(16))
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'study_versions'
--   AND COLUMN_NAME = 'aggregate_uuid';

-- Check all constraints
-- SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
-- FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'study_versions';

-- Check all indexes
-- SHOW INDEX FROM study_versions;

-- ==============================================================================
-- NOTES
-- ==============================================================================
-- 
-- This migration creates a clean study_versions table that:
-- 1. Supports both legacy (Long-based IDs) and DDD (UUID-based) approaches
-- 2. Has aggregate_uuid as BINARY(16) for event sourcing
-- 3. Includes all fields required by ProtocolVersionEntity
-- 4. Maintains backward compatibility with legacy fields
-- 5. Adds proper constraints and indexes
--
-- After this migration:
-- - Delete legacy StudyVersionEntity.java
-- - Use only ProtocolVersionEntity for all new code
-- - Gradually migrate away from Long-based references to UUID-based
-- ==============================================================================
