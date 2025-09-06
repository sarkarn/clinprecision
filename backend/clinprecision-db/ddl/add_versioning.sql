-- Add versioning fields to studies table
ALTER TABLE studies
ADD COLUMN version VARCHAR(20) DEFAULT '1.0' AFTER protocol_number,
ADD COLUMN is_latest_version BOOLEAN DEFAULT TRUE AFTER version,
ADD COLUMN parent_version_id VARCHAR(36) DEFAULT NULL AFTER is_latest_version,
ADD COLUMN version_notes TEXT AFTER parent_version_id,
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;

-- Add enhanced versioning fields to form_definitions table
ALTER TABLE form_definitions
ADD COLUMN is_latest_version BOOLEAN DEFAULT TRUE AFTER version,
ADD COLUMN parent_version_id VARCHAR(36) DEFAULT NULL AFTER is_latest_version,
ADD COLUMN version_notes TEXT AFTER parent_version_id,
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;

-- Create study_versions table for version history
CREATE TABLE study_versions (
  id VARCHAR(36) PRIMARY KEY,
  study_id VARCHAR(36) NOT NULL,
  version VARCHAR(20) NOT NULL,
  version_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  version_notes TEXT,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create form_versions table for version history
CREATE TABLE form_versions (
  id VARCHAR(36) PRIMARY KEY,
  form_id VARCHAR(36) NOT NULL,
  version VARCHAR(20) NOT NULL,
  version_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  version_notes TEXT,
  FOREIGN KEY (form_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add is_active column to visit_forms to handle form version switching
ALTER TABLE visit_forms
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Add audit columns to track form version changes
ALTER TABLE visit_forms
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN updated_by BIGINT,
ADD COLUMN update_reason VARCHAR(255);
