-- Migration: V1.16 - Add unique constraint to prevent duplicate unscheduled visit definitions
-- Date: October 23, 2025
-- Purpose: Prevent duplicate visit_definition records for the same study/visit_code/is_unscheduled combination
--
-- BACKGROUND:
-- Issue discovered where visit_definitions table had 50 duplicate records (5 visit types × 10 duplicates)
-- Root cause: No database-level constraint preventing duplicates when study build runs multiple times
-- 
-- IMPACT:
-- - Prevents future duplicate creation at database level
-- - Complements application-level check in StudyDatabaseBuildWorkerService.createUnscheduledVisitDefinitions()
-- - Must run cleanup script BEFORE applying this constraint (see cleanup_duplicate_visit_definitions.sql)

-- Step 1: Verify current duplicates (for audit log)
-- This query shows the current state before cleanup
SELECT 
    study_id,
    visit_code,
    is_unscheduled,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(id ORDER BY id) as all_ids
FROM visit_definitions
WHERE is_unscheduled = true
GROUP BY study_id, visit_code, is_unscheduled
HAVING COUNT(*) > 1;

-- Step 2: Add unique constraint
-- This prevents duplicates for the combination: (study_id, visit_code, is_unscheduled=true)
-- Note: We only constrain when is_unscheduled=true because scheduled visits can have 
-- arm-specific duplicates (different arm_id values)
ALTER TABLE visit_definitions
ADD CONSTRAINT uk_visit_def_study_code_unscheduled 
UNIQUE (study_id, visit_code, is_unscheduled)
WHERE is_unscheduled = true;

-- Note: If your database doesn't support partial unique constraints (WHERE clause),
-- use this alternative approach with a unique index:
-- CREATE UNIQUE INDEX idx_visit_def_study_code_unscheduled 
-- ON visit_definitions (study_id, visit_code, is_unscheduled)
-- WHERE is_unscheduled = true;

-- Step 3: Verify constraint was added
SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_NAME = 'visit_definitions'
  AND CONSTRAINT_NAME = 'uk_visit_def_study_code_unscheduled';

-- Step 4: Test constraint (should fail if run after migration)
-- Uncomment to test:
-- INSERT INTO visit_definitions (study_id, visit_code, is_unscheduled, name, timepoint, visit_type)
-- VALUES (11, 'EARLY_TERM', true, 'Test Duplicate', 0, 'UNSCHEDULED');
-- Expected: ERROR - Duplicate entry violation of unique constraint

-- Migration complete
-- Next step: Monitor study builds to ensure no duplicate creation attempts are logged
