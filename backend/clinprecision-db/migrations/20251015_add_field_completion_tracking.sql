-- Migration: Add field completion tracking to study_form_data table
-- Date: October 15, 2025
-- Purpose: Track completion progress at field level for better UX
-- Database: MySQL

-- Add new columns for field completion tracking
ALTER TABLE study_form_data
ADD COLUMN total_fields INT NULL COMMENT 'Total number of fields in the form definition',
ADD COLUMN completed_fields INT NULL COMMENT 'Number of fields that have been filled out',
ADD COLUMN required_fields INT NULL COMMENT 'Number of required fields in the form',
ADD COLUMN completed_required_fields INT NULL COMMENT 'Number of required fields that have been completed';

-- Create index for performance when querying by completion status
CREATE INDEX idx_study_form_data_completion 
ON study_form_data (completed_fields, total_fields, status);

-- Optional: Update existing records to calculate their completion stats
-- This can be done after deployment with a separate data migration script
-- Example:
-- UPDATE study_form_data 
-- SET total_fields = JSON_LENGTH(form_data),
--     completed_fields = (SELECT COUNT(*) FROM JSON_TABLE(form_data, '$.*' COLUMNS (val VARCHAR(255) PATH '$')) AS jt WHERE jt.val IS NOT NULL AND jt.val != '')
-- WHERE total_fields IS NULL;
