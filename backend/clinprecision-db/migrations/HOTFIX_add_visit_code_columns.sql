-- Quick Fix: Add missing columns to visit_definitions table
-- Run this on your existing database to fix the immediate issue
-- Date: October 18, 2025

USE clinprecision;

-- Add visit_code column
ALTER TABLE visit_definitions 
ADD COLUMN visit_code VARCHAR(50) NULL 
COMMENT 'Unique code for unscheduled visits (e.g., EARLY_TERM, AE_VISIT)' 
AFTER is_unscheduled;

-- Add visit_order column
ALTER TABLE visit_definitions 
ADD COLUMN visit_order INT NULL 
COMMENT 'Sort order for unscheduled visits (9000+ recommended)' 
AFTER visit_code;

-- Add indexes for performance
CREATE INDEX idx_visit_def_unscheduled ON visit_definitions(study_id, is_unscheduled);
CREATE INDEX idx_visit_def_code ON visit_definitions(study_id, visit_code);

-- Verify the changes
SHOW COLUMNS FROM visit_definitions LIKE 'visit_code';
SHOW COLUMNS FROM visit_definitions LIKE 'visit_order';
SHOW COLUMNS FROM visit_definitions LIKE 'is_unscheduled';

SELECT 'visit_definitions table updated successfully!' AS Status;
