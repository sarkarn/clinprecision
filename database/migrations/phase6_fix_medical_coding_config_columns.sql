-- Phase 6: Fix study_medical_coding_config table schema
-- This script adds missing columns that the JPA entity expects but aren't in the database

USE clinprecision_studydb_11;

-- Add missing columns
ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS adjudicator_role VARCHAR(50) NULL 
COMMENT 'Role for adjudication (e.g., MEDICAL_MONITOR, SAFETY_PHYSICIAN)' 
AFTER adjudication_required;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(30) DEFAULT 'SINGLE_CODER' 
COMMENT 'Coding workflow type: SINGLE_CODER, DUAL_CODER, AUTO_WITH_REVIEW, CENTRALIZED' 
AFTER adjudicator_role;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS validation_rules TEXT NULL 
COMMENT 'Custom validation rules for coded values (JSON format)' 
AFTER workflow_type;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS coding_instructions TEXT NULL 
COMMENT 'Configuration notes or instructions for coders' 
AFTER validation_rules;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL 
COMMENT 'Whether this configuration is active' 
AFTER coding_instructions;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS capture_primary_soc BOOLEAN DEFAULT FALSE NOT NULL 
COMMENT 'Whether primary System Organ Class (SOC) should be captured' 
AFTER code_to_level;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS show_all_matches BOOLEAN DEFAULT FALSE NOT NULL 
COMMENT 'Whether all matching codes should be displayed' 
AFTER capture_primary_soc;

ALTER TABLE study_medical_coding_config 
ADD COLUMN IF NOT EXISTS max_matches_displayed INT DEFAULT 10 
COMMENT 'Maximum number of matches to display in auto-suggest' 
AFTER show_all_matches;

-- Verify the changes
SELECT 
    'Verification: Columns added successfully' AS status,
    COUNT(*) AS column_count
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'clinprecision_studydb_11' 
AND TABLE_NAME = 'study_medical_coding_config'
AND COLUMN_NAME IN (
    'adjudicator_role',
    'workflow_type', 
    'validation_rules',
    'coding_instructions',
    'is_active',
    'capture_primary_soc',
    'show_all_matches',
    'max_matches_displayed'
);

-- Expected result: 8 columns
