-- ==============================================================================
-- V004 ROLLBACK: Restore original study_versions table structure
-- ==============================================================================
-- This script reverts the changes made by V004 and restores the original
-- study_versions table structure (with VARCHAR(36) aggregate_uuid).
--
-- WARNING: This will DELETE all data in study_versions table!
-- Make sure you have a backup before running this rollback.
-- ==============================================================================

-- ==============================================================================
-- STEP 1: Drop foreign key from study_amendments
-- ==============================================================================

ALTER TABLE study_amendments 
    DROP FOREIGN KEY IF EXISTS fk_study_amendments_version_id;

-- ==============================================================================
-- STEP 2: Drop the DDD study_versions table
-- ==============================================================================

DROP TABLE IF EXISTS study_versions;

-- ==============================================================================
-- STEP 3: Recreate original study_versions table
-- ==============================================================================

CREATE TABLE study_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(36) NULL COMMENT 'UUID linking to event-sourced aggregate',
    study_id BIGINT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NULL,
    amendment_reason TEXT NULL,
    description TEXT NULL,
    changes_summary TEXT NULL,
    impact_assessment TEXT NULL,
    previous_version_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT NULL,
    approved_date DATETIME NULL,
    effective_date DATE NULL,
    requires_regulatory_approval BOOLEAN DEFAULT FALSE,
    notify_stakeholders BOOLEAN DEFAULT TRUE,
    additional_notes TEXT NULL,
    protocol_changes JSON NULL,
    icf_changes JSON NULL,
    regulatory_submissions JSON NULL,
    review_comments JSON NULL,
    metadata JSON NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate version numbers per study
    UNIQUE KEY uk_study_version_number (study_id, version_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_versions_study_id FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_versions_previous_version FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_versions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_versions_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

-- ==============================================================================
-- STEP 4: Restore original indexes
-- ==============================================================================

CREATE INDEX idx_study_versions_study_id ON study_versions(study_id);
CREATE INDEX idx_study_versions_status ON study_versions(status);
CREATE INDEX idx_study_versions_version_number ON study_versions(version_number);
CREATE INDEX idx_study_versions_created_date ON study_versions(created_date);
CREATE INDEX idx_study_versions_effective_date ON study_versions(effective_date);
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_status_type ON study_versions (status, amendment_type);

-- ==============================================================================
-- STEP 5: Restore foreign key from study_amendments
-- ==============================================================================

ALTER TABLE study_amendments 
    ADD CONSTRAINT fk_study_amendments_version_id 
        FOREIGN KEY (study_version_id) REFERENCES study_versions (id) ON DELETE CASCADE;

-- ==============================================================================
-- Rollback complete
-- ==============================================================================
