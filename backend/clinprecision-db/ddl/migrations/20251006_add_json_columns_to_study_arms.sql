-- Migration: Add JSON columns for interventions and randomization strategy to study_arms
-- Date: 2025-10-06
-- Description: Add interventions_json and randomization_strategy_json columns
--              to store intervention and randomization data temporarily

USE clinprecisiondb;

-- Add JSON columns to study_arms table
ALTER TABLE study_arms
    ADD COLUMN interventions_json TEXT NULL COMMENT 'JSON array of interventions for this arm' AFTER planned_subjects,
    ADD COLUMN randomization_strategy_json TEXT NULL COMMENT 'JSON object for randomization strategy' AFTER interventions_json;

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
    AND TABLE_NAME = 'study_arms'
ORDER BY 
    ORDINAL_POSITION;
